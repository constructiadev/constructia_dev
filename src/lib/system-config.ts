// ConstructIA - Configuración del Sistema
import { getEnvVar } from '../utils/env';

export interface SystemConfig {
  // Secrets
  GEMINI_API_KEY?: string;
  S3_ENDPOINT?: string;
  S3_BUCKET?: string;
  S3_KEY?: string;
  S3_SECRET?: string;
  
  // Platform-specific secrets
  NALANDA_API_BASE?: string;
  NALANDA_API_KEY?: string;
  NALANDA_WEBHOOK_SECRET?: string;
  
  CTAIMA_API_BASE?: string;
  CTAIMA_API_KEY?: string;
  CTAIMA_WEBHOOK_SECRET?: string;
  
  ECOORDINA_API_BASE?: string;
  ECOORDINA_API_KEY?: string;
  ECOORDINA_WEBHOOK_SECRET?: string;
  
  // Configuration
  ALERT_DAYS: number[];
  MAX_FILE_MB: number;
  ALLOWED_MIME: string[];
}

export const defaultConfig: SystemConfig = {
  // Default configuration values
  ALERT_DAYS: [30, 15, 7],
  MAX_FILE_MB: 20,
  ALLOWED_MIME: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

export class SystemConfigService {
  private config: SystemConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): SystemConfig {
    return {
      // Load from environment variables
      GEMINI_API_KEY: getEnvVar('VITE_GEMINI_API_KEY'),
      S3_ENDPOINT: getEnvVar('VITE_S3_ENDPOINT'),
      S3_BUCKET: getEnvVar('VITE_S3_BUCKET'),
      S3_KEY: getEnvVar('VITE_S3_KEY'),
      S3_SECRET: getEnvVar('VITE_S3_SECRET'),
      
      NALANDA_API_BASE: getEnvVar('VITE_NALANDA_API_BASE'),
      NALANDA_API_KEY: getEnvVar('VITE_NALANDA_API_KEY'),
      NALANDA_WEBHOOK_SECRET: getEnvVar('VITE_NALANDA_WEBHOOK_SECRET'),
      
      CTAIMA_API_BASE: getEnvVar('VITE_CTAIMA_API_BASE'),
      CTAIMA_API_KEY: getEnvVar('VITE_CTAIMA_API_KEY'),
      CTAIMA_WEBHOOK_SECRET: getEnvVar('VITE_CTAIMA_WEBHOOK_SECRET'),
      
      ECOORDINA_API_BASE: getEnvVar('VITE_ECOORDINA_API_BASE'),
      ECOORDINA_API_KEY: getEnvVar('VITE_ECOORDINA_API_KEY'),
      ECOORDINA_WEBHOOK_SECRET: getEnvVar('VITE_ECOORDINA_WEBHOOK_SECRET'),
      
      // Use defaults for configuration
      ...defaultConfig
    };
  }

  getConfig(): SystemConfig {
    return this.config;
  }

  getPlatformConfig(platform: string) {
    const platformUpper = platform.toUpperCase();
    return {
      apiBase: this.config[`${platformUpper}_API_BASE` as keyof SystemConfig],
      apiKey: this.config[`${platformUpper}_API_KEY` as keyof SystemConfig],
      webhookSecret: this.config[`${platformUpper}_WEBHOOK_SECRET` as keyof SystemConfig]
    };
  }

  isFileAllowed(mimeType: string): boolean {
    return this.config.ALLOWED_MIME.includes(mimeType);
  }

  isFileSizeValid(sizeBytes: number): boolean {
    const sizeMB = sizeBytes / (1024 * 1024);
    return sizeMB <= this.config.MAX_FILE_MB;
  }

  getAlertDays(): number[] {
    return this.config.ALERT_DAYS;
  }

  shouldAlert(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return this.config.ALERT_DAYS.includes(daysUntilExpiry);
  }
}

export const systemConfig = new SystemConfigService();