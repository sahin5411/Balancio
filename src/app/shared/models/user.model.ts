export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  settings?: {
    emailNotifications: boolean;
    budgetAlerts: boolean;
    monthlyReports: boolean;
    reportFormat?: string;
    twoFactorEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}