// ConstructIA - Datos Semilla para Desarrollo
import { supabaseNew } from './supabase-new';
import type { 
  Tenant, 
  NewUser, 
  Empresa, 
  Obra, 
  Proveedor, 
  Trabajador, 
  Maquinaria,
  NewDocumento,
  Adaptador,
  RequisitoPlataforma,
  MappingTemplate,
  CheckoutProvider
} from '../types';

export class SeedDataService {
  private tenantId: string;

  constructor(tenantId: string = '00000000-0000-0000-0000-000000000001') {
    this.tenantId = tenantId;
  }

  async seedAll(): Promise<void> {
    console.log('🌱 Iniciando población de datos semilla...');

    try {
      await this.seedTenants();
      await this.seedUsers();
      await this.seedEmpresas();
      await this.seedObras();
      await this.seedProveedores();
      await this.seedTrabajadores();
      await this.seedMaquinaria();
      await this.seedDocumentos();
      await this.seedRequisitosPlataforma();
      await this.seedMappingTemplates();
      await this.seedAdaptadores();
      await this.seedCheckoutProviders();
      await this.seedReportTemplates();

      console.log('✅ Datos semilla poblados exitosamente');
    } catch (error) {
      console.error('❌ Error poblando datos semilla:', error);
      throw error;
    }
  }

  private async seedTenants(): Promise<void> {
    const tenants: Partial<Tenant>[] = [
      {
        id: this.tenantId,
        name: 'DemoCorp',
        status: 'active'
      }
    ];

    const { error } = await supabaseNew
      .from('tenants')
      .upsert(tenants);

    if (error) {
      console.error('Error seeding tenants:', error);
      throw error;
    }

    console.log('✅ Tenants creados');
  }

  private async seedUsers(): Promise<void> {
    const users: Partial<NewUser>[] = [
      {
        id: '20000000-0000-0000-0000-000000000001',
        tenant_id: this.tenantId,
        email: 'admin@constructia.com',
        name: 'Super Admin',
        role: 'SuperAdmin',
        active: true
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        tenant_id: this.tenantId,
        email: 'cliente@test.com',
        name: 'Cliente Demo',
        role: 'ClienteAdmin',
        active: true
      },
      {
        id: '20000000-0000-0000-0000-000000000003',
        tenant_id: this.tenantId,
        email: 'gestor@test.com',
        name: 'Gestor Documental',
        role: 'GestorDocumental',
        active: true
      }
    ];

    const { error } = await supabaseNew
      .from('users')
      .upsert(users);

    if (error) {
      console.error('Error seeding users:', error);
      throw error;
    }

    console.log('✅ Usuarios creados');
  }

  private async seedEmpresas(): Promise<void> {
    const empresas: Partial<Empresa>[] = [
      {
        tenant_id: this.tenantId,
        razon_social: 'Construcciones García S.L.',
        cif: 'B12345678',
        rea_numero: 'REA123456',
        cnae: '4120',
        direccion: 'Calle Construcción 123, 28001 Madrid',
        contacto_email: 'info@construccionesgarcia.com',
        estado_compliance: 'al_dia'
      },
      {
        tenant_id: this.tenantId,
        razon_social: 'Reformas Integrales López',
        cif: 'B87654321',
        rea_numero: 'REA654321',
        cnae: '4330',
        direccion: 'Avenida Reforma 456, 28002 Madrid',
        contacto_email: 'contacto@reformaslopez.com',
        estado_compliance: 'pendiente'
      }
    ];

    const { data, error } = await supabaseNew
      .from('empresas')
      .upsert(empresas)
      .select();

    if (error) {
      console.error('Error seeding empresas:', error);
      throw error;
    }

    this.empresasCreated = data;
    console.log('✅ Empresas creadas');
  }

