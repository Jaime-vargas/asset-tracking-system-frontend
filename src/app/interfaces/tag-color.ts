export const TAG_COLORS = [
  {
    value: 'PURPLE',
    label: 'Purple',
    solid: '#7551ef',
    background: '#f0eaff',
    text: '#6035c4',
    border: '#dfd0fb',
  },
  {
    value: 'BLUE',
    label: 'Blue',
    solid: '#397ce2',
    background: '#eaf2ff',
    text: '#2458a3',
    border: '#c6dbfb',
  },
  {
    value: 'CYAN',
    label: 'Cyan',
    solid: '#169da9',
    background: '#e5f7f8',
    text: '#086975',
    border: '#b8e7eb',
  },
  {
    value: 'GREEN',
    label: 'Green',
    solid: '#369269',
    background: '#e9f6ee',
    text: '#256343',
    border: '#c2e5ce',
  },
  {
    value: 'GOLD',
    label: 'Gold',
    solid: '#be8c20',
    background: '#fff6db',
    text: '#825d0d',
    border: '#efdda3',
  },
  {
    value: 'ORANGE',
    label: 'Orange',
    solid: '#d97a36',
    background: '#fff0e6',
    text: '#9b4b17',
    border: '#f4d2b8',
  },
  {
    value: 'RED',
    label: 'Red',
    solid: '#d45d68',
    background: '#fff0f1',
    text: '#a23946',
    border: '#f0cbd0',
  },
  {
    value: 'MAGENTA',
    label: 'Pink',
    solid: '#ba59a2',
    background: '#fbeef7',
    text: '#8e397a',
    border: '#ebcbe2',
  },
] as const;
export type TagColor = (typeof TAG_COLORS)[number]['value'];
export function tagColor(value: string | null | undefined) {
  return TAG_COLORS.find((color) => color.value === value) ?? TAG_COLORS[0];
}
