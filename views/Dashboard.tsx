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
    success: 'bg-green-100 text-green-700 ring-1 ring-green-200',
    danger: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    info: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    warning: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  };
  return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tones[tone]} ${className}`}>{children}</span>;
};

const ChangeIndicator = ({ current, previous, isIncome = false }) => {
  if (previous === 0) {
    if (current > 0) return <span className="text-xs font-medium text-green-600 flex items-center mt-1">â†‘ New Activity</span>;
    return null;
  }
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 0.1) return null;
  const isGoodChange = isIncome ? change >= 0 : change <= 0;
  const color = isGoodChange ? 'text-green-600' : 'text-red-600';
  const arrow = change >= 0 ? 'â†‘' : 'â†“';
  return (
    <span className={`text-xs font-medium ${color} flex items-center mt-1`}>
      {arrow} {Math.abs(change).toFixed(1)}% vs last month
    </span>
  );
};

const StatCard = ({ title, value, icon, colorClass, changeIndicator, onMouseEnter, onMouseLeave }) => (
  <div
    className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500/40"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    role="group"
  >
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
    <div className="p-3 sm:p-4 flex items-center">
      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl mr-3 sm:mr-4 ring-1 ring-white/20 ${colorClass}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs uppercase tracking-wide text-gray-600 font-semibold">{title}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{value}</p>
        {changeIndicator}
      </div>
    </div>
    <div className="absolute -right-8 -top-8 h-16 w-16 sm:h-24 sm:w-24 rounded-full opacity-10 blur-2xl bg-gradient-to-tr from-blue-500/50 to-transparent group-hover:opacity-20 transition-opacity" />
  </div>
);

const QuickActionButton = ({ icon, label, onClick, className = '', onMouseEnter, onMouseLeave }) => (
  <button
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`relative flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4 rounded-xl sm:rounded-2xl px-3 py-3 sm:px-4 sm:py-3 text-center sm:text-left shadow-sm ring-1 ring-white/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white ${className}`}
  >
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
      <span className="grid place-items-center rounded-lg sm:rounded-xl bg-white/30 p-2">{icon}</span>
      <span className="font-semibold text-white drop-shadow-sm text-sm sm:text-base">{label}</span>
    </div>
    <span className="hidden sm:inline-flex h-6 items-center justify-center rounded-md bg-black/10 px-2 text-[11px] font-semibold text-white/90">Quick</span>
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
    <Card title="Market Snapshot" className="border border-amber-200 rounded-xl sm:rounded-2xl">
      <div className="flex flex-col gap-3">
        <div className="min-h-[80px] sm:min-h-[88px]">
          {loading && !data && (
            <div className="animate-pulse space-y-2" aria-live="polite">
              <div className="h-3 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
              <div className="h-3 w-5/6 rounded bg-gray-200" />
            </div>
          )}
          {error && <p className="text-red-600 text-sm">Could not load market data.</p>}
          {data && <p className="text-gray-800 leading-relaxed text-sm sm:text-base">{data}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MarketTrendsIcon className="h-4 w-4 text-amber-600" />
          <span>AI-powered insight, updated every 5 mins.</span>
        </div>
      </div>
    </Card>
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

  const handleAddTodo = (e) => { e.preventDefault(); if (!newTodo.trim()) return; addTodo(newTodo.trim()); setNewTodo(''); };
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency, minimumFractionDigits: 2 }).format(amount);
  
  const formatDate = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const handleAddCropClick = () => setViewState({ view: 'crops', payload: { openForm: true } });
  const handleAddTransactionClick = (type) => setViewState({ view: 'transactions', type, payload: { openForm: true } });
  const handleAddHydroponicsClick = () => setViewState({ view: 'hydroponics', payload: { openForm: true } });
  const handleCropClick = (crop) => setViewState({ view: 'crops', payload: { detailedCropId: crop.id } });
  
  const handleTransactionClick = (tx) => setViewState({ view: 'transactions', type: tx.type, payload: { selectedTransactionId: tx.id } });
  const handleEquipmentClick = (item) => setViewState({ view: 'equipment', payload: { detailedEquipmentId: item.id } });
  const clearHint = () => triggerUIInteraction(null);

  /* --------------------------------- Render --------------------------------- */

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Top Quick Actions - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <QuickActionButton
          icon={<IncomeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
          label="Add Income"
          onClick={() => handleAddTransactionClick(TransactionType.INCOME)}
          className="bg-gradient-to-tr from-green-500 to-green-600"
          onMouseEnter={() => triggerUIInteraction('Quickly log a new income transaction.')}
          onMouseLeave={clearHint}
        />
        <QuickActionButton
          icon={<ExpensesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-100" />}
          label="Add Expense"
          onClick={() => handleAddTransactionClick(TransactionType.EXPENSE)}
          className="bg-gradient-to-tr from-red-500 to-red-600"
          onMouseEnter={() => triggerUIInteraction('Quickly log a new expense transaction.')}
          onMouseLeave={clearHint}
        />
        <QuickActionButton
          icon={<CropsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-100" />}
          label="Add Crop"
          onClick={handleAddCropClick}
          className="bg-gradient-to-tr from-amber-500 to-orange-500"
          onMouseEnter={() => triggerUIInteraction('Add a new crop or field to track.')}
          onMouseLeave={clearHint}
        />
        <QuickActionButton
          icon={<HydroponicsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-100" />}
          label="Hydroponics"
          onClick={handleAddHydroponicsClick}
          className="bg-gradient-to-tr from-emerald-500 to-teal-600"
          onMouseEnter={() => triggerUIInteraction('Go to Hydroponic Machineries')}
          onMouseLeave={clearHint}
        />
     </div>

      {/* KPI Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <StatCard
          title="This Month's Income"
          value={formatCurrency(financialSummary.monthlyIncome)}
          icon={<IncomeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
          colorClass="bg-green-100"
          changeIndicator={<ChangeIndicator current={financialSummary.monthlyIncome} previous={financialSummary.lastMonthIncome} isIncome />}
          onMouseEnter={() => triggerUIInteraction('Total income recorded in the current month.')}
          onMouseLeave={clearHint}
        />
        <StatCard
          title="This Month's Expenses"
          value={formatCurrency(financialSummary.monthlyExpenses)}
          icon={<ExpensesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />}
          colorClass="bg-red-100"
          changeIndicator={<ChangeIndicator current={financialSummary.monthlyExpenses} previous={financialSummary.lastMonthExpenses} isIncome={false} />}
          onMouseEnter={() => triggerUIInteraction('Total expenses recorded in the current month.')}
          onMouseLeave={clearHint}
        />
        <StatCard
          title="Monthly Net Profit"
          value={formatCurrency(financialSummary.monthlyNet)}
          icon={<ReportsIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${financialSummary.monthlyNet >= 0 ? 'text-blue-600' : 'text-yellow-600'}`} />}
          colorClass={financialSummary.monthlyNet >= 0 ? 'bg-blue-100' : 'bg-yellow-100'}
          onMouseEnter={() => triggerUIInteraction("The difference between this month's income and expenses.")}
          onMouseLeave={clearHint}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
        {/* Left Column - Mobile First */}
        <div className="xl:col-span-3 space-y-4 sm:space-y-6">
          <Card title="Profit / Loss Snapshot (This Month)">
            <div className="rounded-lg sm:rounded-xl border border-gray-200 p-2 sm:p-3 bg-gray-50" onMouseEnter={() => triggerUIInteraction("This bar chart visualizes this month's income versus expenses.")} onMouseLeave={clearHint}>
              <ProfitLossSnapshotChart />
            </div>
          </Card>

          <Card title="Year-to-Date Financials">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center" onMouseEnter={() => triggerUIInteraction('A summary of your total income, expenses, and profit for the current year.')} onMouseLeave={clearHint}>
              <div className="rounded-lg sm:rounded-xl bg-green-50 p-3 sm:p-4 ring-1 ring-green-200">
                <p className="text-xs font-medium text-green-700">Total Income</p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-green-700">{formatCurrency(financialSummary.ytdIncome)}</p>
              </div>
              <div className="rounded-lg sm:rounded-xl bg-red-50 p-3 sm:p-4 ring-1 ring-red-200">
                <p className="text-xs font-medium text-red-700">Total Expenses</p>
                <p className="mt-1 text-xl sm:text-2xl font-bold text-red-700">{formatCurrency(financialSummary.ytdExpenses)}</p>
              </div>
              <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 ring-1 ${financialSummary.ytdNet >= 0 ? 'bg-blue-50 ring-blue-200' : 'bg-amber-50 ring-amber-200'}`}>
                <p className={`text-xs font-medium ${financialSummary.ytdNet >= 0 ? 'text-blue-700' : 'text-amber-800'}`}>Net Profit</p>
                <p className={`mt-1 text-xl sm:text-2xl font-bold ${financialSummary.ytdNet >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>{formatCurrency(financialSummary.ytdNet)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Mobile Optimized */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <MarketSnapshot />

          <Card title="Upcoming Events & Tasks">
            <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto" onMouseEnter={() => triggerUIInteraction('A combined list of your upcoming harvests and to-do items.')} onMouseLeave={clearHint}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={`${event.type}-${event.id}`} className="group flex items-start gap-2 sm:gap-3 rounded-lg sm:rounded-xl border border-gray-200 bg-white p-2 sm:p-3 shadow-sm transition-colors hover:bg-gray-50">
                    {event.type === 'harvest' ? (
                      <>
                        <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg sm:rounded-xl">
                          <CropsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                        <button className="flex-grow text-left min-w-0" onClick={() => handleCropClick(event.raw)}>
                          <p className="font-semibold text-gray-900 group-hover:text-green-600 text-sm sm:text-base truncate">{event.title}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{event.description}: {formatDate(event.date)}</p>
                        </button>
                        <Badge tone="info">Harvest</Badge>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center flex-grow min-w-0">
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleTodo(event.id)}
                            className="h-4 w-4 sm:h-5 sm:w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                            aria-label={`Mark todo as complete: ${event.title}`}
                          />
                          <span className="ml-2 sm:ml-3 text-gray-900 text-sm sm:text-base truncate">{event.title}</span>
                        </div>
                        <button onClick={() => deleteTodo(event.id)} aria-label={`Delete todo: ${event.title}`} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 flex-shrink-0">
                          <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <Badge tone="warning">To-Do</Badge>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6 sm:py-8">
                  <CalendarIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm sm:text-base">No upcoming harvests or tasks.</p>
                </div>
              )}

              {/* To-do input - Mobile Optimized */}
              <form onSubmit={handleAddTodo} className="flex items-center gap-2 rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 p-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a quick task..."
                  className="flex-grow bg-transparent text-sm placeholder:text-gray-500 focus:outline-none"
                  onFocus={() => triggerUIInteraction('Type a new task and press the plus button to add it.')}
                  onBlur={clearHint}
                />
                <button type="submit" aria-label="Add new task" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0">
                  <PlusCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="sr-only">Add</span>
                </button>
              </form>
            </div>
          </Card>

          <Card title="Maintenance Alerts">
            <div className="space-y-3 max-h-40 sm:max-h-48 overflow-y-auto" onMouseEnter={() => triggerUIInteraction('AI-powered alerts for upcoming equipment maintenance.')} onMouseLeave={clearHint}>
              {maintenanceCandidates.length > 0 ? (
                maintenanceCandidates.map(item => (
                  <button key={item.id} onClick={() => handleEquipmentClick(item)} className="group flex w-full items-start gap-2 sm:gap-3 rounded-lg sm:rounded-xl border border-blue-200 bg-blue-50 p-2 sm:p-3 text-left transition-colors hover:bg-blue-100">
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl">
                      <HydroponicsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-700 text-sm sm:text-base truncate">{item.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{item.maintenanceLogs.length} logs recorded. Ready for AI analysis.</p>
                    </div>
                    <Badge tone="info">Check</Badge>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6 sm:py-8">
                  <WrenchIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm sm:text-base">No maintenance predictions yet.</p>
                  <p className="text-xs">Log 2+ maintenance events on a machine to enable AI analysis.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity - Mobile Optimized */}
      <div className="xl:col-span-5">
        <Card title="Recent Activity">
          {recentTransactions.length > 0 ? (
            <div className="overflow-auto rounded-lg sm:rounded-xl border border-gray-200">
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-2">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => handleTransactionClick(tx)}
                    className="cursor-pointer p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    onMouseEnter={() => triggerUIInteraction('Click to view or edit this transaction.')}
                    onMouseLeave={clearHint}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{tx.description}</p>
                        <p className="text-xs text-gray-500">{tx.category}</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className={`font-semibold ${tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="hidden sm:table w-full text-left">
                <thead className="sticky top-0 z-10 bg-gray-100 backdrop-blur">
                  <tr className="border-b">
                    <th scope="col" className="p-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Date</th>
                    <th scope="col" className="p-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Description</th>
                    <th scope="col" className="p-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Category</th>
                    <th scope="col" className="p-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx, idx) => (
                    <tr
                      key={tx.id}
                      onClick={() => handleTransactionClick(tx)}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${idx % 2 ? 'bg-white' : 'bg-gray-50/50'}`}
                      onMouseEnter={() => triggerUIInteraction('Click to view or edit this transaction.')}
                      onMouseLeave={clearHint}
                    >
                      <td className="p-3 whitespace-nowrap text-sm">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                      <td className="p-3 text-gray-900 text-sm">{tx.description}</td>
                      <td className="p-3 text-gray-600 text-sm">{tx.category}</td>
                      <td className={`p-3 text-right font-semibold text-sm ${tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[140px] sm:min-h-[180px] flex-col items-center justify-center gap-2 text-gray-500">
              <ExpensesIcon className="w-12 h-12 sm:w-14 sm:h-14 text-gray-300" />
              <p className="font-semibold text-sm sm:text-base">No recent transactions.</p>
              <p className="text-xs sm:text-sm">Add income or expenses using the buttons above.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