  private async seedObras(): Promise<void> {
    if (!this.empresasCreated || this.empresasCreated.length === 0) {
      throw new Error('Empresas must be created first');
    }

    const obras: Partial<Obra>[] = [
      {
        tenant_id: this.tenantId,
        empresa_id: this.empresasCreated[0].id,
        nombre_obra: 'Edificio Residencial García',
        codigo_obra: 'OBRA-001',
        direccion: 'Calle Nueva 789, Madrid',
        cliente_final: 'Inmobiliaria Madrid S.A.',
        fecha_inicio: '2024-01-15',
        fecha_fin_estimada: '2025-06-30',
        plataforma_destino: 'nalanda',
        perfil_riesgo: 'media'
      },
      {
        tenant_id: this.tenantId,
        empresa_id: this.empresasCreated[1].id,
        nombre_obra: 'Reforma Oficinas Centro',
        codigo_obra: 'OBRA-002',
        direccion: 'Gran Vía 123, Madrid',
        cliente_final: 'Corporación Empresarial S.L.',
        fecha_inicio: '2024-03-01',
        fecha_fin_estimada: '2024-12-15',
        plataforma_destino: 'ctaima',
        perfil_riesgo: 'baja'
      }
    ];

    const { data, error } = await supabaseNew
      .from('obras')
      .upsert(obras)
      .select();

    if (error) {
      console.error('Error seeding obras:', error);
      throw error;
    }

    this.obrasCreated = data;
    console.log('✅ Obras creadas');
  }

  private async seedProveedores(): Promise<void> {
    if (!this.empresasCreated || this.empresasCreated.length === 0) {
      throw new Error('Empresas must be created first');
    }

    const proveedores: Partial<Proveedor>[] = [
      {
        tenant_id: this.tenantId,
        empresa_id: this.empresasCreated[0].id,
        razon_social: 'Subcontratas del Norte S.L.',
        cif: 'B11111111',
        rea_numero: 'REA111111',
        contacto_email: 'admin@subcontratanorte.com',
        estado_homologacion: 'ok'
      },
      {
        tenant_id: this.tenantId,
        empresa_id: this.empresasCreated[1].id,
        razon_social: 'Especialistas en Soldadura S.A.',
        cif: 'B22222222',
        rea_numero: 'REA222222',
        contacto_email: 'info@soldaduraesp.com',
        estado_homologacion: 'pendiente'
      }
    ];

    const { data, error } = await supabaseNew
      .from('proveedores')
      .upsert(proveedores)
      .select();

    if (error) {
      console.error('Error seeding proveedores:', error);
      throw error;
    }

    this.proveedoresCreated = data;
    console.log('✅ Proveedores creados');
  }

  private async seedTrabajadores(): Promise<void> {
    if (!this.proveedoresCreated || this.proveedoresCreated.length === 0) {
      throw new Error('Proveedores must be created first');
    }

    const trabajadores: Partial<Trabajador>[] = [
      {
        tenant_id: this.tenantId,
        proveedor_id: this.proveedoresCreated[0].id,
        dni_nie: '12345678A',
        nombre: 'Juan',
        apellido: 'Pérez',
        nss: '281234567890',
        puesto: 'Oficial de Primera',
        aptitud_medica_caducidad: '2025-12-31',
        formacion_prl_nivel: '20h',
        formacion_prl_caducidad: '2025-06-30',
        epis_entregadas: true
      },
      {
        tenant_id: this.tenantId,
        proveedor_id: this.proveedoresCreated[1].id,
        dni_nie: '87654321B',
        nombre: 'María',
        apellido: 'González',
        nss: '281234567891',
        puesto: 'Soldadora',
        aptitud_medica_caducidad: '2025-11-30',
        formacion_prl_nivel: '60h',
        formacion_prl_caducidad: '2025-08-15',
        epis_entregadas: true
      }
    ];

    const { data, error } = await supabaseNew
      .from('trabajadores')
      .upsert(trabajadores)
      .select();

    if (error) {
      console.error('Error seeding trabajadores:', error);
      throw error;
    }

    this.trabajadoresCreated = data;
    console.log('✅ Trabajadores creados');
  }

