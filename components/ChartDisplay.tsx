import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { ChartType, ChartTheme, DataRow } from '../types';

interface ChartDisplayProps {
  data: DataRow[];
  type: ChartType;
  xAxisKey: string;
  yAxisKeys: string[];
  theme: ChartTheme;
}

export const ChartDisplay: React.FC<ChartDisplayProps> = ({
  data,
  type,
  xAxisKey,
  yAxisKeys,
  theme,
}) => {
  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    // Basic filter to ensure keys exist and limit data point density for performance if massive
    return data.slice(0, 500); // Limit to 500 points for rendering performance
  }, [data]);

  const CommonAxisProps = {
    stroke: theme.textColor,
    fontSize: 12,
    tickLine: false,
    axisLine: { stroke: theme.gridColor, strokeWidth: 1 },
    tick: { fill: theme.textColor, opacity: 0.8 }
  };

  const CommonGridProps = {
    stroke: theme.gridColor,
    strokeDasharray: "3 3",
    vertical: false,
  };

  const CommonTooltip = () => (
    <Tooltip
      contentStyle={{
        backgroundColor: theme.backgroundColor,
        borderColor: theme.gridColor,
        color: theme.textColor,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      itemStyle={{ color: theme.textColor }}
      cursor={{ fill: theme.gridColor, opacity: 0.2 }}
    />
  );

  const renderChart = () => {
    switch (type) {
      case ChartType.BAR:
        return (
          <BarChart data={chartData}>
            <CartesianGrid {...CommonGridProps} />
            <XAxis dataKey={xAxisKey} {...CommonAxisProps} />
            <YAxis {...CommonAxisProps} />
            {CommonTooltip()}
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {yAxisKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={theme.colors[index % theme.colors.length]}
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            ))}
          </BarChart>
        );

      case ChartType.LINE:
        return (
          <LineChart data={chartData}>
            <CartesianGrid {...CommonGridProps} />
            <XAxis dataKey={xAxisKey} {...CommonAxisProps} />
            <YAxis {...CommonAxisProps} />
            {CommonTooltip()}
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {yAxisKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={theme.colors[index % theme.colors.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        );

      case ChartType.AREA:
        return (
          <AreaChart data={chartData}>
            <defs>
              {yAxisKeys.map((key, index) => (
                <linearGradient key={`gradient-${key}`} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.colors[index % theme.colors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.colors[index % theme.colors.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid {...CommonGridProps} />
            <XAxis dataKey={xAxisKey} {...CommonAxisProps} />
            <YAxis {...CommonAxisProps} />
            {CommonTooltip()}
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {yAxisKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={theme.colors[index % theme.colors.length]}
                fill={`url(#color-${key})`}
                animationDuration={1500}
              />
            ))}
          </AreaChart>
        );

      case ChartType.SCATTER:
        return (
          <ScatterChart data={chartData}>
             <CartesianGrid {...CommonGridProps} vertical={true} />
             <XAxis type="category" dataKey={xAxisKey} name={xAxisKey} {...CommonAxisProps} />
             <YAxis type="number" dataKey={yAxisKeys[0]} name={yAxisKeys[0]} {...CommonAxisProps} />
             {CommonTooltip()}
             <Legend wrapperStyle={{ paddingTop: '20px' }} />
             <Scatter name={yAxisKeys[0]} data={chartData} fill={theme.colors[0]} animationDuration={1500} />
          </ScatterChart>
        );

      case ChartType.PIE:
        // Aggregate data for Pie chart if X-axis has duplicates, or just take first N rows
        // For simplicity, we assume data is ready or we slice it
        return (
          <PieChart>
            <Pie
              data={chartData.slice(0, 20)} // Pie charts get messy with too many slices
              dataKey={yAxisKeys[0]}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                 // Simple label logic
                 return percent > 0.05 ? chartData[index][xAxisKey] : '';
              }}
            >
              {chartData.slice(0, 20).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={theme.colors[index % theme.colors.length]} stroke={theme.backgroundColor} />
              ))}
            </Pie>
            {CommonTooltip()}
            <Legend verticalAlign="middle" align="right" layout="vertical" />
          </PieChart>
        );

      default:
        return <div className="flex items-center justify-center h-full text-slate-400">不支持的图表类型</div>;
    }
  };

  return (
    <div 
      className="w-full h-[500px] p-6 rounded-2xl shadow-lg transition-colors duration-500 border border-transparent"
      style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily, borderColor: theme.gridColor }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};