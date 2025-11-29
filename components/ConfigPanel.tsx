import React from 'react';
import { AVAILABLE_CHART_TYPES, CHART_THEMES } from '../constants';
import { ChartTheme, ChartType } from '../types';
import { Settings, BarChart3, Palette, Layout } from 'lucide-react';

interface ConfigPanelProps {
  headers: string[];
  selectedX: string;
  selectedY: string[];
  selectedType: ChartType;
  selectedThemeId: string;
  onUpdateX: (val: string) => void;
  onUpdateY: (val: string) => void; // Currently simplifying to single Y select for UI
  onUpdateType: (val: ChartType) => void;
  onUpdateTheme: (id: string) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  headers,
  selectedX,
  selectedY,
  selectedType,
  selectedThemeId,
  onUpdateX,
  onUpdateY,
  onUpdateType,
  onUpdateTheme,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full overflow-y-auto">
      <div className="flex items-center mb-6">
        <Settings className="w-5 h-5 text-slate-700 mr-2" />
        <h2 className="text-lg font-bold text-slate-800">图表配置</h2>
      </div>

      {/* Chart Type */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <BarChart3 className="w-4 h-4 text-slate-500 mr-2" />
          <label className="text-sm font-semibold text-slate-700">图表类型</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_CHART_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => onUpdateType(type.value)}
              className={`
                px-3 py-2 text-sm rounded-lg border text-left transition-all
                ${selectedType === type.value 
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Mapping */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <Layout className="w-4 h-4 text-slate-500 mr-2" />
          <label className="text-sm font-semibold text-slate-700">数据映射</label>
        </div>
        
        <div className="space-y-4">
          <div>
            <span className="block text-xs font-medium text-slate-500 mb-1">X 轴 (类别/时间)</span>
            <select
              value={selectedX}
              onChange={(e) => onUpdateX(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-500 mb-1">Y 轴 (数值)</span>
            <select
              value={selectedY[0] || ''}
              onChange={(e) => onUpdateY(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div>
        <div className="flex items-center mb-3">
          <Palette className="w-4 h-4 text-slate-500 mr-2" />
          <label className="text-sm font-semibold text-slate-700">视觉风格</label>
        </div>
        <div className="space-y-2">
          {CHART_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onUpdateTheme(theme.id)}
              className={`
                w-full flex items-center p-2 rounded-lg border transition-all
                ${selectedThemeId === theme.id
                  ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50'
                  : 'border-slate-200 hover:bg-slate-50'
                }
              `}
            >
              <div className="flex -space-x-1 mr-3">
                {theme.colors.slice(0, 4).map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full ring-1 ring-white" style={{ backgroundColor: c }}></div>
                ))}
              </div>
              <span className={`text-sm ${selectedThemeId === theme.id ? 'font-medium text-blue-800' : 'text-slate-600'}`}>
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};