  private async seedMaquinaria(): Promise<void> {
    if (!this.empresasCreated || this.empresasCreated.length === 0) {
      throw new Error('Empresas must be created first');
    }

    const maquinaria: Partial<Maquinaria>[] = [
      {
        tenant_id: this.tenantId,
        empresa_id: this.empresasCreated[0].id,
        tipo: 'Grúa Torre',
        marca_modelo: 'Liebherr 280 EC-H',
        numero_serie: 'LH280-2024-001',
        certificado_ce: true,
        mantenimiento_caducidad: '2025-03-15',
        seguro_caducidad: '2025-12-31'
      },
      {
        tenant_id: this.tenantId,
        empresa_id: this.empresasCreated[1].id,
        tipo: 'Excavadora',
        marca_modelo: 'Caterpillar 320D',
        numero_serie: 'CAT320-2023-045',
        certificado_ce: true,
        mantenimiento_caducidad: '2025-02-28',
        seguro_caducidad: '2025-10-15'
      }
    ];

    const { data, error } = await supabaseNew
      .from('maquinaria')
      .upsert(maquinaria)
      .select();

    if (error) {
      console.error('Error seeding maquinaria:', error);
      throw error;
    }

    this.maquinariaCreated = data;
    console.log('✅ Maquinaria creada');
  }

  private async seedDocumentos(): Promise<void> {
    if (!this.trabajadoresCreated || !this.maquinariaCreated) {
      throw new Error('Trabajadores and Maquinaria must be created first');
    }

    const documentos: Partial<NewDocumento>[] = [];

    // Documentos para trabajadores
    this.trabajadoresCreated.forEach(trabajador => {
      documentos.push(
        {
          tenant_id: this.tenantId,
          entidad_tipo: 'trabajador',
          entidad_id: trabajador.id,
          categoria: 'DNI',
          file: `${this.tenantId}/trabajador/${trabajador.id}/DNI/dni_${trabajador.dni_nie}.pdf`,
          mime: 'application/pdf',
          size_bytes: 1024000,
          hash_sha256: `hash_dni_${trabajador.dni_nie}`,
          version: 1,
          estado: 'aprobado',
          metadatos: {
            ai_extraction: {
              categoria_probable: 'DNI',
              campos: {
                dni_nie: trabajador.dni_nie,
                nombre: trabajador.nombre,
                apellido: trabajador.apellido
              },
              confianza: { dni_nie: 0.95, nombre: 0.92 }
            }
          },
          origen: 'usuario'
        },
        {
          tenant_id: this.tenantId,
          entidad_tipo: 'trabajador',
          entidad_id: trabajador.id,
          categoria: 'APTITUD_MEDICA',
          file: `${this.tenantId}/trabajador/${trabajador.id}/APTITUD_MEDICA/aptitud_${trabajador.dni_nie}.pdf`,
          mime: 'application/pdf',
          size_bytes: 2048000,
          hash_sha256: `hash_aptitud_${trabajador.dni_nie}`,
          version: 1,
          estado: 'aprobado',
          caducidad: trabajador.aptitud_medica_caducidad,
          metadatos: {
            ai_extraction: {
              categoria_probable: 'APTITUD_MEDICA',
              campos: {
                dni_nie: trabajador.dni_nie,
                fecha_caducidad: trabajador.aptitud_medica_caducidad
              },
              confianza: { fecha_caducidad: 0.88 }
            }
          },
          origen: 'usuario'
        }
      );
    });

    // Documentos para maquinaria
    this.maquinariaCreated.forEach(maquina => {
      documentos.push({
        tenant_id: this.tenantId,
        entidad_tipo: 'maquinaria',
        entidad_id: maquina.id,
        categoria: 'CERT_MAQUINARIA',
        file: `${this.tenantId}/maquinaria/${maquina.id}/CERT_MAQUINARIA/cert_${maquina.numero_serie}.pdf`,
        mime: 'application/pdf',
        size_bytes: 1536000,
        hash_sha256: `hash_cert_${maquina.numero_serie}`,
        version: 1,
        estado: 'pendiente',
        caducidad: maquina.mantenimiento_caducidad,
        metadatos: {
          ai_extraction: {
            categoria_probable: 'CERT_MAQUINARIA',
            campos: {
              maquina_num_serie: maquina.numero_serie,
              fecha_caducidad: maquina.mantenimiento_caducidad
            },
            confianza: { maquina_num_serie: 0.95 }
          }
        },
        origen: 'usuario'
      });
    });

    const { error } = await supabaseNew
      .from('documentos')
      .upsert(documentos);

    if (error) {
      console.error('Error seeding documentos:', error);
      throw error;
    }

    console.log(`✅ ${documentos.length} documentos creados`);
  }

