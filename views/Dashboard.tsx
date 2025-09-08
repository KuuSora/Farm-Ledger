import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import { useFarm } from '../context/FarmContext';
import { Transaction, TransactionType, ToDo, Crop, Equipment } from '../types';
import ProfitLossSnapshotChart from '../components/charts/ProfitLossSnapshotChart';
import { PlusCircleIcon, TrashIcon, IncomeIcon, ExpensesIcon, ReportsIcon, CropsIcon, CalendarIcon, WrenchIcon, HydroponicsIcon, MarketTrendsIcon } from '../components/icons';
import { useGemini } from '../hooks/useGemini';
import { generateText } from '../utils/gemini';

/* -------------------------------------------------------------------------- */
/*                               Micro Components                             */
/* -------------------------------------------------------------------------- */

const Badge = ({ tone = 'info', className = '', children }) => {
  const tones = {
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50 shadow-sm',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-200/50 shadow-sm',
    info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50 shadow-sm',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50 shadow-sm',
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
};

const ChangeIndicator = ({ current, previous, isIncome = false }) => {
  if (previous === 0) {
    if (current > 0) return (
      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
        <span className="inline-block w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
        ↗ New Activity
      </span>
    );
    return null;
  }
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 0.1) return null;
  const isGoodChange = isIncome ? change >= 0 : change <= 0;
  const color = isGoodChange ? 'text-emerald-600' : 'text-red-600';
  const arrow = change >= 0 ? '↗' : '↘';
  const bgColor = isGoodChange ? 'bg-emerald-500' : 'bg-red-500';
  
  return (
    <span className={`text-xs font-semibold ${color} flex items-center gap-1 mt-1`}>
      <span className={`inline-block w-1 h-1 ${bgColor} rounded-full`}></span>
      {arrow} {Math.abs(change).toFixed(1)}% vs last month
    </span>
  );
};

const StatCard = ({ title, value, icon, colorClass, changeIndicator, onMouseEnter, onMouseLeave }) => (
  <div
    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    role="group"
  >
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative p-4 lg:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-1">{value}</p>
          {changeIndicator}
        </div>
        <div className={`p-2.5 lg:p-3 rounded-xl shadow-lg ring-1 ring-white/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${colorClass}`}>
          <div className="w-5 h-5 lg:w-6 lg:h-6">
            {icon}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ icon, label, onClick, className = '', onMouseEnter, onMouseLeave }) => (
  <button
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`group relative overflow-hidden flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-3 rounded-2xl px-3 py-3 sm:px-4 sm:py-3 text-center sm:text-left shadow-lg hover:shadow-xl ring-1 ring-white/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white ${className}`}
  >
    {/* Animated background gradient */}
    <div className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-3 z-10">
      <span className="grid place-items-center rounded-xl bg-black/10 backdrop-blur-sm p-2 group-hover:scale-110 group-hover:bg-black/20 transition-all duration-300">
        <div className="w-5 h-5 text-white drop-shadow-sm">
          {icon}
        </div>
      </span>
      <span className="font-bold text-white drop-shadow-sm text-xs sm:text-sm tracking-wide">{label}</span>
    </div>
    
    <span className="hidden sm:inline-flex h-6 items-center justify-center rounded-lg bg-black/20 backdrop-blur-sm px-2 py-1 text-xs font-bold text-white/95 ring-1 ring-white/20 group-hover:bg-black/30 transition-all duration-300">
      Quick
    </span>
  </button>
);

/* ------------------------------- Market AI ------------------------------- */

