import React, { useState, useRef, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChartDisplay } from './components/ChartDisplay';
import { ConfigPanel } from './components/ConfigPanel';
import { ChatPanel } from './components/ChatPanel';
import { analyzeDataset, createDataChatSession } from './services/geminiService';
import { Dataset, AIAnalysisResult, ChartSuggestion, ChartType, ChatMessage } from './types';
import { CHART_THEMES } from './constants';
import { Sparkles, BarChart2, Table as TableIcon, RefreshCw, X, Settings, MessageCircle } from 'lucide-react';
import { Chat } from '@google/genai';

const App: React.FC = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Chart Configuration State
  const [selectedType, setSelectedType] = useState<ChartType>(ChartType.BAR);
  const [selectedX, setSelectedX] = useState<string>('');
  const [selectedY, setSelectedY] = useState<string[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('corporate');

  // Chat State
  const [activeTab, setActiveTab] = useState<'config' | 'chat'>('config');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);

  const currentTheme = CHART_THEMES.find(t => t.id === selectedThemeId) || CHART_THEMES[0];

  const handleDataLoaded = async (newDataset: Dataset) => {
    setDataset(newDataset);
    // Reset state
    setAnalysis(null);
    setIsAnalyzing(true);
    setChatMessages([]);
    setActiveTab('config');
    
    // Initial guess for visualization before AI kicks in
    if (newDataset.headers.length >= 2) {
      setSelectedX(newDataset.headers[0]);
      // Try to find a number column for Y
      const numberCol = newDataset.headers.find(h => typeof newDataset.data[0][h] === 'number') || newDataset.headers[1];
      setSelectedY([numberCol]);
    }

    // Initialize Chat Session
    chatSessionRef.current = createDataChatSession(newDataset);

    // Call Gemini for Chart Analysis
    const result = await analyzeDataset(newDataset.headers, newDataset.data);
    setAnalysis(result);
    setIsAnalyzing(false);

    // Apply first suggestion if available
    if (result && result.suggestions.length > 0) {
      applySuggestion(result.suggestions[0]);
    }
  };

  const applySuggestion = (suggestion: ChartSuggestion) => {
    setSelectedType(suggestion.chartType);
    setSelectedX(suggestion.xAxisKey);
    setSelectedY(suggestion.yAxisKeys);
  };

  const handleSendMessage = async (text: string) => {
    if (!chatSessionRef.current) return;

    // Add user message to UI
    const userMsg: ChatMessage = { role: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: text });
      const responseText = result.text;
      
      const botMsg: ChatMessage = { role: 'model', text: responseText || "抱歉，我无法回答这个问题。" };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "发生错误，请稍后再试。" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const resetData = () => {
    setDataset(null);
    setAnalysis(null);
    setChatMessages([]);
    chatSessionRef.current = null;
  };

  if (!dataset) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
             <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <BarChart2 className="w-8 h-8 text-white" />
             </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">VizGenius AI</h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto">
            上传您的 Excel 数据，让我们的 AI 引擎自动发现洞察并为您生成精美的可视化图表。
          </p>
        </div>
        <FileUpload onDataLoaded={handleDataLoaded} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">VizGenius AI</h1>
            <p className="text-xs text-slate-500 font-medium">{dataset.name}</p>
          </div>
        </div>
        <button 
          onClick={resetData}
          className="flex items-center text-sm font-medium text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4 mr-1.5" />
          关闭文件
        </button>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: AI & Main Chart */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          {/* AI Analysis Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center text-indigo-800">
                <Sparkles className="w-5 h-5 mr-2" />
                <h2 className="font-bold text-sm uppercase tracking-wide">AI 智能分析</h2>
              </div>
              {isAnalyzing && (
                 <div className="flex items-center text-xs text-indigo-600">
                   <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                   正在生成洞察...
                 </div>
              )}
            </div>
            
            <div className="p-6">
              {isAnalyzing ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="h-24 bg-slate-100 rounded-lg"></div>
                    <div className="h-24 bg-slate-100 rounded-lg"></div>
                    <div className="h-24 bg-slate-100 rounded-lg"></div>
                  </div>
                </div>
              ) : analysis ? (
                <>
                  <p className="text-slate-700 leading-relaxed mb-6">{analysis.summary}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => applySuggestion(suggestion)}
                        className="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md hover:bg-blue-50/30 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                            {suggestion.chartType}
                          </span>
                          <span className="text-xs text-slate-400">建议 {idx + 1}</span>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-700">{suggestion.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{suggestion.description}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-slate-500 italic">分析不可用。</p>
              )}
            </div>
          </div>

          {/* Chart Section */}
          <div className="space-y-2">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-slate-800">可视化图表</h3>
                <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                   {dataset.data.length} 行数据已加载
                </span>
             </div>
             <ChartDisplay
                data={dataset.data}
                type={selectedType}
                xAxisKey={selectedX}
                yAxisKeys={selectedY}
                theme={currentTheme}
             />
          </div>

          {/* Data Preview Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 flex items-center">
                <TableIcon className="w-5 h-5 text-slate-500 mr-2" />
                <h3 className="font-bold text-slate-700">数据预览</h3>
             </div>
             <div className="overflow-x-auto max-h-60">
                <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-600 font-medium sticky top-0 z-10 shadow-sm">
                      <tr>
                         {dataset.headers.map((h) => (
                            <th key={h} className="px-6 py-3 whitespace-nowrap">{h}</th>
                         ))}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {dataset.data.slice(0, 10).map((row, i) => (
                         <tr key={i} className="hover:bg-slate-50/80">
                            {dataset.headers.map((h, j) => (
                               <td key={j} className="px-6 py-3 whitespace-nowrap text-slate-600">
                                  {row[h]?.toString()}
                               </td>
                            ))}
                         </tr>
                      ))}
                   </tbody>
                </table>
                {dataset.data.length > 10 && (
                   <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
                      仅显示前 10 行，共 {dataset.data.length} 行
                   </div>
                )}
             </div>
          </div>

        </div>

        {/* Right Column: Configuration & Chat */}
        <div className="lg:col-span-4 xl:col-span-3 sticky top-24 h-[calc(100vh-8rem)] flex flex-col">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-4 shrink-0">
                <button
                    onClick={() => setActiveTab('config')}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'config' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Settings className="w-4 h-4 mr-2" />
                    配置
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'chat' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    AI 对话
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden relative">
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'config' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                     <ConfigPanel
                        headers={dataset.headers}
                        selectedX={selectedX}
                        selectedY={selectedY}
                        selectedType={selectedType}
                        selectedThemeId={selectedThemeId}
                        onUpdateX={setSelectedX}
                        onUpdateY={(y) => setSelectedY([y])}
                        onUpdateType={setSelectedType}
                        onUpdateTheme={setSelectedThemeId}
                     />
                </div>
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <ChatPanel 
                        messages={chatMessages} 
                        onSendMessage={handleSendMessage}
                        isLoading={isChatLoading}
                    />
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;