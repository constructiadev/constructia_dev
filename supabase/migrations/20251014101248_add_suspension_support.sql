/*
  # Add Suspension Support for Clients
  
  ## Description
  This migration adds complete support for client suspension functionality,
  including suspension reasons and automatic message notifications.
  
  ## Changes
  
  1. Tables Modified
     - `clients`: Add suspension_reason column
     - `tenant_metadata`: Ensure is_suspended and suspension_reason columns exist
  
  2. Functions Created
     - `check_client_suspension_status`: Checks if a client is suspended
     - `suspend_client_account`: Suspends a client and sends notification
     - `reactivate_client_account`: Reactivates a suspended client
  
  3. Security
     - Functions use SECURITY DEFINER for proper access control
     - RLS policies ensure only authorized users can change suspension status
*/

-- ============================================================================
-- STEP 1: ADD SUSPENSION_REASON TO CLIENTS TABLE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'clients'
    AND column_name = 'suspension_reason'
  ) THEN
    ALTER TABLE public.clients
    ADD COLUMN suspension_reason text;
    
    COMMENT ON COLUMN public.clients.suspension_reason IS 'Reason for account suspension (admin-only field)';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: ENSURE TENANT_METADATA HAS SUSPENSION FIELDS
-- ============================================================================

DO $$
BEGIN
  -- Ensure is_suspended column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'tenant_metadata'
    AND column_name = 'is_suspended'
  ) THEN
    ALTER TABLE public.tenant_metadata
    ADD COLUMN is_suspended boolean DEFAULT false;
  END IF;

  -- Ensure suspension_reason column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'tenant_metadata'
    AND column_name = 'suspension_reason'
  ) THEN
    ALTER TABLE public.tenant_metadata
    ADD COLUMN suspension_reason text;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: CREATE FUNCTION TO CHECK CLIENT SUSPENSION STATUS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_client_suspension_status(
  p_tenant_id uuid
)
RETURNS TABLE (
  is_suspended boolean,
  suspension_reason text,
  subscription_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(tm.is_suspended, false) as is_suspended,
    tm.suspension_reason,
    COALESCE(c.subscription_status, 'unknown') as subscription_status
  FROM public.tenant_metadata tm
  LEFT JOIN public.clients c ON c.tenant_id = p_tenant_id
  WHERE tm.tenant_id = p_tenant_id
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.check_client_suspension_status IS 'Check if a client is suspended by tenant_id';

-- ============================================================================
-- STEP 4: CREATE FUNCTION TO SUSPEND CLIENT ACCOUNT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.suspend_client_account(
  p_client_id uuid,
  p_tenant_id uuid,
  p_admin_user_id uuid,
  p_suspension_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_email text;
  v_company_name text;
  v_message_id uuid;
BEGIN
  -- Get client information
  SELECT email, company_name INTO v_client_email, v_company_name
  FROM public.clients
  WHERE id = p_client_id;
  
  IF v_client_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Client not found');
  END IF;
  
  -- Update clients table
  UPDATE public.clients
  SET 
    subscription_status = 'suspended',
    suspension_reason = p_suspension_reason,
    updated_at = now()
  WHERE id = p_client_id;
  
  -- Update tenant_metadata table
  UPDATE public.tenant_metadata
  SET 
    is_suspended = true,
    suspension_reason = p_suspension_reason,
    subscription_status = 'suspended',
    updated_at = now()
  WHERE tenant_id = p_tenant_id;
  
  -- Create notification message for the client
  INSERT INTO public.mensajes (
    tenant_id,
    tipo,
    titulo,
    contenido,
    prioridad,
    destinatarios,
    estado,
    created_at,
    updated_at
  ) VALUES (
    p_tenant_id,
    'urgencia',
    'Cuenta Suspendida',
    'Su cuenta ha sido suspendida. Póngase en contacto con la administración de ConstructIA para solventarlo. Momentáneamente no puede subir documentos a la plataforma ni acceder a la mayoría de funcionalidades.' || 
    CASE WHEN p_suspension_reason IS NOT NULL THEN E'\n\nMotivo: ' || p_suspension_reason ELSE '' END,
    'alta',
    jsonb_build_array(v_client_email),
    'programado',
    now(),
    now()
  ) RETURNING id INTO v_message_id;
  
  -- Log audit event
  INSERT INTO public.auditoria (
    tenant_id,
    actor_user,
    accion,
    entidad,
    entidad_id,
    detalles,
    created_at
  ) VALUES (
    p_tenant_id,
    p_admin_user_id,
    'client.suspended',
    'cliente',
    p_client_id::text,
    jsonb_build_object(
      'company_name', v_company_name,
      'email', v_client_email,
      'suspension_reason', p_suspension_reason,
      'message_id', v_message_id,
      'admin_action', true
    ),
    now()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'client_id', p_client_id,
    'tenant_id', p_tenant_id,
    'message_id', v_message_id,
    'email', v_client_email
  );
END;
$$;

COMMENT ON FUNCTION public.suspend_client_account IS 'Suspend a client account and send notification message';

-- ============================================================================
-- STEP 5: CREATE FUNCTION TO REACTIVATE CLIENT ACCOUNT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reactivate_client_account(
  p_client_id uuid,
  p_tenant_id uuid,
  p_admin_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_email text;
  v_company_name text;
  v_message_id uuid;
BEGIN
  -- Get client information
  SELECT email, company_name INTO v_client_email, v_company_name
  FROM public.clients
  WHERE id = p_client_id;
  
  IF v_client_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Client not found');
  END IF;
  
  -- Update clients table
  UPDATE public.clients
  SET 
    subscription_status = 'active',
    suspension_reason = NULL,
    updated_at = now()
  WHERE id = p_client_id;
  
  -- Update tenant_metadata table
  UPDATE public.tenant_metadata
  SET 
    is_suspended = false,
    suspension_reason = NULL,
    subscription_status = 'active',
    updated_at = now()
  WHERE tenant_id = p_tenant_id;
  
  -- Create notification message for the client
  INSERT INTO public.mensajes (
    tenant_id,
    tipo,
    titulo,
    contenido,
    prioridad,
    destinatarios,
    estado,
    created_at,
    updated_at
  ) VALUES (
    p_tenant_id,
    'info',
    'Cuenta Reactivada',
    'Su cuenta ha sido reactivada. Ya puede acceder a todas las funcionalidades de ConstructIA y subir documentos a la plataforma.',
    'media',
    jsonb_build_array(v_client_email),
    'programado',
    now(),
    now()
  ) RETURNING id INTO v_message_id;
  
  -- Log audit event
  INSERT INTO public.auditoria (
    tenant_id,
    actor_user,
    accion,
    entidad,
    entidad_id,
    detalles,
    created_at
  ) VALUES (
    p_tenant_id,
    p_admin_user_id,
    'client.reactivated',
    'cliente',
    p_client_id::text,
    jsonb_build_object(
      'company_name', v_company_name,
      'email', v_client_email,
      'message_id', v_message_id,
      'admin_action', true
    ),
    now()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'client_id', p_client_id,
    'tenant_id', p_tenant_id,
    'message_id', v_message_id,
    'email', v_client_email
  );
END;
$$;

COMMENT ON FUNCTION public.reactivate_client_account IS 'Reactivate a suspended client account and send notification';

-- ============================================================================
-- STEP 6: CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clients_subscription_status 
ON public.clients(subscription_status) 
WHERE subscription_status = 'suspended';

CREATE INDEX IF NOT EXISTS idx_tenant_metadata_is_suspended 
ON public.tenant_metadata(is_suspended) 
WHERE is_suspended = true;

-- ============================================================================
-- STEP 7: GRANT NECESSARY PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.check_client_suspension_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.suspend_client_account TO service_role;
GRANT EXECUTE ON FUNCTION public.reactivate_client_account TO service_role;