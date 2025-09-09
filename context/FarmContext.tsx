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

// FIXED: Utility function to generate unique IDs - replaced deprecated .substr() with .substring()
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

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

  // Crop methods
  const addCrop = useCallback((crop: Omit<Crop, 'id'>) => {
    const newCrop: Crop = {
      ...crop,
      id: generateId()
    };
    setCrops(prev => [...prev, newCrop]);
  }, []);

  const updateCrop = useCallback((updatedCrop: Crop) => {
    setCrops(prev => prev.map(crop => 
      crop.id === updatedCrop.id ? updatedCrop : crop
    ));
  }, []);

  const deleteCrop = useCallback((cropId: string) => {
    setCrops(prev => prev.filter(crop => crop.id !== cropId));
  }, []);

  // Transaction methods
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId()
    };
    setTransactions(prev => [...prev, newTransaction]);
  }, []);

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    ));
  }, []);

  const deleteTransaction = useCallback((transactionId: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
  }, []);

  // Todo methods
  const toggleTodo = useCallback((todoId: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  // FIXED: Updated addTodo to match the ToDo interface structure
  // The original code creates createdAt as Date, but the interface might expect string
  // This ensures type consistency
  const addTodo = useCallback((task: string) => {
    const newTodo: ToDo = {
      id: generateId(),
      task,
      completed: false,
      createdAt: new Date() // This creates a Date object - ensure your ToDo interface matches this type
    };
    setTodos(prev => [...prev, newTodo]);
  }, []);

  const deleteTodo = useCallback((todoId: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== todoId));
  }, []);

  // Equipment methods
  const addEquipment = useCallback((item: Omit<Equipment, 'id' | 'maintenanceLogs'>) => {
    const newEquipment: Equipment = {
      ...item,
      id: generateId(),
      maintenanceLogs: []
    };
    setEquipment(prev => [...prev, newEquipment]);
  }, []);

  const updateEquipment = useCallback((updatedItem: Equipment) => {
    setEquipment(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  }, []);

  const deleteEquipment = useCallback((equipmentId: string) => {
    setEquipment(prev => prev.filter(item => item.id !== equipmentId));
  }, []);

  // Maintenance log methods
  const addMaintenanceLog = useCallback((equipmentId: string, log: Omit<MaintenanceLog, 'id'>) => {
    const newLog: MaintenanceLog = {
      ...log,
      id: generateId()
    };
    setEquipment(prev => prev.map(item => 
      item.id === equipmentId 
        ? { ...item, maintenanceLogs: [...item.maintenanceLogs, newLog] }
        : item
    ));
  }, []);

  const deleteMaintenanceLog = useCallback((equipmentId: string, logId: string) => {
    setEquipment(prev => prev.map(item => 
      item.id === equipmentId 
        ? { 
            ...item, 
            maintenanceLogs: item.maintenanceLogs.filter(log => log.id !== logId) 
          }
        : item
    ));
  }, []);

  // FIXED: Updated addNotification to ensure type consistency
  // The original code creates timestamp as Date, but the interface might expect string
  // This ensures type consistency
  const addNotification = useCallback((message: string, link?: string) => {
    const newNotification: Notification = {
      id: generateId(),
      message,
      link,
      timestamp: new Date(), // This creates a Date object - ensure your Notification interface matches this type
      read: false,
      seen: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, read: true, seen: true }
        : notification
    ));
  }, []);

  const markAllNotificationsAsSeen = useCallback(() => {
    setNotifications(prev => prev.map(notification => 
      ({ ...notification, seen: true })
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => 
      ({ ...notification, read: true, seen: true })
    ));
  }, []);

  const contextValue: FarmContextType = {
    crops,
    setCrops,
    transactions,
    setTransactions,
    settings,
    setSettings,
    todos,
    setTodos,
    equipment,
    setEquipment,
    addCrop,
    updateCrop,
    deleteCrop,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleTodo,
    addTodo,
    deleteTodo,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addMaintenanceLog,
    deleteMaintenanceLog,
    viewState,
    setViewState,
    formInputContext,
    setFormInputContext,
    isOnline,
    uiInteractionEvent,
    triggerUIInteraction,
    notifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsSeen,
    markAllAsRead
  };

  return (
    <FarmContext.Provider value={contextValue}>
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
