@@ .. @@
 import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
 import { getAllPaymentGateways } from '../lib/supabase';

-interface PaymentGateway {
-  id: string;
-  name: string;
-  type: string;
-  status: string;
-  commission_type: string;
-  commission_percentage?: number;
-  commission_fixed?: number;
-  supported_currencies: string[];
-  min_amount?: number;
-  max_amount?: number;
-  description?: string;
-}
+import type { PaymentGateway } from '../types';

 interface PaymentGatewayContextType {