// ConstructIA - Motor de Validación de Documentos
import type { DocumentExtractionResult } from './gemini-document-processor';

export interface ValidationRule {
  when: {
    categoria?: string;
    entidad_tipo?: string;
    [key: string]: any;
  };
  must: {
    field: string;
    op: 'in' | '>' | '<' | '=' | '!=' | 'notEmpty' | 'exists' | 'regex';
    value: any;
    message?: string;
  }[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredActions: string[];
}

export class ValidationEngine {
  private rules: ValidationRule[];
  private alertDays: number[];
  private maxFileMB: number;
  private allowedMimes: string[];

  constructor(
    rules: ValidationRule[] = [],
    config: {
      alertDays?: number[];
      maxFileMB?: number;
      allowedMimes?: string[];
    } = {}
  ) {
    this.rules = rules;
    this.alertDays = config.alertDays || [30, 15, 7];
    this.maxFileMB = config.maxFileMB || 20;
    this.allowedMimes = config.allowedMimes || [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];
  }

  // Validar archivo antes de procesamiento
  validateFile(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > this.maxFileMB) {
      errors.push(`El archivo excede el tamaño máximo de ${this.maxFileMB}MB`);
    }

    // Validar tipo MIME
    if (!this.allowedMimes.includes(file.type)) {
      errors.push(`Tipo de archivo no permitido: ${file.type}`);
    }

