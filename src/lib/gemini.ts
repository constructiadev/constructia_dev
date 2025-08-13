// Gemini AI Integration for ConstructIA
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. AI features will be limited.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface AIInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'prediction' | 'alert';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  data_source: any;
  ai_analysis: any;
}

export class GeminiAIService {
  private model: any;

  constructor() {
    if (genAI) {
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async generateInsights(data: any, context: string): Promise<AIInsight[]> {
    if (!this.model) {
      return this.getMockInsights(context);
    }

    try {
      const prompt = this.buildPrompt(data, context);
      const result = await this.retryApiCall(() => this.model.generateContent(prompt));
      const response = await result.response;
      const text = response.text();
      
      return this.parseAIResponse(text, data);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // If it's a network error or API unavailable, use mock data
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('503') ||
        error.message.includes('overloaded') ||
        error.message.includes('network')
      )) {
        console.log('Using mock insights due to API unavailability');
      }
      return this.getMockInsights(context);
    }
  }

  private async retryApiCall<T>(apiCall: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error: any) {
        const isOverloaded = error.message?.includes('503') || error.message?.includes('overloaded');
        
        if (isOverloaded && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`API overloaded, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  private buildPrompt(data: any, context: string): string {
    return `
      Actúa como un analista de datos experto para ConstructIA, una plataforma SaaS de gestión documental.
      
      Contexto: ${context}
      Datos: ${JSON.stringify(data, null, 2)}
      
      Genera insights accionables en formato JSON con la siguiente estructura:
      [
        {
          "type": "trend|anomaly|recommendation|prediction|alert",
          "title": "Título conciso del insight",
          "description": "Descripción detallada y accionable",
          "confidence": 85,
          "priority": "low|medium|high|critical",
          "category": "categoría del insight"
        }
      ]
      
      Enfócate en:
      - Tendencias de crecimiento o declive
      - Anomalías en el comportamiento
      - Recomendaciones para mejorar el negocio
      - Predicciones basadas en datos históricos
      - Alertas sobre problemas potenciales
      
      Responde SOLO con el JSON válido, sin texto adicional.
    `;
  }

  private parseAIResponse(text: string, data: any): AIInsight[] {
    try {
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const insights = JSON.parse(cleanText);
      
      return insights.map((insight: any) => ({
        ...insight,
        data_source: data,
        ai_analysis: {
          model: 'gemini-pro',
          generated_at: new Date().toISOString(),
          prompt_tokens: text.length,
          response_tokens: cleanText.length
        }
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getMockInsights('parsing_error');
    }
  }

  private getMockInsights(context: string): AIInsight[] {
    const mockInsights = [
      {
        type: 'trend' as const,
        title: 'Crecimiento Acelerado de Clientes',
        description: 'Se observa un crecimiento del 23% en nuevos clientes este mes. La tendencia sugiere que alcanzaremos 150 clientes activos para fin de trimestre.',
        confidence: 87,
        priority: 'high' as const,
        category: 'growth',
        data_source: { context },
        ai_analysis: { model: 'mock', generated_at: new Date().toISOString() }
      },
      {
        type: 'recommendation' as const,
        title: 'Optimizar Procesamiento de Documentos',
        description: 'La precisión de IA está en 94.2%. Recomiendo ajustar los parámetros del modelo para alcanzar el 97% objetivo.',
        confidence: 92,
        priority: 'medium' as const,
        category: 'optimization',
        data_source: { context },
        ai_analysis: { model: 'mock', generated_at: new Date().toISOString() }
      },
      {
        type: 'alert' as const,
        title: 'Uso Elevado de Almacenamiento',
        description: 'Varios clientes están cerca del límite de almacenamiento. Considerar ofertas de upgrade automático.',
        confidence: 95,
        priority: 'high' as const,
        category: 'storage',
        data_source: { context },
        ai_analysis: { model: 'mock', generated_at: new Date().toISOString() }
      }
    ];

    return mockInsights;
  }

  async analyzeClientBehavior(clientData: any[]): Promise<AIInsight[]> {
    return this.generateInsights(clientData, 'client_behavior_analysis');
  }

  async analyzeFinancialTrends(financialData: any[]): Promise<AIInsight[]> {
    return this.generateInsights(financialData, 'financial_trends_analysis');
  }

  async analyzeDocumentProcessing(documentData: any[]): Promise<AIInsight[]> {
    return this.generateInsights(documentData, 'document_processing_analysis');
  }

  async analyzeSystemPerformance(performanceData: any): Promise<AIInsight[]> {
    return this.generateInsights(performanceData, 'system_performance_analysis');
  }

  async generateExecutiveSummary(allData: any): Promise<string> {
    if (!this.model) {
      return this.getMockExecutiveSummary();
    }

    try {
      const prompt = `
        Genera un resumen ejecutivo para ConstructIA basado en estos datos:
        ${JSON.stringify(allData, null, 2)}
        
        El resumen debe ser:
        - Máximo 200 palabras
        - Enfocado en métricas clave
        - Incluir recomendaciones estratégicas
        - Tono profesional y ejecutivo
        
        Responde solo con el texto del resumen, sin formato adicional.
      `;

      const result = await this.retryApiCall(() => this.model.generateContent(prompt));
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating executive summary:', error);
      return this.getMockExecutiveSummary();
    }
  }

  private getMockExecutiveSummary(): string {
    return `ConstructIA muestra un rendimiento sólido con crecimiento sostenido. Los clientes activos han aumentado un 23% este mes, con una precisión de IA del 94.2% en clasificación de documentos. Los ingresos mensuales recurrentes muestran estabilidad con oportunidades de expansión en el segmento enterprise. Se recomienda optimizar los algoritmos de IA para alcanzar el 97% de precisión objetivo y considerar ofertas de upgrade automático para clientes cerca del límite de almacenamiento.`;
  }
}

export const geminiAI = new GeminiAIService();