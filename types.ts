export interface DataRow {
  [key: string]: string | number | boolean | null;
}

export interface Dataset {
  name: string;
  headers: string[];
  data: DataRow[];
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  AREA = 'area',
  SCATTER = 'scatter',
  PIE = 'pie',
}

export interface ChartSuggestion {
  title: string;
  description: string;
  chartType: ChartType;
  xAxisKey: string;
  yAxisKeys: string[]; // Support multiple lines/bars
}

export interface AIAnalysisResult {
  summary: string;
  suggestions: ChartSuggestion[];
}

export interface ChartTheme {
  id: string;
  name: string;
  colors: string[];
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  fontFamily: string;
}

// For parsing Gemini response
export interface GeminiAnalysisSchema {
  summary: string;
  suggestions: {
    title: string;
    description: string;
    chartType: string;
    xAxisKey: string;
    yAxisKey: string; // Simplified for initial suggestion
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}