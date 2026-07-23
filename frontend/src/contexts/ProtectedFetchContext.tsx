// contexts/ProtectedFetchContext.tsx
'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// 定義我們提供的 fetch 函式的型別
type ProtectedFetch = (url: string, options?: RequestInit) => Promise<Response>;

// 建立 Context
const ProtectedFetchContext = createContext<{ protectedFetch: ProtectedFetch | null }>({
  protectedFetch: null,
});

// 建立 Provider 元件，這就是你說的「可以通行的環境」
const mockClients = [
  { id: 1, name: "LalaE E-commerce Brand", bigquery_dataset_id: "client_lalae_shop_2026", is_active: true, created_at: "2026-01-15T08:00:00Z" },
  { id: 2, name: "CyberTech AI Solution", bigquery_dataset_id: "client_cybertech_ai_2026", is_active: true, created_at: "2026-02-01T10:30:00Z" },
  { id: 3, name: "OmniMedia Ads Group", bigquery_dataset_id: "client_omnimedia_ads_2026", is_active: true, created_at: "2026-03-10T14:15:00Z" },
];

const mockConnections = [
  { id: 101, name: "Google Ads Core Sync", client_name: "LalaE E-commerce Brand", data_source_name: "Google Ads", status: "ACTIVE", is_enabled: true, last_run_at: "2026-07-23T12:00:00Z" },
  { id: 102, name: "Facebook Ads Conversions", client_name: "CyberTech AI Solution", data_source_name: "Facebook Ads", status: "ACTIVE", is_enabled: true, last_run_at: "2026-07-23T11:45:00Z" },
  { id: 103, name: "Google Analytics 4 Export", client_name: "OmniMedia Ads Group", data_source_name: "GA4", status: "ACTIVE", is_enabled: true, last_run_at: "2026-07-23T10:30:00Z" },
];

const mockQueries = [
  { id: 201, name: "Daily Ad Spend & ROAS Aggregator", client_name: "LalaE E-commerce Brand", query_text: "SELECT date, SUM(cost) as total_cost FROM `my-project.lalae.ad_data` GROUP BY date", created_at: "2026-04-01T09:00:00Z" },
  { id: 202, name: "Customer Lifetime Value Predictor", client_name: "CyberTech AI Solution", query_text: "SELECT user_id, SUM(amount) as ltv FROM `my-project.cybertech.orders` GROUP BY user_id", created_at: "2026-05-12T16:20:00Z" },
];

const mockConnectionExecutions = [
  { id: 301, connection_name: "Google Ads Core Sync", status: "SUCCESS", records_synced: 12450, executed_at: "2026-07-23T12:00:00Z", duration_seconds: 4.2 },
  { id: 302, connection_name: "Facebook Ads Conversions", status: "SUCCESS", records_synced: 8920, executed_at: "2026-07-23T11:45:00Z", duration_seconds: 3.8 },
];

const mockQueryExecutions = [
  { id: 401, query_name: "Daily Ad Spend & ROAS Aggregator", status: "SUCCESS", executed_at: "2026-07-23T12:05:00Z", execution_time: 1.25 },
];

const mockDashboardData = {
  clients: mockClients,
  connections: mockConnections,
  queries: mockQueries,
  recentConnectionExecutions: mockConnectionExecutions,
  recentQueryExecutions: mockQueryExecutions,
};

export function ProtectedFetchProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const protectedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      // MOCK 模式：免去 Token 防護檢查，直接傳回擬真 Mock 資料
      if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
        console.log(`[ProtectedFetchContext] MOCK_MODE intercepting request: ${url}`);
        let payload: any = mockDashboardData;
        if (url.includes('/clients/')) {
          payload = mockClients;
        } else if (url.includes('/connections/')) {
          payload = mockConnections;
        } else if (url.includes('/queries/')) {
          payload = mockQueries;
        } else if (url.includes('/dashboard/')) {
          payload = mockDashboardData;
        }

        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (status !== 'authenticated' || !session?.accessToken) {
        // 如果沒有有效的 session，直接拋出錯誤，讓呼叫它的地方去處理
        throw new Error('User is not authenticated.');
      }

      // 準備預設的標頭
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      };
      
      // 合併使用者傳入的標頭和我們的預設標頭
      const finalOptions: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      // 呼叫原生的 fetch
      return fetch(url, finalOptions);
    },
    [session?.accessToken, status] // 依賴項
  );

  return (
    <ProtectedFetchContext.Provider value={{ protectedFetch }}>
      {children}
    </ProtectedFetchContext.Provider>
  );
}

// 建立一個自訂 Hook，讓子元件可以輕鬆地使用我們的 protectedFetch
export function useProtectedFetch() {
  const context = useContext(ProtectedFetchContext);
  if (!context) {
    throw new Error('useProtectedFetch must be used within a ProtectedFetchProvider');
  }
  if (!context.protectedFetch) {
    // 這種情況可能發生在 session 還在 loading 時，可以根據需求處理
    // 這裡我們暫時回傳一個會報錯的函式，或可以回傳 null
    return { 
        protectedFetch: () => { throw new Error('Protected fetch is not available yet.'); } 
    };
  }
  return context;
}