  private async seedRequisitosPlataforma(): Promise<void> {
    const requisitos: Partial<RequisitoPlataforma>[] = [
      {
        tenant_id: this.tenantId,
        plataforma: 'nalanda',
        aplica_a: 'trabajador',
        perfil_riesgo: 'media',
        categoria: 'DNI',
        obligatorio: true,
        reglas_validacion: [
          {"when":{"categoria":"DNI"}, "must":[{"field":"dni_nie","op":"notEmpty"}]}
        ]
      },
      {
        tenant_id: this.tenantId,
        plataforma: 'nalanda',
        aplica_a: 'trabajador',
        perfil_riesgo: 'media',
        categoria: 'APTITUD_MEDICA',
        obligatorio: true,
        reglas_validacion: [
          {"when":{"categoria":"APTITUD_MEDICA"}, "must":[{"field":"fecha_caducidad","op":">","value":"today"}]}
        ]
      },
      {
        tenant_id: this.tenantId,
        plataforma: 'ctaima',
        aplica_a: 'maquinaria',
        perfil_riesgo: 'alta',
        categoria: 'CERT_MAQUINARIA',
        obligatorio: true,
        reglas_validacion: [
          {"when":{"categoria":"CERT_MAQUINARIA"}, "must":[{"field":"maquina_num_serie","op":"notEmpty"}]}
        ]
      }
    ];

    const { error } = await supabaseNew
      .from('requisitos_plataforma')
      .upsert(requisitos);

    if (error) {
      console.error('Error seeding requisitos:', error);
      throw error;
    }

    console.log(`✅ ${requisitos.length} requisitos de plataforma creados`);
  }

  private async seedMappingTemplates(): Promise<void> {
    const templates: Partial<MappingTemplate>[] = [
      {
        tenant_id: this.tenantId,
        plataforma: 'nalanda',
        version: 1,
        schema_destino: {
          "company": {"taxId":"", "name":"", "rea":"", "contactEmail":""},
          "site": {"code":"", "name":"", "client":"", "riskProfile":""},
          "workers": [{"idNumber":"", "name":"", "surname":"", "prlLevel":"", "prlExpiry":""}],
          "machines": [{"serial":"", "type":"", "maintenanceExpiry":""}],
          "attachments": [{"type":"", "url":"", "expiry":"", "metadata":{}}]
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
        ]
      },
      {
        tenant_id: this.tenantId,
        plataforma: 'ctaima',
        version: 1,
        schema_destino: {
          "empresa": {"cif":"", "razonSocial":"", "rea":"", "correo":""},
          "obra": {"codigo":"", "nombre":"", "cliente":"", "riesgo":""},
          "personal": [{"dni":"", "nombre":"", "apellidos":"", "prlNivel":"", "prlCaducidad":""}],
          "equipos": [{"numSerie":"", "tipo":"", "mtoCaducidad":""}],
          "documentos": [{"categoria":"", "enlace":"", "caducidad":"", "meta":{}}]
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
        ]
      }
    ];

    const { error } = await supabaseNew
      .from('mapping_templates')
      .upsert(templates);

    if (error) {
      console.error('Error seeding mapping templates:', error);
      throw error;
    }

    console.log(`✅ ${templates.length} mapping templates creados`);
  }

  private async seedAdaptadores(): Promise<void> {
    const adaptadores: Partial<Adaptador>[] = [
      {
        tenant_id: this.tenantId,
        plataforma: 'nalanda',
        alias: 'Nalanda Principal',
        credenciales: {
          tipo: 'http-json',
          apiBase: 'https://api.nalanda.com/v1',
          apiKey: 'test_key_nalanda',
          webhookSecret: 'webhook_secret_nalanda',
          endpoints: {
            import: '/v1/cae/import'
          }
        },
        estado: 'ready'
      },
      {
        tenant_id: this.tenantId,
        plataforma: 'ctaima',
        alias: 'CTAIMA Principal',
        credenciales: {
          tipo: 'http-json',
          apiBase: 'https://api.ctaima.com/v2',
          apiKey: 'test_key_ctaima',
          webhookSecret: 'webhook_secret_ctaima',
          endpoints: {
            import: '/v2/projects/import'
          }
        },
        estado: 'ready'
      }
    ];

    const { error } = await supabaseNew
      .from('adaptadores')
      .upsert(adaptadores);

    if (error) {
      console.error('Error seeding adaptadores:', error);
      throw error;
    }

    console.log(`✅ ${adaptadores.length} adaptadores creados`);
  }

