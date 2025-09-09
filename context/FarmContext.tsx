import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { Crop, Transaction, Settings, ToDo, TransactionType, Equipment, MaintenanceLog, Notification, View, ViewState } from '../types';
import { DEFAULT_SETTINGS, MOCK_CROPS, MOCK_TRANSACTIONS, MOCK_TODOS, MOCK_EQUIPMENT } from '../constants';

interface FarmContextType {
  crops: Crop[];
  setCrops: React.Dispatch<React.SetStateAction<Crop[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  todos: ToDo[];
  setTodos: React.Dispatch<React.SetStateAction<ToDo[]>>;
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  addCrop: (crop: Omit<Crop, 'id'>) => void;
  updateCrop: (updatedCrop: Crop) => void;
  deleteCrop: (cropId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (updatedTransaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  toggleTodo: (todoId: string) => void;
  addTodo: (task: string) => void;
  deleteTodo: (todoId: string) => void;
  addEquipment: (item: Omit<Equipment, 'id' | 'maintenanceLogs'>) => void;
  updateEquipment: (updatedItem: Equipment) => void;
  deleteEquipment: (equipmentId: string) => void;
  addMaintenanceLog: (equipmentId: string, log: Omit<MaintenanceLog, 'id'>) => void;
  deleteMaintenanceLog: (equipmentId: string, logId: string) => void;
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  formInputContext: any;
  setFormInputContext: React.Dispatch<React.SetStateAction<any>>;
  isOnline: boolean;
  uiInteractionEvent: string | null;
  triggerUIInteraction: (message: string | null) => void;
  notifications: Notification[];
  addNotification: (message: string, link?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsSeen: () => void;
  markAllAsRead: () => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [crops, setCrops] = useState<Crop[]>(MOCK_CROPS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [todos, setTodos] = useState<ToDo[]>(MOCK_TODOS);
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Start with home view
  const [viewState, setViewState] = useState<ViewState>({ view: 'home' });
  
  const [formInputContext, setFormInputContext] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [uiInteractionEvent, setUiInteractionEvent] = useState<string | null>(null);

  const triggerUIInteraction = useCallback((message: string | null) => {
    setUiInteractionEvent(message);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ... rest of your context methods remain the same

  return (
    <FarmContext.Provider value={{
      crops, setCrops,
      transactions, setTransactions,
      settings, setSettings,
      todos, setTodos,
      equipment, setEquipment,
      addCrop, updateCrop, deleteCrop,
      addTransaction, updateTransaction, deleteTransaction,
      toggleTodo, addTodo, deleteTodo,
      addEquipment, updateEquipment, deleteEquipment,
      addMaintenanceLog, deleteMaintenanceLog,
      viewState, setViewState,
      formInputContext, setFormInputContext,
      isOnline,
      uiInteractionEvent,
      triggerUIInteraction,
      notifications,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsSeen,
      markAllAsRead
    }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
