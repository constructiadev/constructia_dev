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
    // Use the correct bucket name that exists in Supabase
    this.bucketName = (bucketName || 'uploaddocuments').toLowerCase();
    console.log('📁 [FileStorage] Using bucket:', this.bucketName);
  }

  // Verify bucket exists and is accessible
  private async ensureBucketExists(): Promise<boolean> {
    try {
      console.log('🔍 [FileStorage] DEBUG - ensureBucketExists called');
      console.log('🔍 [FileStorage] DEBUG - Checking bucket existence:', this.bucketName);
      console.log('🔍 [FileStorage] DEBUG - Bucket name type:', typeof this.bucketName);
      console.log('🔍 [FileStorage] DEBUG - Bucket name length:', this.bucketName.length);
      
      const { data: buckets, error: bucketsError } = await supabaseServiceClient.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ [FileStorage] Error listing buckets:', bucketsError);
        return false;
      }
      
      console.log('🔍 [FileStorage] DEBUG - Available buckets:', buckets?.map(b => `"${b.name}"`).join(', ') || 'none');
      console.log('🔍 [FileStorage] DEBUG - Looking for bucket:', `"${this.bucketName}"`);
      
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        console.error(`❌ [FileStorage] Bucket '${this.bucketName}' not found`);
        console.log('📝 [FileStorage] Available buckets:', buckets?.map(b => b.name).join(', ') || 'none');
        console.log('🔍 [FileStorage] DEBUG - Exact bucket names with quotes:');
        buckets?.forEach(bucket => {
          console.log(`   - "${bucket.name}" (length: ${bucket.name.length})`);
        });
        console.log('🔧 [FileStorage] To fix this:');
        console.log(`   1. Go to Supabase Dashboard > Storage`);
        console.log(`   2. Create bucket named: ${this.bucketName}`);
        console.log(`   3. Set as Public: Yes`);
        console.log(`   4. Configure MIME types: PDF, JPEG, PNG`);
        console.log(`   5. Or run: node scripts/populateManualQueue.js`);
        return false;
      }
      
      console.log('✅ [FileStorage] DEBUG - Bucket exists and is accessible:', this.bucketName);
      return true;
    } catch (error) {
      console.error('❌ [FileStorage] Error checking bucket:', error);
      return false;
    }
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
      // Verify bucket exists before upload
      const bucketExists = await this.ensureBucketExists();
      if (!bucketExists) {
        return {
          success: false,
          error: 'Storage bucket not accessible'
        };
      }
      
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
      console.log('🔍 [FileStorage] DEBUG - moveFile called with:');
      console.log('   - currentPath:', currentPath);
      console.log('   - targetPlatform:', targetPlatform);
      console.log('   - bucketName:', this.bucketName);
      console.log('   - tenantId:', tenantId);
      console.log('   - documentId:', documentId);
      
      // Verify bucket exists
      const bucketExists = await this.ensureBucketExists();
      if (!bucketExists) {
        return {
          success: false,
          error: 'Storage bucket not accessible'
        };
      }
      
      console.log('📁 Moving file from:', currentPath, 'to platform:', targetPlatform);

      // Descargar archivo actual
      console.log('🔍 [FileStorage] DEBUG - Attempting download from bucket:', this.bucketName, 'path:', currentPath);
      const { data: fileData, error: downloadError } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .download(currentPath);

      if (downloadError) {
        console.error('❌ [FileStorage] Error downloading file:', downloadError);
        console.error('❌ [FileStorage] Download details:', {
          bucket: this.bucketName,
          path: currentPath,
          error: downloadError
        });
        return {
          success: false,
          error: `Error downloading file: ${downloadError.message}`
        };
      }

      // Construir nuevo path para la plataforma
      const pathParts = currentPath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const newPath = `${tenantId}/platforms/${targetPlatform}/${documentId}/${fileName}`;
      
      console.log('🔍 [FileStorage] DEBUG - New path constructed:', newPath);

      // Subir archivo a nueva ubicación
      console.log('🔍 [FileStorage] DEBUG - Attempting upload to bucket:', this.bucketName, 'path:', newPath);
      const { data: uploadData, error: uploadError } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .upload(newPath, fileData, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ [FileStorage] Error uploading to new location:', uploadError);
        console.error('❌ [FileStorage] Upload details:', {
          bucket: this.bucketName,
          path: newPath,
          error: uploadError
        });
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
      console.log('🔍 [FileStorage] DEBUG - getDownloadUrl called with:');
      console.log('   - filePath:', filePath);
      console.log('   - bucketName:', this.bucketName);
      console.log('   - expiresIn:', expiresIn);
      
      // Verify bucket exists before attempting to create signed URL
      const bucketExists = await this.ensureBucketExists();
      if (!bucketExists) {
        console.error('❌ [FileStorage] Cannot create download URL - bucket not accessible');
        return null;
      }
      
      console.log('📁 [FileStorage] Creating download URL for:', filePath);
      
      // First check if file exists
      const fileExists = await this.fileExists(filePath);
      if (!fileExists) {
        console.error('❌ [FileStorage] File does not exist:', filePath);
        return null;
      }
      
      console.log('🔍 [FileStorage] DEBUG - About to call createSignedUrl with bucket:', this.bucketName);
      const { data, error } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('❌ [FileStorage] Error creating signed URL:', error);
        console.error('❌ [FileStorage] SignedURL details:', {
          bucket: this.bucketName,
          filePath: filePath,
          expiresIn: expiresIn,
          error: error
        });
        return null;
      }

      console.log('✅ [FileStorage] Download URL created successfully');
      return data.signedUrl;

    } catch (error) {
      console.error('❌ Error creating download URL:', error);
      return null;
    }
  }

  // Verificar si el archivo existe
  async fileExists(filePath: string): Promise<boolean> {
    try {
      console.log('🔍 [FileStorage] DEBUG - fileExists called with:');
      console.log('   - filePath:', filePath);
      console.log('   - bucketName:', this.bucketName);
      
      // Verify bucket exists first
      const bucketExists = await this.ensureBucketExists();
      if (!bucketExists) {
        return false;
      }
      
      console.log('🔍 [FileStorage] Checking if file exists:', filePath);
      
      // Extract directory and filename from path
      const lastSlashIndex = filePath.lastIndexOf('/');
      if (lastSlashIndex === -1) {
        console.error('❌ [FileStorage] Invalid file path format:', filePath);
        return false;
      }
      
      const directory = filePath.substring(0, lastSlashIndex);
      const filename = filePath.substring(lastSlashIndex + 1);
      
      console.log('🔍 [FileStorage] Directory:', directory);
      console.log('🔍 [FileStorage] Filename:', filename);
      
      console.log('🔍 [FileStorage] DEBUG - About to list files in bucket:', this.bucketName, 'directory:', directory);
      const { data, error } = await supabaseServiceClient.storage
        .from(this.bucketName)
        .list(directory, {
          search: filename
        });

      if (error) {
        console.error('❌ [FileStorage] Error listing files:', error);
        console.error('❌ [FileStorage] List details:', {
          bucket: this.bucketName,
          directory: directory,
          filename: filename,
          error: error
        });
        return false;
      }

      const exists = data && data.length > 0;
      console.log(`${exists ? '✅' : '❌'} [FileStorage] File ${exists ? 'exists' : 'not found'}`);
      
      if (!exists) {
        console.log('🔍 [FileStorage] Files in directory:', data?.map(f => f.name).join(', ') || 'none');
      }
      
      return exists;

    } catch (error) {
      console.error('❌ [FileStorage] Error in fileExists:', error);
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