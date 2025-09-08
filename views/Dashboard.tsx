import React, { useState, useMemo, useEffect, useCallback, createContext, useContext } from 'react';

// Mock data and types
const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Mock icons as simple SVG components
const DashboardIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
);

const CropsIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M12 2l3.09 6.26L22 9l-6.91.74L12 16l-3.09-6.26L2 9l6.91-.74L12 2z"/>
  </svg>
);

const IncomeIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M7 14l5-5 5 5z"/>
  </svg>
);

const ExpensesIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M7 10l5 5 5-5z"/>
  </svg>
);

const ReportsIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>
);

const DocumentIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

const HydroponicsIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,13L13.5,7.5C13.1,6.4 12.1,5.5 10.9,5.5C9.8,5.5 8.8,6.4 8.4,7.5L7,13L1,7V9L6.2,14.2L7.8,8.1C8,7.5 8.4,7 8.9,7C9.4,7 9.8,7.5 10,8.1L11.4,14.2L12.6,14.2L14,8.1C14.2,7.5 14.6,7 15.1,7C15.6,7 16,7.5 16.2,8.1L17.8,14.2L23,9Z"/>
  </svg>
);

const FarmAIIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,6H13V14H11V6M15,10H17V14H15V10M7,10H9V14H7V10Z"/>
  </svg>
);

const MarketTrendsIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
  </svg>
);

const WrenchIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M22.7,19L13.6,9.9C14.5,7.6 14,4.9 12.1,3C10.1,1 7.1,0.6 4.7,1.7L9,6L6,9L1.6,4.7C0.4,7.1 0.9,10.1 2.9,12.1C4.8,14 7.5,14.5 9.8,13.6L18.9,22.7C19.3,23.1 19.9,23.1 20.3,22.7L22.6,20.4C23.1,20 23.1,19.3 22.7,19Z"/>
  </svg>
);

const PlusCircleIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
  </svg>
);

const TrashIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
  </svg>
);

// Mock context and data
const FarmContext = createContext(null);

// Mock chart component
const ProfitLossSnapshotChart = () => (
  <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-blue-200 rounded-full flex items-center justify-center">
        <ReportsIcon />
      </div>
      <p className="text-gray-600 font-medium">Profit/Loss Chart</p>
      <p className="text-sm text-gray-500 mt-2">Interactive chart would display here</p>
    </div>
  </div>
);

