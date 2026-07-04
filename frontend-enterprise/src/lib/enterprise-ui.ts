/**
 * Shared Tailwind class tokens for the enterprise list pages (SOP, 技能, 定时任务,
 * 员工记忆, 对话日志 …). Keeping them in one place avoids copy-pasting the exact
 * same dropdown / select / card styling into every page.
 */

/** Dropdown menu item (icon + label, 12px muted text). */
export const MENU_ITEM_CLASS =
  'cursor-pointer gap-[6px] rounded-[10px] px-[12px] py-[6px] text-[12px] text-[#858b9c] focus:text-[#18181a] dark:text-muted-foreground dark:focus:text-white [&_svg]:size-[14px]';

/** Destructive (red) dropdown menu item. */
export const MENU_ITEM_DANGER_CLASS =
  'cursor-pointer gap-[6px] rounded-[10px] px-[12px] py-[6px] text-[12px] text-[#d20b0b] focus:bg-[#fce7e7] focus:text-[#d20b0b] focus:[&_svg]:text-[#d20b0b]! dark:text-[#ff6b6b] dark:focus:bg-[#d20b0b]/20 dark:focus:text-[#ff6b6b] dark:focus:[&_svg]:text-[#ff6b6b]! [&_svg]:size-[14px]';

/** Dropdown menu popover container (rounded white card + soft shadow). */
export const MENU_CONTENT_CLASS =
  'flex w-auto min-w-[140px] flex-col gap-[4px] rounded-[14px] border-0 bg-white p-[4px] shadow-[0px_0px_8px_rgba(0,0,0,0.1)] ring-0 [--accent:#F6F6F6] [--accent-foreground:#18181A] dark:bg-[#26272d] dark:[--accent:#2f3136] dark:[--accent-foreground:#ffffff]';

/** shadcn `Select` trigger styled to match the 34px filter controls. */
export const SELECT_TRIGGER_CLASS =
  'h-[34px] data-[size=default]:h-[34px] rounded-[10px] border-[0.5px] border-[#e3e7f1] bg-white text-[12px] text-[#464c5e] shadow-none data-placeholder:text-[#858b9c] hover:border-[#cbd3e6] focus-visible:border-[#18181a] focus-visible:ring-0 dark:border-border dark:bg-(--surface) dark:text-muted-foreground dark:hover:bg-(--surface)';

/** Mobile (<768px) list card wrapper. */
export const MOBILE_CARD_CLASS =
  'min-w-0 rounded-[8px] border border-[#eceef1] bg-white p-[14px] dark:border-white/10 dark:bg-[#26272d]';

/** Format a backend timestamp as a localized `zh-CN` date-time, or `-` when empty/invalid. */
export function formatDateTime(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('zh-CN', { hour12: false });
}
