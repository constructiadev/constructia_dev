import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Trash2, Users, Shield } from 'lucide-react';
import { supabaseServiceClient } from '../../lib/supabase-real';

interface OrphanedUser {
  user_id: string;
  email: string;
  role: string;
  tenant_id: string;
  created_at: string;
}

export default function OrphanedUsersCheck() {
  const [loading, setLoading] = useState(false);
  const [orphanedCount, setOrphanedCount] = useState<number | null>(null);
  const [orphanedUsers, setOrphanedUsers] = useState<OrphanedUser[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    checkOrphanedUsers();
  }, []);

  const checkOrphanedUsers = async () => {
    setLoading(true);
    try {
      console.log('🔍 [OrphanedUsersCheck] Checking for orphaned users...');

      // Call the database function to get orphaned users count
      const { data: countData, error: countError } = await supabaseServiceClient
        .rpc('get_orphaned_users_count');

      if (countError) {
        console.error('❌ [OrphanedUsersCheck] Error getting count:', countError);
        // If function doesn't exist yet, try manual query
        const { data: users, error: usersError } = await supabaseServiceClient
          .from('users')
          .select('id, email, role, tenant_id, created_at')
          .neq('role', 'SuperAdmin');

        if (usersError) {
          console.error('❌ [OrphanedUsersCheck] Error querying users:', usersError);
          setOrphanedCount(null);
          return;
        }

        // Manually check for orphaned users
        const orphaned: OrphanedUser[] = [];
        for (const user of users || []) {
          const { data: client, error: clientError } = await supabaseServiceClient
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!clientError && !client) {
            orphaned.push({
              user_id: user.id,
              email: user.email,
              role: user.role,
              tenant_id: user.tenant_id,
              created_at: user.created_at
            });
          }
        }

        setOrphanedCount(orphaned.length);
        setOrphanedUsers(orphaned);
        console.log(`✅ [OrphanedUsersCheck] Found ${orphaned.length} orphaned users (manual check)`);
        return;
      }

      setOrphanedCount(countData);
      console.log(`✅ [OrphanedUsersCheck] Found ${countData} orphaned users`);

      // If there are orphaned users, get their details
      if (countData > 0) {
        const { data: detailsData, error: detailsError } = await supabaseServiceClient
          .rpc('get_orphaned_users_details');

        if (!detailsError && detailsData) {
          setOrphanedUsers(detailsData);
          console.log(`✅ [OrphanedUsersCheck] Loaded details for ${detailsData.length} orphaned users`);
        }
      }
    } catch (error) {
      console.error('❌ [OrphanedUsersCheck] Exception:', error);
      setOrphanedCount(null);
    } finally {
      setLoading(false);
    }
  };

  const cleanupOrphanedUsers = async () => {
    if (orphanedCount === 0 || !orphanedUsers.length) {
      alert('No hay usuarios huérfanos para limpiar');
      return;
    }

    const confirmMessage = `⚠️ ADVERTENCIA: Esta acción eliminará ${orphanedCount} usuario(s) huérfano(s)\n\n` +
      `Usuarios a eliminar:\n` +
      orphanedUsers.map(u => `• ${u.email} (${u.role})`).join('\n') +
      `\n\n✓ Los registros de auditoría se preservarán\n` +
      `⚠️ Esta acción no se puede deshacer\n\n` +
      `¿Estás seguro de que deseas continuar?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setCleaning(true);
    try {
      console.log(`🧹 [OrphanedUsersCheck] Cleaning up ${orphanedCount} orphaned users...`);

      let deletedCount = 0;
      const errors: string[] = [];

      for (const user of orphanedUsers) {
        try {
          // Log to auditoria before deleting
          await supabaseServiceClient
            .from('auditoria')
            .insert({
              tenant_id: user.tenant_id,
              actor_user: null,
              accion: 'MANUAL_CLEANUP_ORPHANED_USER',
              entidad: 'users',
              entidad_id: user.user_id,
              detalles: {
                cleanup_type: 'manual_orphaned_user_removal',
                user_email: user.email,
                user_role: user.role,
                reason: 'User exists without associated client record',
                cleanup_timestamp: new Date().toISOString()
              }
            });

          // Delete the user
          const { error: deleteError } = await supabaseServiceClient
            .from('users')
            .delete()
            .eq('id', user.user_id);

          if (deleteError) {
            console.error(`❌ [OrphanedUsersCheck] Error deleting user ${user.email}:`, deleteError);
            errors.push(`${user.email}: ${deleteError.message}`);
          } else {
            deletedCount++;
            console.log(`✅ [OrphanedUsersCheck] Deleted orphaned user: ${user.email}`);
          }
        } catch (error) {
          console.error(`❌ [OrphanedUsersCheck] Exception deleting user ${user.email}:`, error);
          errors.push(`${user.email}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      console.log(`✅ [OrphanedUsersCheck] Cleanup complete: ${deletedCount}/${orphanedCount} users deleted`);

      if (errors.length > 0) {
        alert(
          `⚠️ Limpieza parcialmente completada\n\n` +
          `✅ Eliminados: ${deletedCount} usuarios\n` +
          `❌ Errores: ${errors.length} usuarios\n\n` +
          `Errores:\n${errors.slice(0, 5).join('\n')}` +
          (errors.length > 5 ? `\n... y ${errors.length - 5} más` : '')
        );
      } else {
        alert(
          `✅ Limpieza completada exitosamente\n\n` +
          `${deletedCount} usuario(s) huérfano(s) eliminados\n` +
          `Los registros de auditoría se han preservado`
        );
      }

      // Refresh the check
      await checkOrphanedUsers();
    } catch (error) {
      console.error('❌ [OrphanedUsersCheck] Cleanup failed:', error);
      alert(`Error durante la limpieza: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setCleaning(false);
    }
  };

  const getStatusColor = () => {
    if (loading || orphanedCount === null) return 'bg-gray-50 border-gray-200';
    if (orphanedCount === 0) return 'bg-green-50 border-green-200';
    if (orphanedCount > 0) return 'bg-orange-50 border-orange-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    if (orphanedCount === null) return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    if (orphanedCount === 0) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <AlertTriangle className="w-5 h-5 text-orange-600" />;
  };

  return (
    <div className={`border rounded-xl p-6 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Users className="w-6 h-6 mr-3 text-gray-700" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Verificación de Usuarios Huérfanos
            </h3>
            <p className="text-sm text-gray-600">
              Usuarios sin cliente asociado en la base de datos
            </p>
          </div>
        </div>
        <button
          onClick={checkOrphanedUsers}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50"
          title="Actualizar verificación"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
          <div className="flex items-center">
            {getStatusIcon()}
            <div className="ml-3">
              <p className="font-semibold text-gray-900">
                {loading ? 'Verificando...' :
                 orphanedCount === null ? 'Error al verificar' :
                 orphanedCount === 0 ? 'Base de datos limpia' :
                 `${orphanedCount} usuario(s) huérfano(s) encontrado(s)`}
              </p>
              <p className="text-sm text-gray-600">
                {loading ? 'Consultando base de datos...' :
                 orphanedCount === null ? 'No se pudo completar la verificación' :
                 orphanedCount === 0 ? 'Todos los usuarios tienen clientes asociados' :
                 'Usuarios sin registro de cliente correspondiente'}
              </p>
            </div>
          </div>

          {orphanedCount !== null && orphanedCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 bg-white border border-orange-300 text-orange-700 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
              >
                {showDetails ? 'Ocultar Detalles' : 'Ver Detalles'}
              </button>
              <button
                onClick={cleanupOrphanedUsers}
                disabled={cleaning}
                className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {cleaning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Limpiando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpiar Ahora
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Details Section */}
        {showDetails && orphanedUsers.length > 0 && (
          <div className="bg-white rounded-lg border border-orange-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Usuarios Huérfanos Detectados:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orphanedUsers.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg text-sm">
                  <div className="flex items-center">
                    <span className="font-mono text-xs text-gray-500 mr-3">{index + 1}.</span>
                    <div>
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-600">
                        Rol: {user.role} • Creado: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {user.role === 'SuperAdmin' && (
                    <div className="flex items-center text-blue-600 text-xs font-medium">
                      <Shield className="w-3 h-3 mr-1" />
                      Protegido
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">ℹ️ Información</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Los usuarios huérfanos son registros de usuarios sin cliente asociado</li>
            <li>• Esto puede ocurrir si un cliente fue eliminado manualmente sin eliminar el usuario</li>
            <li>• La limpieza automática ahora está habilitada vía trigger de base de datos</li>
            <li>• Los usuarios SuperAdmin nunca se consideran huérfanos</li>
            <li>• Los registros de auditoría se preservan permanentemente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
