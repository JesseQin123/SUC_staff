import type { CSSProperties } from 'react';

export type StaffdeckIconName =
  | 'arrow'
  | 'branch'
  | 'chat'
  | 'check'
  | 'clock'
  | 'database'
  | 'edit'
  | 'file'
  | 'filter'
  | 'globe'
  | 'grid'
  | 'image'
  | 'logout'
  | 'model'
  | 'more'
  | 'pause'
  | 'play'
  | 'plus'
  | 'refresh'
  | 'search'
  | 'send'
  | 'sidebar-close'
  | 'sidebar-open'
  | 'spark'
  | 'stop'
  | 'thumb-down'
  | 'thumb-up'
  | 'tool'
  | 'trash'
  | 'user';

type StaffdeckIconProps = {
  name: StaffdeckIconName;
  className?: string;
  size?: number;
  style?: CSSProperties;
};

const iconPaths: Record<StaffdeckIconName, string[]> = {
  arrow: ['M9 5l6 7-6 7'],
  branch: ['M7 5v5a4 4 0 0 0 4 4h6', 'M7 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M17 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M7 23a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M7 19v-9'],
  chat: ['M6 7.5h12a2.5 2.5 0 0 1 2.5 2.5v4.5A2.5 2.5 0 0 1 18 17H11l-4.5 3v-3H6A2.5 2.5 0 0 1 3.5 14.5V10A2.5 2.5 0 0 1 6 7.5Z', 'M8 11.2h7.5', 'M8 14h4.5'],
  check: ['M5 12.5l4 4L19 6.5'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3.5 2'],
  database: ['M5 7c0 2 14 2 14 0S5 5 5 7Z', 'M5 7v5c0 2 14 2 14 0V7', 'M5 12v5c0 2 14 2 14 0v-5'],
  edit: ['M5 19h4.2L19 9.2 14.8 5 5 14.8V19Z', 'M13.5 6.5l4 4'],
  file: ['M6 4h8l4 4v12H6V4Z', 'M14 4v5h5', 'M9 13h6', 'M9 16h4'],
  filter: ['M5 7h14', 'M8 12h8', 'M11 17h2'],
  globe: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M3 12h18', 'M12 3c2.2 2.4 3.2 5.3 3.2 9s-1 6.6-3.2 9c-2.2-2.4-3.2-5.3-3.2-9S9.8 5.4 12 3Z'],
  grid: ['M5 5h5v5H5V5Z', 'M14 5h5v5h-5V5Z', 'M5 14h5v5H5v-5Z', 'M14 14h5v5h-5v-5Z'],
  image: ['M5 5h14v14H5V5Z', 'M8.5 10a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z', 'M5 16l4.4-4.4 3.4 3.4 2.1-2.1L19 17'],
  logout: ['M9 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H9', 'M14 8l4 4-4 4', 'M18 12H9'],
  model: ['M12 4l7 4v8l-7 4-7-4V8l7-4Z', 'M12 12l7-4', 'M12 12v8', 'M12 12L5 8'],
  more: ['M6 12h.1', 'M12 12h.1', 'M18 12h.1'],
  pause: ['M8 6v12', 'M16 6v12'],
  play: ['M8 5v14l11-7L8 5Z'],
  plus: ['M12 5v14', 'M5 12h14'],
  refresh: ['M19 8a7 7 0 0 0-12.2-2.4L5 8', 'M5 5v3h3', 'M5 16a7 7 0 0 0 12.2 2.4L19 16', 'M19 19v-3h-3'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'M16.5 16.5 21 21'],
  send: ['M4 12 20 5l-7 14-2-6-7-1Z', 'M11 13l9-8'],
  'sidebar-close': ['M4 5h16v14H4V5Z', 'M9 5v14', 'M15 9l-3 3 3 3'],
  'sidebar-open': ['M4 5h16v14H4V5Z', 'M9 5v14', 'M12 9l3 3-3 3'],
  spark: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z', 'M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z'],
  stop: ['M7 7h10v10H7V7Z'],
  'thumb-down': ['M7 3h3.2c1.5 0 2.9.8 3.6 2.1L16 9.5V14H9.4l.8 4.1A1.6 1.6 0 0 1 8.6 20H8l-3-6V5a2 2 0 0 1 2-2Z', 'M16 5h3v9h-3'],
  'thumb-up': ['M7 21h3.2c1.5 0 2.9-.8 3.6-2.1L16 14.5V10H9.4l.8-4.1A1.6 1.6 0 0 0 8.6 4H8l-3 6v9a2 2 0 0 0 2 2Z', 'M16 10h3v9h-3'],
  tool: ['M14.5 5.5a4.5 4.5 0 0 0 4 6.3L11 19.3a2.1 2.1 0 0 1-3-3l7.5-7.5a4.5 4.5 0 0 0-1-3.3Z', 'M7.2 16.8l2 2'],
  trash: ['M5 7h14', 'M9 7V5h6v2', 'M8 10v8', 'M12 10v8', 'M16 10v8', 'M7 7l1 13h8l1-13'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4.5 20c1.2-4.1 13.8-4.1 15 0'],
};

export default function StaffdeckIcon({ name, className = '', size = 18, style }: StaffdeckIconProps) {
  return (
    <svg
      className={`sd1-icon sd1-icon-${name} ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      {iconPaths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
