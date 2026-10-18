
const API_BASE = 'https://late-order-detector-fb509386.fastapicloud.dev';

export type Analytics = {
  data_source: string;
  period_start: string | null;
  period_end: string | null;
  total_orders: number;
  late_orders: number;
  on_time_orders: number;
  late_rate_pct: number;
  average_delay_days: number | null;
  monthly: {
    month: string;
    total_orders: number;
    late_orders: number;
  }[];
  by_region: {
    Region: string;
    total_orders: number;
    late_orders: number;
    late_rate_pct: number;
  }[];
};

export type ApiOrder = {
  PO_ID: string;
  Order_Date: string;
  Supplier_ID: string;
  Product_Category: string;
  Late_Delivery: number;
  Late_Status?: string;
  Delay_Days: number | null;
  [key: string]: unknown;
};

export type OrdersResponse = {
  total: number;
  limit: number;
  offset: number;
  orders: ApiOrder[];
};

export type ApiHealth = {
  status: string;
  version: string;
  model_loaded: boolean;
};

export type ApiMetadata = {
  api_status: string;
  model_version: string;
  model_loaded: boolean;
  data_source: string;
  dataset_status: string;
  total_records: number;
  period_start: string | null;
  period_end: string | null;
  checked_at: string;
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export function fetchAnalytics(): Promise<Analytics> {
  return getJson<Analytics>('/analytics');
}

export function fetchOrders(
  limit = 500,
  offset = 0
): Promise<OrdersResponse> {
  return getJson<OrdersResponse>(
    `/orders?limit=${limit}&offset=${offset}`
  );
}

export function fetchApiHealth(): Promise<ApiHealth> {
  return getJson<ApiHealth>('/health');
}

export function fetchApiMetadata(): Promise<ApiMetadata> {
  return getJson<ApiMetadata>('/metadata');
}
