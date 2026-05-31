import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  MoreOutlined,
  PlusOutlined,
  RollbackOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Dropdown, Modal, Row, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, TENANT_ID } from '../api/client';
import type { SkillRead, SkillVersionRead } from '../types';

const STATUS_LABELS: Record<SkillRead['status'], { text: string; color: string }> = {
  draft: { text: '草稿', color: 'blue' },
  published: { text: '已发布', color: 'green' },
  archived: { text: '已归档', color: 'default' },
};

export default function SkillsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<SkillRead[]>([]);
  const [versionRows, setVersionRows] = useState<SkillVersionRead[]>([]);
  const [versionSkill, setVersionSkill] = useState<SkillRead | null>(null);
  const [detailVersion, setDetailVersion] = useState<SkillVersionRead | null>(null);
  const [versionModalTitle, setVersionModalTitle] = useState('');
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await api.get<SkillRead[]>(`/api/enterprise/skills?tenant_id=${TENANT_ID}`);
      setRows(result);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: ColumnsType<SkillRead> = useMemo(
    () => [
      { title: '技能名称', dataIndex: 'name', width: 180, ellipsis: true },
      { title: '技能 ID', dataIndex: 'skill_id', width: 190, ellipsis: true },
      { title: '业务域', dataIndex: 'business_domain', width: 140, ellipsis: true },
      { title: '版本', dataIndex: 'version', width: 90 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 110,
        render: (status: SkillRead['status']) => {
          const option = STATUS_LABELS[status] || { text: status, color: 'default' };
          return <Tag color={option.color}>{option.text}</Tag>;
        },
      },
      { title: '调用次数', dataIndex: 'call_count', width: 100 },
      {
        title: '好评率',
        dataIndex: 'positive_rate',
        width: 100,
        render: (value: number) => percent(value),
      },
      {
        title: '差评率',
        dataIndex: 'negative_rate',
        width: 100,
        render: (value: number) => percent(value),
      },
      {
        title: '操作',
        width: 80,
        fixed: 'right',
        render: (_, row) => (
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'edit', icon: <EditOutlined />, label: '编辑' },
                { key: 'versions', icon: <HistoryOutlined />, label: '版本管理' },
                { key: 'publish', icon: <CheckCircleOutlined />, label: '发布' },
                { key: 'archive', icon: <StopOutlined />, label: '下线' },
                { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true },
              ],
              onClick: ({ key }) => handleAction(key, row),
            }}
          >
            <Button type="text" icon={<MoreOutlined />} aria-label="技能操作" />
          </Dropdown>
        ),
      },
    ],
    [],
  );

  function openCreate() {
    navigate('/enterprise/skills/distill?mode=create');
  }

  function openEdit(row: SkillRead) {
    navigate(`/enterprise/skills/distill?skill_id=${encodeURIComponent(row.skill_id)}`);
  }

  async function publish(row: SkillRead) {
    await api.post(`/api/enterprise/skills/${row.skill_id}/publish?tenant_id=${TENANT_ID}`);
    message.success('已发布');
    load();
  }

  async function archive(row: SkillRead) {
    await api.post(`/api/enterprise/skills/${row.skill_id}/archive?tenant_id=${TENANT_ID}`);
    message.success('已下线');
    load();
  }

  async function openVersions(row: SkillRead) {
    setVersionSkill(row);
    setVersionModalTitle(`版本管理：${row.name}`);
    setVersionModalOpen(true);
    try {
      const result = await api.get<SkillVersionRead[]>(
        `/api/enterprise/skills/${encodeURIComponent(row.skill_id)}/versions?tenant_id=${TENANT_ID}`,
      );
      setVersionRows(result);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载版本失败');
    }
  }

  async function showVersionDetail(row: SkillVersionRead) {
    try {
      const result = await api.get<SkillVersionRead>(
        `/api/enterprise/skills/${encodeURIComponent(row.skill_id)}/versions/${encodeURIComponent(row.version)}?tenant_id=${TENANT_ID}`,
      );
      setDetailVersion(result);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载版本详情失败');
    }
  }

  function rollbackVersion(row: SkillVersionRead) {
    Modal.confirm({
      title: `回滚到版本 ${row.version}？`,
      content: `当前技能将切换为「${row.name}」的 ${row.version} 版本内容，历史版本记录和历史反馈数据不会被删除。`,
      okText: '回滚',
      cancelText: '取消',
      onOk: async () => {
        const result = await api.post<SkillRead>(
          `/api/enterprise/skills/${encodeURIComponent(row.skill_id)}/versions/${encodeURIComponent(row.version)}/rollback?tenant_id=${TENANT_ID}`,
        );
        message.success(`已回滚到 ${row.version}`);
        await load();
        await openVersions(result);
      },
    });
  }

  function remove(row: SkillRead) {
    Modal.confirm({
      title: `删除技能「${row.name}」？`,
      content: '删除后不会移除历史会话记录，但技能列表中将不再显示该技能。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await api.delete(`/api/enterprise/skills/${row.skill_id}?tenant_id=${TENANT_ID}`);
        message.success('已删除');
        load();
      },
    });
  }

  function handleAction(key: string, row: SkillRead) {
    if (key === 'edit') openEdit(row);
    if (key === 'versions') void openVersions(row);
    if (key === 'publish') void publish(row);
    if (key === 'archive') void archive(row);
    if (key === 'delete') remove(row);
  }

  return (
    <>
      <div className="page-title">
        <Typography.Title level={3}>技能管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建
        </Button>
      </div>
      <Card className="data-card" title="技能列表">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1080 }}
          size="middle"
        />
      </Card>
      <Row gutter={[16, 16]} className="skill-rank-row">
        <Col xs={24} lg={8}>
          <RankingCard title="调用排行榜" rows={rankBy(rows, 'call_count')} value={(row) => `${row.call_count} 次`} />
        </Col>
        <Col xs={24} lg={8}>
          <RankingCard title="好评排行榜" rows={rankBy(rows, 'positive_rate')} value={(row) => percent(row.positive_rate)} />
        </Col>
        <Col xs={24} lg={8}>
          <RankingCard title="差评排行榜" rows={rankBy(rows, 'negative_rate')} value={(row) => percent(row.negative_rate)} />
        </Col>
      </Row>
      <Modal
        open={versionModalOpen}
        title={versionModalTitle}
        width={1080}
        footer={null}
        onCancel={() => {
          setVersionModalOpen(false);
          setVersionSkill(null);
        }}
      >
        <Table
          rowKey="id"
          dataSource={versionRows}
          pagination={false}
          size="small"
          columns={[
            { title: '版本', dataIndex: 'version', width: 100 },
            { title: '技能名称', dataIndex: 'name', ellipsis: true },
            { title: '业务域', dataIndex: 'business_domain', width: 140, ellipsis: true },
            { title: '调用次数', dataIndex: 'call_count', width: 100 },
            { title: '好评率', dataIndex: 'positive_rate', width: 100, render: (value: number) => percent(value) },
            { title: '差评率', dataIndex: 'negative_rate', width: 100, render: (value: number) => percent(value) },
            { title: '更新时间', dataIndex: 'updated_at', width: 150, render: (value: string) => value.slice(0, 10) },
            {
              title: '操作',
              width: 80,
              fixed: 'right',
              render: (_, row) => (
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      { key: 'detail', icon: <EyeOutlined />, label: '查看详情' },
                      {
                        key: 'rollback',
                        icon: <RollbackOutlined />,
                        label: row.version === versionSkill?.version ? '当前版本' : '回滚到此版本',
                        disabled: row.version === versionSkill?.version,
                      },
                    ],
                    onClick: ({ key }) => {
                      if (key === 'detail') void showVersionDetail(row);
                      if (key === 'rollback') rollbackVersion(row);
                    },
                  }}
                >
                  <Button type="text" icon={<MoreOutlined />} aria-label="版本操作" />
                </Dropdown>
              ),
            },
          ]}
        />
      </Modal>
      <Modal
        open={Boolean(detailVersion)}
        title={detailVersion ? `版本详情：${detailVersion.name} / ${detailVersion.version}` : '版本详情'}
        width={920}
        footer={null}
        onCancel={() => setDetailVersion(null)}
      >
        {detailVersion && (
          <div className="version-detail">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="技能 ID">{detailVersion.skill_id}</Descriptions.Item>
              <Descriptions.Item label="版本">{detailVersion.version}</Descriptions.Item>
              <Descriptions.Item label="业务域">{detailVersion.business_domain || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">{statusText(detailVersion.status)}</Descriptions.Item>
              <Descriptions.Item label="调用次数">{detailVersion.call_count}</Descriptions.Item>
              <Descriptions.Item label="好评率">{percent(detailVersion.positive_rate)}</Descriptions.Item>
              <Descriptions.Item label="差评率">{percent(detailVersion.negative_rate)}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{detailVersion.updated_at.slice(0, 10)}</Descriptions.Item>
            </Descriptions>
            <pre className="version-detail-source">{skillSourceText(detailVersion)}</pre>
          </div>
        )}
      </Modal>
    </>
  );
}

