import React, { createContext, useContext, ReactNode, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Crop, Transaction, Settings, ToDo, View, TransactionType } from '../types';
import { DEFAULT_SETTINGS, MOCK_CROPS, MOCK_TRANSACTIONS, MOCK_TODOS } from '../constants';

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
  addCrop: (crop: Omit<Crop, 'id'>) => void;
  updateCrop: (updatedCrop: Crop) => void;
  deleteCrop: (cropId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (updatedTransaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  toggleTodo: (todoId: string) => void;
  addTodo: (task: string) => void;
  deleteTodo: (todoId: string) => void;
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [crops, setCrops] = useLocalStorage<Crop[]>('farm_crops', MOCK_CROPS);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('farm_transactions', MOCK_TRANSACTIONS);
  const [settings, setSettings] = useLocalStorage<Settings>('farm_settings', DEFAULT_SETTINGS);
  const [todos, setTodos] = useLocalStorage<ToDo[]>('farm_todos', MOCK_TODOS);
  const [viewState, setViewState] = useState<ViewState>({ view: 'dashboard' });

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


  return (
    <FarmContext.Provider value={{
      crops, setCrops,
      transactions, setTransactions,
      settings, setSettings,
      todos, setTodos,
      addCrop, updateCrop, deleteCrop,
      addTransaction, updateTransaction, deleteTransaction,
      toggleTodo, addTodo, deleteTodo,
      viewState, setViewState
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