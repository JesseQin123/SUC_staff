import {
  CheckCircleOutlined,
  CloudOutlined,
  CodeOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, Card, Empty, Input, Select, Space, Tabs, Tag, Typography, Upload, message } from 'antd';
import type { UploadFile } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { api, TENANT_ID } from '../api/client';
import type { GeneralSkillRead, GeneralSkillRunResponse } from '../types';

const DEFAULT_MARKDOWN = `---
name: 中国城市天气
slug: weather-zh
description: 中国城市天气查询工具
homepage: https://www.weather.com.cn/
---

# 中国城市天气查询工具

输入城市名称，查询城市天气。`;

const PHASE_LABELS: Record<string, string> = {
  skill_loaded: '加载技能',
  planning: '生成执行方案',
  plan_created: '生成代码',
  running_code: '运行代码',
  code_finished: '读取运行结果',
  code_timeout: '运行超时',
  replying: '生成回复',
  reply_created: '完成回复',
};

function formatJson(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

function traceCode(trace: Array<Record<string, unknown>>): string {
  const item = trace.find((entry) => typeof entry.code === 'string' && entry.code.trim());
  return typeof item?.code === 'string' ? item.code : '';
}

function traceDetail(item: Record<string, unknown>): string {
  return [
    item.rationale,
    item.expected_output,
    item.stdout_preview,
    item.stderr_preview,
    item.run_id,
  ]
    .filter((value) => typeof value === 'string' && value.trim())
    .map(String)
    .join('\n');
}

function resultSucceeded(result: GeneralSkillRunResponse | null): boolean {
  if (!result) return false;
  const success = result.structured_result?.success;
  return success !== false && !result.stderr;
}

export default function GeneralSkillsPage({ embedded = false }: { embedded?: boolean }) {
  const [rows, setRows] = useState<GeneralSkillRead[]>([]);
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [selectedSlug, setSelectedSlug] = useState<string>();
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [query, setQuery] = useState('北京今天天气怎么样');
  const [runResult, setRunResult] = useState<GeneralSkillRunResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedSkill = useMemo(
    () => rows.find((row) => row.slug === selectedSlug) || rows[0],
    [rows, selectedSlug],
  );

  const load = () =>
    api
      .get<GeneralSkillRead[]>(`/api/enterprise/general-skills?tenant_id=${TENANT_ID}`)
      .then((items) => {
        setRows(items);
        if (!selectedSlug && items.length) {
          setSelectedSlug(items[0].slug);
          setEditingSlug(items[0].slug);
          setMarkdown(items[0].skill_markdown);
        }
      })
      .catch((error) => message.error(error.message));

  useEffect(() => {
    load();
  }, []);

  async function importSkill() {
    if (!markdown.trim()) {
      message.warning('请先粘贴或上传 SKILL.md');
      return;
    }
    const row = await api.post<GeneralSkillRead>('/api/enterprise/general-skills/import', {
      tenant_id: TENANT_ID,
      markdown,
      status: 'published',
    });
    message.success(editingSlug ? `已保存 ${row.name}` : `已导入 ${row.name}`);
    setSelectedSlug(row.slug);
    setEditingSlug(row.slug);
    load();
  }

  function newSkill() {
    setMarkdown(DEFAULT_MARKDOWN);
    setEditingSlug(null);
    setRunResult(null);
  }

  function editSkill(row: GeneralSkillRead) {
    setMarkdown(row.skill_markdown);
    setSelectedSlug(row.slug);
    setEditingSlug(row.slug);
    setRunResult(null);
  }

  async function runSkill() {
    const slug = selectedSkill?.slug;
    if (!slug) {
      message.warning('请先导入通用技能');
      return;
    }
    if (!query.trim()) {
      message.warning('请输入测试问题');
      return;
    }
    setLoading(true);
    setRunResult(null);
    try {
      const result = await api.post<GeneralSkillRunResponse>(`/api/enterprise/general-skills/${slug}/run`, {
        tenant_id: TENANT_ID,
        user_id: 'enterprise_demo',
        query,
      });
      setRunResult(result);
      message.success('运行完成');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '运行失败');
    } finally {
      setLoading(false);
    }
  }

  async function beforeUpload(file: UploadFile | File) {
    const target = file as File;
    const text = await target.text();
    setMarkdown(text);
    message.success(`已读取 ${target.name}`);
    return false;
  }

  const generatedCode = runResult?.generated_code || (runResult ? traceCode(runResult.execution_trace) : '');

  return (
    <>
      {!embedded && (
        <div className="page-title">
          <Typography.Title level={3}>通用技能 Demo</Typography.Title>
          <Typography.Text type="secondary">导入 PilotDeck 风格 SKILL.md，验证模型选择、代码生成与运行链路。</Typography.Text>
        </div>
      )}
      <div className="general-skill-workbench">
        <Space direction="vertical" size={16} className="general-skill-main">
          <Card
            className="editor-card general-skill-editor"
            title={(
              <Space>
                <FileTextOutlined />
                <span>{editingSlug ? `编辑通用技能：${editingSlug}` : '新增通用技能'}</span>
              </Space>
            )}
            extra={(
              <Space wrap>
                <Button onClick={newSkill}>新建</Button>
                <Upload beforeUpload={beforeUpload} showUploadList={false} accept=".md,.txt">
                  <Button icon={<UploadOutlined />}>选择文件</Button>
                </Upload>
                <Button type="primary" icon={<CloudOutlined />} onClick={importSkill}>保存并发布</Button>
              </Space>
            )}
          >
            <Input.TextArea
              className="general-skill-source-input"
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              rows={20}
              spellCheck={false}
            />
          </Card>
          <Card
            className="editor-card general-skill-run-card"
            title="运行测试"
            extra={<Button type="primary" loading={loading} icon={<ExperimentOutlined />} onClick={runSkill}>运行</Button>}
          >
            <div className="general-run-form">
              <Select
                value={selectedSkill?.slug}
                placeholder="选择通用技能"
                options={rows.map((row) => ({ value: row.slug, label: `${row.name} / ${row.slug}` }))}
                onChange={setSelectedSlug}
              />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          </Card>
          <Card
            className="editor-card general-result-card"
            title={(
              <Space>
                <PlayCircleOutlined />
                <span>运行结果</span>
                {runResult && (
                  resultSucceeded(runResult)
                    ? <Tag color="green" icon={<CheckCircleOutlined />}>成功</Tag>
                    : <Tag color="red" icon={<CloseCircleOutlined />}>失败</Tag>
                )}
              </Space>
            )}
          >
            {runResult ? (
              <div className="general-result-layout">
                <section className="general-reply-panel">
                  <div className="general-section-label">最终回复</div>
                  <Typography.Paragraph className="result-reply">{runResult.reply}</Typography.Paragraph>
                </section>

                <section>
                  <div className="general-section-label">执行流程</div>
                  <div className="general-trace-list">
                    {runResult.execution_trace.map((item, index) => {
                      const phase = typeof item.phase === 'string' ? item.phase : '';
                      const detail = traceDetail(item);
                      return (
                        <div className="general-trace-item" key={`${phase || 'phase'}-${index}`}>
                          <div className="general-trace-dot" />
                          <div>
                            <div className="general-trace-title">{PHASE_LABELS[phase] || String(item.message || phase || '执行')}</div>
                            <div className="general-trace-message">{String(item.message || '')}</div>
                            {detail && <pre className="general-trace-detail">{detail}</pre>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <div className="general-section-label">模型生成代码</div>
                  {generatedCode ? (
                    <pre className="general-code-block"><code>{generatedCode}</code></pre>
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="本次没有返回代码" />
                  )}
                </section>

                <section>
                  <div className="general-section-label">运行输出</div>
                  <Tabs
                    className="general-output-tabs"
                    items={[
                      {
                        key: 'structured',
                        label: '结构化结果',
                        children: <pre className="general-json-block">{formatJson(runResult.structured_result) || '无结构化结果'}</pre>,
                      },
                      {
                        key: 'stdout',
                        label: 'stdout',
                        children: <pre className="general-json-block">{formatJson(runResult.stdout) || '无 stdout'}</pre>,
                      },
                      {
                        key: 'stderr',
                        label: 'stderr',
                        children: <pre className="general-json-block">{formatJson(runResult.stderr) || '无 stderr'}</pre>,
                      },
                    ]}
                  />
                </section>
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="运行后将在这里显示回复、执行流程、代码和输出" />
            )}
          </Card>
        </Space>
        <aside className="general-skill-side">
          <Card className="data-card general-skill-list-card" title="通用技能">
            <div className="general-skill-list">
              {rows.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通用技能" />}
              {rows.map((row) => {
                const active = row.slug === selectedSkill?.slug;
                return (
                  <button
                    type="button"
                    className={`general-skill-list-item ${active ? 'active' : ''}`}
                    key={row.id}
                    onClick={() => {
                      setSelectedSlug(row.slug);
                      editSkill(row);
                    }}
                  >
                    <span>
                      <strong>{row.name}</strong>
                      <small>{row.slug}</small>
                    </span>
                    <Tag color={row.status === 'published' ? 'green' : 'default'}>{row.status}</Tag>
                  </button>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
