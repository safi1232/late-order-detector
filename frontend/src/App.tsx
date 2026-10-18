
import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import {
  fetchAnalytics,
  fetchOrders,
  fetchApiHealth,
} from './api';

import type {
  Analytics,
  ApiOrder,
  OrdersResponse,
  ApiHealth,
} from './api';

import {
  LayoutDashboard,
  Zap,
  Package,
  Settings as SettingsIcon,
  Search,
  Download,
  Bell,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  CalendarDays,
  Activity,
  ShieldCheck,
  X,
  RefreshCw,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import './App.css';

const API_BASE =
  'https://late-order-detector-fb509386.fastapicloud.dev';

const initialForm = {
  PO_ID: 'PO-2001',
  Order_Date: '2026-10-18',
  Supplier_ID: 'SUP-101',
  Product_ID: 'PROD-501',
  Region: 'North America',
  Product_Category: 'Electronics',
  Transport_Mode: 'Road',
  Contract_Type: 'Annual',
  Priority: 'High',
  Expedite_Available: 'Yes',
  Order_Quantity: '500',
  Unit_Cost_USD: '25',
  Order_Value_USD: '12500',
  Promised_Lead_Time_Days: '7',
  Supplier_Reliability_Score: '85',
  Supplier_On_Time_Rate: '90',
  Historical_Orders: '100',
  Historical_Late_Orders: '12',
  Inventory_Coverage_Days: '14',
  Safety_Stock_Days: '5',
  Demand_Volatility: '0.25',
  Supplier_Capacity_Utilization: '75',
  Raw_Material_Price_Change_Pct: '3',
  Currency_Volatility_Pct: '1.5',
  Port_Congestion_Index: '20',
  Weather_Disruption_Index: '10',
  Geopolitical_Risk_Index: '15',
  Payment_Delay_Days: '2',
  Quality_Defect_Rate_Pct: '1',
  Inspection_Delay_Days: '1',
  Actual_Lead_Time_Days: '7',
  Delay_Days: '0',
};

type FormValues = Record<string, string>;

type FormField = {
  name: keyof typeof initialForm;
  label: string;
  type: 'text' | 'date' | 'number' | 'select';
  options?: string[];
};

type FormGroup = {
  title: string;
  fields: FormField[];
};

type Order = {
  id: string;
  supplier: string;
  category: string;
  orderDate: string;
  status: string;
  delayDays: number | null;
};

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone: string;
};

type PredictionView = {
  orderId: string;
  title: string;
  description: string;
  isLate: boolean | null;
  confidence: string | null;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  time: string;
  page: string;
};

const navItems: { label: string; icon: LucideIcon }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Predict delivery', icon: Zap },
  { label: 'Orders', icon: Package },
  { label: 'Settings', icon: SettingsIcon },
];