function RankingCard({
  title,
  rows,
  value,
}: {
  title: string;
  rows: SkillRead[];
  value: (row: SkillRead) => string;
}) {
  return (
    <Card title={title} className="skill-ranking-card">
      {rows.length === 0 ? (
        <Typography.Text type="secondary">暂无数据</Typography.Text>
      ) : (
        rows.map((row, index) => (
          <div className="skill-ranking-item" key={`${title}_${row.skill_id}`}>
            <span className="skill-ranking-index">{index + 1}</span>
            <span className="skill-ranking-name" title={row.name}>{row.name}</span>
            <strong>{value(row)}</strong>
          </div>
        ))
      )}
    </Card>
  );
}

function rankBy(rows: SkillRead[], field: 'call_count' | 'positive_rate' | 'negative_rate'): SkillRead[] {
  return [...rows]
    .sort((a, b) => (b[field] || 0) - (a[field] || 0))
    .slice(0, 5);
}

function percent(value: number | undefined): string {
  return `${Math.round((value || 0) * 100)}%`;
}

function statusText(status: string): string {
  return STATUS_LABELS[status as SkillRead['status']]?.text || status;
}

function skillSourceText(row: SkillVersionRead): string {
  const skill = row.content;
  return [
    `# ${skill.name}`,
    `- skill_id: ${skill.skill_id}`,
    `- version: ${skill.version}`,
    `- business_domain: ${skill.business_domain || '-'}`,
    `- description: ${skill.description || '-'}`,
    `- trigger_intents: ${formatList(skill.trigger_intents)}`,
    `- user_utterance_examples: ${formatList(skill.user_utterance_examples)}`,
    `- goal: ${formatList(skill.goal)}`,
    `- required_info: ${formatList(skill.required_info)}`,
    `- response_rules: ${formatList(skill.response_rules)}`,
    '',
    '## 详细步骤',
    ...skill.steps.flatMap((step, index) => [
      '',
      `### Step ${index + 1}: ${String(step.name || step.step_id || '-')}`,
      `- step_id: ${String(step.step_id || '-')}`,
      `- instruction: ${String(step.instruction || '-')}`,
      `- expected_user_info: ${formatList(step.expected_user_info)}`,
      `- allowed_actions: ${formatList(step.allowed_actions)}`,
    ]),
  ].join('\n');
}

function formatList(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return '-';
  return value.map(String).join(', ');
}
