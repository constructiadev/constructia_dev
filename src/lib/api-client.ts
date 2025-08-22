// ConstructIA - Cliente API para Endpoints
import { appConfig } from '../config/app-config';

export interface APIResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface DocumentUploadParams {
  entidad_tipo: string;
  entidad_id: string;
  categoria: string;
  file: File;
  observaciones?: string;
}

export interface ReviewDocumentParams {
  documento_id: string;
  action: 'aprobar' | 'rechazar';
  comentarios?: string;
}

export interface CreateMessageParams {
  tipo: string;
  titulo: string;
  contenido: string;
  prioridad: string;
  vence?: string;
  destinatarios: string[];
}

export interface CreateCheckoutParams {
  proveedor: string;
  concepto: string;
  monto: number;
}

export class APIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('constructia_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: data.message || 'Error en la petición',
          status: response.status
        };
      }

      return {
        ok: true,
        data,
        status: response.status
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  // Autenticación
  async adminLogin(credentials: LoginCredentials): Promise<APIResponse> {
    const response = await this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.ok && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('constructia_token', this.token);
    }

    return response;
  }

  async clientLogin(credentials: LoginCredentials): Promise<APIResponse> {
    const response = await this.request('/auth/clients/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.ok && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('constructia_token', this.token);
    }

    return response;
  }

  async logout(): Promise<APIResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST'
    });

    if (response.ok) {
      this.token = null;
      localStorage.removeItem('constructia_token');
    }

    return response;
  }

  // Gestión de documentos
  async uploadDocument(params: DocumentUploadParams): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('entidad_tipo', params.entidad_tipo);
    formData.append('entidad_id', params.entidad_id);
    formData.append('categoria', params.categoria);
    formData.append('file', params.file);
    if (params.observaciones) {
      formData.append('observaciones', params.observaciones);
    }

    return this.request('/documents/upload', {
      method: 'POST',
      headers: {
        // No establecer Content-Type para FormData
        'Authorization': this.token ? `Bearer ${this.token}` : ''
      },
      body: formData
    });
  }

  async reviewDocument(params: ReviewDocumentParams): Promise<APIResponse> {
    return this.request('/documents/review', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Mensajes y notificaciones
  async createMessage(params: CreateMessageParams): Promise<APIResponse> {
    return this.request('/admin/messages/send', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Reportes
  async generateMonthlyReport(mes: string, tipo: string, destinatarios: string[]): Promise<APIResponse> {
    return this.request('/admin/reports/monthly', {
      method: 'POST',
      body: JSON.stringify({ mes, tipo, destinatarios })
    });
  }

  // Checkout y pagos
  async createCheckoutSession(params: CreateCheckoutParams): Promise<APIResponse> {
    return this.request('/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Gestión manual
  async getObraliaCredentials(tenantId: string): Promise<APIResponse> {
    return this.request(`/admin/manual-upload/credentials/${tenantId}`, {
      method: 'GET'
    });
  }

  async moveBetweenBuckets(queueId: string, toBucket: string, newOrder: number): Promise<APIResponse> {
    return this.request('/admin/manual-upload/move', {
      method: 'POST',
      body: JSON.stringify({
        queue_id: queueId,
        to_bucket: toBucket,
        new_order: newOrder
      })
    });
  }

  // Integraciones
  async buildPackage(obraId: string, plataforma: string): Promise<APIResponse> {
    return this.request('/integrations/build-package', {
      method: 'POST',
      body: JSON.stringify({ obra_id: obraId, plataforma })
    });
  }

  async sendViaAdapter(jobId: string): Promise<APIResponse> {
    return this.request('/integrations/send', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId })
    });
  }

  // Helpers para rate limiting
  private rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const key = `${endpoint}_${this.token || 'anonymous'}`;
    const limit = this.rateLimitCache.get(key);

    if (!limit || now > limit.resetTime) {
      this.rateLimitCache.set(key, {
        count: 1,
        resetTime: now + (appConfig.settings.security.rate_limit.windowSec * 1000)
      });
      return true;
    }

    if (limit.count >= appConfig.settings.security.rate_limit.max) {
      return false;
    }

    limit.count++;
    return true;
  }
}

// Instancia global del cliente API
export const apiClient = new APIClient();

// Helper para manejar errores de API
export const handleAPIError = (response: APIResponse): string => {
  if (response.status === 429) {
    return 'Demasiadas peticiones. Inténtalo de nuevo en unos minutos.';
  }
  if (response.status === 401) {
    return 'Sesión expirada. Por favor, inicia sesión de nuevo.';
  }
  if (response.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }
  if (response.status === 404) {
    return 'Recurso no encontrado.';
  }
  if (response.status && response.status >= 500) {
    return 'Error del servidor. Inténtalo de nuevo más tarde.';
  }
  
  return response.error || 'Error desconocido';
};

// Helper para retry con backoff exponencial
export const retryWithBackoff = async <T>(
  operation: () => Promise<APIResponse<T>>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<APIResponse<T>> => {
  let lastError: APIResponse<T> | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await operation();
      
      if (result.ok) {
        return result;
      }

      // No reintentar errores 4xx (excepto 429)
      if (result.status && result.status >= 400 && result.status < 500 && result.status !== 429) {
        return result;
      }

      lastError = result;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      lastError = {
        ok: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  return lastError || {
    ok: false,
    error: 'Máximo número de reintentos alcanzado'
  };
};