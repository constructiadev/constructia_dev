-- ============================================
-- CONSTRUCTIA PLATFORM - COMPLETE DATABASE SCHEMA
-- Multi-tenant Architecture
-- ============================================

-- ============================================
-- STEP 1: CREATE ENUM TYPES
-- ============================================

-- User roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SuperAdmin', 'Cliente', 'ClienteDemo');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tenant status
DO $$ BEGIN
  CREATE TYPE tenant_status AS ENUM ('active', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Document categories
DO $$ BEGIN
  CREATE TYPE documento_categoria AS ENUM (
    'PRL', 'APTITUD_MEDICA', 'DNI-CIF', 'ALTA_SS', 'CONTRATO',
    'SEGURO_RC', 'REA', 'FORMACION_PRL', 'EVAL_RIESGOS',
    'CERT_MAQUINARIA', 'PLAN_SEGURIDAD', 'OTROS'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Document state
DO $$ BEGIN
  CREATE TYPE documento_estado AS ENUM ('borrador', 'pendiente', 'aprobado', 'rechazado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Entity type
DO $$ BEGIN
  CREATE TYPE entidad_tipo AS ENUM ('empresa', 'trabajador', 'maquinaria', 'obra');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Platform type
DO $$ BEGIN
  CREATE TYPE plataforma_tipo AS ENUM ('nalanda', 'ctaima', 'ecoordina', 'otro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Risk profile
DO $$ BEGIN
  CREATE TYPE perfil_riesgo AS ENUM ('baja', 'media', 'alta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Compliance state
DO $$ BEGIN
  CREATE TYPE estado_compliance AS ENUM ('al_dia', 'pendiente', 'caducado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Homologation state
DO $$ BEGIN
  CREATE TYPE estado_homologacion AS ENUM ('ok', 'pendiente', 'bloqueado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Task type
DO $$ BEGIN
  CREATE TYPE tarea_tipo AS ENUM ('subir', 'revisar', 'aprobar', 'rechazar', 'subsanar', 'enviar');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Task state
DO $$ BEGIN
  CREATE TYPE tarea_estado AS ENUM ('abierta', 'en_progreso', 'resuelta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Integration job state
DO $$ BEGIN
  CREATE TYPE job_estado AS ENUM ('pendiente', 'enviado', 'aceptado', 'rechazado', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Adapter state
DO $$ BEGIN
  CREATE TYPE adaptador_estado AS ENUM ('ready', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Subscription plan types
DO $$ BEGIN
  CREATE TYPE plan_tipo AS ENUM ('Starter', 'Autonomo', 'AutonomoEmpleados', 'Empresas', 'Asesorias');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Subscription state
DO $$ BEGIN
  CREATE TYPE suscripcion_estado AS ENUM ('activa', 'cancelada', 'trial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Message type
DO $$ BEGIN
  CREATE TYPE mensaje_tipo AS ENUM ('info', 'notificacion', 'alerta', 'recordatorio', 'urgencia');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Priority
DO $$ BEGIN
  CREATE TYPE prioridad AS ENUM ('baja', 'media', 'alta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Message state
DO $$ BEGIN
  CREATE TYPE mensaje_estado AS ENUM ('programado', 'enviado', 'vencido');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Report type
DO $$ BEGIN
  CREATE TYPE reporte_tipo AS ENUM ('operativo', 'financiero');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Token transaction type
DO $$ BEGIN
  CREATE TYPE token_tipo AS ENUM ('compra', 'consumo');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment methods
DO $$ BEGIN
  CREATE TYPE medio_pago AS ENUM ('stripe', 'paypal', 'bizum', 'sepa', 'tarjeta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Queue status
DO $$ BEGIN
  CREATE TYPE queue_status AS ENUM ('queued', 'in_progress', 'uploaded', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Document origin
DO $$ BEGIN
  CREATE TYPE documento_origen AS ENUM ('usuario', 'ia', 'import');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Compliance check status
DO $$ BEGIN
  CREATE TYPE compliance_status AS ENUM ('compliant', 'warning', 'non_compliant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Data subject request types
DO $$ BEGIN
  CREATE TYPE request_type AS ENUM ('access', 'rectification', 'erasure', 'portability', 'objection');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Request status
DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Risk level
DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Assessment status
DO $$ BEGIN
  CREATE TYPE assessment_status AS ENUM ('draft', 'under_review', 'approved', 'requires_action');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Breach severity
DO $$ BEGIN
  CREATE TYPE breach_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Breach status
DO $$ BEGIN
  CREATE TYPE breach_status AS ENUM ('investigating', 'contained', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 2: CREATE CORE TABLES
-- ============================================

-- Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status tenant_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INSTRUCTIONS FOR NEXT STEPS
-- ============================================

-- This is Part 1 of the schema creation.
-- Due to the size and complexity, the schema is split into multiple parts.
--
-- After running this script, you should run:
-- 1. database-schema-part2.sql (Tables: empresas, obras, proveedores, trabajadores, maquinaria)
-- 2. database-schema-part3.sql (Tables: documentos, tareas, requisitos, mapping, adaptadores)
-- 3. database-schema-part4.sql (Tables: subscriptions, audit, messages, reports, tokens)
-- 4. database-schema-part5.sql (Tables: compliance, GDPR, payment systems)
-- 5. database-schema-part6.sql (Functions, triggers, and RLS policies)

COMMENT ON SCHEMA public IS 'ConstructIA Platform - Multi-tenant Database Schema - Part 1: ENUMs and Core Tables';
