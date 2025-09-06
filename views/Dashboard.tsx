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

const Badge: React.FC<{ tone?: 'success' | 'danger' | 'info' | 'warning'; className?: string; children: React.ReactNode }> = ({ tone = 'info', className = '', children }) => {
  const tones: Record<string, string> = {
    success: 'bg-green-100 text-green-700 ring-1 ring-green-200',
    danger: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    info: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    warning: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]} ${className}`}>{children}</span>;
};

const ChangeIndicator: React.FC<{ current: number; previous: number; isIncome?: boolean }> = ({ current, previous, isIncome = false }) => {
  if (previous === 0) {
    if (current > 0) return <span className="text-xs font-medium text-green-600 flex items-center mt-1">↑ New Activity</span>;
    return null;
  }
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 0.1) return null;
  const isGoodChange = isIncome ? change >= 0 : change <= 0;
  const color = isGoodChange ? 'text-green-600' : 'text-red-600';
  const arrow = change >= 0 ? '↑' : '↓';
  return (
    <span className={`text-xs font-medium ${color} flex items-center mt-1`}>
      {arrow} {Math.abs(change).toFixed(1)}% vs last month
    </span>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string; changeIndicator?: React.ReactNode; onMouseEnter?: () => void; onMouseLeave?: () => void; }> = ({ title, value, icon, colorClass, changeIndicator, onMouseEnter, onMouseLeave }) => (
  <div
    className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-primary/40"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    role="group"
  >
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
    <div className="p-4 flex items-center">
      <div className={`p-3 rounded-xl mr-4 ring-1 ring-white/20 ${colorClass}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-xs uppercase tracking-wide text-text-secondary font-semibold">{title}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-text-primary leading-tight">{value}</p>
        {changeIndicator}
      </div>
    </div>
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-gradient-to-tr from-primary/50 to-transparent group-hover:opacity-20 transition-opacity" />
  </div>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; className?: string; onMouseEnter?: () => void; onMouseLeave?: () => void; }> = ({ icon, label, onClick, className = '', onMouseEnter, onMouseLeave }) => (
  <button
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`relative flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left shadow-sm ring-1 ring-white/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${className}`}
  >
    <div className="flex items-center gap-3">
      <span className="grid place-items-center rounded-xl bg-white/30 p-2">{icon}</span>
      <span className="font-semibold text-white drop-shadow-sm">{label}</span>
    </div>
    <span className="inline-flex h-6 items-center justify-center rounded-md bg-black/10 px-2 text-[11px] font-semibold text-white/90">Quick</span>
  </button>
);

/* ------------------------------- Market AI ------------------------------- */

