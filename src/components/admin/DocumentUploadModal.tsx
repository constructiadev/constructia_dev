```diff
--- a/src/components/client/DocumentUpload.tsx
+++ b/src/components/admin/DocumentUploadModal.tsx
@@ -1,4 +1,4 @@
-import React, { useState, useEffect } => 'react';
+import React, { useState, useEffect, useCallback } from 'react';
 import { 
   Upload, 
   FileText, 
@@ -10,7 +10,8 @@
   ChevronRight,
   ChevronDown,
   Plus,
-  X,
+  X as XIcon, // Renamed to avoid conflict with component prop
+  Search,
   Save,
   Loader2
 } from 'lucide-react';
@@ -20,6 +21,7 @@
   createEmpresa, 
   createObra, 
   getCurrentUserTenant,
+  getAllClients, // For admin to select client
   logAuditoria,
   DEV_TENANT_ID 
 } from '../../lib/supabase-real';
@@ -38,10 +40,12 @@
 }
 
 interface HierarchicalSelectorProps {
-  onSelectionChange: (empresaId: string | null, obraId: string | null) => void;
+  onSelectionChange: (clientId: string | null, empresaId: string | null, obraId: string | null) => void;
+  selectedClient: string | null;
   selectedEmpresa: string | null;
   selectedObra: string | null;
 }
 
-function HierarchicalSelector({ onSelectionChange, selectedEmpresa, selectedObra }: HierarchicalSelectorProps) {
+function AdminDocumentTargetSelector({ onSelectionChange, selectedClient, selectedEmpresa, selectedObra }: HierarchicalSelectorProps) {
   const [empresas, setEmpresas] = useState<Empresa[]>([]);
   const [obras, setObras] = useState<{ [empresaId: string]: Obra[] }>({});
   const [expandedEmpresas, setExpandedEmpresas] = useState<string[]>([]);
@@ -56,12 +60,34 @@
     codigo_obra: '',
     direccion: '',
     cliente_final: ''
   });
+  const [clients, setClients] = useState<any[]>([]); // For admin to select client
+  const [filteredClients, setFilteredClients] = useState<any[]>([]);
+  const [clientSearchTerm, setClientSearchTerm] = useState('');
+  const [selectedClientTenantId, setSelectedClientTenantId] = useState<string | null>(null);
 
   useEffect(() => {
-    loadEmpresas();
+    loadClients();
   }, []);
 
-  const loadEmpresas = async () => {
+  useEffect(() => {
+    if (selectedClientTenantId) {
+      loadEmpresas(selectedClientTenantId);
+    } else {
+      setEmpresas([]);
+      setObras({});
+    }
+  }, [selectedClientTenantId]);
+
+  const loadClients = async () => {
+    try {
+      const allClients = await getAllClients(); // Fetches from 'clients' table
+      setClients(allClients);
+      setFilteredClients(allClients);
+    } catch (error) {
+      console.error('Error loading clients:', error);
+    }
+  };
+
+  const loadEmpresas = async (tenantId: string) => {
     try {
       setLoading(true);
-      const tenantId = user?.tenant_id || DEV_TENANT_ID;
       const empresasData = await getTenantEmpresas(tenantId);
       setEmpresas(empresasData);
     } catch (error) {
@@ -72,7 +98,7 @@
 
   const loadObras = async (empresaId: string) => {
     try {
-      const tenantId = user?.tenant_id || DEV_TENANT_ID;
+      const tenantId = selectedClientTenantId || user?.tenant_id || DEV_TENANT_ID;
       const obrasData = await getEmpresaObras(empresaId, tenantId);
       setObras(prev => ({ ...prev, [empresaId]: obrasData }));
     } catch (error) {
@@ -84,14 +110,26 @@
       setExpandedEmpresas(prev => prev.filter(id => id !== empresaId));
     } else {
       setExpandedEmpresas(prev => [...prev, empresaId]);
-      if (!obras[empresaId]) {
+      if (!obras[empresaId] && selectedClientTenantId) {
         await loadObras(empresaId);
       }
     }
   };
 
+  const handleClientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
+    const term = e.target.value;
+    setClientSearchTerm(term);
+    if (term) {
+      setFilteredClients(clients.filter(client =>
+        client.company_name.toLowerCase().includes(term.toLowerCase()) ||
+        client.email.toLowerCase().includes(term.toLowerCase())
+      ));
+    } else {
+      setFilteredClients(clients);
+    }
+  };
+
   const handleCreateEmpresa = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
@@ -110,7 +148,7 @@
 
   const handleCreateObra = async (e: React.FormEvent) => {
     e.preventDefault();
-    if (!selectedEmpresa) return;
+    if (!selectedEmpresa || !selectedClientTenantId) return;
 
     try {
       const tenantId = user?.tenant_id || DEV_TENANT_ID;
@@ -146,6 +184,56 @@
   return (
     <div className="space-y-4">
       <div className="flex items-center justify-between">
+        <h3 className="text-lg font-semibold text-gray-900">Seleccionar Cliente</h3>
+      </div>
+      <div className="border border-gray-200 rounded-lg p-4">
+        <div className="relative mb-3">
+          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
+          <input
+            type="text"
+            placeholder="Buscar cliente por nombre o email..."
+            value={clientSearchTerm}
+            onChange={handleClientSearch}
+            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
+          />
+        </div>
+        <div className="max-h-48 overflow-y-auto space-y-2">
+          {filteredClients.length === 0 && clientSearchTerm ? (
+            <div className="text-center text-gray-500 py-4">No se encontraron clientes.</div>
+          ) : filteredClients.length === 0 && !clientSearchTerm ? (
+            <div className="text-center text-gray-500 py-4">Cargando clientes...</div>
+          ) : (
+            filteredClients.map(client => (
+              <div
+                key={client.id}
+                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
+                  selectedClient === client.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
+                }`}
+                onClick={() => {
+                  onSelectionChange(client.id, null, null);
+                  setSelectedClientTenantId(client.tenant_id);
+                }}
+              >
+                <div className="flex items-center space-x-3">
+                  <User className="w-5 h-5 text-blue-600" />
+                  <div>
+                    <h4 className="font-medium text-gray-900">{client.company_name}</h4>
+                    <p className="text-sm text-gray-600">{client.email}</p>
+                  </div>
+                </div>
+                {selectedClient === client.id && (
+                  <CheckCircle className="w-5 h-5 text-blue-600" />
+                )}
+              </div>
+            ))
+          )}
+        </div>
+      </div>
+
+      {selectedClient && (
+        <>
+          <div className="flex items-center justify-between">
         <h3 className="text-lg font-semibold text-gray-900">Seleccionar Destino</h3>
         <button
           onClick={() => setShowCreateEmpresa(true)}
@@ -155,7 +293,7 @@
           Nueva Empresa
         </button>
       </div>
-
+      
       {!empresas || empresas.length === 0 ? (
         <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
           <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
@@ -174,7 +312,7 @@
                 className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
                   selectedEmpresa === empresa.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                 }`}
-                onClick={() => {
+                onClick={(e) => {
                   onSelectionChange(empresa.id, null);
                   toggleEmpresa(empresa.id);
                 }}
@@ -194,7 +332,7 @@
                   <div className="flex items-center justify-between mb-3">
                     <h5 className="text-sm font-medium text-gray-700">Proyectos/Obras</h5>
                     <button
-                      onClick={(e) => {
+                      onClick={(e: React.MouseEvent) => {
                         e.stopPropagation();
                         setShowCreateObra(true);
                       }}
@@ -217,7 +355,7 @@
                             selectedObra === obra.id 
                               ? 'bg-green-100 border border-green-300' 
                               : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                           }`}
                           onClick={(e) => {
                             e.stopPropagation();
                             onSelectionChange(empresa.id, obra.id);
@@ -237,6 +375,7 @@
               )}
             </div>
           ))}
