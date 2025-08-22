// ConstructIA - Sistema de Mapping y Transformaciones
// Tipos para gestión de templates de mapping y workflows

export interface MappingRule {
  from: string;
  to: string;
  transform?: string;
  condition?: string;
  default?: any;
}

export interface MappingTemplate {
  id: string;
  tenant_id: string;
  plataforma: 'nalanda' | 'ctaima' | 'ecoordina' | 'otro';
  version: number;
  schema_destino: any;
  rules: MappingRule[];
  created_at: string;
  updated_at: string;
}

export interface TransformFunction {
  name: string;
  description: string;
  apply: (value: any, params?: string) => any;
}

// Motor de transformaciones
export class TransformEngine {
  private static transforms: { [key: string]: TransformFunction } = {
    upper: {
      name: 'upper',
      description: 'Convertir a mayúsculas',
      apply: (value: string) => value?.toString().toUpperCase() || ''
    },
    lower: {
      name: 'lower', 
      description: 'Convertir a minúsculas',
      apply: (value: string) => value?.toString().toLowerCase() || ''
    },
    date: {
      name: 'date',
      description: 'Formatear fecha',
      apply: (value: string, format: string = 'YYYY-MM-DD') => {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date.getTime())) return '';
        
        switch (format) {
          case 'YYYY-MM-DD':
            return date.toISOString().split('T')[0];
          case 'DD/MM/YYYY':
            return date.toLocaleDateString('es-ES');
          case 'MM/DD/YYYY':
            return date.toLocaleDateString('en-US');
          default:
            return date.toISOString().split('T')[0];
        }
      }
    },
    map: {
      name: 'map',
      description: 'Mapear valores usando diccionario',
      apply: (value: string, mappingStr: string) => {
        if (!value || !mappingStr) return value;
        
        const mappings = mappingStr.split('|').reduce((acc, pair) => {
          const [from, to] = pair.split('=');
          if (from && to) {
            acc[from.trim()] = to.trim();
          }
          return acc;
        }, {} as { [key: string]: string });
        
        // Buscar mapeo exacto o wildcard
        return mappings[value] || mappings['*'] || value;
      }
    },
    trim: {
      name: 'trim',
      description: 'Eliminar espacios en blanco',
      apply: (value: string) => value?.toString().trim() || ''
    },
    prefix: {
      name: 'prefix',
      description: 'Añadir prefijo',
      apply: (value: string, prefix: string) => `${prefix}${value || ''}`
    },
    suffix: {
      name: 'suffix',
      description: 'Añadir sufijo',
      apply: (value: string, suffix: string) => `${value || ''}${suffix}`
    },
    replace: {
      name: 'replace',
      description: 'Reemplazar texto',
      apply: (value: string, params: string) => {
        if (!value || !params) return value;
        const [search, replace] = params.split('|');
        return value.toString().replace(new RegExp(search, 'g'), replace || '');
      }
    }
  };

  static applyTransform(value: any, transformStr: string): any {
    if (!transformStr) return value;

    const [transformName, params] = transformStr.split(':');
    const transform = this.transforms[transformName];
    
    if (!transform) {
      console.warn(`Transform '${transformName}' not found`);
      return value;
    }

    return transform.apply(value, params);
  }

  static getAvailableTransforms(): TransformFunction[] {
    return Object.values(this.transforms);
  }
}

// Motor de mapping
export class MappingEngine {
  private template: MappingTemplate;

  constructor(template: MappingTemplate) {
    this.template = template;
  }

  // Aplicar mapping a un payload
  transform(sourcePayload: any): any {
    const result = JSON.parse(JSON.stringify(this.template.schema_destino));

    this.template.rules.forEach(rule => {
      try {
        const sourceValue = this.getValueByPath(sourcePayload, rule.from);
        let transformedValue = sourceValue;

        // Aplicar transformación si existe
        if (rule.transform) {
          transformedValue = TransformEngine.applyTransform(sourceValue, rule.transform);
        }

        // Aplicar valor por defecto si no hay valor
        if ((transformedValue === null || transformedValue === undefined || transformedValue === '') && rule.default !== undefined) {
          transformedValue = rule.default;
        }

        // Establecer valor en destino
        this.setValueByPath(result, rule.to, transformedValue);
      } catch (error) {
        console.error(`Error applying rule ${rule.from} -> ${rule.to}:`, error);
      }
    });

    return result;
  }