    // Advertencias por tamaño
    if (fileSizeMB > this.maxFileMB * 0.8) {
      warnings.push(`El archivo es grande (${fileSizeMB.toFixed(1)}MB). Considera optimizarlo.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiredActions: []
    };
  }

  // Validar extracción de documento
  validateExtraction(
    extraction: DocumentExtractionResult,
    categoria: string,
    entidadTipo: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredActions: string[] = [];

    // Verificar si la categoría detectada coincide con la seleccionada
    if (extraction.categoria_probable !== categoria) {
      warnings.push(
        `Categoría detectada (${extraction.categoria_probable}) difiere de la seleccionada (${categoria})`
      );
      requiredActions.push('revisar');
    }

    // Verificar tipo de entidad
    if (extraction.entidad_tipo_probable !== entidadTipo) {
      warnings.push(
        `Tipo de entidad detectado (${extraction.entidad_tipo_probable}) difiere del seleccionado (${entidadTipo})`
      );
    }

    // Aplicar reglas específicas
    const applicableRules = this.rules.filter(rule => 
      this.matchesCondition(extraction, categoria, entidadTipo, rule.when)
    );

    applicableRules.forEach(rule => {
      rule.must.forEach(requirement => {
        const validationResult = this.validateRequirement(extraction.campos, requirement);
        if (!validationResult.isValid) {
          errors.push(requirement.message || `${requirement.field}: ${validationResult.error}`);
          if (requirement.field === 'fecha_caducidad') {
            requiredActions.push('subsanar');
          }
        }
      });
    });

    // Validar fechas de caducidad
    if (extraction.campos.fecha_caducidad) {
      const caducidad = new Date(extraction.campos.fecha_caducidad);
      const hoy = new Date();
      
      if (caducidad <= hoy) {
        errors.push('El documento está caducado');
        requiredActions.push('subsanar');
      } else {
        // Verificar alertas de proximidad
        const diasRestantes = Math.ceil((caducidad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (this.alertDays.includes(diasRestantes)) {
          warnings.push(`El documento caduca en ${diasRestantes} días`);
          requiredActions.push('revisar');
        }
      }
    }

    // Validar campos obligatorios por categoría
    const requiredFields = this.getRequiredFieldsByCategory(categoria);
    requiredFields.forEach(field => {
      if (!extraction.campos[field as keyof typeof extraction.campos]) {
        errors.push(`Campo obligatorio faltante: ${field}`);
        requiredActions.push('revisar');
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiredActions: [...new Set(requiredActions)] // Remove duplicates
    };
  }

  private matchesCondition(
    extraction: DocumentExtractionResult,
    categoria: string,
    entidadTipo: string,
    condition: any
  ): boolean {
    if (condition.categoria && condition.categoria !== categoria) {
      return false;
    }
    if (condition.entidad_tipo && condition.entidad_tipo !== entidadTipo) {
      return false;
    }
    return true;
  }

  private validateRequirement(
    campos: any,
    requirement: any
  ): { isValid: boolean; error?: string } {
    const value = campos[requirement.field];
    
    switch (requirement.op) {
      case '>':
        if (requirement.value === 'today') {
          const isValid = value && new Date(value) > new Date();
          return {
            isValid,
            error: isValid ? undefined : 'La fecha debe ser posterior a hoy'
          };
        }
        return {
          isValid: value > requirement.value,
          error: `Debe ser mayor que ${requirement.value}`
        };
      
      case '<':
        if (requirement.value === 'today') {
          const isValid = value && new Date(value) < new Date();
          return {
            isValid,
            error: isValid ? undefined : 'La fecha debe ser anterior a hoy'
          };
        }
        return {
          isValid: value < requirement.value,
          error: `Debe ser menor que ${requirement.value}`
        };
      
      case 'in':
        const isValid = Array.isArray(requirement.value) && requirement.value.includes(value);
        return {
          isValid,
          error: isValid ? undefined : `Debe ser uno de: ${requirement.value.join(', ')}`
        };
      
      case 'notEmpty':
        const hasValue = value && value.toString().trim().length > 0;
        return {
          isValid: hasValue,
          error: hasValue ? undefined : 'Este campo es obligatorio'
        };
      
      case 'exists':
        return {
          isValid: value !== null && value !== undefined,
          error: 'Este campo debe existir'
        };
      
      case 'regex':
        const regex = new RegExp(requirement.value);
        const matches = value && regex.test(value.toString());
        return {
          isValid: matches,
          error: matches ? undefined : 'Formato inválido'
        };
      
      default:
        return { isValid: true };
    }
  }

  private getRequiredFieldsByCategory(categoria: string): string[] {
    const requiredFields: { [key: string]: string[] } = {
      'DNI': ['dni_nie'],
      'APTITUD_MEDICA': ['dni_nie', 'fecha_caducidad'],
      'FORMACION_PRL': ['dni_nie', 'curso_prl_nivel', 'fecha_caducidad'],
      'SEGURO_RC': ['poliza_numero', 'fecha_caducidad'],
      'REA': ['rea_numero'],
      'CERT_MAQUINARIA': ['maquina_num_serie', 'fecha_caducidad'],
      'CONTRATO': ['dni_nie', 'fecha_emision'],
      'ALTA_SS': ['dni_nie', 'fecha_emision']
    };

    return requiredFields[categoria] || [];
  }

  // Obtener reglas por defecto para cada plataforma
  static getDefaultRules(plataforma: string): ValidationRule[] {
    const baseRules: ValidationRule[] = [
      {
        when: { categoria: 'APTITUD_MEDICA' },
        must: [
          { field: 'fecha_caducidad', op: '>', value: 'today', message: 'La aptitud médica debe estar vigente' },
          { field: 'dni_nie', op: 'notEmpty', message: 'DNI/NIE es obligatorio para aptitud médica' }
        ]
      },
      {
        when: { categoria: 'FORMACION_PRL' },
        must: [
          { field: 'curso_prl_nivel', op: 'in', value: ['básico', '60h', '20h', '8h'], message: 'Nivel de PRL inválido' },
          { field: 'fecha_caducidad', op: '>', value: 'today', message: 'La formación PRL debe estar vigente' }
        ]
      },
      {
        when: { categoria: 'SEGURO_RC' },
        must: [
          { field: 'fecha_caducidad', op: '>', value: 'today', message: 'El seguro debe estar vigente' },
          { field: 'poliza_numero', op: 'notEmpty', message: 'Número de póliza es obligatorio' }
        ]
      },
      {
        when: { categoria: 'DNI' },
        must: [
          { field: 'dni_nie', op: 'regex', value: '^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$', message: 'Formato de DNI/NIE inválido' }
        ]
      }
    ];

    // Reglas específicas por plataforma
    switch (plataforma) {
      case 'nalanda':
        return [
          ...baseRules,
          {
            when: { categoria: 'REA' },
            must: [
              { field: 'rea_numero', op: 'notEmpty', message: 'Número REA obligatorio para Nalanda' }
            ]
          }
        ];
      
      case 'ctaima':
        return [
          ...baseRules,
          {
            when: { entidad_tipo: 'trabajador' },
            must: [
              { field: 'nombre', op: 'notEmpty', message: 'Nombre obligatorio en CTAIMA' },
              { field: 'apellido', op: 'notEmpty', message: 'Apellido obligatorio en CTAIMA' }
            ]
          }
        ];
      
      default:
        return baseRules;
    }
  }
}

export const validationEngine = new ValidationEngine();