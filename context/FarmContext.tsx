import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Crop, Transaction, Settings, ToDo, View, TransactionType, Equipment, MaintenanceLog, Notification } from '../types';
import { DEFAULT_SETTINGS, MOCK_CROPS, MOCK_TRANSACTIONS, MOCK_TODOS, MOCK_EQUIPMENT } from '../constants';

interface ViewState {
    view: View;
    type?: TransactionType;
    payload?: any;
}

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
  const [crops, setCrops] = useLocalStorage<Crop[]>('farm_crops', MOCK_CROPS);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('farm_transactions', MOCK_TRANSACTIONS);
  const [settings, setSettings] = useLocalStorage<Settings>('farm_settings', DEFAULT_SETTINGS);
  const [todos, setTodos] = useLocalStorage<ToDo[]>('farm_todos', MOCK_TODOS);
  const [equipment, setEquipment] = useLocalStorage<Equipment[]>('farm_equipment', MOCK_EQUIPMENT);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('farm_notifications', []);
  const [viewState, setViewState] = useState<ViewState>({ view: 'dashboard' });
  const [formInputContext, setFormInputContext] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [uiInteractionEvent, setUiInteractionEvent] = useState<string | null>(null);

  const triggerUIInteraction = useCallback((message: string | null) => {
    setUiInteractionEvent(message);
  }, []);


  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Notification Management ---
  const addNotification = (message: string, link?: string) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      message,
      link,
      read: false,
      seen: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };
  
  const markAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const markAllNotificationsAsSeen = () => {
    setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
  };


  const addCrop = (crop: Omit<Crop, 'id'>) => {
    setCrops(prev => [...prev, { ...crop, id: crypto.randomUUID() }]);
  };

  const updateCrop = (updatedCrop: Crop) => {
    setCrops(prev => prev.map(c => c.id === updatedCrop.id ? updatedCrop : c));
  };

  const deleteCrop = (cropId: string) => {
    setCrops(prev => prev.filter(c => c.id !== cropId));
  };
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: crypto.randomUUID() }].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  const toggleTodo = (todoId: string) => {
    setTodos(prev => prev.map(todo => todo.id === todoId ? { ...todo, completed: !todo.completed } : todo));
  };

  const addTodo = (task: string) => {
      if (task.trim() === '') return;
      const newTodo: ToDo = { id: crypto.randomUUID(), task, completed: false };
      setTodos(prev => [newTodo, ...prev]);
  };
  
  const deleteTodo = (todoId: string) => {
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
  };

  const addEquipment = (item: Omit<Equipment, 'id' | 'maintenanceLogs'>) => {
    const newEquipment: Equipment = { ...item, id: crypto.randomUUID(), maintenanceLogs: [] };
    setEquipment(prev => [...prev, newEquipment]);
  };
  
  const updateEquipment = (updatedItem: Equipment) => {
    setEquipment(prev => prev.map(eq => eq.id === updatedItem.id ? updatedItem : eq));
  };
  
  const deleteEquipment = (equipmentId: string) => {
    setEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
  };

  const addMaintenanceLog = (equipmentId: string, log: Omit<MaintenanceLog, 'id'>) => {
    const newLog = { ...log, id: crypto.randomUUID() };
    let targetEquipment: Equipment | undefined;

    setEquipment(prev => {
      const newState = prev.map(eq => {
        if (eq.id === equipmentId) {
          targetEquipment = eq; // get equipment state before update
          return { ...eq, maintenanceLogs: [...eq.maintenanceLogs, newLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) };
        }
        return eq;
      });
      
      // After state update is calculated, check for notification trigger
      if (targetEquipment && targetEquipment.maintenanceLogs.length === 1) {
          // It had 1 log, now it will have 2.
          addNotification(`"${targetEquipment.name}" is now ready for an AI maintenance prediction.`, equipmentId);
      }

      return newState;
    });
  };
  
  const deleteMaintenanceLog = (equipmentId: string, logId: string) => {
    setEquipment(prev => prev.map(eq => eq.id === equipmentId ? { ...eq, maintenanceLogs: eq.maintenanceLogs.filter(log => log.id !== logId) } : eq));
  };


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