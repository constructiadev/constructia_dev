import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Datos de ejemplo para la nueva arquitectura
const empresasData = [
  {
    razon_social: 'Construcciones García S.L.',
    cif: 'B12345678',
    rea_numero: 'REA123456',
    cnae: '4120',
    direccion: 'Calle Construcción 123, 28001 Madrid',
    contacto_email: 'info@construccionesgarcia.com',
    estado_compliance: 'al_dia'
  },
  {
    razon_social: 'Reformas Integrales López',
    cif: 'B87654321',
    rea_numero: 'REA654321',
    cnae: '4330',
    direccion: 'Avenida Reforma 456, 28002 Madrid',
    contacto_email: 'contacto@reformaslopez.com',
    estado_compliance: 'pendiente'
  }
];

const obrasData = [
  {
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
    nombre_obra: 'Reforma Oficinas Centro',
    codigo_obra: 'OBRA-002',
    direccion: 'Gran Vía 123, Madrid',
    cliente_final: 'Corporación Empresarial S.L.',
    fecha_inicio: '2024-03-01',
    fecha_fin_estimada: '2024-12-15',
    plataforma_destino: 'ctaima',
    perfil_riesgo: 'baja'
  },
  {
    nombre_obra: 'Torre Martín Business',
    codigo_obra: 'OBRA-003',
    direccion: 'Plaza Business 321, Valencia',
    cliente_final: 'Inversiones Valencia S.A.',
    fecha_inicio: '2024-04-01',
    fecha_fin_estimada: '2025-12-31',
    plataforma_destino: 'nalanda',
    perfil_riesgo: 'alta'
  },
  {
    nombre_obra: 'Puente Norte',
    codigo_obra: 'OBRA-004',
    direccion: 'Río Norte, Bilbao',
    cliente_final: 'Gobierno Vasco',
    fecha_inicio: '2024-05-01',
    fecha_fin_estimada: '2026-04-30',
    plataforma_destino: 'ctaima',
    perfil_riesgo: 'alta'
  },
  {
    nombre_obra: 'Centro Comercial Sur',
    codigo_obra: 'OBRA-005',
    direccion: 'Zona Comercial Sur, Sevilla',
    cliente_final: 'Retail Andalucía S.L.',
    fecha_inicio: '2024-06-01',
    fecha_fin_estimada: '2025-11-30',
    plataforma_destino: 'ecoordina',
    perfil_riesgo: 'media'
  }
];

const proveedoresData = [
  {
    razon_social: 'Subcontratas del Norte S.L.',
    cif: 'B11111111',
    rea_numero: 'REA111111',
    contacto_email: 'admin@subcontratanorte.com',
    estado_homologacion: 'ok'
  },
  {
    razon_social: 'Especialistas en Soldadura S.A.',
    cif: 'B22222222',
    rea_numero: 'REA222222',
    contacto_email: 'info@soldaduraesp.com',
    estado_homologacion: 'pendiente'
  }
];

