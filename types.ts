export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string
  description: string;
  category: string;
  cropId?: string;
}

export interface Crop {
  id:string;
  name: string;
  plantingDate: string; // ISO string
  estimatedHarvestDate: string; // ISO string
  actualHarvestDate?: string; // ISO string
  area: number;
  areaUnit: 'acres' | 'hectares';
  yieldAmount?: number;
  yieldUnit?: string;
  notes?: string;
}

export interface MaintenanceLog {
  id: string;
  date: string; // ISO string
  description: string;
  cost: number;
}

export interface Equipment {
  id: string;
  name: string;
  purchaseDate: string; // ISO string
  model?: string;
  notes?: string;
  maintenanceLogs: MaintenanceLog[];
}

export interface Settings {
  farmName: string;
  currency: string;
  incomeCategories: string[];
  expenseCategories: string[];
}

export interface ToDo {
  id: string;
  task: string;
  completed: boolean;
}

export interface Notification {
  id: string;
  message: string;
  link?: string; // Can be used to navigate to a specific item, e.g., an equipment ID
  read: boolean;
  seen: boolean;
  timestamp: string; // ISO string
}

export type View = 'dashboard' | 'crops' | 'transactions' | 'reports' | 'settings' | 'summary' | 'farm-ai' | 'equipment';