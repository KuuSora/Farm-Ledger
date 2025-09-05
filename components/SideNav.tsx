import React, { useState, useEffect, useRef } from "react";
import { View, TransactionType } from "../types";
import { DashboardIcon, CropsIcon, IncomeIcon, ExpensesIcon, ReportsIcon, SettingsIcon, DocumentIcon, FarmAIIcon, HydroponicsIcon } from "./icons";
import { useFarm } from "../context/FarmContext";

// Navigation Item Component
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  hasNotification?: boolean;
  badge?: string | number;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  isExpanded,
  onClick,
  onMouseEnter,
  onMouseLeave,
  hasNotification = false,
  badge
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <li className="relative">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => {
          onMouseEnter();
          if (!isExpanded) setShowTooltip(true);
        }}
        onMouseLeave={() => {
          onMouseLeave();
          setShowTooltip(false);
        }}
        className={`
          group relative w-full flex items-center h-12 px-3 rounded-xl 
          transition-all duration-300 ease-out select-none
          ${isActive 
            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25" 
            : "text-slate-600 hover:bg-white/70 hover:text-emerald-700 hover:shadow-md"
          }
          focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-50
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/90 rounded-r-full" />
        )}
        
        {/* Icon container */}
        <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
          <div className={`
            transition-all duration-300
            ${isActive ? 'scale-110' : 'group-hover:scale-105'}
          `}>
            {icon}
          </div>
          
          {/* Notification badge */}
          {hasNotification && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white">
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
          
          {/* Number badge */}
          {badge && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border border-white font-medium">
              {badge}
            </div>
          )}
        </div>

        {/* Label */}
        <span 
          className={`
            ml-3 font-medium text-sm transition-all duration-300 truncate
            ${isExpanded 
              ? "opacity-100 translate-x-0" 
              : "opacity-0 -translate-x-4 w-0 overflow-hidden"
            }
          `}
        >
          {label}
        </span>
      </button>

      {/* Tooltip for collapsed state */}
      {showTooltip && !isExpanded && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50">
          <div className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
            {label}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45" />
          </div>
        </div>
      )}
    </li>
  );
};

// Mobile Menu Toggle Button
interface MobileToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

const MobileToggle: React.FC<MobileToggleProps> = ({ isOpen, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      fixed top-4 left-4 z-50 md:hidden
      w-12 h-12 rounded-xl border shadow-lg
      flex items-center justify-center transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-emerald-500/50
      ${isOpen 
        ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/25' 
        : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300'
      }
    `}
  >
    <div className="relative w-5 h-5">
      <span className={`
        absolute top-0 left-0 w-5 h-0.5 bg-current rounded-full
        transition-all duration-300 origin-center
        ${isOpen ? 'rotate-45 top-2' : ''}
      `} />
      <span className={`
        absolute top-2 left-0 w-5 h-0.5 bg-current rounded-full
        transition-all duration-300
        ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
      `} />
      <span className={`
        absolute top-4 left-0 w-5 h-0.5 bg-current rounded-full
        transition-all duration-300 origin-center
        ${isOpen ? '-rotate-45 top-2' : ''}
      `} />
    </div>
  </button>
);

