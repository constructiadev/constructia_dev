// ConstructIA - Esquemas de Payloads Internos
// Esquemas para construcción de payloads de integración con plataformas externas

export interface CompanyPayload {
  cif: string;
  name: string;
  rea: string;
  contactEmail: string;
}

export interface SitePayload {
  code: string;
  name: string;
  client: string;
  riskProfile: 'low' | 'medium' | 'high';
}

export interface WorkerPayload {
  dni: string;
  name: string;
  surname: string;
  prlLevel: string;
  prlExpiry: string;
}

export interface MachinePayload {
  serial: string;
  type: string;
  maintenanceExpiry: string;
}

export interface DocumentPayload {
  entityType: 'empresa' | 'trabajador' | 'maquinaria' | 'obra';
  category: string;
  fileUrl: string;
  expiry: string;
  meta: Record<string, any>;
}

// Payload completo para integración
export interface IntegrationPayload {
  Company: CompanyPayload;
  Site: SitePayload;
  Worker: WorkerPayload[];
  Machine: MachinePayload[];
  Docs: DocumentPayload[];
}

// Builder para construir payloads desde datos de la base de datos
export class PayloadBuilder {
  private payload: Partial<IntegrationPayload> = {};

  setCompany(empresa: any): PayloadBuilder {
    this.payload.Company = {
      cif: empresa.cif || '',
      name: empresa.razon_social || '',
      rea: empresa.rea_numero || '',
      contactEmail: empresa.contacto_email || ''
    };
    return this;
  }

  setSite(obra: any): PayloadBuilder {
    this.payload.Site = {
      code: obra.codigo_obra || '',
      name: obra.nombre_obra || '',
      client: obra.cliente_final || '',
      riskProfile: obra.perfil_riesgo || 'medium'
    };
    return this;
  }

  setWorkers(trabajadores: any[]): PayloadBuilder {
    this.payload.Worker = trabajadores.map(trabajador => ({
      dni: trabajador.dni_nie || '',
      name: trabajador.nombre || '',
      surname: trabajador.apellido || '',
      prlLevel: trabajador.formacion_prl_nivel || '',
      prlExpiry: trabajador.formacion_prl_caducidad || ''
    }));
    return this;
  }

  setMachines(maquinaria: any[]): PayloadBuilder {
    this.payload.Machine = maquinaria.map(maquina => ({
      serial: maquina.numero_serie || '',
      type: maquina.tipo || '',
      maintenanceExpiry: maquina.mantenimiento_caducidad || ''
    }));
    return this;
  }

  setDocuments(documentos: any[]): PayloadBuilder {
    this.payload.Docs = documentos.map(documento => ({
      entityType: documento.entidad_tipo || 'obra',
      category: documento.categoria || '',
      fileUrl: documento.file || '',
      expiry: documento.caducidad || '',
      meta: documento.metadatos || {}
    }));
    return this;
  }

  build(): IntegrationPayload {
    return {
      Company: this.payload.Company || { cif: '', name: '', rea: '', contactEmail: '' },
      Site: this.payload.Site || { code: '', name: '', client: '', riskProfile: 'medium' },
      Worker: this.payload.Worker || [],
      Machine: this.payload.Machine || [],
      Docs: this.payload.Docs || []
    };
  }

  // Método para validar el payload antes de enviarlo
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const payload = this.build();

    // Validar Company
    if (!payload.Company.cif) errors.push('Company CIF is required');
    if (!payload.Company.name) errors.push('Company name is required');

    // Validar Site
    if (!payload.Site.code) errors.push('Site code is required');
    if (!payload.Site.name) errors.push('Site name is required');

    // Validar Workers
    payload.Worker.forEach((worker, index) => {
      if (!worker.dni) errors.push(`Worker ${index + 1}: DNI is required`);
      if (!worker.name) errors.push(`Worker ${index + 1}: Name is required`);
    });

    // Validar Machines
    payload.Machine.forEach((machine, index) => {
      if (!machine.serial) errors.push(`Machine ${index + 1}: Serial is required`);
      if (!machine.type) errors.push(`Machine ${index + 1}: Type is required`);
    });

    // Validar Documents
    payload.Docs.forEach((doc, index) => {
      if (!doc.entityType) errors.push(`Document ${index + 1}: Entity type is required`);
      if (!doc.category) errors.push(`Document ${index + 1}: Category is required`);
      if (!doc.fileUrl) errors.push(`Document ${index + 1}: File URL is required`);
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Método para convertir a JSON
  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }

  // Método estático para crear desde datos completos
  static fromTenantData(
    empresa: any,
    obra: any,
    trabajadores: any[] = [],
    maquinaria: any[] = [],
    documentos: any[] = []
  ): IntegrationPayload {
    return new PayloadBuilder()
      .setCompany(empresa)
      .setSite(obra)
      .setWorkers(trabajadores)
      .setMachines(maquinaria)
      .setDocuments(documentos)
      .build();
  }
}

// Utilidades para transformación de datos
export class PayloadTransformer {
  // Transformar datos de la nueva arquitectura multi-tenant
  static transformFromNewArchitecture(hierarchyData: any): IntegrationPayload[] {
    const payloads: IntegrationPayload[] = [];

    hierarchyData.forEach((empresa: any) => {
      empresa.obras?.forEach((obra: any) => {
        // Recopilar trabajadores de todos los proveedores
        const allWorkers: any[] = [];
        obra.proveedores?.forEach((proveedor: any) => {
          allWorkers.push(...(proveedor.trabajadores || []));
        });

        // Recopilar documentos de todas las entidades
        const allDocuments: any[] = [
          ...(obra.documentos || []),
          ...allWorkers.flatMap(worker => worker.documentos || []),
          ...(obra.maquinaria?.flatMap((maq: any) => maq.documentos || []) || [])
        ];

        const payload = PayloadBuilder.fromTenantData(
          empresa,
          obra,
          allWorkers,
          obra.maquinaria || [],
          allDocuments
        );

        payloads.push(payload);
      });
    });

    return payloads;
  }