+        </div>
       )}
 
       {/* Create Empresa Modal */}
@@ -246,7 +385,7 @@
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-gray-900">Nueva Empresa</h3>
               <button
-                onClick={() => setShowCreateEmpresa(false)}
+                onClick={() => setShowCreateEmpresa(false)} // Use XIcon here
                 className="text-gray-400 hover:text-gray-600"
               >
                 <X className="w-5 h-5" />
@@ -305,7 +444,7 @@
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-gray-900">Nueva Obra</h3>
               <button
-                onClick={() => setShowCreateObra(false)}
+                onClick={() => setShowCreateObra(false)} // Use XIcon here
                 className="text-gray-400 hover:text-gray-600"
               >
                 <X className="w-5 h-5" />
@@ -364,13 +503,13 @@
     </div>
   );
 }
-
-export default function DocumentUpload() {
+
+export default function DocumentUploadModal() {
   const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
+  const [selectedClient, setSelectedClient] = useState<string | null>(null);
   const [selectedEmpresa, setSelectedEmpresa] = useState<string | null>([]);
   const [selectedObra, setSelectedObra] = useState<string | null>(null);
   const [uploading, setUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState<{ [fileId: string]: number }>({});
   const [uploadResults, setUploadResults] = useState<{ [fileId: string]: { success: boolean; message: string } }>({});
   const [selectedCategory, setSelectedCategory] = useState<string>('');
 
@@ -421,7 +560,7 @@
     setUploading(true);
 
     for (const selectedFile of selectedFiles) {
-      try {
+      try { // Ensure selectedFile.file is a valid File/Blob object
         // Validación crítica: verificar que el objeto file es realmente un File/Blob
         if (!(selectedFile.file instanceof File) && !(selectedFile.file instanceof Blob)) {
           console.error('❌ Invalid file object type:', {
@@ -450,7 +589,7 @@
         });
 
         // Upload to manual queue with real file storage
-        console.log('📁 Starting real file upload to manual queue...');
+        console.log('📁 Starting real file upload to manual queue...'); // Log the start of the upload
         console.log('📁 File validation passed:', {
           fileName: selectedFile.file.name,
           fileSize: selectedFile.file.size,
@@ -459,7 +598,7 @@
           isBlob: selectedFile.file instanceof Blob
         });
         
-        const document = await manualManagementService.addDocumentToQueue(
+        const document = await manualManagementService.addDocumentToQueue( // Call the service to add document
           selectedEmpresa, // clientId
           selectedObra,    // projectId
           selectedFile.file,
@@ -477,7 +616,7 @@
         }));
 
         // Log audit event
-        const tenantId = user?.tenant_id || DEV_TENANT_ID;
+        const tenantId = user?.tenant_id || DEV_TENANT_ID; // Use current user's tenant ID
         await logAuditoria(
           tenantId,
           user?.id || 'unknown-user',
@@ -506,7 +645,7 @@
       </div>
 
       {/* Hierarchical Selection */}
-      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
-        <HierarchicalSelector
+      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> {/* Hierarchical selector for admin */}
+        <AdminDocumentTargetSelector
           onSelectionChange={(empresaId, obraId) => {
             setSelectedEmpresa(empresaId);
             setSelectedObra(obraId);
@@ -514,10 +653,11 @@
           selectedEmpresa={selectedEmpresa}
           selectedObra={selectedObra}
         />
+        {/* Pass selectedClient to the selector */}
       </div>
 
       {/* Category Selection */}
-      {selectedEmpresa && selectedObra && (
+      {selectedClient && selectedEmpresa && selectedObra && ( // Only show category selection after all hierarchy is selected
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">Categoría del Documento</h3>
           <select
@@ -534,7 +674,7 @@
       )}
 
       {/* File Upload Area */}
-      {selectedEmpresa && selectedObra && selectedCategory && (
+      {selectedClient && selectedEmpresa && selectedObra && selectedCategory && ( // Only show file upload after all hierarchy and category are selected
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">Archivos</h3>
           
@@ -621,7 +761,7 @@
       )}
 
       {/* Selection Summary */}
-      {(selectedEmpresa || selectedObra) && (
+      {(selectedClient || selectedEmpresa || selectedObra) && ( // Show summary if any part of hierarchy is selected
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
           <h4 className="font-medium text-blue-800 mb-2">Destino Seleccionado</h4>
           <div className="text-sm text-blue-700">
```