const trabajadoresData = [
  {
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

const maquinariaData = [
  {
    tipo: 'Grúa Torre',
    marca_modelo: 'Liebherr 280 EC-H',
    numero_serie: 'LH280-2024-001',
    certificado_ce: true,
    mantenimiento_caducidad: '2025-03-15',
    seguro_caducidad: '2025-12-31'
  },
  {
    tipo: 'Excavadora',
    marca_modelo: 'Caterpillar 320D',
    numero_serie: 'CAT320-2023-045',
    certificado_ce: true,
    mantenimiento_caducidad: '2025-02-28',
    seguro_caducidad: '2025-10-15'
  }
];

async function populateNewArchitecture() {
  console.log('🚀 Poblando nueva arquitectura multi-tenant...\n');

  try {
    // 1. Crear tenant de desarrollo
    console.log('1️⃣ Creando tenant de desarrollo...');
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'ConstructIA Development',
        status: 'active'
      })
      .select()
      .single();

    if (tenantError) {
      console.error('❌ Error creating tenant:', tenantError);
      throw tenantError;
    }
    console.log('✅ Tenant creado:', tenant.name);

    // 2. Crear usuario administrador
    console.log('2️⃣ Creando usuario administrador...');
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .upsert({
        id: '20000000-0000-0000-0000-000000000001',
        tenant_id: tenant.id,
        email: 'admin@constructia.com',
        name: 'Administrador ConstructIA',
        role: 'SuperAdmin',
        active: true
      }, {
        onConflict: 'tenant_id,email'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating admin user:', userError);
      throw userError;
    }
    console.log('✅ Usuario admin creado:', adminUser.email);

    // 3. Crear empresas
    console.log('3️⃣ Creando empresas...');
    const empresasWithTenant = empresasData.map(empresa => ({
      ...empresa,
      tenant_id: tenant.id
    }));

    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .upsert(empresasWithTenant)
      .select();

    if (empresasError) {
      console.error('❌ Error creating empresas:', empresasError);
      throw empresasError;
    }
    console.log(`✅ ${empresas.length} empresas creadas`);

    // 4. Crear obras
    console.log('4️⃣ Creando obras...');
    const obrasWithRefs = obrasData.map((obra, index) => ({
      ...obra,
      tenant_id: tenant.id,
      empresa_id: empresas[index % empresas.length].id
    }));

    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .upsert(obrasWithRefs)
      .select();

    if (obrasError) {
      console.error('❌ Error creating obras:', obrasError);
      throw obrasError;
    }
    console.log(`✅ ${obras.length} obras creadas`);

    // 5. Crear proveedores
    console.log('5️⃣ Creando proveedores...');
    const proveedoresWithRefs = proveedoresData.map((proveedor, index) => ({
      ...proveedor,
      tenant_id: tenant.id,
      empresa_id: empresas[index % empresas.length].id
    }));

    const { data: proveedores, error: proveedoresError } = await supabase
      .from('proveedores')
      .upsert(proveedoresWithRefs)
      .select();

    if (proveedoresError) {
      console.error('❌ Error creating proveedores:', proveedoresError);
      throw proveedoresError;
    }
    console.log(`✅ ${proveedores.length} proveedores creados`);

    // 6. Crear trabajadores
    console.log('6️⃣ Creando trabajadores...');
    const trabajadoresWithRefs = trabajadoresData.map((trabajador, index) => ({
      ...trabajador,
      tenant_id: tenant.id,
      proveedor_id: proveedores[index % proveedores.length].id
    }));

    const { data: trabajadores, error: trabajadoresError } = await supabase
      .from('trabajadores')
      .upsert(trabajadoresWithRefs)
      .select();

    if (trabajadoresError) {
      console.error('❌ Error creating trabajadores:', trabajadoresError);
      throw trabajadoresError;
    }
    console.log(`✅ ${trabajadores.length} trabajadores creados`);

    // 7. Crear maquinaria
    console.log('7️⃣ Creando maquinaria...');
    const maquinariaWithRefs = maquinariaData.map((maquina, index) => ({
      ...maquina,
      tenant_id: tenant.id,
      empresa_id: empresas[index % empresas.length].id
    }));

    const { data: maquinaria, error: maquinariaError } = await supabase
      .from('maquinaria')
      .upsert(maquinariaWithRefs)
      .select();

    if (maquinariaError) {
      console.error('❌ Error creating maquinaria:', maquinariaError);
      throw maquinariaError;
    }
    console.log(`✅ ${maquinaria.length} máquinas creadas`);

    // 8. Crear documentos de ejemplo
    console.log('8️⃣ Creando documentos de ejemplo...');
    const documentosData = [];

    // Documentos para trabajadores
    trabajadores.forEach(trabajador => {
      documentosData.push(
        {
          tenant_id: tenant.id,
          entidad_tipo: 'trabajador',
          entidad_id: trabajador.id,
          categoria: 'DNI',
          file: `${tenant.id}/trabajador/${trabajador.id}/DNI/dni_${trabajador.dni_nie}.pdf`,
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
          tenant_id: tenant.id,
          entidad_tipo: 'trabajador',
          entidad_id: trabajador.id,
          categoria: 'APTITUD_MEDICA',
          file: `${tenant.id}/trabajador/${trabajador.id}/APTITUD_MEDICA/aptitud_${trabajador.dni_nie}.pdf`,
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
    maquinaria.forEach(maquina => {
      documentosData.push({
        tenant_id: tenant.id,
        entidad_tipo: 'maquinaria',
        entidad_id: maquina.id,
        categoria: 'CERT_MAQUINARIA',
        file: `${tenant.id}/maquinaria/${maquina.id}/CERT_MAQUINARIA/cert_${maquina.numero_serie}.pdf`,
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

    const { data: documentos, error: documentosError } = await supabase
      .from('documentos')
      .upsert(documentosData)
      .select();

    if (documentosError) {
      console.error('❌ Error creating documentos:', documentosError);
      throw documentosError;
    }
    console.log(`✅ ${documentos.length} documentos creados`);

    // 9. Crear mapping templates
    console.log('9️⃣ Creando mapping templates...');
    const mappingTemplates = [
      {
        tenant_id: tenant.id,
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
          {"from":"Worker[*].dni", "to":"workers[*].idNumber", "transform":"upper"},
          {"from":"Docs[*].category", "to":"attachments[*].type", "transform":"map:PRL=OSH_CERT|APTITUD_MEDICA=MED_CERT|DNI=ID_DOC"}
        ]
      },
      {
        tenant_id: tenant.id,
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
          {"from":"Site.riskProfile", "to":"obra.riesgo", "transform":"map:low=baja|medium=media|high=alta"}
        ]
      }
    ];

    const { error: templatesError } = await supabase
      .from('mapping_templates')
      .upsert(mappingTemplates);

    if (templatesError) {
      console.error('❌ Error creating mapping templates:', templatesError);
      throw templatesError;
    }
    console.log(`✅ ${mappingTemplates.length} mapping templates creados`);

    // 10. Crear requisitos de plataforma
    console.log('🔟 Creando requisitos de plataforma...');
    const requisitos = [
      {
        tenant_id: tenant.id,
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
        tenant_id: tenant.id,
        plataforma: 'nalanda',
        aplica_a: 'trabajador',
        perfil_riesgo: 'media',
        categoria: 'APTITUD_MEDICA',
        obligatorio: true,
        reglas_validacion: [
          {"when":{"categoria":"APTITUD_MEDICA"}, "must":[{"field":"fecha_caducidad","op":">","value":"today"}]}
        ]
      }
    ];

    const { error: requisitosError } = await supabase
      .from('requisitos_plataforma')
      .upsert(requisitos);

    if (requisitosError) {
      console.error('❌ Error creating requisitos:', requisitosError);
      throw requisitosError;
    }
    console.log(`✅ ${requisitos.length} requisitos de plataforma creados`);

    // 11. Crear adaptadores
    console.log('1️⃣1️⃣ Creando adaptadores...');
    const adaptadores = [
      {
        tenant_id: tenant.id,
        plataforma: 'nalanda',
        alias: 'Nalanda Principal',
        credenciales: {
          api_base: 'https://identity.nalandaglobal.com/realms/nalanda/protocol/openid-connect/auth',
          api_key: 'test_key_nalanda',
          webhook_secret: 'webhook_secret_nalanda'
        },
        estado: 'ready'
      },
      {
        tenant_id: tenant.id,
        plataforma: 'ctaima',
        alias: 'CTAIMA Principal',
        credenciales: {
          api_base: 'https://login.ctaima.com/Account/Login',
          api_key: 'test_key_ctaima',
          webhook_secret: 'webhook_secret_ctaima'
        },
        estado: 'ready'
      }
    ];

    const { error: adaptadoresError } = await supabase
      .from('adaptadores')
      .upsert(adaptadores);

    if (adaptadoresError) {
      console.error('❌ Error creating adaptadores:', adaptadoresError);
      throw adaptadoresError;
    }
    console.log(`✅ ${adaptadores.length} adaptadores creados`);

    // 12. Crear suscripción
    console.log('1️⃣2️⃣ Creando suscripción...');
    const { error: suscripcionError } = await supabase
      .from('suscripciones')
      .upsert({
        tenant_id: tenant.id,
        plan: 'Empresas',
        limites: {
          maxUsers: 50,
          maxObras: 20,
          maxStorageMB: 5000,
          connectors: 3
        },
        estado: 'activa'
      });

    if (suscripcionError) {
      console.error('❌ Error creating suscripcion:', suscripcionError);
      throw suscripcionError;
    }
    console.log('✅ Suscripción creada');

    // 13. Verificación final
    console.log('\n1️⃣3️⃣ Verificación final...');
    const stats = await getTenantStats(tenant.id);
    
    console.log('📊 Estadísticas finales:');
    console.log(`   - Empresas: ${stats.totalEmpresas}`);
    console.log(`   - Obras: ${stats.totalObras}`);
    console.log(`   - Proveedores: ${stats.totalProveedores}`);
    console.log(`   - Trabajadores: ${stats.totalTrabajadores}`);
    console.log(`   - Maquinaria: ${stats.totalMaquinaria}`);
    console.log(`   - Documentos: ${stats.totalDocumentos}`);

    console.log('\n🎉 Nueva arquitectura multi-tenant poblada exitosamente!');
    console.log('🔧 Sistema listo para pruebas de integración');
    console.log(`📋 Tenant ID: ${tenant.id}`);
    console.log(`👤 Admin User ID: ${adminUser.id}`);

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

async function getTenantStats(tenantId) {
  try {
    const [
      { count: totalEmpresas },
      { count: totalObras },
      { count: totalProveedores },
      { count: totalTrabajadores },
      { count: totalMaquinaria },
      { count: totalDocumentos }
    ] = await Promise.all([
      supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('obras').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('proveedores').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('trabajadores').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('maquinaria').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('documentos').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId)
    ]);

    return {
      totalEmpresas: totalEmpresas || 0,
      totalObras: totalObras || 0,
      totalProveedores: totalProveedores || 0,
      totalTrabajadores: totalTrabajadores || 0,
      totalMaquinaria: totalMaquinaria || 0,
      totalDocumentos: totalDocumentos || 0
    };
  } catch (error) {
    console.error('Error getting tenant stats:', error);
    return {
      totalEmpresas: 0,
      totalObras: 0,
      totalProveedores: 0,
      totalTrabajadores: 0,
      totalMaquinaria: 0,
      totalDocumentos: 0
    };
  }
}

populateNewArchitecture();