import { ApiOutlined, SaveOutlined } from '../icons';
import { Button, Card, Form, Input, InputNumber, Switch } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Check, FlaskConical } from 'lucide-react';

import { api, TENANT_ID } from '../api/client';
import type { EnterpriseAuthUser } from '../auth';
import AppHeader from '@/components/AppHeader';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { Paginator } from '@/components/Paginator';
import { StatCard } from '@/components/StatCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { Button as UIButton } from '@/components/ui/button';
import { notify } from '@/components/ui/app-toast';
import { cn } from '@/lib/utils';
import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS } from '@/lib/enterprise-ui';
import IconAdd from '../assets/icons/add.svg?react';
import IconClear from '../assets/icons/field-clear.svg?react';
import IconEdit from '../assets/icons/edit.svg?react';
import IconModels from '../assets/icons/sys-models.svg?react';
import IconMore from '../assets/icons/more.svg?react';
import IconRefresh from '../assets/icons/refresh.svg?react';
import IconSearch from '../assets/icons/search.svg?react';
import { StatusBadge } from './scheduled-tasks/StatusBadge';
import { useClientPagination } from '../hooks/useClientPagination';
import type { ModelConfigRead } from '../types';

const MODEL_PAGE_SIZE = 8;

export default function ModelsPage({
  currentUser,
  onLogout,
}: {
  currentUser?: EnterpriseAuthUser;
  onLogout?: () => void;
} = {}) {
  const [rows, setRows] = useState<ModelConfigRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selected, setSelected] = useState<ModelConfigRead | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    return api
      .get<ModelConfigRead[]>(`/api/enterprise/model-configs?tenant_id=${TENANT_ID}`)
      .then(setRows)
      .catch((error) => notify.error(error instanceof Error ? error.message : '加载模型失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) =>
      [row.name, row.model, row.provider, row.base_url || ''].some((value) =>
        (value || '').toLowerCase().includes(keyword),
      ),
    );
  }, [rows, searchText]);

  const pagination = useClientPagination(filteredRows, MODEL_PAGE_SIZE, searchText);

  const enabledCount = rows.filter((item) => item.enabled).length;
  const defaultRow = rows.find((item) => item.is_default);
  const providerCount = new Set(rows.map((item) => item.provider).filter(Boolean)).size;

  function edit(row: ModelConfigRead) {
    setSelected(row);
    form.setFieldsValue({ ...row, api_key: '' });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }

  function createBlank() {
    setSelected(null);
    form.resetFields();
    form.setFieldsValue({ provider: 'openai_compatible', temperature: 0.2, max_output_tokens: 2048, enabled: true });
  }

  async function save() {
    let values: Record<string, unknown>;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const payload = { ...values, tenant_id: TENANT_ID, api_key: values.api_key || undefined };
    try {
      if (selected) {
        await api.put(`/api/enterprise/model-configs/${selected.id}`, payload);
      } else {
        await api.post('/api/enterprise/model-configs', payload);
      }
      notify.success('已保存');
      setSelected(null);
      form.resetFields();
      await load();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '保存失败');
    }
  }

  async function setDefault(row: ModelConfigRead) {
    try {
      await api.post(`/api/enterprise/model-configs/${row.id}/set-default?tenant_id=${TENANT_ID}`);
      notify.success('已设为默认');
      await load();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '设为默认失败');
    }
  }

  async function test(row: ModelConfigRead) {
    try {
      const result = await api.post<{ success: boolean; message: string; output?: string }>(
        `/api/enterprise/model-configs/${row.id}/test?tenant_id=${TENANT_ID}`,
      );
      if (result.success) {
        notify.success(result.output || result.message);
      } else {
        notify.error(result.message);
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : '测试失败');
    }
  }

  function renderActions(row: ModelConfigRead) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="模型操作"
          className="ml-auto grid size-7 place-items-center rounded-[8px] text-[#1a71ff] transition-colors outline-none hover:bg-black/5 hover:text-[#4a8dff] focus-visible:bg-black/5 dark:hover:bg-white/10"
        >
          <IconMore className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={MENU_CONTENT_CLASS}>
          <DropdownMenuItem className={MENU_ITEM_CLASS} onSelect={() => edit(row)}>
            <IconEdit />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem className={MENU_ITEM_CLASS} disabled={row.is_default} onSelect={() => void setDefault(row)}>
            <Check />
            {row.is_default ? '已默认' : '设为默认'}
          </DropdownMenuItem>
          <DropdownMenuItem className={MENU_ITEM_CLASS} onSelect={() => void test(row)}>
            <FlaskConical />
            测试
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const columns: DataTableColumn<ModelConfigRead>[] = [
    {
      key: 'name',
      title: '名称',
      width: 240,
      className: 'text-[#18181a] dark:text-white',
      render: (row) => (
        <div className="flex min-w-0 flex-col gap-[2px]">
          <span className="flex min-w-0 items-center gap-[6px]">
            <span className="truncate font-medium leading-[18px] text-[#18181a] dark:text-white">{row.name}</span>
            {row.is_default && <StatusBadge tone="green">默认</StatusBadge>}
          </span>
          <span className="truncate text-[#858b9c]">
            {row.enabled ? '已启用' : '已停用'} · {row.provider}
          </span>
        </div>
      ),
    },
    { key: 'model', title: '模型', width: 180, render: (row) => <span className="block truncate">{row.model}</span> },
    {
      key: 'base_url',
      title: 'Base URL',
      className: 'whitespace-normal',
      render: (row) => <span className="line-clamp-1 wrap-break-word text-[#858b9c]">{row.base_url || '-'}</span>,
    },
    {
      key: 'api_key',
      title: 'API Key',
      width: 180,
      render: (row) => <span className="block truncate font-mono text-[#858b9c]">{row.api_key_masked || '-'}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: 70,
      align: 'right',
      render: (row) => renderActions(row),
    },
  ];

  const renderMobileCard = (row: ModelConfigRead) => (
    <article
      className="min-w-0 rounded-[8px] border border-[#eceef1] bg-white p-[14px] dark:border-white/10 dark:bg-[#26272d]"
      key={row.id}
    >
      <div className="flex min-w-0 items-start justify-between gap-[10px]">
        <div className="min-w-0">
          <span className="flex min-w-0 items-center gap-[6px]">
            <strong className="truncate text-[14px] font-semibold text-[#18181a] dark:text-white">{row.name}</strong>
            {row.is_default && <StatusBadge tone="green">默认</StatusBadge>}
          </span>
          <span className="mt-[2px] block truncate text-[12px] text-[#858b9c]">
            {row.enabled ? '已启用' : '已停用'} · {row.provider}
          </span>
        </div>
        {renderActions(row)}
      </div>
      <p className="mt-[8px] line-clamp-1 wrap-break-word text-[12px] text-[#858b9c]">{row.model}</p>
      <p className="mt-[4px] line-clamp-1 wrap-break-word font-mono text-[12px] text-[#858b9c]">
        {row.api_key_masked || '-'}
      </p>
    </article>
  );

  return (
    <div className="min-h-full box-border px-[48px] pt-[32px] pb-[43px] max-[900px]:px-[16px]">
      <AppHeader onLogout={onLogout} userName={currentUser?.username} title="模型" />

      <div className="mt-[20px] mb-[16px] flex items-center justify-end gap-[12px]">
        <UIButton
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
          className="h-[34px] gap-[4px] rounded-[10px] border-[0.5px] border-[#e3e7f1] bg-white px-[20px] text-[12px] font-normal text-[#757f9c] hover:border-[#cbd3e6] hover:bg-white hover:text-[#18181a] dark:border-border dark:bg-(--surface) dark:text-muted-foreground dark:hover:bg-(--surface)"
        >
          <IconRefresh className={cn('size-[14px]', loading && 'animate-spin')} />
          刷新
        </UIButton>
        <UIButton
          onClick={createBlank}
          className="h-[34px] gap-[4px] rounded-[10px] bg-[#18181a] px-[20px] text-[12px] font-normal text-white hover:bg-[#303030] dark:bg-white dark:text-[#18181a] dark:hover:bg-white/90"
        >
          <IconAdd className="size-[14px]" />
          新建模型
        </UIButton>
      </div>

      <div className="flex flex-col gap-[24px] rounded-[20px_20px_0_0] bg-white p-[18px_18px_24px_18px] shadow-[0_-4px_16px_0_rgba(0,0,0,0.05)] dark:bg-(--surface)">
        <div className="flex flex-wrap items-stretch gap-[20px]" aria-label="模型统计">
          <StatCard label="模型" value={rows.length} />
          <StatCard label="已启用" value={enabledCount} tone="green" />
          <StatCard label="默认模型" value={defaultRow?.name || '-'} valueClassName="text-[18px]" />
          <StatCard label="Provider" value={providerCount} />
        </div>

        <div className="flex flex-col gap-[18px]">
          <div className="flex items-center gap-[6px] px-[12px] text-[#757f9c] dark:text-muted-foreground">
            <IconModels className="size-[14px] shrink-0" />
            <span className="text-[14px] font-normal leading-none">模型列表</span>
          </div>

          <label className="flex h-[34px] w-[300px] items-center gap-[8px] overflow-hidden rounded-[10px] border-[0.5px] border-[#e3e7f1] bg-white px-[12px] transition-colors focus-within:border-[#18181a] max-[900px]:w-full dark:border-border dark:bg-(--surface) dark:focus-within:border-white/40">
            <IconSearch className="size-[14px] shrink-0 text-[#858b9c]" />
            <input
              value={searchText}
              placeholder="搜索名称、模型、Provider 或 Base URL"
              onChange={(event) => setSearchText(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-[12px] text-[#17191f] outline-none placeholder:text-[#c0c6d4] dark:text-white dark:placeholder:text-muted-foreground"
            />
            {searchText && (
              <button
                type="button"
                aria-label="清除搜索"
                onClick={() => setSearchText('')}
                className="grid size-[16px] shrink-0 place-items-center text-[#c0c6d4] hover:text-[#858b9c]"
              >
                <IconClear className="size-[14px]" />
              </button>
            )}
          </label>

          <div className="grid gap-[10px] md:hidden">
            {filteredRows.length ? (
              pagination.pagedItems.map(renderMobileCard)
            ) : (
              <div className="py-[40px] text-center text-[13px] text-[#858b9c]">暂无模型</div>
            )}
          </div>

          <div className="hidden md:block">
            <DataTable
              aria-label="模型列表"
              columns={columns}
              data={pagination.pagedItems}
              rowKey={(row) => row.id}
              loading={loading}
              emptyText="暂无模型，点击「新建模型」添加一个吧"
            />
          </div>

          {filteredRows.length > 0 && (
            <Paginator
              aria-label="模型分页"
              className="mt-0 mb-[6px]"
              page={pagination.page}
              pageCount={pagination.pageCount}
              onChange={pagination.setPage}
            />
          )}
        </div>
      </div>

      <Card className="editor-card model-editor-card mt-[20px]" title={selected ? `编辑模型：${selected.name}` : '新建模型'}>
        <Form form={form} layout="vertical" initialValues={{ provider: 'openai_compatible', temperature: 0.2, max_output_tokens: 2048, enabled: true }}>
          <div className="model-form-grid">
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input prefix={<ApiOutlined />} /></Form.Item>
            <Form.Item name="provider" label="Provider" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="base_url" label="Base URL"><Input /></Form.Item>
            <Form.Item name="model" label="Model" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="api_key" label="API Key"><Input.Password placeholder={selected ? '不修改请留空' : undefined} /></Form.Item>
            <div className="form-number-row model-number-row">
              <Form.Item name="temperature" label="Temperature"><InputNumber min={0} max={2} step={0.1} /></Form.Item>
              <Form.Item name="max_output_tokens" label="Max Tokens"><InputNumber min={128} max={32000} /></Form.Item>
            </div>
          </div>
          <div className="model-switch-row">
            <Form.Item name="is_default" label="设为默认" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="enabled" label="启用" valuePropName="checked"><Switch /></Form.Item>
          </div>
          <div className="form-actions">
            <Button type="primary" icon={<SaveOutlined />} onClick={() => void save()}>保存</Button>
            <Button onClick={createBlank}>清空</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