const fieldGroups: FormGroup[] = [
  {
    title: 'Order information',
    fields: [
      { name: 'PO_ID', label: 'Purchase order ID', type: 'text' },
      { name: 'Order_Date', label: 'Order date', type: 'date' },
      { name: 'Supplier_ID', label: 'Supplier ID', type: 'text' },
      { name: 'Product_ID', label: 'Product ID', type: 'text' },
      {
        name: 'Region',
        label: 'Region',
        type: 'select',
        options: [
          'North America',
          'East Asia',
          'South Asia',
          'Europe',
          'Southeast Asia',
          'Middle East',
          'Africa',
          'South America',
          'Oceania',
        ],
      },
      {
        name: 'Product_Category',
        label: 'Product category',
        type: 'select',
        options: [
          'Electronics',
          'Raw materials',
          'Packaging',
          'Machinery',
          'Other',
        ],
      },
      {
        name: 'Transport_Mode',
        label: 'Transport mode',
        type: 'select',
        options: ['Road', 'Air', 'Sea', 'Rail'],
      },
      {
        name: 'Contract_Type',
        label: 'Contract type',
        type: 'select',
        options: ['Annual', 'Monthly', 'One-time', 'Long-term'],
      },
      {
        name: 'Priority',
        label: 'Priority',
        type: 'select',
        options: ['Low', 'Medium', 'High', 'Critical'],
      },
      {
        name: 'Expedite_Available',
        label: 'Expedite available',
        type: 'select',
        options: ['Yes', 'No'],
      },
    ],
  },
  {
    title: 'Order and supplier metrics',
    fields: [
      { name: 'Order_Quantity', label: 'Order quantity', type: 'number' },
      { name: 'Unit_Cost_USD', label: 'Unit cost (USD)', type: 'number' },
      { name: 'Order_Value_USD', label: 'Order value (USD)', type: 'number' },
      {
        name: 'Promised_Lead_Time_Days',
        label: 'Promised lead time (days)',
        type: 'number',
      },
      {
        name: 'Supplier_Reliability_Score',
        label: 'Supplier reliability score',
        type: 'number',
      },
      {
        name: 'Supplier_On_Time_Rate',
        label: 'Supplier on-time rate (%)',
        type: 'number',
      },
      {
        name: 'Historical_Orders',
        label: 'Historical orders',
        type: 'number',
      },
      {
        name: 'Historical_Late_Orders',
        label: 'Historical late orders',
        type: 'number',
      },
      {
        name: 'Inventory_Coverage_Days',
        label: 'Inventory coverage (days)',
        type: 'number',
      },
      {
        name: 'Safety_Stock_Days',
        label: 'Safety stock (days)',
        type: 'number',
      },
      {
        name: 'Demand_Volatility',
        label: 'Demand volatility',
        type: 'number',
      },
      {
        name: 'Supplier_Capacity_Utilization',
        label: 'Supplier capacity utilization (%)',
        type: 'number',
      },
      {
        name: 'Raw_Material_Price_Change_Pct',
        label: 'Raw material price change (%)',
        type: 'number',
      },
      {
        name: 'Currency_Volatility_Pct',
        label: 'Currency volatility (%)',
        type: 'number',
      },
      {
        name: 'Port_Congestion_Index',
        label: 'Port congestion index',
        type: 'number',
      },
      {
        name: 'Weather_Disruption_Index',
        label: 'Weather disruption index',
        type: 'number',
      },
      {
        name: 'Geopolitical_Risk_Index',
        label: 'Geopolitical risk index',
        type: 'number',
      },
      {
        name: 'Payment_Delay_Days',
        label: 'Payment delay (days)',
        type: 'number',
      },
      {
        name: 'Quality_Defect_Rate_Pct',
        label: 'Quality defect rate (%)',
        type: 'number',
      },
      {
        name: 'Inspection_Delay_Days',
        label: 'Inspection delay (days)',
        type: 'number',
      },
      {
        name: 'Actual_Lead_Time_Days',
        label: 'Actual lead time (days)',
        type: 'number',
      },
      { name: 'Delay_Days', label: 'Delay (days)', type: 'number' },
    ],
  },
];

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>
        <span className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-change">
        <span>{description}</span>
      </div>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatNumber(
  value: number | null | undefined,
  decimals = 1
): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return '—';
  }

  return value.toLocaleString('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
}

function mapApiOrder(order: ApiOrder): Order {
  const rawDelay = order.Delay_Days;
  const parsedDelay =
    rawDelay === null || rawDelay === undefined
      ? null
      : Number(rawDelay);

  return {
    id: String(order.PO_ID ?? 'Unknown'),
    supplier: String(order.Supplier_ID ?? 'Unknown'),
    category: String(order.Product_Category ?? 'Unknown'),
    orderDate: String(order.Order_Date ?? ''),
    status: String(
      order.Late_Status ??
        (Number(order.Late_Delivery) === 1 ? 'Late' : 'On time')
    ),
    delayDays:
      parsedDelay !== null && Number.isFinite(parsedDelay)
        ? parsedDelay
        : null,
  };
}

function getPredictionView(result: unknown): PredictionView {
  const outer =
    typeof result === 'object' && result !== null
      ? (result as Record<string, unknown>)
      : {};

  const nested =
    typeof outer.prediction === 'object' &&
    outer.prediction !== null
      ? (outer.prediction as Record<string, unknown>)
      : {};

  const raw = nested.predicted;
  let isLate: boolean | null = null;

  if (raw === 1 || raw === '1' || raw === true) {
    isLate = true;
  } else if (raw === 0 || raw === '0' || raw === false) {
    isLate = false;
  } else if (typeof raw === 'string') {
    const normalized = raw.toLowerCase();

    if (normalized.includes('late')) {
      isLate = true;
    } else if (
      normalized.includes('on time') ||
      normalized.includes('ontime')
    ) {
      isLate = false;
    }
  }

  const confidenceValue = nested.confidence;

  let confidence: string | null = null;

  if (
    typeof confidenceValue === 'number' &&
    Number.isFinite(confidenceValue) &&
    confidenceValue >= 0
  ) {
    const percentage =
      confidenceValue <= 1
        ? confidenceValue * 100
        : confidenceValue;

    if (percentage <= 100) {
      confidence = `${percentage.toFixed(1)}%`;
    }
  }

  return {
    orderId: String(outer.PO_ID ?? outer.po_id ?? 'N/A'),
    title:
      isLate === true
        ? 'Late Delivery Risk'
        : isLate === false
          ? 'Likely On Time'
          : 'Prediction Generated',
    description:
      isLate === true
        ? 'The model predicts that this order may arrive late. Review supplier reliability, lead time, and potential disruptions.'
        : isLate === false
          ? 'The model predicts that this order will arrive on time based on the submitted information.'
          : 'The model returned a prediction, but its delivery-status label could not be interpreted.',
    isLate,
    confidence,
  };
}

