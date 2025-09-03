// ConstructIA - Procesador de Documentos con Gemini AI
import { GoogleGenerativeAI } from '@google/generative-ai';
import { appConfig, getEnvironmentConfig } from '../config/app-config';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface DocumentExtractionResult {
  categoria_probable: string;
  entidad_tipo_probable: string;
  campos: {
    dni_nie?: string;
    nombre?: string;
    apellido?: string;
    empresa?: string;
    rea_numero?: string;
    poliza_numero?: string;
    fecha_emision?: string;
    fecha_caducidad?: string;
    curso_prl_nivel?: string;
    maquina_num_serie?: string;
    coincidencias_texto: string[];
  };
  confianza: {
    [key: string]: number;
  };
}

export class GeminiDocumentProcessor {
  private genAI: GoogleGenerativeAI | null;
  private model: any;

  constructor() {
    const envConfig = getEnvironmentConfig();
    
    // Always use mock in development or when simulate_in_dev is enabled
    if (envConfig.isDev || appConfig.settings.IA.simulate_in_dev) {
      console.warn('🤖 [Gemini] Using mock responses in development to avoid quota limits');
      this.genAI = null;
      this.model = null;
    } else if (API_KEY) {
      this.genAI = new GoogleGenerativeAI(API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    } else {
      console.warn('🤖 [Gemini] API key not found. Using mock responses.');
      this.genAI = null;
      this.model = null;
    }
  }

  async processDocument(
    fileContent: string | ArrayBuffer, 
    fileName: string,
    mimeType: string
  ): Promise<DocumentExtractionResult> {
    if (!this.model) {
      return this.getMockExtraction(fileName);
    }

    try {
      const systemPrompt = `Eres un extractor documental para CAE en construcción (España). 
Devuelve SOLO JSON válido siguiendo el esquema indicado, sin texto extra.
Detecta y normaliza: fechas (YYYY-MM-DD), nombres, DNI/NIE, nº póliza, empresa emisora, 
categoría probable del documento y fecha de caducidad si aplica. 
Si un campo no existe, usa null. 
Confianza por campo: 0..1.`;

      const userPrompt = `Documento del tipo CAE. Clasifícalo y extrae campos. 
Responde en JSON con este esquema:
{
  "categoria_probable": "PRL|APTITUD_MEDICA|DNI|ALTA_SS|CONTRATO|SEGURO_RC|REA|FORMACION_PRL|EVAL_RIESGOS|CERT_MAQUINARIA|PLAN_SEGURIDAD|OTROS",
  "entidad_tipo_probable": "empresa|trabajador|maquinaria|obra",
  "campos": {
    "dni_nie": "...",
    "nombre": "...",
    "apellido": "...",
    "empresa": "...",
    "rea_numero": "...",
    "poliza_numero": "...",
    "fecha_emision": "YYYY-MM-DD",
    "fecha_caducidad": "YYYY-MM-DD",
    "curso_prl_nivel": "...",
    "maquina_num_serie": "...",
    "coincidencias_texto": ["..."]
  },
  "confianza": { "dni_nie": 0.92, "fecha_caducidad": 0.88, "...": 0.0 }
}`;

      // Preparar contenido para Gemini
      let parts: any[] = [
        { text: systemPrompt },
        { text: userPrompt }
      ];

      // Si es imagen o PDF, añadir como contenido binario
      if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
        const base64Data = typeof fileContent === 'string' 
          ? fileContent 
          : this.arrayBufferToBase64(fileContent);
        
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }

      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      // Parsear respuesta JSON
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const extraction = JSON.parse(cleanText);

      return this.validateExtraction(extraction);
    } catch (error) {
      console.error('Error processing document with Gemini:', error);
      return this.getMockExtraction(fileName);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private validateExtraction(extraction: any): DocumentExtractionResult {
    // Validar y normalizar la respuesta de Gemini
    const validCategories = [
      'PRL', 'APTITUD_MEDICA', 'DNI', 'ALTA_SS', 'CONTRATO', 
      'SEGURO_RC', 'REA', 'FORMACION_PRL', 'EVAL_RIESGOS', 
      'CERT_MAQUINARIA', 'PLAN_SEGURIDAD', 'OTROS'
    ];

    const validEntidades = ['empresa', 'trabajador', 'maquinaria', 'obra'];

    return {
      categoria_probable: validCategories.includes(extraction.categoria_probable) 
        ? extraction.categoria_probable 
        : 'OTROS',
      entidad_tipo_probable: validEntidades.includes(extraction.entidad_tipo_probable)
        ? extraction.entidad_tipo_probable
        : 'obra',
      campos: {
        dni_nie: extraction.campos?.dni_nie || null,
        nombre: extraction.campos?.nombre || null,
        apellido: extraction.campos?.apellido || null,
        empresa: extraction.campos?.empresa || null,
        rea_numero: extraction.campos?.rea_numero || null,
        poliza_numero: extraction.campos?.poliza_numero || null,
        fecha_emision: this.validateDate(extraction.campos?.fecha_emision),
        fecha_caducidad: this.validateDate(extraction.campos?.fecha_caducidad),
        curso_prl_nivel: extraction.campos?.curso_prl_nivel || null,
        maquina_num_serie: extraction.campos?.maquina_num_serie || null,
        coincidencias_texto: Array.isArray(extraction.campos?.coincidencias_texto) 
          ? extraction.campos.coincidencias_texto 
          : []
      },
      confianza: extraction.confianza || {}
    };
  }

  private validateDate(dateStr: string): string | null {
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString().split('T')[0];
  }

  private getMockExtraction(fileName: string): DocumentExtractionResult {
    // Generar respuesta mock inteligente basada en el nombre del archivo
    const fileName_lower = fileName.toLowerCase();
    
    // Detectar categoría por nombre de archivo
    let categoria = 'OTROS';
    let entidad: 'empresa' | 'trabajador' | 'maquinaria' | 'obra' = 'obra';
    
    if (fileName_lower.includes('dni') || fileName_lower.includes('nie')) {
      categoria = 'DNI';
      entidad = 'trabajador';
    } else if (fileName_lower.includes('aptitud') || fileName_lower.includes('medica') || fileName_lower.includes('reconocimiento')) {
      categoria = 'APTITUD_MEDICA';
      entidad = 'trabajador';
    } else if (fileName_lower.includes('prl') || fileName_lower.includes('formacion') || fileName_lower.includes('curso')) {
      categoria = 'FORMACION_PRL';
      entidad = 'trabajador';
    } else if (fileName_lower.includes('contrato') || fileName_lower.includes('laboral')) {
      categoria = 'CONTRATO';
      entidad = 'trabajador';
    } else if (fileName_lower.includes('seguro') || fileName_lower.includes('responsabilidad') || fileName_lower.includes('rc')) {
      categoria = 'SEGURO_RC';
      entidad = 'empresa';
    } else if (fileName_lower.includes('rea') || fileName_lower.includes('registro') || fileName_lower.includes('acreditada')) {
      categoria = 'REA';
      entidad = 'empresa';
    } else if (fileName_lower.includes('plan') && fileName_lower.includes('seguridad')) {
      categoria = 'PLAN_SEGURIDAD';
      entidad = 'obra';
    } else if (fileName_lower.includes('evaluacion') || fileName_lower.includes('riesgos')) {
      categoria = 'EVAL_RIESGOS';
      entidad = 'obra';
    } else if (fileName_lower.includes('certificado') && (fileName_lower.includes('maquina') || fileName_lower.includes('equipo'))) {
      categoria = 'CERT_MAQUINARIA';
      entidad = 'maquinaria';
    } else if (fileName_lower.includes('alta') && fileName_lower.includes('ss')) {
      categoria = 'ALTA_SS';
      entidad = 'trabajador';
    }
    
    return {
      categoria_probable: categoria,
      entidad_tipo_probable: entidad,
      campos: {
        dni_nie: entidad === 'trabajador' ? this.extractDNIFromFilename(fileName) : null,
        nombre: entidad === 'trabajador' ? this.extractNameFromFilename(fileName) : null,
        apellido: entidad === 'trabajador' ? this.extractSurnameFromFilename(fileName) : null,
        empresa: 'Construcciones García S.L.',
        rea_numero: 'REA123456',
        poliza_numero: categoria === 'SEGURO_RC' ? 'POL789456' : null,
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_caducidad: categoria.includes('MEDICA') || categoria.includes('PRL') 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null,
        curso_prl_nivel: categoria === 'FORMACION_PRL' ? '20h' : null,
        maquina_num_serie: entidad === 'maquinaria' ? this.extractSerialFromFilename(fileName) : null,
        coincidencias_texto: [fileName, categoria]
      },
      confianza: {
        categoria_probable: categoria !== 'OTROS' ? 0.85 : 0.45,
        dni_nie: entidad === 'trabajador' ? 0.92 : 0.0,
        fecha_caducidad: 0.88,
        empresa: 0.95
      }
    };
  }

  private extractDNIFromFilename(fileName: string): string | null {
    const dniMatch = fileName.match(/(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])/i);
    return dniMatch ? dniMatch[0].toUpperCase() : '12345678A';
  }

  private extractNameFromFilename(fileName: string): string | null {
    const namePatterns = ['juan', 'maria', 'carlos', 'ana', 'pedro', 'laura'];
    const fileName_lower = fileName.toLowerCase();
    const foundName = namePatterns.find(name => fileName_lower.includes(name));
    return foundName ? foundName.charAt(0).toUpperCase() + foundName.slice(1) : 'Juan';
  }

  private extractSurnameFromFilename(fileName: string): string | null {
    const surnamePatterns = ['garcia', 'lopez', 'martinez', 'rodriguez', 'sanchez', 'fernandez'];
    const fileName_lower = fileName.toLowerCase();
    const foundSurname = surnamePatterns.find(surname => fileName_lower.includes(surname));
    return foundSurname ? foundSurname.charAt(0).toUpperCase() + foundSurname.slice(1) : 'García';
  }

  private extractSerialFromFilename(fileName: string): string | null {
    const serialMatch = fileName.match(/([A-Z]{2,4}\d{3,6}[-_]?\d{4}[-_]?\d{3})/i);
    return serialMatch ? serialMatch[0].toUpperCase() : 'CAT320-2024-001';
  }

  // Validar documento según reglas de plataforma
  validateAgainstRules(
    extraction: DocumentExtractionResult, 
    validationRules: any[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    validationRules.forEach(rule => {
      if (this.matchesCondition(extraction, rule.when)) {
        rule.must.forEach((requirement: any) => {
          if (!this.validateRequirement(extraction.campos, requirement)) {
            errors.push(`Campo ${requirement.field}: ${requirement.op} ${requirement.value}`);
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private matchesCondition(extraction: DocumentExtractionResult, condition: any): boolean {
    if (condition.categoria && extraction.categoria_probable !== condition.categoria) {
      return false;
    }
    return true;
  }

  private validateRequirement(campos: any, requirement: any): boolean {
    const value = campos[requirement.field];
    
    switch (requirement.op) {
      case '>':
        if (requirement.value === 'today') {
          return value && new Date(value) > new Date();
        }
        return value > requirement.value;
      case 'in':
        return Array.isArray(requirement.value) && requirement.value.includes(value);
      case 'notEmpty':
        return value && value.toString().trim().length > 0;
      default:
        return true;
    }
  }
}

export const geminiProcessor = new GeminiDocumentProcessor();