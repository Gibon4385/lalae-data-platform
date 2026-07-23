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
  { id: "1", name: "LalaE E-commerce Brand", bigquery_dataset_id: "client_lalae_shop_2026", is_active: true, created_at: "2026-01-15T08:00:00Z" },
  { id: "2", name: "CyberTech AI Solution", bigquery_dataset_id: "client_cybertech_ai_2026", is_active: true, created_at: "2026-02-01T10:30:00Z" },
  { id: "3", name: "OmniMedia Ads Group", bigquery_dataset_id: "client_omnimedia_ads_2026", is_active: true, created_at: "2026-03-10T14:15:00Z" },
];

const mockConnections = [
  {
    id: 101,
    name: "Google Ads Core Sync",
    display_name: "Google Ads Core Sync",
    target_dataset_id: "client_lalae_shop_2026",
    client_name: "LalaE E-commerce Brand",
    data_source: { id: 1, name: "Google Ads", display_name: "Google Ads" },
    status: "ACTIVE",
    is_enabled: true,
    last_run_at: "2026-07-23T12:00:00Z",
    config: {
      customer_id: "123-456-7890",
      resource_name: "campaign",
      metrics: ["metrics.clicks", "metrics.impressions", "metrics.cost_micros", "metrics.conversions"],
      segments: ["segments.date"],
      attributes: ["campaign.id", "campaign.name", "campaign.status"],
      sync_frequency: "daily",
      sync_time: "08:00"
    }
  },
  {
    id: 102,
    name: "Facebook Ads Conversions",
    display_name: "Facebook Ads Conversions",
    target_dataset_id: "client_cybertech_ai_2026",
    client_name: "CyberTech AI Solution",
    data_source: { id: 2, name: "Facebook Ads", display_name: "Facebook Ads" },
    status: "ACTIVE",
    is_enabled: true,
    last_run_at: "2026-07-23T11:45:00Z",
    config: {
      facebook_ad_account_id: "act_9876543210",
      campaign_ids: ["23849102930", "23849102931"],
      fields: ["campaign_name", "spend", "impressions", "clicks", "conversions", "roas"],
      date_preset: "last_30d",
      sync_frequency: "daily",
      sync_time: "09:00"
    }
  },
  {
    id: 103,
    name: "Google Analytics 4 Export",
    display_name: "Google Analytics 4 Export",
    target_dataset_id: "client_omnimedia_ads_2026",
    client_name: "OmniMedia Ads Group",
    data_source: { id: 3, name: "GA4", display_name: "Google Analytics 4" },
    status: "ACTIVE",
    is_enabled: true,
    last_run_at: "2026-07-23T10:30:00Z",
    config: {
      property_id: "properties/312456789",
      metrics: ["activeUsers", "screenPageViews", "sessions", "conversions"],
      dimensions: ["date", "deviceCategory", "country"],
      sync_frequency: "daily",
      sync_time: "07:30"
    }
  },
];

const mockQueries = [
  { id: 201, name: "Daily Ad Spend & ROAS Aggregator", displayName: "Daily Ad Spend & ROAS Aggregator", client_name: "LalaE E-commerce Brand", config: { sql_query: "SELECT date, SUM(cost) as total_cost FROM `my-project.lalae.ad_data` GROUP BY date", schedule_type: "PERIODIC", cron_schedule: "0 0 * * *", output_target: "GOOGLE_SHEET" }, created_at: "2026-04-01T09:00:00Z" },
  { id: 202, name: "Customer Lifetime Value Predictor", displayName: "Customer Lifetime Value Predictor", client_name: "CyberTech AI Solution", config: { sql_query: "SELECT user_id, SUM(amount) as ltv FROM `my-project.cybertech.orders` GROUP BY user_id", schedule_type: "ONCE", cron_schedule: null, output_target: "NONE" }, created_at: "2026-05-12T16:20:00Z" },
];

const mockQueryListResponse = {
  count: mockQueries.length,
  next: null,
  previous: null,
  results: mockQueries,
  current_dataset: "client_lalae_shop_2026",
  client_datasets: mockClients.map(c => ({
    id: c.id,
    name: c.name,
    bigquery_dataset_id: c.bigquery_dataset_id
  })),
  current_client_name: "LalaE E-commerce Brand",
  current_access_level: "OWNER"
};

const mockConnectionExecutions = [
  { id: 301, connection_name: "Google Ads Core Sync", status: "SUCCESS", records_synced: 12450, executed_at: "2026-07-23T12:00:00Z", duration_seconds: 4.2 },
  { id: 302, connection_name: "Facebook Ads Conversions", status: "SUCCESS", records_synced: 8920, executed_at: "2026-07-23T11:45:00Z", duration_seconds: 3.8 },
];

const mockQueryExecutions = [
  { id: 401, query_name: "Daily Ad Spend & ROAS Aggregator", status: "SUCCESS", executed_at: "2026-07-23T12:05:00Z", execution_time: 1.25 },
];

