import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { useFarm } from '../context/FarmContext';
import { Transaction, TransactionType, ToDo, Crop } from '../types';
import ProfitLossSnapshotChart from '../components/charts/ProfitLossSnapshotChart';
import { PlusCircleIcon, TrashIcon, IncomeIcon, ExpensesIcon, ReportsIcon, CropsIcon } from '../components/icons';

const ChangeIndicator: React.FC<{ current: number; previous: number; isIncome?: boolean }> = ({ current, previous, isIncome = false }) => {
    if (previous === 0) {
        if (current > 0) {
            return <span className="text-xs font-medium text-green-600 flex items-center mt-1">↑ New Activity</span>;
        }
        return null; // No change if both are 0
    }

    const change = ((current - previous) / previous) * 100;
    
    if (Math.abs(change) < 0.1) return null; // Don't show for tiny changes

    const isGoodChange = isIncome ? change >= 0 : change <= 0;
    
    const color = isGoodChange ? 'text-green-600' : 'text-red-600';
    const arrow = change >= 0 ? '↑' : '↓';

    return (
        <span className={`text-xs font-medium ${color} flex items-center mt-1`}>
            {arrow} {Math.abs(change).toFixed(1)}% vs last month
        </span>
    );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, colorClass: string, changeIndicator?: React.ReactNode }> = ({ title, value, icon, colorClass, changeIndicator }) => (
    <div className="bg-card rounded-xl shadow-lg p-4 flex items-center transition-transform transform hover:scale-105">
        <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-secondary font-medium">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            {changeIndicator}
        </div>
    </div>
);

