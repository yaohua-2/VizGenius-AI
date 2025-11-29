import { ChartTheme, ChartType } from './types';

export const CHART_THEMES: ChartTheme[] = [
  {
    id: 'corporate',
    name: '现代商务',
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    gridColor: '#e2e8f0',
    fontFamily: 'Inter, "Microsoft YaHei", sans-serif',
  },
  {
    id: 'dark-cyber',
    name: '赛博霓虹',
    colors: ['#06b6d4', '#d946ef', '#f43f5e', '#8b5cf6', '#10b981', '#fbbf24'],
    backgroundColor: '#0f172a',
    textColor: '#f1f5f9',
    gridColor: '#334155',
    fontFamily: 'Inter, "Microsoft YaHei", sans-serif',
  },
  {
    id: 'sunset',
    name: '日落暖阳',
    colors: ['#fdba74', '#fb923c', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
    backgroundColor: '#fff7ed',
    textColor: '#431407',
    gridColor: '#fed7aa',
    fontFamily: 'Inter, "Microsoft YaHei", sans-serif',
  },
  {
    id: 'forest',
    name: '深邃森林',
    colors: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#84cc16'],
    backgroundColor: '#f0fdf4',
    textColor: '#052e16',
    gridColor: '#bbf7d0',
    fontFamily: 'Inter, "Microsoft YaHei", sans-serif',
  },
  {
    id: 'monochrome',
    name: '极简黑白',
    colors: ['#1e293b', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'],
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    gridColor: '#f1f5f9',
    fontFamily: 'Inter, "Microsoft YaHei", sans-serif',
  },
];

export const AVAILABLE_CHART_TYPES = [
  { value: ChartType.BAR, label: '柱状图' },
  { value: ChartType.LINE, label: '折线图' },
  { value: ChartType.AREA, label: '面积图' },
  { value: ChartType.SCATTER, label: '散点图' },
  { value: ChartType.PIE, label: '饼图' },
];