const MarketSnapshot = () => {
  const { loading, error, data, execute } = useGemini();
  const fetchTrends = useCallback(() => {
    const prompt = 'Provide a very brief (2-3 sentences) market snapshot for a major agricultural commodity like corn, wheat, or soybeans. Focus on a recent price movement or key influencing factor.';
    execute(generateText, prompt);
  }, [execute]);

  useEffect(() => {
    fetchTrends();
    const id = setInterval(fetchTrends, 300000);
    return () => clearInterval(id);
  }, [fetchTrends]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-100 shadow-md">
            <MarketTrendsIcon className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Market Snapshot</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <Badge tone="warning">Live AI</Badge>
        </div>
      </div>
      
      {/* Content area */}
      <div className="px-4 pb-4">
        <div className="min-h-[80px]">
          {loading && !data && (
            <div className="animate-pulse space-y-2" aria-live="polite">
              <div className="h-3 w-4/5 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-200 animate-shimmer" />
              <div className="h-3 w-3/5 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-200 animate-shimmer" />
              <div className="h-3 w-5/6 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-200 animate-shimmer" />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <p className="text-red-700 text-sm font-medium">Could not load market data.</p>
            </div>
          )}
          {data && (
            <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/40">
              <p className="text-gray-800 leading-relaxed text-sm font-medium">{data}</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-amber-200/40">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="font-medium">AI-powered insight</span>
          </div>
          <span>•</span>
          <span>Updated every 5 mins</span>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 Dashboard                                  */
/* -------------------------------------------------------------------------- */

const Dashboard = () => {
  const { crops, transactions, todos, settings, equipment, toggleTodo, addTodo, deleteTodo, setViewState, triggerUIInteraction } = useFarm();
  const [newTodo, setNewTodo] = useState('');

  /* ----------------------------- Data Processing ---------------------------- */

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
      if (txDate.getFullYear() === thisYear) {
        if (t.type === TransactionType.INCOME) ytdIncome += t.amount; else ytdExpenses += t.amount;
      }
      if (txDate >= firstDayOfMonth) {
        if (t.type === TransactionType.INCOME) monthlyIncome += t.amount; else monthlyExpenses += t.amount;
      }
      if (txDate >= firstDayOfLastMonth && txDate <= lastDayOfLastMonth) {
        if (t.type === TransactionType.INCOME) lastMonthIncome += t.amount; else lastMonthExpenses += t.amount;
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
      ytdNet: ytdIncome - ytdExpenses,
    };
  }, [transactions]);

  const upcomingEvents = useMemo(() => {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const upcomingHarvests = crops
      .filter(crop => !crop.actualHarvestDate && new Date(crop.estimatedHarvestDate) <= ninetyDaysFromNow && new Date(crop.estimatedHarvestDate) >= new Date())
      .map(crop => ({ id: crop.id, type: 'harvest', date: new Date(crop.estimatedHarvestDate), title: `${crop.name}`, description: 'Est. Harvest', raw: crop }));

    const openTodos = todos
      .filter(todo => !todo.completed)
      .map(todo => ({ id: todo.id, type: 'todo', date: null, title: todo.task, raw: todo }));

    const sortedHarvests = upcomingHarvests.sort((a, b) => a.date.getTime() - b.date.getTime());
    return [...sortedHarvests, ...openTodos];
  }, [crops, todos]);

  const recentTransactions = transactions.slice(0, 5);
  const maintenanceCandidates = useMemo(() => equipment.filter(e => e.maintenanceLogs.length >= 2), [equipment]);

  /* -------------------------------- Handlers -------------------------------- */

  const handleAddTodo = (e) => { 
    if (e) e.preventDefault(); 
    if (!newTodo.trim()) return; 
    addTodo(newTodo.trim()); 
    setNewTodo(''); 
  };
  
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency, minimumFractionDigits: 2 }).format(amount);
  
  const formatDate = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const handleAddCropClick = () => setViewState({ view: 'crops', payload: { openForm: true } });
  const handleAddTransactionClick = (type) => setViewState({ view: 'transactions', type, payload: { openForm: true } });
  const handleAddHydroponicsClick = () => setViewState({ view: 'equipment', payload: { openForm: true } });
  const handleCropClick = (crop) => setViewState({ view: 'crops', payload: { detailedCropId: crop.id } });
  
  const handleTransactionClick = (tx) => setViewState({ view: 'transactions', type: tx.type, payload: { selectedTransactionId: tx.id } });
  const handleEquipmentClick = (item) => setViewState({ view: 'equipment', payload: { detailedEquipmentId: item.id } });
  const clearHint = () => triggerUIInteraction(null);

  /* --------------------------------- Render --------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40">
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .bg-size-200 {
          background-size: 200% 100%;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-3">
            Farm Dashboard
          </h1>
          <p className="text-gray-600 text-sm lg:text-base max-w-2xl mx-auto">
            Monitor your farm's performance with real-time insights and AI-powered analytics
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <QuickActionButton
            icon={<IncomeIcon className="w-5 h-5" />}
            label="Add Income"
            onClick={() => handleAddTransactionClick(TransactionType.INCOME)}
            className="bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600"
            onMouseEnter={() => triggerUIInteraction('Quickly log a new income transaction with enhanced tracking.')}
            onMouseLeave={clearHint}
          />
          <QuickActionButton
            icon={<ExpensesIcon className="w-5 h-5" />}
            label="Add Expense"
            onClick={() => handleAddTransactionClick(TransactionType.EXPENSE)}
            className="bg-gradient-to-br from-red-500 via-rose-500 to-red-600"
            onMouseEnter={() => triggerUIInteraction('Quickly log a new expense transaction with category tracking.')}
            onMouseLeave={clearHint}
          />
          <QuickActionButton
            icon={<CropsIcon className="w-5 h-5" />}
            label="Add Crop"
            onClick={handleAddCropClick}
            className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600"
            onMouseEnter={() => triggerUIInteraction('Add a new crop with AI-powered growth predictions.')}
            onMouseLeave={clearHint}
          />
          <QuickActionButton
            icon={<HydroponicsIcon className="w-5 h-5" />}
            label="Hydroponics"
            onClick={handleAddHydroponicsClick}
            className="bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-600"
            onMouseEnter={() => triggerUIInteraction('Access advanced hydroponic system management.')}
            onMouseLeave={clearHint}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          <StatCard
            title="This Month's Income"
            value={formatCurrency(financialSummary.monthlyIncome)}
            icon={<IncomeIcon className="w-full h-full text-emerald-600" />}
            colorClass="bg-gradient-to-br from-emerald-100 to-green-100"
            changeIndicator={<ChangeIndicator current={financialSummary.monthlyIncome} previous={financialSummary.lastMonthIncome} isIncome />}
            onMouseEnter={() => triggerUIInteraction('Total income recorded in the current month with trend analysis.')}
            onMouseLeave={clearHint}
          />
          <StatCard
            title="This Month's Expenses"
            value={formatCurrency(financialSummary.monthlyExpenses)}
            icon={<ExpensesIcon className="w-full h-full text-red-600" />}
            colorClass="bg-gradient-to-br from-red-100 to-rose-100"
            changeIndicator={<ChangeIndicator current={financialSummary.monthlyExpenses} previous={financialSummary.lastMonthExpenses} isIncome={false} />}
            onMouseEnter={() => triggerUIInteraction('Total expenses recorded with smart categorization and alerts.')}
            onMouseLeave={clearHint}
          />
          <StatCard
            title="Monthly Net Profit"
            value={formatCurrency(financialSummary.monthlyNet)}
            icon={<ReportsIcon className={`w-full h-full ${financialSummary.monthlyNet >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />}
            colorClass={financialSummary.monthlyNet >= 0 ? 'bg-gradient-to-br from-blue-100 to-indigo-100' : 'bg-gradient-to-br from-amber-100 to-orange-100'}
            onMouseEnter={() => triggerUIInteraction("Advanced profit analysis with forecasting and optimization tips.")}
            onMouseLeave={clearHint}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left Column */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Chart Card */}
            <Card title="Profit / Loss Snapshot (This Month)" className="border-0 shadow-xl bg-white/90 backdrop-blur-xl">
              <div className="rounded-xl border border-gray-200/50 p-4 bg-gradient-to-br from-gray-50 to-blue-50/30" 
                   onMouseEnter={() => triggerUIInteraction("Interactive chart showing monthly income vs expenses with predictive trends.")} 
                   onMouseLeave={clearHint}>
                <ProfitLossSnapshotChart />
              </div>
            </Card>

            {/* YTD Card */}
            <Card title="Year-to-Date Financial Overview" className="border-0 shadow-xl bg-white/90 backdrop-blur-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center" 
                   onMouseEnter={() => triggerUIInteraction('Comprehensive yearly financial summary with growth metrics and projections.')} 
                   onMouseLeave={clearHint}>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-4 ring-1 ring-emerald-200/50 shadow-lg group hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Total Income</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-700 mb-1">{formatCurrency(financialSummary.ytdIncome)}</p>
                  <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2">
                    <div className="bg-emerald-500 h-1.5 rounded-full w-3/4"></div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-rose-50 p-4 ring-1 ring-red-200/50 shadow-lg group hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">Total Expenses</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-700 mb-1">{formatCurrency(financialSummary.ytdExpenses)}</p>
                  <div className="w-full bg-red-200 rounded-full h-1.5 mt-2">
                    <div className="bg-red-500 h-1.5 rounded-full w-1/2"></div>
                  </div>
                </div>
                
                <div className={`relative overflow-hidden rounded-xl p-4 ring-1 shadow-lg group hover:shadow-xl transition-all duration-300 ${
                  financialSummary.ytdNet >= 0 
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 ring-blue-200/50' 
                    : 'bg-gradient-to-br from-amber-50 to-orange-50 ring-amber-200/50'
                }`}>
                  <div className="absolute top-2 right-2">
                    <div className={`w-2 h-2 rounded-full ${financialSummary.ytdNet >= 0 ? 'bg-blue-500' : 'bg-amber-500'} animate-pulse`}></div>
                  </div>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${financialSummary.ytdNet >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>Net Profit</p>
                  <p className={`text-xl sm:text-2xl font-bold mb-1 ${financialSummary.ytdNet >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>{formatCurrency(financialSummary.ytdNet)}</p>
                  <div className={`w-full rounded-full h-1.5 mt-2 ${financialSummary.ytdNet >= 0 ? 'bg-blue-200' : 'bg-amber-200'}`}>
                    <div className={`h-1.5 rounded-full w-2/3 ${financialSummary.ytdNet >= 0 ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-2 space-y-6">
            <MarketSnapshot />

            {/* Events Card */}
            <Card title="Upcoming Events & Smart Tasks" className="border-0 shadow-xl bg-white/90 backdrop-blur-xl">
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar" 
                   onMouseEnter={() => triggerUIInteraction('AI-enhanced task management with predictive scheduling and smart reminders.')} 
                   onMouseLeave={clearHint}>
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <div key={`${event.type}-${event.id}`} className="group flex items-start gap-3 rounded-xl border border-gray-200/50 bg-gradient-to-r from-white to-gray-50/50 p-3 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                      {event.type === 'harvest' ? (
                        <>
                          <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl shadow-md">
                            <CropsIcon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <button className="flex-grow text-left min-w-0" onClick={() => handleCropClick(event.raw)}>
                            <p className="font-bold text-gray-900 group-hover:text-emerald-600 text-sm truncate transition-colors">{event.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{event.description}: {formatDate(event.date)}</p>
                          </button>
                          <Badge tone="success">🌾</Badge>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center flex-grow min-w-0 gap-2">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => toggleTodo(event.id)}
                              className="h-4 w-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                              aria-label={`Mark todo as complete: ${event.title}`}
                            />
                            <span className="text-gray-900 text-sm truncate font-medium">{event.title}</span>
                          </div>
                          <button onClick={() => deleteTodo(event.id)} aria-label={`Delete todo: ${event.title}`} className="text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-red-50 rounded-lg flex-shrink-0">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <Badge tone="warning">📝</Badge>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="p-4 rounded-xl bg-gray-100 inline-block mb-4">
                      <CalendarIcon className="w-12 h-12 mx-auto text-gray-300" />
                    </div>
                    <p className="text-lg font-semibold mb-2">No upcoming events</p>
                    <p className="text-sm text-gray-400">Your schedule is clear for now!</p>
                  </div>
                )}

                {/* To-do input */}
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-200/50 bg-gradient-to-r from-gray-50 to-white p-3 shadow-sm focus-within:border-blue-300 focus-within:shadow-lg transition-all duration-300">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a quick task... ✨"
                    className="flex-grow bg-transparent text-sm placeholder:text-gray-500 focus:outline-none font-medium"
                    onFocus={() => triggerUIInteraction('Type a new task and press the plus button to add it to your smart task list.')}
                    onBlur={clearHint}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                  />
                  <button 
                    onClick={handleAddTodo}
                    aria-label="Add new task" 
                    className="inline-flex items-center gap-1 rounded-xl px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex-shrink-0"
                  >
                    <PlusCircleIcon className="w-4 h-4" />
                    <span className="hidden sm:inline font-semibold text-xs">Add</span>
                  </button>
                </div>
              </div>
            </Card>

            {/* Maintenance Alerts */}
            <Card title="AI Maintenance Intelligence" className="border-0 shadow-xl bg-white/90 backdrop-blur-xl">
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar" 
                   onMouseEnter={() => triggerUIInteraction('Advanced AI-powered maintenance predictions with machine learning insights.')} 
                   onMouseLeave={clearHint}>
                {maintenanceCandidates.length > 0 ? (
                  maintenanceCandidates.map(item => (
                    <button key={item.id} onClick={() => handleEquipmentClick(item)} className="group flex w-full items-start gap-3 rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-3 text-left transition-all duration-300 hover:shadow-lg hover:border-blue-300 hover:scale-[1.01]">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                        <HydroponicsIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-gray-900 group-hover:text-blue-700 text-sm truncate transition-colors">{item.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.maintenanceLogs.length} logs recorded. AI analysis ready.</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          <span className="text-xs text-blue-600 font-medium">Predictive insights available</span>
                        </div>
                      </div>
                      <Badge tone="info">🔧</Badge>
                    </button>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="p-4 rounded-xl bg-gray-100 inline-block mb-4">
                      <WrenchIcon className="w-12 h-12 mx-auto text-gray-300" />
                    </div>
                    <p className="text-lg font-semibold mb-2">No maintenance alerts</p>
                    <p className="text-sm text-gray-400 mb-1">Your equipment is running smoothly!</p>
                    <p className="text-xs text-gray-400">Log 2+ maintenance events to enable AI predictions</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-5">
          <Card title="Recent Transaction Activity" className="border-0 shadow-xl bg-white/90 backdrop-blur-xl">
            {recentTransactions.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200/50 shadow-sm">
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-2">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => handleTransactionClick(tx)}
                      className="cursor-pointer p-4 bg-gradient-to-r from-white to-gray-50/50 border border-gray-100/50 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                      onMouseEnter={() => triggerUIInteraction('Click to view detailed transaction information and edit options.')}
                      onMouseLeave={clearHint}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg shadow-md ${
                            tx.type === TransactionType.INCOME 
                              ? 'bg-gradient-to-br from-emerald-100 to-green-100' 
                              : 'bg-gradient-to-br from-red-100 to-rose-100'
                          }`}>
                            {tx.type === TransactionType.INCOME ? (
                              <IncomeIcon className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ExpensesIcon className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate text-sm">{tx.description}</p>
                            <p className="text-xs text-gray-600 mt-1">{tx.category}</p>
                          </div>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className={`font-bold text-sm ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>
                            {tx.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 z-10 bg-gradient-to-r from-gray-100 to-gray-50 backdrop-blur-xl border-b border-gray-200">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>
                        <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Description</th>
                        <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Category</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx, idx) => (
                        <tr
                          key={tx.id}
                          onClick={() => handleTransactionClick(tx)}
                          className={`cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:shadow-lg group ${
                            idx % 2 ? 'bg-white' : 'bg-gray-50/30'
                          }`}
                          onMouseEnter={() => triggerUIInteraction('Click to view detailed transaction analysis and smart insights.')}
                          onMouseLeave={clearHint}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-gray-900 text-sm font-medium group-hover:text-blue-600 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${
                                tx.type === TransactionType.INCOME 
                                  ? 'bg-emerald-100' 
                                  : 'bg-red-100'
                              }`}>
                                {tx.type === TransactionType.INCOME ? (
                                  <IncomeIcon className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <ExpensesIcon className="w-3 h-3 text-red-600" />
                                )}
                              </div>
                              {tx.description}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            <Badge tone="info">{tx.category}</Badge>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold text-sm ${
                            tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {tx.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 text-gray-500">
                <div className="p-6 rounded-xl bg-gray-100">
                  <ExpensesIcon className="w-16 h-16 text-gray-300" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg mb-2">No recent transactions</p>
                  <p className="text-sm text-gray-400">Start tracking your farm's financial activity using the buttons above</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #1e40af);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
