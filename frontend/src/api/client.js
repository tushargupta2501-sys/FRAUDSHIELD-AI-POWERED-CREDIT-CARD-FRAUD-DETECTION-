import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const evaluateTransaction = async (data) => {
  const response = await apiClient.post('/transactions/evaluate', data);
  return response.data;
};

export const fetchTransactions = async (limit = 50, decision = null) => {
  const params = { limit };
  if (decision) params.decision = decision;
  const response = await apiClient.get('/transactions', { params });
  return response.data;
};

export const fetchSummaryMetrics = async () => {
  const response = await apiClient.get('/analytics/summary');
  return response.data;
};

export const fetchGlobalSHAP = async () => {
  const response = await apiClient.get('/analytics/shap-global');
  return response.data;
};

export const fetchTimeseriesData = async () => {
  const response = await apiClient.get('/analytics/timeseries');
  return response.data;
};

export const fetchRules = async () => {
  const response = await apiClient.get('/rules');
  return response.data;
};

export const toggleRule = async (ruleId) => {
  const response = await apiClient.patch(`/rules/${ruleId}/toggle`);
  return response.data;
};
