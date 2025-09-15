export interface MonthlyBudget {
  amount: number;
  currency: string;
  alertThresholds: {
    warning: number;
    critical: number;
  };
  lastAlertSent?: {
    warning?: Date;
    critical?: Date;
  };
}

export interface BudgetOverview {
  budgetSet: boolean;
  budget?: number;
  spent?: number;
  remaining?: number;
  percentageUsed?: number;
  alertLevel?: 'safe' | 'warning' | 'critical';
  shouldSendAlert?: boolean;
  alertType?: 'warning' | 'critical';
  thresholds?: {
    warning: number;
    critical: number;
  };
  monthlyData?: {
    month: number;
    year: number;
    totalExpenses: number;
    transactionCount: number;
    period: {
      startDate: Date;
      endDate: Date;
    };
  };
  categoryBreakdown?: Array<{
    categoryId?: string;
    categoryName: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
}

export interface BudgetAlertSummary {
  budgetSet: boolean;
  alertsEnabled: boolean;
  currentStatus: 'no_budget' | 'safe' | 'warning' | 'critical';
  percentageUsed?: number;
  shouldSendAlert?: boolean;
  lastAlerts?: {
    warning?: Date;
    critical?: Date;
  };
  thresholds?: {
    warning: number;
    critical: number;
  };
}