import api from './axios';

export const debtService = {
  getDebts: async (params) => {
    return await api.get('/debts', { params });
  },
  getDebtById: async (debtId) => {
    return await api.get(`/debts/${debtId}`);
  },
  createDebtPayment: async (debtId, payload) => {
    return await api.post(`/debts/${debtId}/payments`, payload);
  }
};