// Main Sidebar Component
interface SideNavProps {
  setIsExpanded?: (isExpanded: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ setIsExpanded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const { viewState, setViewState, triggerUIInteraction } = useFarm();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle outside click for mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileOpen]);

  // Update parent component about expansion state
  useEffect(() => {
    if (setIsExpanded) {
      setIsExpanded(isExpanded);
    }
  }, [isExpanded, setIsExpanded]);

  const handleMouseEnter = () => {
    if (!isMobile && !isCollapsed) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isCollapsed) {
      setIsHovered(false);
    }
  };

  const handleNav = (view: View, type?: TransactionType) => {
    setViewState({ view, type });
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const clearHint = () => triggerUIInteraction(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setIsHovered(false);
  };

  const isExpanded = isMobileOpen || (isHovered && !isCollapsed) || isCollapsed;

  const navItems = [
    { 
      view: "dashboard" as View, 
      label: "Dashboard", 
      icon: <DashboardIcon />, 
      hint: "Get a quick overview of your farm.",
      hasNotification: true
    },
    { 
      view: "crops" as View, 
      label: "Crops", 
      icon: <CropsIcon />, 
      hint: "Manage your crops and fields." 
    },
    { 
      view: "equipment" as View, 
      label: "Hydroponics", 
      icon: <HydroponicsIcon />, 
      hint: "Track your hydroponic systems." 
    },
    { 
      view: "transactions" as View, 
      type: TransactionType.INCOME, 
      label: "Income", 
      icon: <IncomeIcon />, 
      hint: "Log and view all income.",
      badge: "12"
    },
    { 
      view: "transactions" as View, 
      type: TransactionType.EXPENSE, 
      label: "Expenses", 
      icon: <ExpensesIcon />, 
      hint: "Log and view all expenses." 
    },
    { 
      view: "reports" as View, 
      label: "Reports", 
      icon: <ReportsIcon />, 
      hint: "Analyze your farm's performance." 
    },
    { 
      view: "summary" as View, 
      label: "Summary", 
      icon: <DocumentIcon />, 
      hint: "Generate printable summaries." 
    },
    { 
      view: "farm-ai" as View, 
      label: "Farm AI", 
      icon: <FarmAIIcon />, 
      hint: "Use AI-powered tools for your farm.",
      hasNotification: true
    },
  ];

  const settingsItem = {
    view: "settings" as View,
    label: "Settings",
    icon: <SettingsIcon />,
    hint: "Configure your app settings.",
  };

  return (
    <>
      {/* Mobile toggle button */}
      <MobileToggle 
        isOpen={isMobileOpen} 
        onClick={() => setIsMobileOpen(!isMobileOpen)} 
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full flex flex-col z-40
          bg-white border-r border-slate-200 shadow-xl
          transition-all duration-300 ease-out
          ${isExpanded ? 'w-64' : 'w-16'}
          ${isMobileOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <CropsIcon className="w-6 h-6 text-white" />
            </div>
            
            {/* Brand text */}
            <div className={`
              transition-all duration-300
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
            `}>
              <h1 className="text-lg font-bold text-slate-800">FARMY'S</h1>
              <p className="text-xs font-medium text-slate-500 -mt-1">LEDGER</p>
            </div>
          </div>
          
          {/* Desktop collapse button */}
          {!isMobile && (
            <button
              type="button"
              onClick={toggleCollapse}
              className={`
                w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100
                transition-all duration-300 flex items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                ${isExpanded ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </header>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col py-4 overflow-hidden">
          {/* Main nav items */}
          <ul className="flex-1 space-y-1 px-3 overflow-y-auto">
            {navItems.map((item) => (
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
                onMouseEnter={() => triggerUIInteraction(item.hint)}
                onMouseLeave={clearHint}
                hasNotification={item.hasNotification}
                badge={item.badge}
              />
            ))}
          </ul>

          {/* Settings section */}
          <div className="border-t border-slate-200 pt-3 mt-3 px-3">
            <NavItem
              label={settingsItem.label}
              icon={settingsItem.icon}
              isExpanded={isExpanded}
              isActive={viewState.view === settingsItem.view}
              onClick={() => handleNav(settingsItem.view)}
              onMouseEnter={() => triggerUIInteraction(settingsItem.hint)}
              onMouseLeave={clearHint}
            />
          </div>
        </nav>

        {/* User profile section */}
        <footer className={`
          border-t border-slate-200 p-4 bg-slate-50/50
          ${isExpanded ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-300
        `}>
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                F
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            
            {/* User info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">Farmer</p>
              <p className="text-xs text-slate-500 truncate">farmer@farmyledger.com</p>
            </div>
            
            {/* Options button */}
            <button 
              type="button"
              className="w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </footer>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Demo content area */}
      <main className={`
        transition-all duration-300 ease-out
        ${isExpanded ? 'ml-64' : 'ml-16'}
        ${isMobile ? 'ml-0' : ''}
        min-h-screen bg-slate-50 p-6
      `}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Welcome to Farmy's Ledger
            </h2>
            <p className="text-slate-600 mb-6">
              This is a responsive sidebar navigation system with proper alignment and modern design patterns.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <h3 className="font-semibold text-emerald-800 mb-2">Responsive Design</h3>
                <p className="text-sm text-emerald-700">
                  Adapts seamlessly to mobile, tablet, and desktop screens
                </p>
              </div>
              
              <<div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Modern UI</h3>
                <p className="text-sm text-blue-700">
                  Clean, modern design with smooth animations and transitions
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">Accessibility</h3>
                <p className="text-sm text-purple-700">
                  Built with proper focus management and keyboard navigation
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SideNav;