const mockSchema = {
  tables: [
    {
      name: "facebook_campaign_performance",
      columns: [
        { name: "date", type: "DATE" },
        { name: "campaign_id", type: "STRING" },
        { name: "campaign_name", type: "STRING" },
        { name: "impressions", type: "INTEGER" },
        { name: "clicks", type: "INTEGER" },
        { name: "spend", type: "FLOAT" },
        { name: "conversions", type: "INTEGER" }
      ]
    },
    {
      name: "google_ads_daily_stats",
      columns: [
        { name: "date", type: "DATE" },
        { name: "ad_group_id", type: "STRING" },
        { name: "ad_group_name", type: "STRING" },
        { name: "cost", type: "FLOAT" },
        { name: "conversions", type: "INTEGER" },
        { name: "roas", type: "FLOAT" }
      ]
    },
    {
      name: "orders_master",
      columns: [
        { name: "order_id", type: "STRING" },
        { name: "user_id", type: "STRING" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "total_amount", type: "FLOAT" },
        { name: "payment_status", type: "STRING" }
      ]
    }
  ]
};

const mockQueryResult = {
  status: "success",
  columns: ["date", "campaign_name", "spend", "conversions", "roas"],
  previewData: [
    ["2026-07-23", "Summer Promo 2026", "$1,250.00", "148", "3.85x"],
    ["2026-07-22", "Summer Promo 2026", "$1,180.50", "132", "3.60x"],
    ["2026-07-21", "Retargeting Ads V2", "$850.00", "94", "4.12x"],
    ["2026-07-20", "Brand Awareness AI", "$2,100.00", "210", "2.95x"],
    ["2026-07-19", "Brand Awareness AI", "$1,950.00", "185", "3.10x"]
  ],
  message: "Query executed successfully. Returned 5 rows in 1.2s."
};

const mockGoogleAdsResources = [
  { name: "campaign", display: "Campaign (廣告活動)" },
  { name: "ad_group", display: "Ad Group (廣告群組)" },
  { name: "ad_group_ad", display: "Ad (廣告)" },
  { name: "keyword_view", display: "Keyword (關鍵字)" }
];

const mockGoogleAdsCompatibleFields = {
  metrics: [
    { name: "metrics.clicks", display: "Clicks (點擊數)" },
    { name: "metrics.impressions", display: "Impressions (曝光數)" },
    { name: "metrics.cost_micros", display: "Cost (費用)" },
    { name: "metrics.conversions", display: "Conversions (轉化數)" },
    { name: "metrics.conversions_value", display: "Conversion Value (轉化金額)" },
    { name: "metrics.ctr", display: "CTR (點擊率)" },
    { name: "metrics.average_cpc", display: "Avg CPC (平均點擊成本)" }
  ],
  segments: [
    { name: "segments.date", display: "Date (日期)" },
    { name: "segments.device", display: "Device (裝置類型)" },
    { name: "segments.ad_network_type", display: "Network (廣告聯播網)" }
  ],
  attributes: [
    { name: "campaign.id", display: "Campaign ID (廣告活動 ID)" },
    { name: "campaign.name", display: "Campaign Name (廣告活動名稱)" },
    { name: "campaign.status", display: "Campaign Status (狀態)" }
  ]
};

const mockFBAdAccounts = [
  { id: "act_9876543210", name: "LalaE Global Facebook Ads (act_9876543210)" },
  { id: "act_1234567890", name: "CyberTech Taiwan Marketing (act_1234567890)" }
];

const mockFBAllFields = {
  campaign: {
    fields: [
      { name: "campaign_name", label: "Campaign Name (廣告活動名稱)" },
      { name: "spend", label: "Spend (花費金額)" },
      { name: "impressions", label: "Impressions (曝光數)" },
      { name: "clicks", label: "Clicks (點擊數)" },
      { name: "reach", label: "Reach (觸及人數)" },
      { name: "frequency", label: "Frequency (頻率)" },
      { name: "conversions", label: "Conversions (轉化數)" },
      { name: "purchase_roas", label: "ROAS (購物投資報酬率)" }
    ],
    breakdowns: [
      { name: "age", label: "Age (年齡層)" },
      { name: "gender", label: "Gender (性別)" },
      { name: "country", label: "Country (國家)" },
      { name: "publisher_platform", label: "Platform (平台: FB/IG)" }
    ],
    action_breakdowns: [
      { name: "action_type", label: "Action Type (動作類型)" },
      { name: "action_device", label: "Action Device (動作裝置)" }
    ]
  }
};

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
        if (url.includes('google-ads-resources')) {
          payload = mockGoogleAdsResources;
        } else if (url.includes('get-compatible-google-ads-fields')) {
          payload = mockGoogleAdsCompatibleFields;
        } else if (url.includes('get-facebook-ad-accounts')) {
          payload = mockFBAdAccounts;
        } else if (url.includes('facebook-all-fields')) {
          payload = mockFBAllFields;
        } else if (url.includes('/schema')) {
          payload = mockSchema;
        } else if (url.includes('/test') || url.includes('/run') || url.includes('/preview')) {
          payload = mockQueryResult;
        } else if (url.includes('/clients/')) {
          const idMatch = url.match(/\/clients\/(\d+)/);
          payload = idMatch ? (mockClients.find(c => c.id === parseInt(idMatch[1])) || mockClients[0]) : mockClients;
        } else if (url.includes('/connections/')) {
          const idMatch = url.match(/\/connections\/(\d+)/);
          payload = idMatch ? (mockConnections.find(c => c.id === parseInt(idMatch[1])) || mockConnections[0]) : mockConnections;
        } else if (url.includes('/queries/')) {
          const idMatch = url.match(/\/queries\/(\d+)/);
          payload = idMatch ? (mockQueries.find(q => q.id === parseInt(idMatch[1])) || mockQueries[0]) : mockQueryListResponse;
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