  private async seedCheckoutProviders(): Promise<void> {
    const providers: Partial<CheckoutProvider>[] = [
      {
        tenant_id: this.tenantId,
        proveedor: 'stripe',
        comision_pct: 2.9,
        config: {
          pubKey: 'pk_test_...',
          secret: 'sk_test_...',
          webhookSecret: 'whsec_...'
        }
      },
      {
        tenant_id: this.tenantId,
        proveedor: 'sepa',
        comision_pct: 0.5,
        config: {
          iban_validation: true,
          mandate_required: true
        }
      }
    ];

    const { error } = await supabaseNew
      .from('checkout_providers')
      .upsert(providers);

    if (error) {
      console.error('Error seeding checkout providers:', error);
      throw error;
    }

    console.log(`✅ ${providers.length} checkout providers creados`);
  }

  private async seedReportTemplates(): Promise<void> {
    const templates = [
      {
        tenant_id: this.tenantId,
        name: 'Mensual Operativo',
        type: 'operativo',
        html_base64: btoa(`
          <style>
            body { font-family: Century Gothic, sans-serif; }
            .header { background: #0FA958; color: white; padding: 20px; }
            .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .metric { background: #f9f9f9; padding: 15px; border-radius: 8px; }
          </style>
          <div>
            <div class="header">
              <h1>Reporte Operativo {{period}}</h1>
              <p>ConstructIA - Gestión Documental Inteligente</p>
            </div>
            <div class="metrics">
              {{#each metrics}}
              <div class="metric">
                <h3>{{this.name}}</h3>
                <p>{{this.value}}</p>
              </div>
              {{/each}}
            </div>
          </div>
        `)
      }
    ];

    const { error } = await supabaseNew
      .from('report_templates')
      .upsert(templates);

    if (error) {
      console.error('Error seeding report templates:', error);
      throw error;
    }

    console.log(`✅ ${templates.length} report templates creados`);
  }

  // Propiedades para mantener referencias entre entidades
  private empresasCreated: any[] = [];
  private obrasCreated: any[] = [];
  private proveedoresCreated: any[] = [];
  private trabajadoresCreated: any[] = [];
  private maquinariaCreated: any[] = [];
}

// Función helper para ejecutar población de datos
export const populateSeedData = async (tenantId?: string): Promise<void> => {
  const seedService = new SeedDataService(tenantId);
  await seedService.seedAll();
};

// Función helper para limpiar datos de desarrollo
export const cleanupSeedData = async (tenantId: string): Promise<void> => {
  console.log('🧹 Limpiando datos semilla...');

  try {
    const tables = [
      'auditoria',
      'jobs_integracion',
      'tareas',
      'documentos',
      'maquinaria',
      'trabajadores',
      'proveedores',
      'obras',
      'empresas',
      'mapping_templates',
      'requisitos_plataforma',
      'adaptadores',
      'checkout_providers',
      'users'
    ];

    for (const table of tables) {
      const { error } = await supabaseNew
        .from(table)
        .delete()
        .eq('tenant_id', tenantId);

      if (error) {
        console.warn(`Warning: Could not clean ${table}:`, error.message);
      } else {
        console.log(`✅ Limpiado ${table}`);
      }
    }

    // Limpiar tenant
    const { error: tenantError } = await supabaseNew
      .from('tenants')
      .delete()
      .eq('id', tenantId);

    if (tenantError) {
      console.warn('Warning: Could not clean tenant:', tenantError.message);
    } else {
      console.log('✅ Tenant limpiado');
    }

    console.log('✅ Limpieza completada');
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    throw error;
  }
};