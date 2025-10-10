```diff
--- a/src/components/admin/ClientsManagement.tsx
+++ b/src/components/admin/ClientsManagement.tsx
@@ -1034,7 +1034,7 @@
                     </td>
                     <td className="py-3 px-4 text-sm text-gray-900">
                       {client.total_documents || 0} {/* Use total_documents */}
-                    </div>
+                    </td>
                     <td className="py-3 px-4">
                       <PlatformCredentialsStatus
                         client={client}
```