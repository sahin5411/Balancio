export const APP_CONSTANTS = {
  APP_NAME: 'Finance Tracker',
  CURRENCY: 'USD',
  DATE_FORMAT: 'MM/dd/yyyy',
  TRANSACTION_TYPES: {
    INCOME: 'income',
    EXPENSE: 'expense'
  },
  COLORS: {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
    INFO: '#06B6D4'
  }
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://balancio-backend.vercel.app/api',
  // You can add different environments here:
  // BASE_URL: 'http://localhost:3000/api',
  // PROD_BASE_URL: 'https://balancio-backend.vercel.app/api',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: 'auth/login',
      SIGNUP: 'auth/signup',
      GOOGLE: 'auth/google',
      GITHUB: 'auth/github',
      LOGOUT: 'auth/logout'
    },
    USERS: {
      PROFILE: 'users/profile',
      CHANGE_PASSWORD: 'users/change-password',
      SETTINGS: 'users/settings'
    },
    TRANSACTIONS: {
      BASE: 'transactions',
      BY_ID: (id: string) => `transactions/${id}`
    },
    CATEGORIES: {
      BASE: 'categories',
      BY_ID: (id: string) => `categories/${id}`
    },
    REPORTS: {
      MONTHLY: 'reports/monthly',
      DOWNLOAD: (year: number, month: number) => `reports/monthly/${year}/${month}/download`
    },
    BUDGET: {
      BASE: 'budget',
      ALERTS: 'budget/alerts'
    }
  }
};