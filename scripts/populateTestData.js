import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const DEV_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function populateTestData() {
  console.log('🚀 Populating test data for manual management...\n');

  try {
    // 0. Cleanup existing test data (in reverse dependency order)
    console.log('0️⃣ Cleaning up existing test data...');
    
    // Delete in reverse dependency order to avoid foreign key violations
    await supabase.from('auditoria').delete().eq('tenant_id', DEV_TENANT_ID);
    await supabase.from('manual_upload_queue').delete().eq('tenant_id', DEV_TENANT_ID);
    await supabase.from('receipts').delete().in('client_id', [
      '20000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002', 
      '20000000-0000-0000-0000-000000000003'
    ]);
    await supabase.from('adaptadores').delete().eq('tenant_id', DEV_TENANT_ID);
    await supabase.from('trabajadores').delete().eq('tenant_id', DEV_TENANT_ID);
    await supabase.from('proveedores').delete().eq('tenant_id', DEV_TENANT_ID);
    await supabase.from('documentos').delete().eq('tenant_id', DEV_TENANT_ID);
    await supabase.from('obras').delete().eq('tenant_id', DEV_TENANT_ID);
    await supabase.from('empresas').delete().eq('tenant_id', DEV_TENANT_ID);
    await supabase.from('users').delete().eq('tenant_id', DEV_TENANT_ID);
    await supabase.from('tenants').delete().eq('id', DEV_TENANT_ID);
    
    console.log('✅ Cleanup completed');

    // 1. Create test tenant
    console.log('1️⃣ Creating test tenant...');
    const { error: tenantError } = await supabase
      .from('tenants')
      .upsert({
        id: DEV_TENANT_ID,
        name: 'ConstructIA Development',
        status: 'active'
      });

    if (tenantError) {
      console.warn('⚠️ Tenant creation error:', tenantError.message);
    } else {
      console.log('✅ Test tenant created');
    }

    // 2. Create test users
    console.log('2️⃣ Creating test users...');
    const testUsers = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        tenant_id: DEV_TENANT_ID,
        email: 'garcia@construcciones.com',
        name: 'Juan García',
        role: 'ClienteAdmin',
        active: true
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        tenant_id: DEV_TENANT_ID,
        email: 'lopez@reformas.com',
        name: 'María López',
        role: 'ClienteAdmin',
        active: true
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        tenant_id: DEV_TENANT_ID,
        email: 'martin@edificaciones.com',
        name: 'Carlos Martín',
        role: 'ClienteAdmin',
        active: true
      }
    ];

    // Insert users one by one to handle any conflicts
    for (const user of testUsers) {
      const { error: userError } = await supabase
        .from('users')
        .upsert(user);
      
      if (userError) {
        console.warn(`⚠️ Could not create user ${user.email}:`, userError.message);
      } else {
        console.log(`✅ Created user: ${user.email}`);
      }
    }


    // 3. Create test empresas
    console.log('3️⃣ Creating test empresas...');
    const testEmpresas = [
      {
        id: '20000000-0000-0000-0000-000000000001',
        tenant_id: DEV_TENANT_ID,
        razon_social: 'Construcciones García S.L.',
        cif: 'B12345678',
        rea_numero: 'REA-001',
        cnae: '4120',
        direccion: 'Calle Construcción 123, 28001 Madrid',
        contacto_email: 'garcia@construcciones.com',
        estado_compliance: 'al_dia'
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        tenant_id: DEV_TENANT_ID,
        razon_social: 'Reformas López S.L.',
        cif: 'B87654321',
        rea_numero: 'REA-002',
        cnae: '4330',
        direccion: 'Avenida Reforma 456, 28002 Madrid',
        contacto_email: 'lopez@reformas.com',
        estado_compliance: 'pendiente'
      },
      {
        id: '20000000-0000-0000-0000-000000000003',
        tenant_id: DEV_TENANT_ID,
        razon_social: 'Edificaciones Martín S.A.',
        cif: 'A11223344',
        rea_numero: 'REA-003',
        cnae: '4110',
        direccion: 'Plaza Edificación 789, 28003 Madrid',
        contacto_email: 'martin@edificaciones.com',
        estado_compliance: 'al_dia'
      }
    ];

    const { error: empresasError } = await supabase
      .from('empresas')
      .upsert(testEmpresas);

    if (empresasError) {
      console.warn('⚠️ Empresas creation error:', empresasError.message);
    } else {
      console.log('✅ Test empresas created');
    }

    // 4. Create test obras
    console.log('4️⃣ Creating test obras...');
    const testObras = [
      {
        id: '30000000-0000-0000-0000-000000000001',
        tenant_id: DEV_TENANT_ID,
        empresa_id: '20000000-0000-0000-0000-000000000001',
        nombre_obra: 'Edificio Residencial García',
        codigo_obra: 'ERG-2025-001',
        direccion: 'Calle Nueva 123, Madrid',
        cliente_final: 'Inmobiliaria Madrid S.L.',
        fecha_inicio: '2025-01-15',
        fecha_fin_estimada: '2025-12-15',
        plataforma_destino: 'nalanda',
        perfil_riesgo: 'media'
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        tenant_id: DEV_TENANT_ID,
        empresa_id: '20000000-0000-0000-0000-000000000001',
        nombre_obra: 'Centro Comercial García',
        codigo_obra: 'CCG-2025-002',
        direccion: 'Avenida Comercial 456, Madrid',
        cliente_final: 'Grupo Comercial ABC',
        fecha_inicio: '2025-03-01',
        fecha_fin_estimada: '2026-02-28',
        plataforma_destino: 'ctaima',
        perfil_riesgo: 'alta'
      },
      {
        id: '30000000-0000-0000-0000-000000000003',
        tenant_id: DEV_TENANT_ID,
        empresa_id: '20000000-0000-0000-0000-000000000002',
        nombre_obra: 'Reforma Oficinas López',
        codigo_obra: 'ROL-2025-001',
        direccion: 'Calle Oficinas 789, Barcelona',
        cliente_final: 'Corporación XYZ',
        fecha_inicio: '2025-02-01',
        fecha_fin_estimada: '2025-08-31',
        plataforma_destino: 'ecoordina',
        perfil_riesgo: 'baja'
      },
      {
        id: '30000000-0000-0000-0000-000000000004',
        tenant_id: DEV_TENANT_ID,
        empresa_id: '20000000-0000-0000-0000-000000000003',
        nombre_obra: 'Torre Martín Business',
        codigo_obra: 'TMB-2025-001',
        direccion: 'Plaza Business 321, Valencia',
        cliente_final: 'Inversiones Valencia S.A.',
        fecha_inicio: '2025-04-01',
        fecha_fin_estimada: '2026-12-31',
        plataforma_destino: 'nalanda',
        perfil_riesgo: 'alta'
      }
    ];

    const { error: obrasError } = await supabase
      .from('obras')
      .upsert(testObras);

    if (obrasError) {
      console.warn('⚠️ Obras creation error:', obrasError.message);
    } else {
      console.log('✅ Test obras created');
    }

    // 5. Create test proveedores
    console.log('5️⃣ Creating test proveedores...');
    const testProveedores = [
      {
        id: '40000000-0000-0000-0000-000000000001',
        tenant_id: DEV_TENANT_ID,
        empresa_id: '20000000-0000-0000-0000-000000000001',
        razon_social: 'Subcontrata García S.L.',
        cif: 'B55555555',
        rea_numero: 'REA-SUB-001',
        contacto_email: 'subcontrata@garcia.com',
        estado_homologacion: 'ok'
      },
      {
        id: '40000000-0000-0000-0000-000000000002',
        tenant_id: DEV_TENANT_ID,
        empresa_id: '20000000-0000-0000-0000-000000000002',
        razon_social: 'Instalaciones López S.L.',
        cif: 'B66666666',
        rea_numero: 'REA-SUB-002',
        contacto_email: 'instalaciones@lopez.com',
        estado_homologacion: 'pendiente'
      }
    ];

    const { error: proveedoresError } = await supabase
      .from('proveedores')
      .upsert(testProveedores);

    if (proveedoresError) {
      console.warn('⚠️ Proveedores creation error:', proveedoresError.message);
    } else {
      console.log('✅ Test proveedores created');
    }

    // 6. Create test trabajadores
    console.log('6️⃣ Creating test trabajadores...');
    const testTrabajadores = [
      {
        id: '50000000-0000-0000-0000-000000000001',
        tenant_id: DEV_TENANT_ID,
        proveedor_id: '40000000-0000-0000-0000-000000000001',
        dni_nie: '12345678A',
        nombre: 'Pedro',
        apellido: 'Sánchez',
        nss: '123456789012',
        puesto: 'Oficial de Primera',
        aptitud_medica_caducidad: '2025-12-31',
        formacion_prl_nivel: 'Básico',
        formacion_prl_caducidad: '2025-06-30',
        epis_entregadas: true
      },
      {
        id: '50000000-0000-0000-0000-000000000002',
        tenant_id: DEV_TENANT_ID,
        proveedor_id: '40000000-0000-0000-0000-000000000001',
        dni_nie: '87654321B',
        nombre: 'Ana',
        apellido: 'Rodríguez',
        nss: '987654321098',
        puesto: 'Peón Especialista',
        aptitud_medica_caducidad: '2025-11-30',
        formacion_prl_nivel: 'Intermedio',
        formacion_prl_caducidad: '2025-09-15',
        epis_entregadas: true
      }
    ];

    const { error: trabajadoresError } = await supabase
      .from('trabajadores')
      .upsert(testTrabajadores);

    if (trabajadoresError) {
      console.warn('⚠️ Trabajadores creation error:', trabajadoresError.message);
    } else {
      console.log('✅ Test trabajadores created');
    }

    // 7. Create test documentos
    console.log('7️⃣ Creating test documentos...');
    const testDocumentos = [
      // Documentos de obra
      {
        id: '60000000-0000-0000-0000-000000000001',
        tenant_id: DEV_TENANT_ID,
        entidad_tipo: 'obra',
        entidad_id: '30000000-0000-0000-0000-000000000001',
        categoria: 'PLAN_SEGURIDAD',
        file: 'plan_seguridad_erg_001.pdf',
        mime: 'application/pdf',
        size_bytes: 2048576,
        hash_sha256: 'abc123def456',
        version: 1,
        estado: 'pendiente',
        caducidad: '2025-12-31',
        emisor: 'Construcciones García S.L.',
        observaciones: 'Plan de seguridad inicial',
        metadatos: { original_filename: 'Plan_Seguridad_ERG_001.pdf' },
        origen: 'usuario',
        sensible: false
      },
      {
        id: '60000000-0000-0000-0000-000000000002',
        tenant_id: DEV_TENANT_ID,
        entidad_tipo: 'obra',
        entidad_id: '30000000-0000-0000-0000-000000000001',
        categoria: 'EVAL_RIESGOS',
        file: 'evaluacion_riesgos_erg_001.pdf',
        mime: 'application/pdf',
        size_bytes: 1536000,
        hash_sha256: 'def456ghi789',
        version: 1,
        estado: 'aprobado',
        caducidad: '2026-01-31',
        emisor: 'Técnico PRL García',
        observaciones: 'Evaluación completa de riesgos',
        metadatos: { original_filename: 'Evaluacion_Riesgos_ERG_001.pdf' },
        origen: 'usuario',
        sensible: true
      },
      // Documentos de trabajadores
      {
        id: '60000000-0000-0000-0000-000000000003',
        tenant_id: DEV_TENANT_ID,
        entidad_tipo: 'trabajador',
        entidad_id: '50000000-0000-0000-0000-000000000001',
        categoria: 'DNI',
        file: 'dni_pedro_sanchez.pdf',
        mime: 'application/pdf',
        size_bytes: 512000,
        hash_sha256: 'ghi789jkl012',
        version: 1,
        estado: 'aprobado',
        caducidad: '2030-03-15',
        emisor: 'Ministerio del Interior',
        observaciones: 'DNI vigente',
        metadatos: { original_filename: 'DNI_Pedro_Sanchez.pdf' },
        origen: 'usuario',
        sensible: true
      },
      {
        id: '60000000-0000-0000-0000-000000000004',
        tenant_id: DEV_TENANT_ID,
        entidad_tipo: 'trabajador',
        entidad_id: '50000000-0000-0000-0000-000000000001',
        categoria: 'APTITUD_MEDICA',
        file: 'aptitud_medica_pedro.pdf',
        mime: 'application/pdf',
        size_bytes: 768000,
        hash_sha256: 'jkl012mno345',
        version: 1,
        estado: 'pendiente',
        caducidad: '2025-12-31',
        emisor: 'Centro Médico Madrid',
        observaciones: 'Reconocimiento médico anual',
        metadatos: { original_filename: 'Aptitud_Medica_Pedro.pdf' },
        origen: 'usuario',
        sensible: true
      },
      {
        id: '60000000-0000-0000-0000-000000000005',
        tenant_id: DEV_TENANT_ID,
        entidad_tipo: 'trabajador',
        entidad_id: '50000000-0000-0000-0000-000000000002',
        categoria: 'FORMACION_PRL',
        file: 'formacion_prl_ana.pdf',
        mime: 'application/pdf',
        size_bytes: 1024000,
        hash_sha256: 'mno345pqr678',
        version: 1,
        estado: 'rechazado',
        caducidad: '2025-09-15',
        emisor: 'Centro Formación PRL',
        observaciones: 'Formación PRL nivel intermedio - Requiere actualización',
        metadatos: { original_filename: 'Formacion_PRL_Ana.pdf' },
        origen: 'usuario',
        sensible: false
      }
    ];

    const { error: documentosError } = await supabase
      .from('documentos')
      .upsert(testDocumentos);

    if (documentosError) {
      console.warn('⚠️ Documentos creation error:', documentosError.message);
    } else {
      console.log('✅ Test documentos created');
    }

    // 8. Create manual upload queue entries
    console.log('8️⃣ Creating manual upload queue...');
    const queueEntries = [
      {
        id: '70000000-0000-0000-0000-000000000001',
        tenant_id: DEV_TENANT_ID,
        empresa_id: '20000000-0000-0000-0000-000000000001',
        obra_id: '30000000-0000-0000-0000-000000000001',
        documento_id: '60000000-0000-0000-0000-000000000001',
        status: 'queued',
        nota: 'Plan de seguridad pendiente de subida a Nalanda'
      },
      {
        id: '70000000-0000-0000-0000-000000000002',
        tenant_id: DEV_TENANT_ID,
        empresa_id: '20000000-0000-0000-0000-000000000001',
        obra_id: '30000000-0000-0000-0000-000000000001',
        documento_id: '60000000-0000-0000-0000-000000000004',
        status: 'queued',
        nota: 'Aptitud médica pendiente de validación'
      },
      {
        id: '70000000-0000-0000-0000-000000000003',
        tenant_id: DEV_TENANT_ID,
        empresa_id: '20000000-0000-0000-0000-000000000002',
        obra_id: '30000000-0000-0000-0000-000000000003',
        documento_id: '60000000-0000-0000-0000-000000000005',
        status: 'error',
        nota: 'Error en formación PRL - requiere revisión'
      }
    ];

    const { error: queueError } = await supabase
      .from('manual_upload_queue')
      .upsert(queueEntries);

    if (queueError) {
      console.warn('⚠️ Queue creation error:', queueError.message);
    } else {
      console.log('✅ Manual upload queue created');
    }

    // 9. Create adaptadores (platform credentials)
    console.log('9️⃣ Creating platform adapters...');
    const testAdaptadores = [
      {
        tenant_id: DEV_TENANT_ID,
        plataforma: 'nalanda',
        alias: 'Nalanda García',
        credenciales: {
          tipo: 'api',
          apiBase: 'https://api.nalanda.com',
          apiKey: 'nal_key_abc123',
          webhookSecret: 'webhook_secret_nalanda',
          endpoints: {
            upload: '/documents/upload',
            validate: '/documents/validate',
            status: '/documents/status'
          }
        },
        estado: 'ready',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        tenant_id: DEV_TENANT_ID,
        plataforma: 'ctaima',
        alias: 'CTAIMA López',
        credenciales: {
          tipo: 'api',
          apiBase: 'https://api.ctaima.com',
          apiKey: 'cta_key_def456',
          webhookSecret: 'webhook_secret_ctaima',
          endpoints: {
            upload: '/api/documents',
            validate: '/api/validate',
            status: '/api/status'
          }
        },
        estado: 'ready',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        tenant_id: DEV_TENANT_ID,
        plataforma: 'ecoordina',
        alias: 'Ecoordina Martín',
        credenciales: {
          tipo: 'api',
          apiBase: 'https://api.ecoordina.com',
          apiKey: 'eco_key_placeholder',
          webhookSecret: 'webhook_secret_placeholder',
          endpoints: {
            upload: '/upload',
            validate: '/validate',
            status: '/status'
          }
        },
        estado: 'error',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { error: adaptadoresError } = await supabase
      .from('adaptadores')
      .upsert(testAdaptadores);

    if (adaptadoresError) {
      console.warn('⚠️ Adaptadores creation error:', adaptadoresError.message);
    } else {
      console.log('✅ Platform adapters created');
    }

    // 10. Create test receipts for financial module
    console.log('🔟 Creating test receipts...');
    
    // Get the actual client IDs from the clients table (old schema)
    const { data: clientsData, error: clientsQueryError } = await supabase
      .from('clients')
      .select('id, client_id')
      .in('client_id', ['garcia-construcciones', 'lopez-reformas', 'martin-edificaciones']);
    
    if (clientsQueryError || !clientsData || clientsData.length === 0) {
      console.warn('⚠️ No clients found in old schema, skipping receipts creation');
      console.log('✅ Skipped receipts (no matching clients)');
    } else {
      const clientIdMap = clientsData.reduce((map, client) => {
        map[client.client_id] = client.id;
        return map;
      }, {});
      
    const testReceipts = [
      {
        id: '90000000-0000-0000-0000-000000000001',
        receipt_number: 'REC-2025-001',
        client_id: clientIdMap['garcia-construcciones'],
        amount: 149.00,
        base_amount: 123.14,
        tax_amount: 25.86,
        tax_rate: 21.00,
        currency: 'EUR',
        payment_method: 'stripe',
        gateway_name: 'Stripe',
        description: 'Suscripción Professional - Enero 2025',
        payment_date: '2025-01-15T10:30:00Z',
        status: 'paid',
        transaction_id: 'pi_stripe_123456789'
      },
      {
        id: '90000000-0000-0000-0000-000000000002',
        receipt_number: 'REC-2025-002',
        client_id: clientIdMap['lopez-reformas'],
        amount: 59.00,
        base_amount: 48.76,
        tax_amount: 10.24,
        tax_rate: 21.00,
        currency: 'EUR',
        payment_method: 'sepa',
        gateway_name: 'SEPA Direct Debit',
        description: 'Suscripción Basic - Enero 2025',
        payment_date: '2025-01-20T14:15:00Z',
        status: 'paid',
        transaction_id: 'sepa_dd_987654321'
      },
      {
        id: '90000000-0000-0000-0000-000000000003',
        receipt_number: 'REC-2025-003',
        client_id: clientIdMap['martin-edificaciones'],
        amount: 299.00,
        base_amount: 247.11,
        tax_amount: 51.89,
        tax_rate: 21.00,
        currency: 'EUR',
        payment_method: 'stripe',
        gateway_name: 'Stripe',
        description: 'Suscripción Enterprise - Enero 2025',
        payment_date: '2025-01-25T09:45:00Z',
        status: 'paid',
        transaction_id: 'pi_stripe_abcdef123'
      }
    ];

      const { error: receiptsError } = await supabase
        .from('receipts')
        .upsert(testReceipts.filter(receipt => receipt.client_id)); // Only insert receipts with valid client_id

      if (receiptsError) {
        console.warn('⚠️ Receipts creation error:', receiptsError.message);
      } else {
        console.log('✅ Test receipts created');
      }
    }

    // 11. Crear pasarelas de pago con períodos de comisión
    console.log('1️⃣1️⃣ Creando pasarelas de pago...');
    const paymentGateways = [
      {
        name: 'Stripe Principal',
        type: 'stripe',
        status: 'active',
        commission_type: 'mixed',
        commission_percentage: 2.9,
        commission_fixed: 0.30,
        commission_periods: [
          {
            start_date: '2024-01-01',
            end_date: '2024-06-30',
            percentage: 3.2,
            fixed: 0.35,
            description: 'Tarifa inicial'
          },
          {
            start_date: '2024-07-01',
            end_date: '2024-12-31',
            percentage: 2.9,
            fixed: 0.30,
            description: 'Tarifa estándar'
          },
          {
            start_date: '2025-01-01',
            end_date: '2025-12-31',
            percentage: 2.7,
            fixed: 0.25,
            description: 'Tarifa promocional 2025'
          }
        ],
        api_key: 'pk_test_...',
        secret_key: 'sk_test_...',
        webhook_url: 'https://constructia.com/webhooks/stripe',
        supported_currencies: ['EUR', 'USD'],
        min_amount: 1,
        max_amount: 10000,
        description: 'Pasarela principal para tarjetas de crédito'
      },
      {
        name: 'SEPA Directo',
        type: 'sepa',
        status: 'active',
        commission_type: 'fixed',
        commission_percentage: 0,
        commission_fixed: 0.50,
        commission_periods: [
          {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            percentage: 0,
            fixed: 0.60,
            description: 'Tarifa 2024'
          },
          {
            start_date: '2025-01-01',
            end_date: '2025-12-31',
            percentage: 0,
            fixed: 0.50,
            description: 'Tarifa reducida 2025'
          }
        ],
        supported_currencies: ['EUR'],
        min_amount: 10,
        max_amount: 50000,
        description: 'Domiciliación bancaria SEPA'
      },
      {
        name: 'PayPal Business',
        type: 'paypal',
        status: 'active',
        commission_type: 'percentage',
        commission_percentage: 3.4,
        commission_fixed: 0,
        commission_periods: [
          {
            start_date: '2024-01-01',
            end_date: '2025-12-31',
            percentage: 3.4,
            fixed: 0,
            description: 'Tarifa estándar PayPal'
          }
        ],
        supported_currencies: ['EUR', 'USD'],
        min_amount: 1,
        max_amount: 5000,
        description: 'Pagos con PayPal'
      },
      {
        name: 'Bizum Empresas',
        type: 'bizum',
        status: 'active',
        commission_type: 'fixed',
        commission_percentage: 0,
        commission_fixed: 0.25,
        commission_periods: [
          {
            start_date: '2024-01-01',
            end_date: '2025-12-31',
            percentage: 0,
            fixed: 0.25,
            description: 'Tarifa fija Bizum'
          }
        ],
        supported_currencies: ['EUR'],
        min_amount: 1,
        max_amount: 1000,
        description: 'Pagos instantáneos con Bizum'
      }
    ];

    const { error: gatewaysError } = await supabase
      .from('payment_gateways')
      .upsert(paymentGateways.map(gateway => ({
        ...gateway,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));

    if (gatewaysError) {
      console.error('❌ Error creating payment gateways:', gatewaysError);
      throw gatewaysError;
    }
    console.log(`✅ ${paymentGateways.length} pasarelas de pago creadas exitosamente`);

    console.log('\n🎉 Test data population completed successfully!');
    console.log('📊 Data created:');
    console.log('   • 1 Tenant (ConstructIA Development)');
    console.log('   • 3 Users (García, López, Martín)');
    console.log('   • 3 Empresas with different compliance states');
    console.log('   • 4 Obras across different platforms');
    console.log('   • 2 Proveedores with different homologation states');
    console.log('   • 2 Trabajadores with various document states');
    console.log('   • 5 Documentos (obra, trabajador types)');
    console.log('   • 3 Manual upload queue entries');
    console.log('   • 3 Platform adapters (Nalanda, CTAIMA, Ecoordina)');
    console.log('   • 3 Financial receipts for KPI calculations');

  } catch (error) {
    console.error('❌ Fatal error during data population:', error);
    process.exit(1);
  }
}

populateTestData();