  // Obtener valor usando path notation (ej: "Company.name", "Worker[*].dni")
  private getValueByPath(obj: any, path: string): any {
    if (!obj || !path) return null;

    // Manejar arrays con [*]
    if (path.includes('[*]')) {
      const [arrayPath, itemPath] = path.split('[*].');
      const arrayValue = this.getValueByPath(obj, arrayPath);
      
      if (!Array.isArray(arrayValue)) return null;
      
      return arrayValue.map(item => this.getValueByPath(item, itemPath));
    }

    // Path simple con puntos
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Establecer valor usando path notation
  private setValueByPath(obj: any, path: string, value: any): void {
    if (!obj || !path) return;

    // Manejar arrays con [*]
    if (path.includes('[*]')) {
      const [arrayPath, itemPath] = path.split('[*].');
      const arrayContainer = this.getOrCreateByPath(obj, arrayPath);
      
      if (!Array.isArray(arrayContainer)) {
        this.setValueByPath(obj, arrayPath, []);
      }
      
      const targetArray = this.getValueByPath(obj, arrayPath);
      
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (!targetArray[index]) {
            targetArray[index] = {};
          }
          this.setValueByPath(targetArray[index], itemPath, item);
        });
      }
      return;
    }

    // Path simple con puntos
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  // Obtener o crear objeto por path
  private getOrCreateByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
  }

  // Validar que el resultado cumple con el schema destino
  validate(transformedPayload: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validación básica del schema
    this.validateSchema(transformedPayload, this.template.schema_destino, '', errors);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateSchema(obj: any, schema: any, path: string, errors: string[]): void {
    if (typeof schema === 'object' && schema !== null) {
      if (Array.isArray(schema)) {
        if (!Array.isArray(obj)) {
          errors.push(`${path} should be an array`);
          return;
        }
        // Validar elementos del array si hay schema definido
        if (schema.length > 0) {
          obj.forEach((item, index) => {
            this.validateSchema(item, schema[0], `${path}[${index}]`, errors);
          });
        }
      } else {
        Object.keys(schema).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          if (obj && obj[key] !== undefined) {
            this.validateSchema(obj[key], schema[key], newPath, errors);
          }
        });
      }
    }
  }
}

