import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { TenantDataService, ClientSuspensionStatus } from '../lib/tenant-service';

export function useSuspensionStatus() {
  const { user } = useAuth();
  const [suspensionStatus, setSuspensionStatus] = useState<ClientSuspensionStatus | null>(null);
  const [checkingSuspension, setCheckingSuspension] = useState(true);

  useEffect(() => {
    checkSuspensionStatus();

    // Check suspension status every 30 seconds
    const interval = setInterval(() => {
      checkSuspensionStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.tenant_id]);

  const checkSuspensionStatus = async () => {
    if (!user?.tenant_id) {
      setCheckingSuspension(false);
      return;
    }

    try {
      setCheckingSuspension(true);
      const status = await TenantDataService.checkClientSuspensionStatus(user.tenant_id);
      setSuspensionStatus(status);
    } catch (error) {
      console.error('Error checking suspension status:', error);
      setSuspensionStatus(null);
    } finally {
      setCheckingSuspension(false);
    }
  };

  return {
    isSuspended: suspensionStatus?.is_suspended || false,
    suspensionReason: suspensionStatus?.suspension_reason,
    suspensionStatus,
    checkingSuspension,
    refreshSuspensionStatus: checkSuspensionStatus
  };
}
