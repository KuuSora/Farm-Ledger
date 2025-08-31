
import { Settings, Crop, Transaction, ToDo, TransactionType } from './types';

export const DEFAULT_INCOME_CATEGORIES = [
  "Crop Sale",
  "Livestock Sale",
  "Government Grant",
  "Other",
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Seeds",
  "Fertilizer",
  "Pesticides",
  "Fuel",
  "Labor",
  "Repairs",
  "Rent",
  "Utilities",
  "Insurance",
  "Other",
];

export const DEFAULT_SETTINGS: Settings = {
  farmName: "My Farm",
  currency: "USD",
  incomeCategories: DEFAULT_INCOME_CATEGORIES,
  expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
};

export const MOCK_CROPS: Crop[] = [
  {
    id: 'crop-1',
    name: 'Wheat - Field A',
    plantingDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
    estimatedHarvestDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    area: 50,
    areaUnit: 'acres',
    notes: 'Using a new fertilizer this season.'
  },
  {
    id: 'crop-2',
    name: 'Corn - Field B',
    plantingDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
    estimatedHarvestDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
    area: 100,
    areaUnit: 'acres'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1',
    type: TransactionType.EXPENSE,
    amount: 1200,
    date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    description: 'Wheat seeds for Field A',
    category: 'Seeds',
    cropId: 'crop-1'
  },
  {
    id: 'txn-2',
    type: TransactionType.EXPENSE,
    amount: 500,
    date: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
    description: 'Fertilizer purchase',
    category: 'Fertilizer',
    cropId: 'crop-1'
  },
  {
    id: 'txn-3',
    type: TransactionType.INCOME,
    amount: 3500,
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    description: 'Early sale of hay',
    category: 'Other',
  },
  {
    id: 'txn-4',
    type: TransactionType.EXPENSE,
    amount: 250,
    date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    description: 'Tractor fuel',
    category: 'Fuel',
  }
];

export const MOCK_TODOS: ToDo[] = [
    { id: 'todo-1', task: 'Fertilize Field 3', completed: false },
    { id: 'todo-2', task: 'Order new seeds for next season', completed: false },
    { id: 'todo-3', task: 'Service the harvester', completed: true },
];
