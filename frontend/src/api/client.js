import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to attach JWT Bearer Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sentinel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication
export const loginUser = async (username = 'analyst@sentinel.ai', password = 'sentinel123') => {
  const response = await apiClient.post('/auth/login', { username, password });
  if (response.data.access_token) {
    localStorage.setItem('sentinel_token', response.data.access_token);
    localStorage.setItem('sentinel_user', JSON.stringify(response.data.user_info));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('sentinel_token');
  localStorage.removeItem('sentinel_user');
};

// Transactions & Risk Evaluation
export const checkTransaction = async (data) => {
  const response = await apiClient.post('/transactions/check', data);
  return response.data;
};

export const evaluateTransaction = async (data) => {
  return checkTransaction(data);
};

export const fetchTransactions = async (limit = 50, decision = null) => {
  const params = { limit };
  if (decision) params.decision = decision;
  const response = await apiClient.get('/transactions', { params });
  return response.data;
};

export const fetchTransactionById = async (id) => {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data;
};

// SHAP Explainability
export const fetchTransactionExplanation = async (transactionId) => {
  const response = await apiClient.get(`/explainability/${transactionId}`);
  return response.data;
};

export const explainTransactionPayload = async (data) => {
  const response = await apiClient.post('/explainability/explain', data);
  return response.data;
};

// Fraud Alerts & Investigation Cases
export const fetchFraudAlerts = async (status = null, severity = null) => {
  const params = {};
  if (status) params.status = status;
  if (severity) params.severity = severity;
  const response = await apiClient.get('/fraud-alerts', { params });
  return response.data;
};

export const fetchFraudCases = async (status = null) => {
  const params = {};
  if (status) params.status = status;
  const response = await apiClient.get('/fraud-cases', { params });
  return response.data;
};

// Dashboard Stats & Analytics
export const fetchDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

export const fetchDashboardCharts = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

export const fetchInvestigationDetails = async (transactionId) => {
  const response = await apiClient.get(`/investigation/${transactionId}`);
  return response.data;
};

export const fetchSummaryMetrics = async () => {
  return fetchDashboardStats();
};

export const fetchGlobalSHAP = async () => {
  const response = await apiClient.get('/explainability/global-importance');
  return response.data;
};

export const fetchTimeseriesData = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

// Rule Engine
export const fetchRules = async () => {
  const response = await apiClient.get('/rules');
  return response.data;
};

export const createRule = async (ruleData) => {
  const response = await apiClient.post('/rules', ruleData);
  return response.data;
};

export const toggleRule = async (ruleId) => {
  const response = await apiClient.patch(`/rules/${ruleId}/toggle`);
  return response.data;
};

// Customers
export const fetchCustomerProfile = async (customerId) => {
  const response = await apiClient.get(`/customers/${customerId}/profile`);
  return response.data;
};

export const fetchCustomerHistory = async (customerId) => {
  const response = await apiClient.get(`/customers/${customerId}/history`);
  return response.data;
};
