import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';
import { parseExcelFile } from '../utils/excelUtils';
import { Dataset } from '../types';

interface FileUploadProps {
  onDataLoaded: (dataset: Dataset) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError("请上传有效的 Excel 文件 (.xlsx 或 .xls)");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dataset = await parseExcelFile(file);
      onDataLoaded(dataset);
    } catch (err: any) {
      setError(err.message || "解析文件失败");
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        className={`
          relative flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-300
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
          }
          ${isLoading ? 'opacity-80 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />

        {isLoading ? (
          <div className="flex flex-col items-center text-blue-600 animate-pulse">
            <Loader2 className="w-16 h-16 animate-spin mb-4" />
            <p className="text-lg font-medium">正在处理数据...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-8">
            <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
              <FileSpreadsheet className={`w-12 h-12 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {isDragging ? '释放文件！' : '上传 Excel 文件'}
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
              拖放 .xlsx 文件到此处，或点击浏览。我们将自动为您分析。
            </p>
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors">
              选择文件
            </button>
          </div>
        )}

        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-100 shadow-sm animate-bounce-in">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};