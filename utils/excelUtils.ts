import * as XLSX from 'xlsx';
import { DataRow, Dataset } from '../types';

export const parseExcelFile = (file: File): Promise<Dataset> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("File is empty"));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse to JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (rawData.length === 0) {
          reject(new Error("Sheet is empty"));
          return;
        }

        // Assume first row is headers
        const headers = rawData[0].map((h: any) => String(h || ''));
        const rows = rawData.slice(1);

        const processedData: DataRow[] = rows.map((row) => {
          const obj: DataRow = {};
          headers.forEach((header, index) => {
            // Try to keep numbers as numbers, otherwise string
            // Handle undefined/null safely
            const val = row[index];
            obj[header] = val; 
          });
          return obj;
        });

        resolve({
          name: file.name,
          headers,
          data: processedData,
        });

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
