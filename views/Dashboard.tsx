import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { useFarm } from '../context/FarmContext';
import { Transaction, TransactionType, ToDo, Crop } from '../types';
import ProfitLossSnapshotChart from '../components/charts/ProfitLossSnapshotChart';
import { PlusCircleIcon, TrashIcon, IncomeIcon, ExpensesIcon, ReportsIcon, CropsIcon, CalendarIcon, WrenchIcon } from '../components/icons';

// --- Reusable Sub-components ---

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


const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, colorClass: string, changeIndicator?: React.ReactNode, onMouseEnter?: () => void, onMouseLeave?: () => void }> = ({ title, value, icon, colorClass, changeIndicator, onMouseEnter, onMouseLeave }) => (
    <div className="bg-card rounded-xl shadow-lg p-4 flex items-center transition-transform transform hover:scale-105" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
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

const QuickActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}> = ({ icon, label, onClick, className = '', onMouseEnter, onMouseLeave }) => (
    <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full ${className}`}
    >
        <div className="p-3 bg-white/30 rounded-full">{icon}</div>
        <span className="font-semibold text-white">{label}</span>
    </button>
);


const Dashboard: React.FC = () => {
  const { crops, transactions, todos, settings, toggleTodo, addTodo, deleteTodo, setViewState, triggerUIInteraction } = useFarm();
  const [newTodo, setNewTodo] = useState('');

  // --- Data Processing & Memoization ---

  const financialSummary = useMemo(() => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    let monthlyIncome = 0, monthlyExpenses = 0, lastMonthIncome = 0, lastMonthExpenses = 0;
    let ytdIncome = 0, ytdExpenses = 0;

    transactions.forEach(t => {
        const txDate = new Date(t.date);
        
        // YTD calculation
        if (txDate.getFullYear() === thisYear) {
            if (t.type === TransactionType.INCOME) ytdIncome += t.amount;
            else ytdExpenses += t.amount;
        }

        // Monthly calculation
        if (txDate >= firstDayOfMonth) {
            if (t.type === TransactionType.INCOME) monthlyIncome += t.amount;
            else monthlyExpenses += t.amount;
        }

        // Last month calculation
        if (txDate >= firstDayOfLastMonth && txDate <= lastDayOfLastMonth) {
            if (t.type === TransactionType.INCOME) lastMonthIncome += t.amount;
            else lastMonthExpenses += t.amount;
        }
    });

    return {
        monthlyIncome,
        monthlyExpenses,
        monthlyNet: monthlyIncome - monthlyExpenses,
        lastMonthIncome,
        lastMonthExpenses,
        ytdIncome,
        ytdExpenses,
        ytdNet: ytdIncome - ytdExpenses
    };
  }, [transactions]);

  const upcomingEvents = useMemo(() => {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

      const upcomingHarvests = crops
        .filter(crop => !crop.actualHarvestDate && new Date(crop.estimatedHarvestDate) <= ninetyDaysFromNow && new Date(crop.estimatedHarvestDate) >= new Date())
        .map(crop => ({
            id: crop.id,
            type: 'harvest' as const,
            date: new Date(crop.estimatedHarvestDate),
            title: `${crop.name}`,
            description: 'Est. Harvest',
            raw: crop
        }));
      
      const openTodos = todos
        .filter(todo => !todo.completed)
        .map(todo => ({
            id: todo.id,
            type: 'todo' as const,
            date: null,
            title: todo.task,
            raw: todo
        }));

      const sortedHarvests = upcomingHarvests.sort((a, b) => a.date.getTime() - b.date.getTime());

      return [...sortedHarvests, ...openTodos];
  }, [crops, todos]);
  
  const recentTransactions = transactions.slice(0, 5);
  
  // --- Handlers ---
  
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(newTodo);
    setNewTodo('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency, minimumFractionDigits: 2 }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  const handleAddCropClick = () => setViewState({ view: 'crops', payload: { openForm: true } });
  const handleAddTransactionClick = (type: TransactionType) => setViewState({ view: 'transactions', type, payload: { openForm: true } });
  const handleCropClick = (crop: Crop) => setViewState({ view: 'crops', payload: { detailedCropId: crop.id } });
  const handleTransactionClick = (tx: Transaction) => setViewState({ view: 'transactions', type: tx.type, payload: { selectedTransactionId: tx.id } });
  const clearHint = () => triggerUIInteraction(null);

  return (
    <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionButton 
                icon={<IncomeIcon className="w-8 h-8 text-primary" />}
                label="Add Income"
                onClick={() => handleAddTransactionClick(TransactionType.INCOME)}
                className="bg-primary hover:bg-primary-dark"
                onMouseEnter={() => triggerUIInteraction('Quickly log a new income transaction.')}
                onMouseLeave={clearHint}
            />
             <QuickActionButton 
                icon={<ExpensesIcon className="w-8 h-8 text-red-500" />}
                label="Add Expense"
                onClick={() => handleAddTransactionClick(TransactionType.EXPENSE)}
                className="bg-red-500 hover:bg-red-600"
                onMouseEnter={() => triggerUIInteraction('Quickly log a new expense transaction.')}
                onMouseLeave={clearHint}
            />
             <QuickActionButton 
                icon={<CropsIcon className="w-8 h-8 text-secondary" />}
                label="Add Crop"
                onClick={handleAddCropClick}
                className="bg-secondary hover:bg-amber-600"
                onMouseEnter={() => triggerUIInteraction('Add a new crop or field to track.')}
                onMouseLeave={clearHint}
            />
        </div>

        {/* Monthly Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
                title="This Month's Income" 
                value={formatCurrency(financialSummary.monthlyIncome)} 
                icon={<IncomeIcon className="w-6 h-6 text-primary"/>} 
                colorClass="bg-primary/20" 
                changeIndicator={<ChangeIndicator current={financialSummary.monthlyIncome} previous={financialSummary.lastMonthIncome} isIncome={true} />}
                onMouseEnter={() => triggerUIInteraction("Total income recorded in the current month.")}
                onMouseLeave={clearHint}
            />
            <StatCard 
                title="This Month's Expenses" 
                value={formatCurrency(financialSummary.monthlyExpenses)} 
                icon={<ExpensesIcon className="w-6 h-6 text-red-500"/>} 
                colorClass="bg-red-500/20" 
                changeIndicator={<ChangeIndicator current={financialSummary.monthlyExpenses} previous={financialSummary.lastMonthExpenses} isIncome={false} />}
                onMouseEnter={() => triggerUIInteraction("Total expenses recorded in the current month.")}
                onMouseLeave={clearHint}
            />
            <StatCard 
                title="Monthly Net Profit" 
                value={formatCurrency(financialSummary.monthlyNet)} 
                icon={<ReportsIcon className={ `w-6 h-6 ${financialSummary.monthlyNet >= 0 ? 'text-blue-500' : 'text-yellow-500'}`}/>}
                colorClass={financialSummary.monthlyNet >= 0 ? 'bg-blue-500/20' : 'bg-yellow-500/20'} 
                onMouseEnter={() => triggerUIInteraction("The difference between this month's income and expenses.")}
                onMouseLeave={clearHint}
            />
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-3 space-y-6">
          <Card title="Profit / Loss Snapshot (This Month)">
            <div onMouseEnter={() => triggerUIInteraction("This bar chart visualizes this month's income versus expenses.")} onMouseLeave={clearHint}>
              <ProfitLossSnapshotChart />
            </div>
          </Card>
           <Card title="Year-to-Date Financials">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center" onMouseEnter={() => triggerUIInteraction("A summary of your total income, expenses, and profit for the current year.")} onMouseLeave={clearHint}>
                    <div>
                        <p className="text-sm text-text-secondary font-medium">Total Income</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.ytdIncome)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-text-secondary font-medium">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(financialSummary.ytdExpenses)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-text-secondary font-medium">Net Profit</p>
                        <p className={`text-2xl font-bold ${financialSummary.ytdNet >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>{formatCurrency(financialSummary.ytdNet)}</p>
                    </div>
                </div>
           </Card>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-2 space-y-6">
          <Card title="Upcoming Events & Tasks">
              <div className="space-y-3 max-h-96 overflow-y-auto" onMouseEnter={() => triggerUIInteraction("A combined list of your upcoming harvests and to-do items.")} onMouseLeave={clearHint}>
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map(event => (
                        <div key={`${event.type}-${event.id}`} className="flex items-start p-3 bg-gray-50 rounded-lg group">
                            {event.type === 'harvest' ? (
                                <>
                                    <div className="p-2 bg-primary/10 rounded-full mr-3">
                                        <CropsIcon className="w-5 h-5 text-primary"/>
                                    </div>
                                    <div className="flex-grow cursor-pointer" onClick={() => handleCropClick(event.raw as Crop)}>
                                        <p className="font-semibold text-text-primary group-hover:text-primary">{event.title}</p>
                                        <p className="text-sm text-text-secondary">{event.description}: {formatDate(event.date!)}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center flex-grow">
                                        <input
                                            type="checkbox"
                                            checked={false}
                                            onChange={() => toggleTodo(event.id)}
                                            className="h-5 w-5 rounded text-primary focus:ring-primary/50 cursor-pointer"
                                            aria-label={`Mark todo as complete: ${event.title}`}
                                        />
                                        <span className="ml-3 text-text-primary">{event.title}</span>
                                    </div>
                                    <button onClick={() => deleteTodo(event.id)} aria-label={`Delete todo: ${event.title}`} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center text-text-secondary py-8">
                         <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No upcoming harvests or tasks.</p>
                    </div>
                )}
                 {/* To-do input remains */}
                <form onSubmit={handleAddTodo} className="flex p-3">
                  <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Add a quick task..."
                      className="flex-grow border-b-2 border-gray-200 focus:outline-none focus:border-primary transition-colors bg-transparent text-sm"
                      onFocus={() => triggerUIInteraction("Type a new task and press the plus button to add it.")}
                      onBlur={clearHint}
                  />
                  <button type="submit" aria-label="Add new task" className="ml-2 text-primary hover:text-primary-dark">
                      <PlusCircleIcon className="w-7 h-7"/>
                  </button>
                </form>
              </div>
          </Card>
          <Card title="Maintenance Alerts">
                <div className="space-y-3 max-h-48 overflow-y-auto" onMouseEnter={() => triggerUIInteraction("AI-powered alerts for upcoming equipment maintenance.")} onMouseLeave={clearHint}>
                    <div className="text-center text-text-secondary py-8">
                        <WrenchIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No maintenance predictions yet.</p>
                        <p className="text-xs">Log maintenance to enable AI analysis.</p>
                    </div>
                    {/* Maintenance alerts will be populated here by the AI */}
                </div>
          </Card>
        </div>
      </div>

       <div className="xl:col-span-5">
        <Card title="Recent Activity">
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
                    <tr key={tx.id} onClick={() => handleTransactionClick(tx)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onMouseEnter={() => triggerUIInteraction("Click to view or edit this transaction.")} onMouseLeave={clearHint}>
                    <td className="p-2">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
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
                <p className="text-sm">Add income or expenses using the buttons above.</p>
            </div>
        )}
        </Card>
       </div>
    </div>
  );
};

export default Dashboard;