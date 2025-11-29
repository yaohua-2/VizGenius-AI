import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { AIAnalysisResult, ChartType, DataRow, Dataset } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Limit data sample to avoid token limits
const PREVIEW_ROW_LIMIT = 5;

const analysisResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise summary of what the dataset appears to represent (approx 2 sentences), in Chinese.",
    },
    suggestions: {
      type: Type.ARRAY,
      description: "A list of 3 recommended visualizations based on the data.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A catchy title for the chart, in Chinese." },
          description: { type: Type.STRING, description: "Why this chart is useful, in Chinese." },
          chartType: { 
            type: Type.STRING, 
            description: "One of: bar, line, area, pie, scatter",
            enum: ["bar", "line", "area", "pie", "scatter"] 
          },
          xAxisKey: { type: Type.STRING, description: "The column name to use for the X-axis (category or time)." },
          yAxisKey: { type: Type.STRING, description: "The column name to use for the Y-axis (metric/value)." },
        },
        required: ["title", "description", "chartType", "xAxisKey", "yAxisKey"],
      },
    },
  },
  required: ["summary", "suggestions"],
};

export const analyzeDataset = async (
  headers: string[],
  dataSample: DataRow[]
): Promise<AIAnalysisResult | null> => {
  const client = createClient();
  if (!client) return null;

  try {
    const prompt = `
      我有一个数据集，包含以下表头: ${JSON.stringify(headers)}.
      这是前 ${PREVIEW_ROW_LIMIT} 行的数据样本:
      ${JSON.stringify(dataSample.slice(0, PREVIEW_ROW_LIMIT))}

      请分析此数据结构。
      1. 用中文提供一个关于此数据内容的简短摘要（约2句话）。
      2. 建议 3 个不同且有意义的可视化图表。
         - 识别哪些列是分类列（适合作为 X 轴或标签）。
         - 识别哪些列是数值列（适合作为 Y 轴或值）。
         - 对于 'pie' (饼图)，确保 X 轴是具有少量唯一值的分类数据。
         - 对于 'line' (折线图)，优先选择 X 轴上的时间序列或顺序数据。
      
      请确保返回的 JSON 中 summary, title, description 等字段都是中文。
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisResponseSchema,
        temperature: 0.4, // Lower temperature for more deterministic analysis
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const parsed = JSON.parse(text);
    
    // Transform simple suggestion to full structure (handling array of Y axes if we wanted to expand later)
    return {
      summary: parsed.summary,
      suggestions: parsed.suggestions.map((s: any) => ({
        title: s.title,
        description: s.description,
        chartType: s.chartType as ChartType,
        xAxisKey: s.xAxisKey,
        yAxisKeys: [s.yAxisKey],
      })),
    };
  } catch (error) {
    console.error("Error analyzing dataset with Gemini:", error);
    return null;
  }
};

export const createDataChatSession = (dataset: Dataset): Chat | null => {
  const client = createClient();
  if (!client) return null;

  // Create a context for the AI about the dataset
  // We limit the data to avoid token limits, just giving it a flavor of the data
  const dataContext = dataset.data.slice(0, 20); 

  const systemInstruction = `
    你是一个专业的数据分析助手。
    用户上传了一个名为 "${dataset.name}" 的数据集。
    
    表头结构: ${JSON.stringify(dataset.headers)}
    
    前 20 行数据样本:
    ${JSON.stringify(dataContext)}
    
    请根据以上数据回答用户的问题。
    如果用户询问特定统计数据（如总和、平均值），请基于提供的样本数据进行回答，并明确说明这只是基于样本数据的计算。如果需要准确的全量数据计算，请指导用户关注图表或说明局限性。
    
    请始终用中文回答。保持回答简洁、专业、友好。
  `;

  return client.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemInstruction,
    },
  });
};