// Servicio de gestión de templates
export class MappingTemplateService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Obtener template por plataforma
  async getTemplate(plataforma: string, version?: number): Promise<MappingTemplate | null> {
    try {
      // En desarrollo, usar templates predefinidos
      const templates = this.getDefaultTemplates();
      return templates.find(t => 
        t.plataforma === plataforma && 
        (version ? t.version === version : true)
      ) || null;
    } catch (error) {
      console.error('Error getting mapping template:', error);
      return null;
    }
  }

  // Obtener todos los templates
  async getAllTemplates(): Promise<MappingTemplate[]> {
    try {
      return this.getDefaultTemplates();
    } catch (error) {
      console.error('Error getting all templates:', error);
      return [];
    }
  }

  // Templates por defecto basados en el esquema proporcionado
  private getDefaultTemplates(): MappingTemplate[] {
    return [
      {
        id: 'nalanda-v1',
        tenant_id: this.tenantId,
        plataforma: 'nalanda',
        version: 1,
        schema_destino: {
          "company": {"taxId":"", "name":"", "rea":"", "contactEmail":""},
          "site": {"code":"", "name":"", "client":"", "riskProfile":""},
          "workers": [
            {"idNumber":"", "name":"", "surname":"", "prlLevel":"", "prlExpiry":""}
          ],
          "machines": [
            {"serial":"", "type":"", "maintenanceExpiry":""}
          ],
          "attachments": [
            {"type":"", "url":"", "expiry":"", "metadata":{}}
          ]
        },
        rules: [
          {"from":"Company.cif", "to":"company.taxId"},
          {"from":"Company.name", "to":"company.name"},
          {"from":"Company.rea", "to":"company.rea"},
          {"from":"Company.contactEmail", "to":"company.contactEmail"},
          {"from":"Site.code", "to":"site.code"},
          {"from":"Site.name", "to":"site.name"},
          {"from":"Site.client", "to":"site.client"},
          {"from":"Site.riskProfile", "to":"site.riskProfile"},
          {"from":"Worker[*].dni", "to":"workers[*].idNumber", "transform":"upper"},
          {"from":"Worker[*].name", "to":"workers[*].name"},
          {"from":"Worker[*].surname", "to":"workers[*].surname"},
          {"from":"Worker[*].prlLevel", "to":"workers[*].prlLevel"},
          {"from":"Worker[*].prlExpiry", "to":"workers[*].prlExpiry", "transform":"date:YYYY-MM-DD"},
          {"from":"Machine[*].serial", "to":"machines[*].serial"},
          {"from":"Machine[*].type", "to":"machines[*].type"},
          {"from":"Machine[*].maintenanceExpiry", "to":"machines[*].maintenanceExpiry", "transform":"date:YYYY-MM-DD"},
          {"from":"Docs[*].category", "to":"attachments[*].type", "transform":"map:PRL=OSH_CERT|APTITUD_MEDICA=MED_CERT|DNI=ID_DOC|ALTA_SS=SS_ENROLL|CONTRATO=CONTRACT|SEGURO_RC=LIABILITY_INS|REA=REA_CERT|FORMACION_PRL=TRAINING|EVAL_RIESGOS=RISK_ASSESS|CERT_MAQUINARIA=MACHINE_CERT|PLAN_SEGURIDAD=HSE_PLAN|OTROS=OTHER"},
          {"from":"Docs[*].fileUrl", "to":"attachments[*].url"},
          {"from":"Docs[*].expiry", "to":"attachments[*].expiry", "transform":"date:YYYY-MM-DD"},
          {"from":"Docs[*].meta", "to":"attachments[*].metadata"}
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'ctaima-v1',
        tenant_id: this.tenantId,
        plataforma: 'ctaima',
        version: 1,
        schema_destino: {
          "empresa": {"cif":"", "razonSocial":"", "rea":"", "correo":""},
          "obra": {"codigo":"", "nombre":"", "cliente":"", "riesgo":""},
          "personal": [
            {"dni":"", "nombre":"", "apellidos":"", "prlNivel":"", "prlCaducidad":""}
          ],
          "equipos": [
            {"numSerie":"", "tipo":"", "mtoCaducidad":""}
          ],
          "documentos": [
            {"categoria":"", "enlace":"", "caducidad":"", "meta":{}}
          ]
        },
        rules: [
          {"from":"Company.cif", "to":"empresa.cif"},
          {"from":"Company.name", "to":"empresa.razonSocial"},
          {"from":"Company.rea", "to":"empresa.rea"},
          {"from":"Company.contactEmail", "to":"empresa.correo"},
          {"from":"Site.code", "to":"obra.codigo"},
          {"from":"Site.name", "to":"obra.nombre"},
          {"from":"Site.client", "to":"obra.cliente"},
          {"from":"Site.riskProfile", "to":"obra.riesgo", "transform":"map:low=baja|medium=media|high=alta|*=media"},
          {"from":"Worker[*].dni", "to":"personal[*].dni"},
          {"from":"Worker[*].name", "to":"personal[*].nombre"},
          {"from":"Worker[*].surname", "to":"personal[*].apellidos"},
          {"from":"Worker[*].prlLevel", "to":"personal[*].prlNivel"},
          {"from":"Worker[*].prlExpiry", "to":"personal[*].prlCaducidad", "transform":"date:YYYY-MM-DD"},
          {"from":"Machine[*].serial", "to":"equipos[*].numSerie"},
          {"from":"Machine[*].type", "to":"equipos[*].tipo"},
          {"from":"Machine[*].maintenanceExpiry", "to":"equipos[*].mtoCaducidad", "transform":"date:YYYY-MM-DD"},
          {"from":"Docs[*].category", "to":"documentos[*].categoria"},
          {"from":"Docs[*].fileUrl", "to":"documentos[*].enlace"},
          {"from":"Docs[*].expiry", "to":"documentos[*].caducidad", "transform":"date:YYYY-MM-DD"},
          {"from":"Docs[*].meta", "to":"documentos[*].meta"}
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'ecoordina-v1',
        tenant_id: this.tenantId,
        plataforma: 'ecoordina',
        version: 1,
        schema_destino: {
          "taxId":"", "companyName":"", "reaNumber":"", "email":"",
          "project":{"id":"","name":"","client":"","risk":""},
          "people":[{"nid":"","firstName":"","lastName":"","training":"","trainingExpiry":""}],
          "gear":[{"sn":"","kind":"","serviceDue":""}],
          "files":[{"kind":"","url":"","expiresOn":"","meta":{}}]
        },
        rules: [
          {"from":"Company.cif", "to":"taxId"},
          {"from":"Company.name", "to":"companyName"},
          {"from":"Company.rea", "to":"reaNumber"},
          {"from":"Company.contactEmail", "to":"email"},
          {"from":"Site.code", "to":"project.id"},
          {"from":"Site.name", "to":"project.name"},
          {"from":"Site.client", "to":"project.client"},
          {"from":"Site.riskProfile", "to":"project.risk"},
          {"from":"Worker[*].dni", "to":"people[*].nid"},
          {"from":"Worker[*].name", "to":"people[*].firstName"},
          {"from":"Worker[*].surname", "to":"people[*].lastName"},
          {"from":"Worker[*].prlLevel", "to":"people[*].training"},
          {"from":"Worker[*].prlExpiry", "to":"people[*].trainingExpiry", "transform":"date:YYYY-MM-DD"},
          {"from":"Machine[*].serial", "to":"gear[*].sn"},
          {"from":"Machine[*].type", "to":"gear[*].kind"},
          {"from":"Machine[*].maintenanceExpiry", "to":"gear[*].serviceDue", "transform":"date:YYYY-MM-DD"},
          {"from":"Docs[*].category", "to":"files[*].kind"},
          {"from":"Docs[*].fileUrl", "to":"files[*].url"},
          {"from":"Docs[*].expiry", "to":"files[*].expiresOn", "transform":"date:YYYY-MM-DD"},
          {"from":"Docs[*].meta", "to":"files[*].meta"}
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Crear template personalizado
  async createTemplate(
    plataforma: string,
    schemaDestino: any,
    rules: MappingRule[]
  ): Promise<MappingTemplate> {
    const template: MappingTemplate = {
      id: `${plataforma}-custom-${Date.now()}`,
      tenant_id: this.tenantId,
      plataforma: plataforma as any,
      version: 1,
      schema_destino: schemaDestino,
      rules,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // En producción, guardar en base de datos
    console.log('📝 Template creado:', template);
    
    return template;
  }

  // Validar template
  validateTemplate(template: MappingTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar que tiene schema destino
    if (!template.schema_destino) {
      errors.push('Schema destino es requerido');
    }

    // Validar que tiene reglas
    if (!template.rules || template.rules.length === 0) {
      errors.push('Al menos una regla de mapping es requerida');
    }

    // Validar reglas
    template.rules?.forEach((rule, index) => {
      if (!rule.from) {
        errors.push(`Regla ${index + 1}: Campo 'from' es requerido`);
      }
      if (!rule.to) {
        errors.push(`Regla ${index + 1}: Campo 'to' es requerido`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Workflow de procesamiento
export interface WorkflowStep {
  id: string;
  name: string;
  type: 'transform' | 'validate' | 'send' | 'notify';
  config: any;
  order: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  plataforma: string;
  steps: WorkflowStep[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export class WorkflowEngine {
  private workflow: Workflow;

  constructor(workflow: Workflow) {
    this.workflow = workflow;
  }

  // Ejecutar workflow completo
  async execute(payload: any): Promise<{ success: boolean; result?: any; errors?: string[] }> {
    try {
      let currentPayload = payload;
      const errors: string[] = [];

      // Ejecutar pasos en orden
      const sortedSteps = this.workflow.steps.sort((a, b) => a.order - b.order);
      
      for (const step of sortedSteps) {
        try {
          currentPayload = await this.executeStep(step, currentPayload);
        } catch (error) {
          errors.push(`Error en paso ${step.name}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        result: currentPayload,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Error ejecutando workflow: ${error}`]
      };
    }
  }

  private async executeStep(step: WorkflowStep, payload: any): Promise<any> {
    switch (step.type) {
      case 'transform':
        return this.executeTransformStep(step, payload);
      case 'validate':
        return this.executeValidateStep(step, payload);
      case 'send':
        return this.executeSendStep(step, payload);
      case 'notify':
        return this.executeNotifyStep(step, payload);
      default:
        throw new Error(`Tipo de paso desconocido: ${step.type}`);
    }
  }

  private executeTransformStep(step: WorkflowStep, payload: any): any {
    const { templateId } = step.config;
    // Aquí se aplicaría el template de mapping
    console.log(`🔄 Ejecutando transformación con template: ${templateId}`);
    return payload;
  }

  private executeValidateStep(step: WorkflowStep, payload: any): any {
    const { rules } = step.config;
    // Aquí se aplicarían las reglas de validación
    console.log(`✅ Ejecutando validación con reglas:`, rules);
    return payload;
  }

  private async executeSendStep(step: WorkflowStep, payload: any): Promise<any> {
    const { endpoint, method, headers } = step.config;
    // Aquí se enviaría el payload al endpoint
    console.log(`📤 Enviando payload a: ${endpoint}`);
    return payload;
  }

  private executeNotifyStep(step: WorkflowStep, payload: any): any {
    const { recipients, template } = step.config;
    // Aquí se enviarían notificaciones
    console.log(`📧 Enviando notificaciones a:`, recipients);
    return payload;
  }
}

// Exportar todo
export {
  MappingEngine,
  MappingTemplateService,
  WorkflowEngine,
  TransformEngine
};

export type {
  MappingRule,
  MappingTemplate,
  TransformFunction,
  WorkflowStep,
  Workflow
};