// Card component
const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-200/50 ${className}`}>
    <div className="p-4 border-b border-gray-200/50">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

// Mock farm provider
const FarmProvider = ({ children }) => {
  const [viewState, setViewState] = useState({ view: 'dashboard', type: null, payload: null });
  const [hintText, setHintText] = useState('');

  // Mock data
  const transactions = [
    { id: 1, type: TransactionType.INCOME, amount: 2500, description: 'Corn Sale', category: 'Crop Sales', date: '2024-01-15' },
    { id: 2, type: TransactionType.EXPENSE, amount: 150, description: 'Seeds', category: 'Supplies', date: '2024-01-14' },
    { id: 3, type: TransactionType.INCOME, amount: 800, description: 'Vegetable Sales', category: 'Crop Sales', date: '2024-01-13' },
    { id: 4, type: TransactionType.EXPENSE, amount: 300, description: 'Fuel', category: 'Equipment', date: '2024-01-12' },
    { id: 5, type: TransactionType.INCOME, amount: 1200, description: 'Wheat Sale', category: 'Crop Sales', date: '2024-01-11' }
  ];

  const crops = [
    { id: 1, name: 'Corn', estimatedHarvestDate: '2024-02-15', actualHarvestDate: null },
    { id: 2, name: 'Wheat', estimatedHarvestDate: '2024-02-20', actualHarvestDate: null }
  ];

  const todos = [
    { id: 1, task: 'Check irrigation system', completed: false },
    { id: 2, task: 'Order fertilizer', completed: false },
    { id: 3, task: 'Schedule equipment maintenance', completed: true }
  ];

  const equipment = [
    { id: 1, name: 'Hydroponic System A', maintenanceLogs: [{ date: '2024-01-01' }, { date: '2024-01-15' }] },
    { id: 2, name: 'Tractor', maintenanceLogs: [{ date: '2024-01-10' }] }
  ];

  const settings = { currency: 'USD' };

  const toggleTodo = (id) => {
    // Mock implementation
    console.log('Toggle todo:', id);
  };

  const addTodo = (task) => {
    console.log('Add todo:', task);
  };

  const deleteTodo = (id) => {
    console.log('Delete todo:', id);
  };

  const triggerUIInteraction = (text) => {
    setHintText(text || '');
  };

  const value = {
    viewState,
    setViewState,
    transactions,
    crops,
    todos,
    equipment,
    settings,
    toggleTodo,
    addTodo,
    deleteTodo,
    triggerUIInteraction,
    hintText
  };

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
};

const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within FarmProvider');
  }
  return context;
};

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
    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
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

// Market Snapshot Component
const MarketSnapshot = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState("Corn futures are showing steady growth this week, up 2.3% due to strong export demand. Weather conditions remain favorable for the upcoming planting season.");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-100 shadow-md">
            <MarketTrendsIcon />
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

// Navigation Item Component
const NavItem = ({ icon, label, isActive, isExpanded, onClick, hasNotification, badge, isMobile }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <li className="relative group">
      <div
        onClick={onClick}
        onMouseEnter={() => {
          if (!isExpanded && !isMobile) setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
        }}
        className={`
          relative flex items-center h-12 mx-2 rounded-xl cursor-pointer
          transition-all duration-300 ease-out group overflow-hidden
          ${isActive 
            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25" 
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 hover:shadow-sm"
          }
        `}
      >
        {/* Active state glow effect */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-xl blur-xl" />
        )}

        {/* Icon container */}
        <div className={`
          relative z-10 flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg transition-all duration-300
          ${isExpanded ? 'ml-3' : 'mx-auto'}
          ${isActive ? 'bg-white/20 shadow-inner' : 'group-hover:bg-slate-100/50'}
        `}>
          <div className={`
            w-5 h-5 transition-all duration-300
            ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-emerald-600'}
          `}>
            {icon}
          </div>
          
          {/* Notification indicators */}
          {hasNotification && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-white shadow-sm">
              <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-60" />
            </div>
          )}
          
          {badge && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-semibold shadow-md">
              {badge}
            </div>
          )}
        </div>

        {/* Label with smooth animation */}
        <div className={`
          relative z-10 ml-3 transition-all duration-300 ease-out
          ${isExpanded 
            ? "opacity-100 translate-x-0 max-w-none" 
            : "opacity-0 -translate-x-4 max-w-0 overflow-hidden"
          }
        `}>
          <span className="font-semibold text-sm whitespace-nowrap">{label}</span>
        </div>

        {/* Active indicator line */}
        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full shadow-sm" />
        )}
      </div>

      {/* Enhanced tooltip for collapsed state - Desktop only */}
      {showTooltip && !isExpanded && !isMobile && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50">
          <div className="relative bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl border border-slate-700 backdrop-blur-sm">
            {label}
            {/* Arrow */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 border-4 border-transparent border-r-slate-800" />
          </div>
        </div>
      )}
    </li>
  );
};

// Sidebar Navigation Component
const SideNav = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { viewState, setViewState, triggerUIInteraction } = useFarm();

  // Handle responsive behavior
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleNav = (view, type) => {
    setViewState({ view, type });
    setIsMobileOpen(false);
  };

  const clearHint = () => triggerUIInteraction(null);

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed);
  };

  // Determine if sidebar should be expanded
  const isExpanded = isMobile ? true : !isDesktopCollapsed;

// Navigation items organized by sections
  const mainNavItems = [
    { 
      view: "dashboard", 
      label: "Dashboard", 
      icon: <DashboardIcon />, 
      hint: "Overview of your farm operations",
      hasNotification: true
    },
    { 
      view: "crops", 
      label: "Crops", 
      icon: <CropsIcon />, 
      hint: "Manage crops and field operations" 
    },
    { 
      view: "equipment", 
      label: "Hydroponics", 
      icon: <HydroponicsIcon />, 
      hint: "Monitor hydroponic systems" 
    },
  ];

  const financeNavItems = [
    { 
      view: "transactions", 
      type: TransactionType.INCOME, 
      label: "Income", 
      icon: <IncomeIcon />, 
      hint: "Track farm revenue and sales",
      badge: "12"
    },
    { 
      view: "transactions", 
      type: TransactionType.EXPENSE, 
      label: "Expenses", 
      icon: <ExpensesIcon />, 
      hint: "Monitor farm costs and expenses" 
    },
    { 
      view: "reports", 
      label: "Reports", 
      icon: <ReportsIcon />, 
      hint: "Financial reports and analytics" 
    },
  ];

  const toolsNavItems = [
    { 
      view: "summary", 
      label: "Summary", 
      icon: <DocumentIcon />, 
      hint: "Generate comprehensive summaries" 
    },
    { 
      view: "farm-ai", 
      label: "Farm AI", 
      icon: <FarmAIIcon />, 
      hint: "AI-powered farm insights",
      hasNotification: true
    },
  ];

  const settingsItem = {
    view: "settings",
    label: "Settings",
    icon: <SettingsIcon />,
    hint: "Application preferences and configuration",
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className={`
          fixed top-6 left-6 z-50 md:hidden
          w-12 h-12 backdrop-blur-xl shadow-lg border
          flex items-center justify-center transition-all duration-300 ease-out
          ${isMobileOpen 
            ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/30 rotate-90' 
            : 'bg-white/95 border-slate-200 text-slate-700 hover:bg-white hover:shadow-xl hover:border-slate-300'
          }
          rounded-2xl hover:scale-105 active:scale-95
        `}
      >
        <div className="relative w-5 h-5">
          <span className={`
            absolute top-1 left-0 w-5 h-0.5 bg-current rounded-full origin-center
            transition-all duration-300 ease-out
            ${isMobileOpen ? 'rotate-45 top-2.5 bg-white' : ''}
          `} />
          <span className={`
            absolute top-2.5 left-0 w-5 h-0.5 bg-current rounded-full
            transition-all duration-300 ease-out
            ${isMobileOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
          `} />
          <span className={`
            absolute top-4 left-0 w-5 h-0.5 bg-current rounded-full origin-center
            transition-all duration-300 ease-out
            ${isMobileOpen ? '-rotate-45 top-2.5 bg-white' : ''}
          `} />
        </div>
      </button>

      {/* Main sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-full flex flex-col z-40
          bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl shadow-slate-900/5
          transition-all duration-400 ease-out
          ${isMobile ? (
            isMobileOpen 
              ? 'w-72 translate-x-0' 
              : 'w-72 -translate-x-full'
          ) : (
            isDesktopCollapsed 
              ? 'w-20 translate-x-0' 
              : 'w-72 translate-x-0'
          )}
        `}
      >
        {/* Enhanced header */}
        <div className="relative flex items-center h-20 px-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-emerald-50/40">
          {/* Logo and brand */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all duration-300 border border-emerald-400/30">
                <div className="w-6 h-6 text-white">
                  <svg fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                    <path d="M12 16C12 16 8 18 8 22H16C16 18 12 16 12 16Z" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </div>
              </div>
            </div>
            <div className={`
              transition-all duration-400 ease-out
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
            `}>
              <h1 className="text-xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                FARMY'S LEDGER
              </h1>
              <p className="text-sm font-semibold text-emerald-600 -mt-0.5">Farm Management System</p>
            </div>
          </div>
          
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleDesktopCollapse}
            className={`
              hidden md:flex items-center justify-center w-8 h-8 ml-auto
              text-slate-400 hover:text-slate-600 rounded-xl
              hover:bg-slate-100/80 backdrop-blur-sm transition-all duration-300
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
              hover:scale-110 active:scale-95
            `}
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${isDesktopCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation content */}
        <div className="flex-1 flex flex-col py-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent px-1">
            
            {/* Main Operations Section */}
            <div className="mb-8">
              <div className={`
                px-4 mb-3 transition-all duration-300
                ${isExpanded ? 'opacity-100' : 'opacity-0'}
              `}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operations</h3>
              </div>
              <ul className="space-y-2">
                {mainNavItems.map((item) => (
                  <NavItem
                    key={`${item.view}-${item.type || ''}`}
                    label={item.label}
                    icon={item.icon}
                    isExpanded={isExpanded}
                    isActive={
                      viewState.view === item.view &&
                      (item.type ? viewState.type === item.type : true)
                    }
                    onClick={() => handleNav(item.view, item.type)}
                    hasNotification={item.hasNotification}
                    badge={item.badge}
                    isMobile={isMobile}
                  />
                ))}
              </ul>
            </div>

            {/* Financial Section */}
            <div className="mb-8">
              <div className={`
                px-4 mb-3 transition-all duration-300
                ${isExpanded ? 'opacity-100' : 'opacity-0'}
              `}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial</h3>
              </div>
              <ul className="space-y-2">
                {financeNavItems.map((item) => (
                  <NavItem
                    key={`${item.view}-${item.type || ''}`}
                    label={item.label}
                    icon={item.icon}
                    isExpanded={isExpanded}
                    isActive={
                      viewState.view === item.view &&
                      (item.type ? viewState.type === item.type : true)
                    }
                    onClick={() => handleNav(item.view, item.type)}
                    hasNotification={item.hasNotification}
                    badge={item.badge}
                    isMobile={isMobile}
                  />
                ))}
              </ul>
            </div>

            {/* Tools Section */}
            <div className="mb-8">
              <div className={`
                px-4 mb-3 transition-all duration-300
                ${isExpanded ? 'opacity-100' : 'opacity-0'}
              `}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tools</h3>
              </div>
              <ul className="space-y-2">
                {toolsNavItems.map((item) => (
                  <NavItem
                    key={`${item.view}-${item.type || ''}`}
                    label={item.label}
                    icon={item.icon}
                    isExpanded={isExpanded}
                    isActive={
                      viewState.view === item.view &&
                      (item.type ? viewState.type === item.type : true)
                    }
                    onClick={() => handleNav(item.view, item.type)}
                    hasNotification={item.hasNotification}
                    badge={item.badge}
                    isMobile={isMobile}
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* Settings section */}
          <div className="border-t border-slate-200/60 pt-6 mt-auto">
            <ul>
              <NavItem
                label={settingsItem.label}
                icon={settingsItem.icon}
                isExpanded={isExpanded}
                isActive={viewState.view === settingsItem.view}
                onClick={() => handleNav(settingsItem.view)}
                isMobile={isMobile}
              />
            </ul>
          </div>
        </div>

        {/* Enhanced user profile section */}
        <div className={`
          border-t border-slate-200/60 p-4 bg-gradient-to-r from-slate-50/60 to-emerald-50/30 backdrop-blur-sm
          transition-all duration-400 ease-out
          ${isExpanded ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-all duration-300 border border-emerald-200/50">
                ðŸŒ¾
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-0.5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">Farmer John</p>
              <p className="text-xs text-slate-500 truncate">Premium Account â€¢ Active</p>
            </div>
            <button className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100/80 transition-all duration-200 flex items-center justify-center group">
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

// Layout Component
const IntegratedLayout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40">
      {/* Sidebar Component */}
      <SideNav />
      
      {/* Main Content Area */}
      <div
        className={`
          flex-1 transition-all duration-400 ease-out
          ${!isMobile ? (sidebarExpanded ? 'ml-72' : 'ml-20') : 'ml-0'}
        `}
      >
        <div className="min-h-screen">
          <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-6 py-6 pt-20 md:pt-6">
            {children}
          </div>
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
        /* Enhanced scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-slate-300::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.4);
          border-radius: 3px;
          transition: background-color 0.2s;
        }
        .scrollbar-thumb-slate-300::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.6);
        }
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
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
            icon={<IncomeIcon />}
            label="Add Income"
            onClick={() => handleAddTransactionClick(TransactionType.INCOME)}
            className="bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600"
            onMouseEnter={() => triggerUIInteraction('Quickly log a new income transaction with enhanced tracking.')}
            onMouseLeave={clearHint}
          />
          <QuickActionButton
            icon={<ExpensesIcon />}
            label="Add Expense"
            onClick={() => handleAddTransactionClick(TransactionType.EXPENSE)}
            className="bg-gradient-to-br from-red-500 via-rose-500 to-red-600"
            onMouseEnter={() => triggerUIInteraction('Quickly log a new expense transaction with category tracking.')}
            onMouseLeave={clearHint}
          />
          <QuickActionButton
            icon={<CropsIcon />}
            label="Add Crop"
            onClick={handleAddCropClick}
            className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600"
            onMouseEnter={() => triggerUIInteraction('Add a new crop with AI-powered growth predictions.')}
            onMouseLeave={clearHint}
          />
          <QuickActionButton
            icon={<HydroponicsIcon />}
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
            icon={<IncomeIcon />}
            colorClass="bg-gradient-to-br from-emerald-100 to-green-100"
            changeIndicator={<ChangeIndicator current={financialSummary.monthlyIncome} previous={financialSummary.lastMonthIncome} isIncome />}
            onMouseEnter={() => triggerUIInteraction('Total income recorded in the current month with trend analysis.')}
            onMouseLeave={clearHint}
          />
          <StatCard
            title="This Month's Expenses"
            value={formatCurrency(financialSummary.monthlyExpenses)}
            icon={<ExpensesIcon />}
            colorClass="bg-gradient-to-br from-red-100 to-rose-100"
            changeIndicator={<ChangeIndicator current={financialSummary.monthlyExpenses} previous={financialSummary.lastMonthExpenses} isIncome={false} />}
            onMouseEnter={() => triggerUIInteraction('Total expenses recorded with smart categorization and alerts.')}
            onMouseLeave={clearHint}
          />
          <StatCard
            title="Monthly Net Profit"
            value={formatCurrency(financialSummary.monthlyNet)}
            icon={<ReportsIcon />}
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
                            <CropsIcon />
                          </div>
                          <button className="flex-grow text-left min-w-0" onClick={() => handleCropClick(event.raw)}>
                            <p className="font-bold text-gray-900 group-hover:text-emerald-600 text-sm truncate transition-colors">{event.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{event.description}: {formatDate(event.date)}</p>
                          </button>
                          <Badge tone="success">ðŸŒ¾</Badge>
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
                            <TrashIcon />
                          </button>
                          <Badge tone="warning">ðŸ“</Badge>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="p-4 rounded-xl bg-gray-100 inline-block mb-4">
                      <CalendarIcon />
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
                    placeholder="Add a quick task... âœ¨"
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
                    <PlusCircleIcon />
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
                        <HydroponicsIcon />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-gray-900 group-hover:text-blue-700 text-sm truncate transition-colors">{item.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.maintenanceLogs.length} logs recorded. AI analysis ready.</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          <span className="text-xs text-blue-600 font-medium">Predictive insights available</span>
                        </div>
                      </div>
                      <Badge tone="info">ðŸ”§</Badge>
                    </button>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="p-4 rounded-xl bg-gray-100 inline-block mb-4">
                      <WrenchIcon />
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
                              <IncomeIcon />
                            ) : (
                              <ExpensesIcon />
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
                                  <IncomeIcon />
                                ) : (
                                  <ExpensesIcon />
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
                  <ExpensesIcon />
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
    </div>
  );
};

// Main App Component
const App = () => {
  const { viewState } = useFarm();

  const renderView = () => {
    switch (viewState.view) {
      case 'dashboard':
        return <Dashboard />;
      case 'crops':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Crops Management</h2>
            <p className="text-gray-600">Crops view would be implemented here</p>
          </div>
        );
      case 'transactions':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {viewState.type === TransactionType.INCOME ? 'Income' : 'Expense'} Transactions
            </h2>
            <p className="text-gray-600">Transaction management view would be implemented here</p>
          </div>
        );
      case 'equipment':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Hydroponics Equipment</h2>
            <p className="text-gray-600">Equipment management view would be implemented here</p>
          </div>
        );
      case 'reports':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
            <p className="text-gray-600">Reports view would be implemented here</p>
          </div>
        );
      case 'summary':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Farm Summary</h2>
            <p className="text-gray-600">Summary view would be implemented here</p>
          </div>
        );
      case 'farm-ai':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Farm AI Assistant</h2>
            <p className="text-gray-600">AI assistant view would be implemented here</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-gray-600">Settings view would be implemented here</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <IntegratedLayout>
      {renderView()}
    </IntegratedLayout>
  );
};

// Main component with provider
export default function FarmDashboard() {
  return (
    <FarmProvider>
      <App />
    </FarmProvider>
  );
}