const Dashboard: React.FC = () => {
  const { crops, transactions, todos, settings, toggleTodo, addTodo, deleteTodo, setViewState } = useFarm();
  const [newTodo, setNewTodo] = useState('');

  const upcomingCrops = crops
    .filter(crop => new Date(crop.estimatedHarvestDate) > new Date())
    .sort((a, b) => new Date(a.estimatedHarvestDate).getTime() - new Date(b.estimatedHarvestDate).getTime());

  const recentTransactions = transactions.slice(0, 5);

  const { monthlyIncome, monthlyExpenses, netProfit, lastMonthIncome, lastMonthExpenses } = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const monthlyTransactions = transactions.filter(t => new Date(t.date) >= firstDayOfMonth);
    
    const lastMonthTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= firstDayOfLastMonth && txDate <= lastDayOfLastMonth;
    });

    const income = monthlyTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastMonthIncome = lastMonthTransactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = lastMonthTransactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
      
    return { 
        monthlyIncome: income, 
        monthlyExpenses: expenses, 
        netProfit: income - expenses,
        lastMonthIncome,
        lastMonthExpenses
    };
  }, [transactions]);
  
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(newTodo);
    setNewTodo('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency, minimumFractionDigits: 2 }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  const handleAddCropClick = () => setViewState({ view: 'crops', payload: { openForm: true } });
  const handleAddTransactionClick = (type: TransactionType) => setViewState({ view: 'transactions', type, payload: { openForm: true } });
  const handleCropClick = (crop: Crop) => setViewState({ view: 'crops', payload: { detailedCropId: crop.id } });
  const handleTransactionClick = (tx: Transaction) => setViewState({ view: 'transactions', type: tx.type, payload: { selectedTransactionId: tx.id } });

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
                title="This Month's Income" 
                value={formatCurrency(monthlyIncome)} 
                icon={<IncomeIcon className="w-6 h-6 text-primary"/>} 
                colorClass="bg-primary/20" 
                changeIndicator={<ChangeIndicator current={monthlyIncome} previous={lastMonthIncome} isIncome={true} />}
            />
            <StatCard 
                title="This Month's Expenses" 
                value={formatCurrency(monthlyExpenses)} 
                icon={<ExpensesIcon className="w-6 h-6 text-red-500"/>} 
                colorClass="bg-red-500/20" 
                changeIndicator={<ChangeIndicator current={monthlyExpenses} previous={lastMonthExpenses} isIncome={false} />}
            />
            <StatCard 
                title="Net Profit" 
                value={formatCurrency(netProfit)} 
                icon={<ReportsIcon className={ `w-6 h-6 ${netProfit >= 0 ? 'text-blue-500' : 'text-yellow-500'}`}/>}
                colorClass={netProfit >= 0 ? 'bg-blue-500/20' : 'bg-yellow-500/20'} 
            />
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="md:col-span-2">
          <Card title="Profit / Loss Snapshot">
            <ProfitLossSnapshotChart />
          </Card>
        </div>

        <Card title="Crops in Progress">
          <div className="space-y-3 overflow-y-auto max-h-64">
            {upcomingCrops.length > 0 ? (
              upcomingCrops.map(crop => (
                <div key={crop.id} onClick={() => handleCropClick(crop)} className="p-3 bg-green-50 rounded-lg hover:bg-primary/10 cursor-pointer transition-colors">
                  <p className="font-semibold text-primary-dark">{crop.name}</p>
                  <p className="text-sm text-primary">
                    Est. Harvest: {new Date(crop.estimatedHarvestDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
                <div className="text-center text-text-secondary py-8 flex flex-col items-center justify-center h-full">
                    <CropsIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-semibold mb-2">No upcoming crops.</p>
                    <p className="text-sm mb-4">Get started by adding your first crop.</p>
                    <button onClick={handleAddCropClick} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                        Add Crop
                    </button>
                </div>
            )}
          </div>
        </Card>
        
        <Card title="To-Do List">
          <div className="flex flex-col h-full">
              <form onSubmit={handleAddTodo} className="flex mb-2">
                  <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Add a new task..."
                      className="flex-grow border-b-2 border-gray-200 focus:outline-none focus:border-primary transition-colors bg-transparent"
                  />
                  <button type="submit" className="ml-2 text-primary hover:text-primary-dark">
                      <PlusCircleIcon className="w-8 h-8"/>
                  </button>
              </form>
              <ul className="space-y-2 overflow-y-auto flex-grow max-h-48">
                  {todos.length > 0 ? (
                    todos.map((todo: ToDo) => (
                      <li key={todo.id} className="flex items-center justify-between group">
                          <div className="flex items-center">
                              <input
                                  type="checkbox"
                                  checked={todo.completed}
                                  onChange={() => toggleTodo(todo.id)}
                                  className="h-5 w-5 rounded text-primary focus:ring-primary/50"
                              />
                              <span className={`ml-3 ${todo.completed ? 'line-through text-gray-400' : 'text-text-primary'}`}>{todo.task}</span>
                          </div>
                          <button onClick={() => deleteTodo(todo.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TrashIcon className="w-5 h-5"/>
                          </button>
                      </li>
                  ))
                  ) : (
                    <li className="text-center text-text-secondary pt-8 h-full flex flex-col justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>You're all caught up!</p>
                        <p className="text-sm">Add a task above to get started.</p>
                    </li>
                  )}
              </ul>
          </div>
        </Card>

        <div className="md:col-span-2 xl:col-span-4">
          <Card title="Recent Transactions">
            {recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">Date</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Category</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx: Transaction) => (
                      <tr key={tx.id} onClick={() => handleTransactionClick(tx)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                        <td className="p-2">{formatDate(tx.date)}</td>
                        <td className="p-2 text-text-primary">{tx.description}</td>
                        <td className="p-2 text-text-secondary">{tx.category}</td>
                        <td className={`p-2 text-right font-semibold ${
                            tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {tx.type === TransactionType.INCOME ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
                <div className="text-center text-text-secondary py-12 flex flex-col items-center justify-center h-full">
                    <ExpensesIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-semibold mb-2">No recent transactions.</p>
                    <p className="text-sm mb-4">Track your farm's finances to see your progress.</p>
                    <div className="flex space-x-4">
                        <button onClick={() => handleAddTransactionClick(TransactionType.INCOME)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                            Add Income
                        </button>
                        <button onClick={() => handleAddTransactionClick(TransactionType.EXPENSE)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                            Add Expense
                        </button>
                    </div>
                </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;