const MarketSnapshot: React.FC = () => {
  const { loading, error, data, execute } = useGemini<[string], string>();
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
    <Card title="Market Snapshot" className="border border-secondary/40 rounded-2xl">
      <div className="flex flex-col gap-3">
        <div className="min-h-[88px]">
          {loading && !data && (
            <div className="animate-pulse space-y-2" aria-live="polite">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="h-3 w-5/6 rounded bg-muted" />
            </div>
          )}
          {error && <p className="text-red-600">Could not load market data.</p>}
          {data && <p className="text-text-primary leading-relaxed">{data}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <MarketTrendsIcon className="h-4 w-4 text-secondary" />
          <span>AI-powered insight, updated every 5 mins.</span>
        </div>
      </div>
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 Dashboard                                  */
/* -------------------------------------------------------------------------- */

const Dashboard: React.FC = () => {
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
      .map(crop => ({ id: crop.id, type: 'harvest' as const, date: new Date(crop.estimatedHarvestDate), title: `${crop.name}`, description: 'Est. Harvest', raw: crop }));

    const openTodos = todos
      .filter(todo => !todo.completed)
      .map(todo => ({ id: todo.id, type: 'todo' as const, date: null, title: todo.task, raw: todo }));

    const sortedHarvests = upcomingHarvests.sort((a, b) => a.date.getTime() - b.date.getTime());
    return [...sortedHarvests, ...openTodos];
  }, [crops, todos]);

  const recentTransactions = transactions.slice(0, 5);
  const maintenanceCandidates = useMemo(() => equipment.filter(e => e.maintenanceLogs.length >= 2), [equipment]);

  /* -------------------------------- Handlers -------------------------------- */

  const handleAddTodo = (e: React.FormEvent) => { e.preventDefault(); if (!newTodo.trim()) return; addTodo(newTodo.trim()); setNewTodo(''); };
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency, minimumFractionDigits: 2 }).format(amount);
  
  const formatDate = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const handleAddCropClick = () => setViewState({ view: 'crops', payload: { openForm: true } });
  const handleAddTransactionClick = (type: TransactionType) => setViewState({ view: 'transactions', type, payload: { openForm: true } });
  const handleHydroponicsClick = () => setViewState({ view: 'hydroponics', payload: { openForm: true } });
  const handleCropClick = (crop: Crop) => setViewState({ view: 'crops', payload: { detailedCropId: crop.id } });
  
  const handleTransactionClick = (tx: Transaction) => setViewState({ view: 'transactions', type: tx.type, payload: { selectedTransactionId: tx.id } });
  const handleEquipmentClick = (item: Equipment) => setViewState({ view: 'equipment', payload: { detailedEquipmentId: item.id } });
  const clearHint = () => triggerUIInteraction(null);

  /* --------------------------------- Render --------------------------------- */

  return (
    <div className="space-y-6">
      {/* Top Quick Actions */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionButton
          icon={<IncomeIcon className="w-6 h-6 text-primary" />}
          label="Add Income"
          onClick={() => handleAddTransactionClick(TransactionType.INCOME)}
          className="bg-gradient-to-tr from-primary to-primary/80"
          onMouseEnter={() => triggerUIInteraction('Quickly log a new income transaction.')}
          onMouseLeave={clearHint}
        />
        <QuickActionButton
          icon={<ExpensesIcon className="w-6 h-6 text-red-500" />}
          label="Add Expense"
          onClick={() => handleAddTransactionClick(TransactionType.EXPENSE)}
          className="bg-gradient-to-tr from-red-500 to-red-400"
          onMouseEnter={() => triggerUIInteraction('Quickly log a new expense transaction.')}
          onMouseLeave={clearHint}
        />
        <QuickActionButton
          icon={<CropsIcon className="w-6 h-6 text-secondary" />}
          label="Add Crop"
          onClick={handleAddCropClick}
          className="bg-gradient-to-tr from-secondary to-amber-500"
          onMouseEnter={() => triggerUIInteraction('Add a new crop or field to track.')}
          onMouseLeave={clearHint}
        />
        <QuickActionButton
          icon={<HydroponicsIcon className="w-6 h-6 text-emerald-300" />}
          label="Hydroponics"
          onClick={handleHydroponicsClick}
          className="bg-gradient-to-tr from-emerald-600 to-emerald-500"
          onMouseEnter={() => triggerUIInteraction('Go to Hydroponic Machineries')}
          onMouseLeave={clearHint}
        />
     </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="This Month's Income"
          value={formatCurrency(financialSummary.monthlyIncome)}
          icon={<IncomeIcon className="w-6 h-6 text-primary" />}
          colorClass="bg-primary/15"
          changeIndicator={<ChangeIndicator current={financialSummary.monthlyIncome} previous={financialSummary.lastMonthIncome} isIncome />}
          onMouseEnter={() => triggerUIInteraction('Total income recorded in the current month.')}
          onMouseLeave={clearHint}
        />
        <StatCard
          title="This Month's Expenses"
          value={formatCurrency(financialSummary.monthlyExpenses)}
          icon={<ExpensesIcon className="w-6 h-6 text-red-500" />}
          colorClass="bg-red-500/15"
          changeIndicator={<ChangeIndicator current={financialSummary.monthlyExpenses} previous={financialSummary.lastMonthExpenses} isIncome={false} />}
          onMouseEnter={() => triggerUIInteraction('Total expenses recorded in the current month.')}
          onMouseLeave={clearHint}
        />
        <StatCard
          title="Monthly Net Profit"
          value={formatCurrency(financialSummary.monthlyNet)}
          icon={<ReportsIcon className={`w-6 h-6 ${financialSummary.monthlyNet >= 0 ? 'text-blue-500' : 'text-yellow-500'}`} />}
          colorClass={financialSummary.monthlyNet >= 0 ? 'bg-blue-500/15' : 'bg-yellow-500/15'}
          onMouseEnter={() => triggerUIInteraction("The difference between this month's income and expenses.")}
          onMouseLeave={clearHint}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-3 space-y-6">
          <Card title="Profit / Loss Snapshot (This Month)">
            <div className="rounded-xl border border-border/60 p-3 bg-muted/30" onMouseEnter={() => triggerUIInteraction("This bar chart visualizes this month's income versus expenses.")} onMouseLeave={clearHint}>
              <ProfitLossSnapshotChart />
            </div>
          </Card>

          <Card title="Year-to-Date Financials">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center" onMouseEnter={() => triggerUIInteraction('A summary of your total income, expenses, and profit for the current year.')} onMouseLeave={clearHint}>
              <div className="rounded-xl bg-green-50/60 p-4 ring-1 ring-green-200">
                <p className="text-xs font-medium text-green-700">Total Income</p>
                <p className="mt-1 text-2xl font-extrabold text-green-700">{formatCurrency(financialSummary.ytdIncome)}</p>
              </div>
              <div className="rounded-xl bg-red-50/70 p-4 ring-1 ring-red-200">
                <p className="text-xs font-medium text-red-700">Total Expenses</p>
                <p className="mt-1 text-2xl font-extrabold text-red-700">{formatCurrency(financialSummary.ytdExpenses)}</p>
              </div>
              <div className={`rounded-xl p-4 ring-1 ${financialSummary.ytdNet >= 0 ? 'bg-blue-50/70 ring-blue-200' : 'bg-amber-50 ring-amber-200'}`}>
                <p className={`text-xs font-medium ${financialSummary.ytdNet >= 0 ? 'text-blue-700' : 'text-amber-800'}`}>Net Profit</p>
                <p className={`mt-1 text-2xl font-extrabold ${financialSummary.ytdNet >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>{formatCurrency(financialSummary.ytdNet)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-2 space-y-6">
          <MarketSnapshot />

          <Card title="Upcoming Events & Tasks">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1" onMouseEnter={() => triggerUIInteraction('A combined list of your upcoming harvests and to-do items.')} onMouseLeave={clearHint}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={`${event.type}-${event.id}`} className="group flex items-start gap-3 rounded-xl border border-border/60 bg-white/60 p-3 shadow-sm transition-colors hover:bg-white">
                    {event.type === 'harvest' ? (
                      <>
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <CropsIcon className="w-5 h-5 text-primary" />
                        </div>
                        <button className="flex-grow text-left" onClick={() => handleCropClick(event.raw as Crop)}>
                          <p className="font-semibold text-text-primary group-hover:text-primary">{event.title}</p>
                          <p className="text-sm text-text-secondary">{event.description}: {formatDate(event.date!)}</p>
                        </button>
                        <Badge tone="info">Harvest</Badge>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center flex-grow">
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleTodo(event.id)}
                            className="h-5 w-5 rounded border-border text-primary focus:ring-primary/50 cursor-pointer"
                            aria-label={`Mark todo as complete: ${event.title}`}
                          />
                          <span className="ml-3 text-text-primary">{event.title}</span>
                        </div>
                        <button onClick={() => deleteTodo(event.id)} aria-label={`Delete todo: ${event.title}`} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                        <Badge tone="warning">To-Do</Badge>
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

              {/* To-do input */}
              <form onSubmit={handleAddTodo} className="flex items-center gap-2 rounded-xl border border-border/60 bg-white/70 p-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a quick task..."
                  className="flex-grow bg-transparent text-sm placeholder:text-text-secondary/70 focus:outline-none"
                  onFocus={() => triggerUIInteraction('Type a new task and press the plus button to add it.')}
                  onBlur={clearHint}
                />
                <button type="submit" aria-label="Add new task" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-primary hover:bg-primary/10">
                  <PlusCircleIcon className="w-6 h-6" />
                  <span className="sr-only">Add</span>
                </button>
              </form>
            </div>
          </Card>

          <Card title="Maintenance Alerts">
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1" onMouseEnter={() => triggerUIInteraction('AI-powered alerts for upcoming equipment maintenance.')} onMouseLeave={clearHint}>
              {maintenanceCandidates.length > 0 ? (
                maintenanceCandidates.map(item => (
                  <button key={item.id} onClick={() => handleEquipmentClick(item)} className="group flex w-full items-start gap-3 rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-left transition-colors hover:bg-blue-50">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                      <HydroponicsIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-text-primary group-hover:text-blue-700">{item.name}</p>
                      <p className="text-sm text-text-secondary">{item.maintenanceLogs.length} logs recorded. Ready for AI analysis.</p>
                    </div>
                    <Badge tone="info">Check</Badge>
                  </button>
                ))
              ) : (
                <div className="text-center text-text-secondary py-8">
                  <WrenchIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No maintenance predictions yet.</p>
                  <p className="text-xs">Log 2+ maintenance events on a machine to enable AI analysis.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="xl:col-span-5">
        <Card title="Recent Activity">
          {recentTransactions.length > 0 ? (
            <div className="overflow-auto rounded-xl border border-border/60">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40">
                  <tr className="border-b">
                    <th scope="col" className="p-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</th>
                    <th scope="col" className="p-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Description</th>
                    <th scope="col" className="p-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Category</th>
                    <th scope="col" className="p-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx: Transaction, idx: number) => (
                    <tr
                      key={tx.id}
                      onClick={() => handleTransactionClick(tx)}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${idx % 2 ? 'bg-white' : 'bg-white/70'}`}
                      onMouseEnter={() => triggerUIInteraction('Click to view or edit this transaction.')}
                      onMouseLeave={clearHint}
                    >
                      <td className="p-3 whitespace-nowrap">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                      <td className="p-3 text-text-primary">{tx.description}</td>
                      <td className="p-3 text-text-secondary">{tx.category}</td>
                      <td className={`p-3 text-right font-semibold ${tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 text-text-secondary">
              <ExpensesIcon className="w-14 h-14 text-gray-300" />
              <p className="font-semibold">No recent transactions.</p>
              <p className="text-sm">Add income or expenses using the buttons above.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
