// ConstructIA - Servicio de Almacenamiento de Archivos Real
import { supabaseServiceClient } from './supabase-real';
import { appConfig } from '../config/app-config';

export interface FileUploadResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

export interface FileMoveResult {
  success: boolean;
  newPath?: string;
  error?: string;
}

export class FileStorageService {
  private bucketName: string;

  constructor(bucketName?: string) {
    // Use bucket from app config or fallback to parameter or default
    this.bucketName = bucketName || appConfig.settings.STORAGE.bucket || 'documents';
    console.log('📁 [FileStorage] Using bucket:', this.bucketName);
  }

  // Helper para leer archivo como ArrayBuffer de forma robusta
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      // Validar que el parámetro es realmente un Blob/File
      if (!(file instanceof Blob)) {
        reject(new Error(`Invalid file object: expected Blob/File, got ${typeof file}`));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsArrayBuffer(file);
    });
  }
  // Subir archivo real a Supabase Storage
  async uploadFile(
    file: File,
    tenantId: string,
    entidadTipo: string,
    entidadId: string,
    categoria: string,
    version: number = 1
  ): Promise<FileUploadResult> {
    try {
      // Validate file parameter type at entry point
      if (!(file instanceof File) && !(file instanceof Blob)) {
        const actualType = typeof file;
        const actualConstructor = file?.constructor?.name || 'unknown';
        console.error('❌ FileStorageService.uploadFile - Invalid file parameter:', {
          expectedType: 'File or Blob',
          actualType,
          actualConstructor,
          fileValue: file
        });
        return {
          success: false,
          error: `Invalid file object: expected File/Blob, got ${actualType} (${actualConstructor})`
        };
      }

      // Generar hash del archivo
      const fileBuffer = await file.arrayBuffer();
      const hashArray = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hash = Array.from(new Uint8Array(hashArray))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Construir path del archivo
      const fileExtension = file.name.split('.').pop() || 'bin';
      const filePath = `${tenantId}/${entidadTipo}/${entidadId}/${categoria}/v${version}/${hash}.${fileExtension}`;

      console.log('📁 Uploading file to:', filePath);

      // Subir archivo a Supabase Storage
      const { data, error } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error uploading file:', error);
        return {
          success: false,
          error: `Error uploading file: ${error.message}`
        };
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabaseServiceClient.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      console.log('✅ File uploaded successfully:', filePath);

      return {
        success: true,
        filePath: data.path,
        publicUrl: publicUrlData.publicUrl
      };

    } catch (error) {
      console.error('❌ Error in file upload:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Mover archivo a otra plataforma/carpeta
  async moveFile(
    currentPath: string,
    targetPlatform: string,
    tenantId: string,
    documentId: string
  ): Promise<FileMoveResult> {
    try {
      console.log('📁 Moving file from:', currentPath, 'to platform:', targetPlatform);

      // Descargar archivo actual
      const { data: fileData, error: downloadError } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .download(currentPath);

      if (downloadError) {
        console.error('❌ Error downloading file:', downloadError);
        return {
          success: false,
          error: `Error downloading file: ${downloadError.message}`
        };
      }

      // Construir nuevo path para la plataforma
      const pathParts = currentPath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const newPath = `${tenantId}/platforms/${targetPlatform}/${documentId}/${fileName}`;

      // Subir archivo a nueva ubicación
      const { data: uploadData, error: uploadError } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .upload(newPath, fileData, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Error uploading to new location:', uploadError);
        return {
          success: false,
          error: `Error moving file: ${uploadError.message}`
        };
      }

      console.log('✅ File moved successfully to:', newPath);

      return {
        success: true,
        newPath: uploadData.path
      };

    } catch (error) {
      console.error('❌ Error moving file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Copiar archivo a otra ubicación
  async copyFile(
    sourcePath: string,
    targetPath: string
  ): Promise<FileMoveResult> {
    try {
      console.log('📁 Copying file from:', sourcePath, 'to:', targetPath);

      // Descargar archivo fuente
      const { data: fileData, error: downloadError } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .download(sourcePath);

      if (downloadError) {
        return {
          success: false,
          error: `Error downloading source file: ${downloadError.message}`
        };
      }

      // Subir copia a nueva ubicación
      const { data: uploadData, error: uploadError } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .upload(targetPath, fileData, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        return {
          success: false,
          error: `Error copying file: ${uploadError.message}`
        };
      }

      console.log('✅ File copied successfully to:', targetPath);

      return {
        success: true,
        newPath: uploadData.path
      };

    } catch (error) {
      console.error('❌ Error copying file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Eliminar archivo
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('❌ Error deleting file:', error);
        return false;
      }

      console.log('✅ File deleted successfully:', filePath);
      return true;

    } catch (error) {
      console.error('❌ Error deleting file:', error);
      return false;
    }
  }

  // Obtener URL de descarga temporal
  async getDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('❌ Error creating signed URL:', error);
        return null;
      }

      return data.signedUrl;

    } catch (error) {
      console.error('❌ Error creating download URL:', error);
      return null;
    }
  }

  // Verificar si el archivo existe
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .list(filePath.substring(0, filePath.lastIndexOf('/')), {
          search: filePath.substring(filePath.lastIndexOf('/') + 1)
        });

      if (error) {
        return false;
      }

      return data && data.length > 0;

    } catch (error) {
      return false;
    }
  }

  // Obtener información del archivo
  async getFileInfo(filePath: string): Promise<any> {
    try {
      const { data, error } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .list(filePath.substring(0, filePath.lastIndexOf('/')), {
          search: filePath.substring(filePath.lastIndexOf('/') + 1)
        });

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0];

    } catch (error) {
      console.error('❌ Error getting file info:', error);
      return null;
    }
  }
}

export const fileStorageService = new FileStorageService();