function App() {
  const [activePage, setActivePage] = useState('Overview');
  const [search, setSearch] = useState('');

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  const [form, setForm] = useState<FormValues>({ ...initialForm });
  const [prediction, setPrediction] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsCheckedAt, setSettingsCheckedAt] = useState<string | null>(
    null
  );

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const [predictionNotifications, setPredictionNotifications] = useState<
    Notification[]
  >([]);

  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);
    setDataError('');

    try {
      const [analyticsData, ordersData]: [
        Analytics,
        OrdersResponse,
      ] = await Promise.all([
        fetchAnalytics(),
        fetchOrders(500, 0),
      ]);

      setAnalytics(analyticsData);
      setOrders(ordersData.orders.map(mapApiOrder));
      setTotalOrders(ordersData.total);
    } catch (error: unknown) {
      setDataError(
        error instanceof Error
          ? error.message
          : 'Could not load historical data from the API.'
      );
    } finally {
      setDataLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError('');

    try {
      const health = await fetchApiHealth();
      setApiHealth(health);
    } catch {
      setApiHealth(null);
      setSettingsError(
        'Could not connect to the health endpoint. Check the deployed API.'
      );
    } finally {
      setSettingsCheckedAt(new Date().toISOString());
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (activePage === 'Settings') {
      void loadSettings();
    }
  }, [activePage, loadSettings]);

  const filteredOrders = orders.filter((order) =>
    `${order.id} ${order.supplier} ${order.category} ${order.status} ${order.orderDate}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  const notifications: Notification[] = [
    ...predictionNotifications,

    ...(dataError
      ? [
          {
            id: 'dashboard-error',
            title: 'Dashboard data unavailable',
            message: dataError,
            type: 'error' as const,
            time: 'Current',
            page: 'Overview',
          },
        ]
      : []),

    ...(apiHealth !== null && apiHealth.status !== 'ok'
      ? [
          {
            id: 'api-status',
            title: 'API connection issue',
            message: 'Check the FastAPI health endpoint in Settings.',
            type: 'warning' as const,
            time: 'Current',
            page: 'Settings',
          },
        ]
      : []),

    ...orders
      .filter(
        (order) =>
          order.status.toLowerCase().includes('late') &&
          !order.status.toLowerCase().includes('on time')
      )
      .slice(0, 5)
      .map((order) => ({
        id: `late-${order.id}`,
        title: `Late order: ${order.id}`,
        message: `Supplier ${order.supplier} · ${order.category}${
          order.delayDays !== null
            ? ` · ${order.delayDays} day(s) delayed`
            : ''
        }`,
        type: 'warning' as const,
        time: formatDate(order.orderDate),
        page: 'Orders',
      })),
  ];

  const unreadCount = notifications.filter(
    (notification) => !readNotifications.includes(notification.id)
  ).length;

  const chartData = (analytics?.monthly ?? []).map((item) => {
    const total = Number(item.total_orders) || 0;
    const late = Number(item.late_orders) || 0;

    return {
      month: item.month,
      onTime:
        total > 0
          ? Number((((total - late) / total) * 100).toFixed(1))
          : 0,
    };
  });

  function updateForm(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function addPredictionNotification(
    notification: Notification
  ) {
    setPredictionNotifications((previous) =>
      [notification, ...previous].slice(0, 20)
    );
  }

  async function handlePrediction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setPrediction(null);
    setApiError('');

    const orderId = form.PO_ID || 'Unknown';

    const numericFields = [
      'Order_Quantity',
      'Unit_Cost_USD',
      'Order_Value_USD',
      'Promised_Lead_Time_Days',
      'Supplier_Reliability_Score',
      'Supplier_On_Time_Rate',
      'Historical_Orders',
      'Historical_Late_Orders',
      'Inventory_Coverage_Days',
      'Safety_Stock_Days',
      'Demand_Volatility',
      'Supplier_Capacity_Utilization',
      'Raw_Material_Price_Change_Pct',
      'Currency_Volatility_Pct',
      'Port_Congestion_Index',
      'Weather_Disruption_Index',
      'Geopolitical_Risk_Index',
      'Payment_Delay_Days',
      'Quality_Defect_Rate_Pct',
      'Inspection_Delay_Days',
      'Actual_Lead_Time_Days',
      'Delay_Days',
    ] as const;

    try {
      const payload: Record<string, string | number> = { ...form };

      for (const field of numericFields) {
        const value = form[field].trim();

        if (value === '' || !Number.isFinite(Number(value))) {
          throw new Error(`Please enter a valid number for ${field}.`);
        }

        payload[field] = Number(value);
      }

      payload.Expedite_Available =
        form.Expedite_Available === 'Yes' ? 1 : 0;

      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data: unknown;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          `The API returned an invalid response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        let detail = `Prediction failed (HTTP ${response.status}).`;

        if (
          typeof data === 'object' &&
          data !== null &&
          'detail' in data
        ) {
          const apiDetail = (data as Record<string, unknown>).detail;

          detail =
            typeof apiDetail === 'string'
              ? apiDetail
              : JSON.stringify(apiDetail);
        }

        throw new Error(detail);
      }

      setPrediction(data);

      const resultView = getPredictionView(data);
      const predictionTime = new Date().toLocaleString();

      const resultLabel =
        resultView.isLate === true
          ? 'Late Delivery Risk'
          : resultView.isLate === false
            ? 'Likely On Time'
            : 'Prediction Generated';

      const confidenceText = resultView.confidence
        ? ` · Confidence: ${resultView.confidence}`
        : '';

      addPredictionNotification({
        id: `prediction-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        title: `Prediction: ${resultLabel}`,
        message: `Order ${orderId}${confidenceText}`,
        type:
          resultView.isLate === true
            ? 'warning'
            : resultView.isLate === false
              ? 'success'
              : 'warning',
        time: predictionTime,
        page: 'Predict delivery',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Could not connect to the prediction API. Check your backend and CORS settings.';

      setApiError(errorMessage);

      addPredictionNotification({
        id: `prediction-error-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        title: 'Prediction failed',
        message: `Order ${orderId}: ${errorMessage}`,
        type: 'error',
        time: new Date().toLocaleString(),
        page: 'Predict delivery',
      });
    } finally {
      setLoading(false);
    }
  }

  function exportOrders() {
    const headers = [
      'PO_ID',
      'Supplier_ID',
      'Product_Category',
      'Order_Date',
      'Late_Status',
      'Delay_Days',
    ];

    const rows = filteredOrders.map((order) => [
      order.id,
      order.supplier,
      order.category,
      order.orderDate,
      order.status,
      order.delayDays ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    );

    const link = document.createElement('a');
    link.href = url;
    link.download = 'supplyguard-orders.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderDataError() {
    if (!dataError) return null;

    return (
      <div className="error-message dashboard-error" role="alert">
        <AlertTriangle size={19} />
        <div>
          <strong>Could not load dashboard data</strong>
          <p>{dataError}</p>
          <small>
            Check that your FastAPI server is running and CORS allows your
            frontend origin.
          </small>
          <button
            className="secondary-button"
            type="button"
            onClick={() => void loadDashboardData()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  function renderOrdersTable(limit?: number) {
    const displayedOrders =
      typeof limit === 'number'
        ? filteredOrders.slice(0, limit)
        : filteredOrders;

    return (
      <section className="panel orders-panel">
        <div className="panel-heading orders-heading">
          <div>
            <h2>{activePage === 'Orders' ? 'All orders' : 'Recent orders'}</h2>
            <p>Historical purchase orders from the procurement dataset.</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                aria-label="Search orders"
                placeholder="Search loaded orders..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  className="icon-button clear-search"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  type="button"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              className="secondary-button"
              onClick={exportOrders}
              disabled={filteredOrders.length === 0}
              type="button"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {dataError && renderDataError()}

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>SUPPLIER ID</th>
                <th>CATEGORY</th>
                <th>ORDER DATE</th>
                <th>STATUS</th>
                <th>DELAY (DAYS)</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map((order, index) => (
                <tr key={`${order.id}-${index}`}>
                  <td className="order-id">{order.id}</td>
                  <td>{order.supplier}</td>
                  <td>{order.category}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    <span
                      className={`table-status ${order.status
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.delayDays === null
                      ? '—'
                      : formatNumber(order.delayDays, 1)}
                  </td>
                </tr>
              ))}

              {dataLoading && displayedOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    Loading orders...
                  </td>
                </tr>
              )}

              {!dataLoading && displayedOrders.length === 0 && !dataError && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No orders match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          Showing {displayedOrders.length} of {filteredOrders.length} loaded
          orders
          {totalOrders > orders.length &&
            ` · ${formatNumber(totalOrders, 0)} total records in dataset`}
        </div>
      </section>
    );
  }

  function renderOverview() {
    const total = analytics?.total_orders ?? 0;
    const late = analytics?.late_orders ?? 0;
    const onTime = analytics?.on_time_orders ?? 0;
    const lateRate = analytics?.late_rate_pct ?? 0;
    const averageDelay = analytics?.average_delay_days ?? 0;
    const onTimeRate = total > 0 ? (onTime / total) * 100 : 0;

    return (
      <>
        <div className="welcome-row">
          <div>
            <h1>Supply chain overview</h1>
            <p>Monitor your deliveries and spot potential delays early.</p>
          </div>
          <button
            className="primary-button"
            onClick={() => setActivePage('Predict delivery')}
            type="button"
          >
            <Zap size={17} /> Predict an order
          </button>
        </div>

        {renderDataError()}

        {dataLoading && (
          <div className="panel loading-panel">
            <span className="loading-spinner" />
            Loading historical procurement data...
          </div>
        )}

        <div className="stats-grid">
          <StatCard
            title="Total orders"
            value={dataLoading ? '...' : formatNumber(total, 0)}
            description="Orders in the historical dataset"
            icon={Package}
            tone="purple"
          />
          <StatCard
            title="On-time delivery"
            value={dataLoading ? '...' : `${formatNumber(onTimeRate)}%`}
            description={`${formatNumber(onTime, 0)} orders delivered on time`}
            icon={CheckCircle2}
            tone="green"
          />
          <StatCard
            title="Late deliveries"
            value={dataLoading ? '...' : formatNumber(late, 0)}
            description={`${formatNumber(lateRate)}% of all orders`}
            icon={AlertTriangle}
            tone="orange"
          />
          <StatCard
            title="Average delay"
            value={dataLoading ? '...' : `${formatNumber(averageDelay)} days`}
            description="Average delay across the dataset"
            icon={Clock}
            tone="blue"
          />
        </div>

        <div className="content-grid">
          <section className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h2>Delivery performance</h2>
                <p>Monthly on-time delivery rate</p>
              </div>
              <span className="period-chip">
                <CalendarDays size={15} />
                {analytics?.period_start && analytics?.period_end
                  ? `${formatDate(analytics.period_start)} – ${formatDate(analytics.period_end)}`
                  : 'Historical data'}
              </span>
            </div>

            <div className="chart-legend">
              <span>
                <i className="legend-dot teal-dot" /> On-time rate
              </span>
            </div>

            <div className="chart-wrap">
              {!dataLoading && chartData.length === 0 ? (
                <div className="empty-state">
                  No monthly analytics available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="onTimeFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#159a83"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor="#159a83"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="#edf0f2"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#89939f', fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      unit="%"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#89939f', fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${formatNumber(Number(value))}%`,
                        'On-time rate',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="onTime"
                      name="On-time rate"
                      stroke="#159a83"
                      strokeWidth={3}
                      fill="url(#onTimeFill)"
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="panel health-panel">
            <div className="panel-heading">
              <div>
                <h2>System health</h2>
                <p>Dashboard data status</p>
              </div>
              <span className={dataError ? 'health-pending' : 'status-live'}>
                <span />
                {dataLoading ? 'Loading' : dataError ? 'Error' : 'Connected'}
              </span>
            </div>

            <div className="health-score">
              <span className="health-icon">
                <ShieldCheck size={25} />
              </span>
              <div>
                <strong>Historical data API</strong>
                <p>
                  {dataError
                    ? 'The API could not be reached'
                    : dataLoading
                      ? 'Fetching dataset statistics'
                      : 'Analytics loaded successfully'}
                </p>
              </div>
            </div>

            <div className="health-line">
              <span>Analytics endpoint</span>
              <strong>
                {dataError ? 'Error' : dataLoading ? 'Loading' : 'OK'}
              </strong>
            </div>
            <div className="health-line">
              <span>Orders loaded</span>
              <strong>{formatNumber(orders.length, 0)}</strong>
            </div>
            <div className="health-line">
              <span>Total records</span>
              <strong>{formatNumber(totalOrders, 0)}</strong>
            </div>

            <button
              className="secondary-button full-width"
              onClick={() => setActivePage('Predict delivery')}
              type="button"
            >
              <Activity size={16} /> Test prediction API
            </button>
          </section>
        </div>

        {renderOrdersTable(5)}
      </>
    );
  }

  function renderPrediction() {
    const predictionView =
      prediction !== null ? getPredictionView(prediction) : null;

    return (
      <>
        <div className="welcome-row">
          <div>
            <h1>Predict delivery risk</h1>
            <p>Enter purchase order details to estimate late-delivery risk.</p>
          </div>
          <span className="model-chip">
            <ShieldCheck size={15} /> ML-powered
          </span>
        </div>

        <div className="prediction-layout">
          <form className="panel prediction-form" onSubmit={handlePrediction}>
            {fieldGroups.map((group) => (
              <div className="form-section" key={group.title}>
                <div className="form-section-title">
                  <h2>{group.title}</h2>
                  <span>{group.fields.length} fields</span>
                </div>

                <div className="form-grid">
                  {group.fields.map(({ name, label, type, options }) => (
                    <label className="form-field" key={name}>
                      <span>{label}</span>
                      {type === 'select' ? (
                        <select
                          name={name}
                          value={form[name]}
                          onChange={updateForm}
                          required
                        >
                          {(options ?? []).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          name={name}
                          type={type}
                          value={form[name]}
                          onChange={updateForm}
                          step={type === 'number' ? 'any' : undefined}
                          required
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              className="primary-button predict-submit"
              type="submit"
              disabled={loading}
            >
              <Zap size={17} />
              {loading ? 'Analyzing order...' : 'Predict delivery risk'}
            </button>
          </form>

          <aside className="panel result-panel">
            <div className="result-icon">
              <Activity size={24} />
            </div>
            <h2>Prediction result</h2>
            <p className="result-description">
              Submit the order details to see your model&apos;s prediction.
            </p>

            {loading && (
              <div className="result-message">
                <span className="loading-spinner" />
                <p>Contacting prediction API...</p>
              </div>
            )}

            {apiError && (
              <div className="error-message" role="alert">
                <AlertTriangle size={19} />
                <div>
                  <strong>Prediction unavailable</strong>
                  <p>{apiError}</p>
                  <small>
                    Check that the deployed API is available and accepts the
                    submitted fields.
                  </small>
                </div>
              </div>
            )}

            {predictionView && (
              <div className="prediction-result">
                <div
                  className={`prediction-result-icon ${
                    predictionView.isLate === true
                      ? 'risk-high'
                      : predictionView.isLate === false
                        ? 'risk-low'
                        : 'risk-unknown'
                  }`}
                >
                  {predictionView.isLate === true ? (
                    <AlertTriangle size={25} />
                  ) : predictionView.isLate === false ? (
                    <CheckCircle2 size={25} />
                  ) : (
                    <Activity size={25} />
                  )}
                </div>

                <span className="result-label">DELIVERY ASSESSMENT</span>
                <h3 className="prediction-result-title">
                  {predictionView.title}
                </h3>
                <p className="prediction-result-description">
                  {predictionView.description}
                </p>

                <div className="prediction-detail">
                  <span>Purchase order</span>
                  <strong>
                    {predictionView.orderId === 'N/A'
                      ? form.PO_ID
                      : predictionView.orderId}
                  </strong>
                </div>

                {predictionView.confidence !== null && (
                  <div className="prediction-detail">
                    <span>Model confidence</span>
                    <strong>{predictionView.confidence}</strong>
                  </div>
                )}

                <div
                  className={`prediction-status-banner ${
                    predictionView.isLate === true
                      ? 'banner-late'
                      : predictionView.isLate === false
                        ? 'banner-ontime'
                        : 'banner-unknown'
                  }`}
                >
                  {predictionView.isLate === true
                    ? 'Action recommended: review this order.'
                    : predictionView.isLate === false
                      ? 'No delay risk flagged by the model.'
                      : 'Verify the prediction output format in your API response.'}
                </div>

                <button
                  className="secondary-button full-width"
                  onClick={() => setPrediction(null)}
                  type="button"
                >
                  Clear result
                </button>
              </div>
            )}

            {prediction === null && !loading && !apiError && (
              <div className="result-placeholder">
                <Truck size={32} />
                <span>Your result will appear here</span>
              </div>
            )}

            <div className="result-note">
              <ShieldCheck size={17} />
              <span>
                Predictions are estimates from your trained machine-learning
                pipeline.
              </span>
            </div>
          </aside>
        </div>
      </>
    );
  }

  function renderSettings() {
    const apiConnected = apiHealth?.status === 'ok';
    const modelLoaded = apiHealth?.model_loaded ?? false;
    const modelVersion = apiHealth?.version ?? null;

    const dataSource = analytics?.data_source ?? null;
    const totalRecords = analytics?.total_orders ?? null;
    const periodStart = analytics?.period_start ?? null;
    const periodEnd = analytics?.period_end ?? null;
    const datasetAvailable = analytics !== null;

    return (
      <>
        <div className="welcome-row">
          <div>
            <h1>Settings</h1>
            <p>Application and model configuration.</p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => void loadSettings()}
            disabled={settingsLoading}
          >
            <RefreshCw
              size={17}
              className={settingsLoading ? 'spin' : ''}
            />
            {settingsLoading ? 'Checking...' : 'Refresh status'}
          </button>
        </div>

        <section className="panel settings-panel">
          <div className="settings-row">
            <div>
              <h2>Prediction API</h2>
              <p>Endpoint used to make late-delivery predictions.</p>
              <code>{API_BASE}/predict</code>
            </div>
            <span
              className={`settings-badge ${
                apiConnected ? '' : 'neutral'
              }`}
            >
              {settingsLoading && !apiHealth
                ? 'Checking'
                : apiConnected
                  ? 'Connected'
                  : 'Unavailable'}
            </span>
          </div>

          <div className="settings-row">
            <div>
              <h2>Model version</h2>
              <p>Version reported by the deployed FastAPI backend.</p>
            </div>
            <div className="settings-value">
              <strong>{modelVersion ?? 'Unknown'}</strong>
              <span
                className={`settings-badge ${
                  modelLoaded ? '' : 'neutral'
                }`}
              >
                {settingsLoading && !apiHealth
                  ? 'Checking'
                  : modelLoaded
                    ? 'Model loaded'
                    : 'Not confirmed'}
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <h2>Data source</h2>
              <p>Dataset information available from the analytics API.</p>
            </div>
            <div className="settings-value">
              <strong>{dataSource ?? 'Unavailable'}</strong>
              <span
                className={`settings-badge ${
                  datasetAvailable ? '' : 'neutral'
                }`}
              >
                {datasetAvailable ? 'Analytics available' : 'Not confirmed'}
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <h2>Historical dataset</h2>
              <p>
                {totalRecords !== null
                  ? `${formatNumber(totalRecords, 0)} records`
                  : 'Record count unavailable'}
                {' · '}
                {periodStart ? formatDate(periodStart) : 'Unknown'}
                {' to '}
                {periodEnd ? formatDate(periodEnd) : 'Unknown'}
              </p>
            </div>
            <span
              className={`settings-badge ${
                datasetAvailable ? '' : 'neutral'
              }`}
            >
              {datasetAvailable ? 'Analytics data' : 'Unavailable'}
            </span>
          </div>

          <div className="settings-row">
            <div>
              <h2>Last checked</h2>
              <p>
                {settingsCheckedAt
                  ? new Date(settingsCheckedAt).toLocaleString()
                  : 'Not checked yet'}
              </p>
            </div>
            <span className="settings-badge neutral">
              {settingsLoading ? 'Refreshing' : 'Status check'}
            </span>
          </div>
        </section>

        {settingsError && (
          <div className="error-message dashboard-error" role="alert">
            <AlertTriangle size={19} />
            <div>
              <strong>Could not refresh API status.</strong>
              <p>{settingsError}</p>
            </div>
          </div>
        )}

        {renderDataError()}
      </>
    );
  }

  const ActiveIcon =
    navItems.find((item) => item.label === activePage)?.icon ??
    LayoutDashboard;

  const apiConnected = apiHealth?.status === 'ok';

  async function handleApiStatusCheck() {
    setSettingsLoading(true);
    setSettingsError('');

    try {
      const result = await fetchApiHealth();
      setApiHealth(result);
    } catch {
      setApiHealth(null);
      setSettingsError('Could not connect to the API health endpoint.');
    } finally {
      setSettingsCheckedAt(new Date().toISOString());
      setSettingsLoading(false);
    }
  }

  function markNotificationRead(id: string) {
    setReadNotifications((previous) =>
      previous.includes(id) ? previous : [...previous, id]
    );
  }

  function markAllNotificationsRead() {
    setReadNotifications((previous) => [
      ...new Set([
        ...previous,
        ...notifications.map((notification) => notification.id),
      ]),
    ]);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Activity size={23} />
          </div>
          <div>
            <strong>SupplyGuard</strong>
            <span>Delivery intelligence</span>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`nav-item ${
                activePage === label ? 'active' : ''
              }`}
              onClick={() => setActivePage(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {activePage === label && <ArrowUpRight size={15} />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className={`api-status ${
              apiConnected ? 'connected' : 'disconnected'
            }`}
            onClick={() => void handleApiStatusCheck()}
            disabled={settingsLoading}
            title="Click to check the API connection"
            aria-label="Check API connection status"
          >
            <span className="status-dot" />

            <span className="api-status-text">
              <span>API status</span>
              <strong>
                {settingsLoading
                  ? 'Checking...'
                  : apiConnected
                    ? 'Connected'
                    : 'Disconnected'}
              </strong>
            </span>

            <RefreshCw
              size={15}
              className={settingsLoading ? 'spin' : ''}
            />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <span className="topbar-date">
              <CalendarDays size={15} />
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>

            <div className="notification-wrapper">
              <button
                className="icon-button notification-trigger"
                type="button"
                aria-label={`Notifications${
                  unreadCount > 0 ? `, ${unreadCount} unread` : ''
                }`}
                title="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() =>
                  setNotificationsOpen((previous) => !previous)
                }
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notification-count">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  className="notification-dropdown"
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className="notification-header">
                    <div>
                      <h3>Notifications</h3>
                      <p>
                        {unreadCount} unread notification
                        {unreadCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Close notifications"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {notifications.length > 0 ? (
                    <>
                      <div className="notification-list">
                        {notifications.map((notification) => {
                          const isRead = readNotifications.includes(
                            notification.id
                          );

                          return (
                            <button
                              key={notification.id}
                              type="button"
                              className={`notification-item ${
                                isRead ? 'is-read' : 'is-unread'
                              }`}
                              onClick={() => {
                                markNotificationRead(notification.id);
                                setActivePage(notification.page);
                                setNotificationsOpen(false);
                              }}
                            >
                              <span
                                className={`notification-indicator ${notification.type}`}
                              >
                                {notification.type === 'error' ? (
                                  <AlertTriangle size={17} />
                                ) : notification.type === 'success' ? (
                                  <CheckCircle2 size={17} />
                                ) : (
                                  <Bell size={17} />
                                )}
                              </span>

                              <span className="notification-copy">
                                <strong>{notification.title}</strong>
                                <span>{notification.message}</span>
                                <small>{notification.time}</small>
                              </span>

                              {!isRead && (
                                <span className="notification-unread-dot" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="notification-footer">
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          disabled={unreadCount === 0}
                        >
                          Mark all as read
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="notification-empty">
                      <CheckCircle2 size={28} />
                      <strong>You&apos;re all caught up</strong>
                      <span>No notifications to show.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="user-avatar" title="SupplyGuard user">
              SG
            </div>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading-icon">
            <span>
              <ActiveIcon size={18} />
            </span>
            <span>
              {activePage === 'Overview'
                ? 'OVERVIEW'
                : activePage === 'Predict delivery'
                  ? 'PREDICTION WORKSPACE'
                  : activePage === 'Orders'
                    ? 'ORDER MANAGEMENT'
                    : 'SYSTEM CONFIGURATION'}
            </span>
          </div>

          {activePage === 'Overview' && renderOverview()}

          {activePage === 'Predict delivery' && renderPrediction()}

          {activePage === 'Orders' && (
            <>
              <div className="welcome-row">
                <div>
                  <h1>Orders</h1>
                  <p>
                    Search and export historical procurement orders.
                  </p>
                </div>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => void loadDashboardData()}
                  disabled={dataLoading}
                >
                  <RefreshCw
                    size={16}
                    className={dataLoading ? 'spin' : ''}
                  />
                  Refresh orders
                </button>
              </div>

              {renderOrdersTable()}
            </>
          )}

          {activePage === 'Settings' && renderSettings()}
        </div>

        <footer className="app-footer">
          <span>SupplyGuard</span>
          <span>Procurement delay risk monitoring</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