  // Transformar para plataforma específica
  static transformForPlatform(
    payload: IntegrationPayload,
    platform: 'nalanda' | 'ctaima' | 'ecoordina' | 'otro'
  ): any {
    switch (platform) {
      case 'nalanda':
        return PayloadTransformer.transformForNalanda(payload);
      case 'ctaima':
        return PayloadTransformer.transformForCtaima(payload);
      case 'ecoordina':
        return PayloadTransformer.transformForEcoordina(payload);
      default:
        return payload;
    }
  }

  private static transformForNalanda(payload: IntegrationPayload): any {
    return {
      empresa: {
        cif: payload.Company.cif,
        razonSocial: payload.Company.name,
        rea: payload.Company.rea,
        email: payload.Company.contactEmail
      },
      obra: {
        codigo: payload.Site.code,
        nombre: payload.Site.name,
        clienteFinal: payload.Site.client,
        nivelRiesgo: payload.Site.riskProfile
      },
      trabajadores: payload.Worker.map(worker => ({
        dni: worker.dni,
        nombreCompleto: `${worker.name} ${worker.surname}`,
        formacionPRL: {
          nivel: worker.prlLevel,
          caducidad: worker.prlExpiry
        }
      })),
      maquinaria: payload.Machine.map(machine => ({
        numeroSerie: machine.serial,
        tipoMaquina: machine.type,
        mantenimiento: {
          proximaRevision: machine.maintenanceExpiry
        }
      })),
      documentos: payload.Docs.map(doc => ({
        tipoEntidad: doc.entityType,
        categoria: doc.category,
        archivo: doc.fileUrl,
        fechaCaducidad: doc.expiry,
        metadatos: doc.meta
      }))
    };
  }

  private static transformForCtaima(payload: IntegrationPayload): any {
    return {
      company: {
        taxId: payload.Company.cif,
        companyName: payload.Company.name,
        reaNumber: payload.Company.rea,
        contactEmail: payload.Company.contactEmail
      },
      project: {
        projectCode: payload.Site.code,
        projectName: payload.Site.name,
        endClient: payload.Site.client,
        riskLevel: payload.Site.riskProfile
      },
      personnel: payload.Worker.map(worker => ({
        identification: worker.dni,
        firstName: worker.name,
        lastName: worker.surname,
        trainingLevel: worker.prlLevel,
        trainingExpiry: worker.prlExpiry
      })),
      equipment: payload.Machine.map(machine => ({
        serialNumber: machine.serial,
        equipmentType: machine.type,
        nextMaintenance: machine.maintenanceExpiry
      })),
      documents: payload.Docs.map(doc => ({
        entityType: doc.entityType,
        documentCategory: doc.category,
        fileLocation: doc.fileUrl,
        expirationDate: doc.expiry,
        additionalData: doc.meta
      }))
    };
  }

  private static transformForEcoordina(payload: IntegrationPayload): any {
    return {
      entidad: {
        nif: payload.Company.cif,
        denominacion: payload.Company.name,
        numeroREA: payload.Company.rea,
        correo: payload.Company.contactEmail
      },
      centro: {
        codigoCentro: payload.Site.code,
        nombreCentro: payload.Site.name,
        clienteObra: payload.Site.client,
        perfilRiesgo: payload.Site.riskProfile
      },
      operarios: payload.Worker.map(worker => ({
        documento: worker.dni,
        nombre: worker.name,
        apellidos: worker.surname,
        nivelFormacion: worker.prlLevel,
        vencimientoFormacion: worker.prlExpiry
      })),
      equipos: payload.Machine.map(machine => ({
        serie: machine.serial,
        categoria: machine.type,
        proximoMantenimiento: machine.maintenanceExpiry
      })),
      ficheros: payload.Docs.map(doc => ({
        tipoEntidad: doc.entityType,
        tipoDocumento: doc.category,
        rutaArchivo: doc.fileUrl,
        fechaVencimiento: doc.expiry,
        metadatos: doc.meta
      }))
    };
  }
}

// Exportar tipos para uso en otros módulos
export type {
  CompanyPayload,
  SitePayload,
  WorkerPayload,
  MachinePayload,
  DocumentPayload,
  IntegrationPayload
};