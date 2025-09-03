// ConstructIA - Configuración Global de la Aplicación
import { getEnvVar, getEnvVarWithFallback } from '../utils/env';

export interface AppConfig {
  version: string;
  app: {
    name: string;
    environment: string[];
    pwa: {
      enabled: boolean;
      manifest: {
        name: string;
        short_name: string;
        start_url: string;
        display: string;
      };
    };
    branding: {
      font: string;
      colors: {
        primary: string;
        gray: string;
        danger: string;
        info: string;
      };
    };
  };
  settings: {
    MAX_FILE_MB: number;
    ALLOWED_MIME: string[];
    ALERT_DAYS: number[];
    STORAGE: {
      provider: string;
      bucket: string;
      endpoint: string;
    };
    IA: {
      gemini_model: string;
      api_key_secret: string;
      simulate_in_dev: boolean;
    };
    security: {
      password_hash: string;
      session: {
        httpOnly: boolean;
        sameSite: string;
      };
      cors: {
        enabled: boolean;
      };
      rate_limit: {
        windowSec: number;
        max: number;
      };
    };
    legal: {
      gdpr: boolean;
      iso27001: boolean;
      lopd: boolean;
    };
  };
  roles: Array<{ name: string }>;
}

export const appConfig: AppConfig = {
  version: "1.1",
  app: {
    name: "ConstructIA",
    environment: ["dev", "staging", "prod"],
    pwa: {
      enabled: true,
      manifest: {
        name: "ConstructIA",
        short_name: "ConstructIA",
        start_url: "/",
        display: "standalone"
      }
    },
    branding: {
      font: "Century Gothic",
      colors: {
        primary: "#0FA958",
        gray: "#6B7280",
        danger: "#DC2626",
        info: "#2563EB"
      }
    }
  },
  settings: {
    MAX_FILE_MB: 20,
    ALLOWED_MIME: ["application/pdf", "image/jpeg", "image/png"],
    ALERT_DAYS: [30, 15, 7],
    STORAGE: {
      provider: "s3-compatible",
      bucket: getEnvVarWithFallback('VITE_S3_BUCKET', 'uploaddocuments').toLowerCase(),
      endpoint: getEnvVarWithFallback('VITE_S3_ENDPOINT', '')
    },
    IA: {
      gemini_model: "gemini-1.5-pro",
      api_key_secret: "GEMINI_API_KEY",
      simulate_in_dev: true
    },
    security: {
      password_hash: "argon2id",
      session: {
        httpOnly: true,
        sameSite: "Lax"
      },
      cors: {
        enabled: false
      },
      rate_limit: {
        windowSec: 60,
        max: 100
      }
    },
    legal: {
      gdpr: true,
      iso27001: true,
      lopd: true
    }
  },
  roles: [
    { name: "SuperAdmin" },
    { name: "ClienteAdmin" },
    { name: "GestorDocumental" },
    { name: "SupervisorObra" },
    { name: "Proveedor" },
    { name: "Lector" }
  ]
};

// Helper para obtener configuración de entorno
export const getEnvironmentConfig = () => {
  const env = getEnvVarWithFallback('MODE', 'development');
  
  return {
    isDev: env === 'development',
    isStaging: env === 'staging',
    isProd: env === 'production',
    environment: env
  };
};

// Helper para obtener configuración de plataforma
export const getPlatformConfig = (platform: string) => {
  const platformUpper = platform.toUpperCase();
  
  return {
    apiBase: getEnvVar(`VITE_${platformUpper}_API_BASE`),
    apiKey: getEnvVar(`VITE_${platformUpper}_API_KEY`),
    webhookSecret: getEnvVar(`VITE_${platformUpper}_WEBHOOK_SECRET`)
  };
};

// Helper para validar archivo según configuración
export const validateFileConfig = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validar tamaño
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > appConfig.settings.MAX_FILE_MB) {
    errors.push(`El archivo excede el tamaño máximo de ${appConfig.settings.MAX_FILE_MB}MB`);
  }
  
  // Validar tipo MIME
  if (!appConfig.settings.ALLOWED_MIME.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido: ${file.type}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper para verificar días de alerta
export const shouldAlert = (expiryDate: string): boolean => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return appConfig.settings.ALERT_DAYS.includes(daysUntilExpiry);
};