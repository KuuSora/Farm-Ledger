import React, { useState, useEffect, useRef } from "react";
import { View, TransactionType } from "../types";
import { DashboardIcon, CropsIcon, IncomeIcon, ExpensesIcon, ReportsIcon, SettingsIcon, DocumentIcon, FarmAIIcon, HydroponicsIcon } from "./icons";
import { useFarm } from "../context/FarmContext";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  hasNotification?: boolean;
  badge?: string | number;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  isExpanded,
  onClick,
  hasNotification = false,
  badge
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => !isExpanded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          relative w-full flex items-center h-12 px-3 rounded-xl cursor-pointer
          transition-all duration-200 ease-out group overflow-hidden
          ${isActive 
            ? "bg-green-600 text-white shadow-lg shadow-green-600/25" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }
          active:scale-[0.98] select-none
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
        )}
        
        {/* Icon container - always visible */}
        <div className={`
          relative flex items-center justify-center w-8 h-8 flex-shrink-0
          ${isExpanded ? 'mr-3' : 'mx-auto'}
          transition-all duration-200
        `}>
          <div className={`
            transition-all duration-200 ease-out
            ${isActive ? 'scale-110' : 'group-hover:scale-105'}
          `}>
            {icon}
          </div>
          
          {/* Notification dot */}
          {hasNotification && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}
          
          {/* Badge */}
          {badge && (
            <div className="absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-medium leading-none">
              {badge}
            </div>
          )}
        </div>

        {/* Label - only visible when expanded */}
        <span className={`
          font-medium text-sm whitespace-nowrap transition-all duration-200
          ${isExpanded 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 translate-x-2 absolute"
          }
        `}>
          {label}
        </span>

        {/* Hover effect */}
        <div className={`
          absolute inset-0 bg-slate-50 rounded-xl transition-opacity duration-200 pointer-events-none -z-10
          ${!isActive && 'group-hover:opacity-100 opacity-0'}
        `} />
      </button>

      {/* Tooltip for collapsed state */}
      {showTooltip && !isExpanded && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none">
          <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-xl whitespace-nowrap">
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
          </div>
        </div>
      )}
    </div>
  );
};

interface SideNavProps {
  // Props can be added here if needed
}

const SideNav: React.FC<SideNavProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { viewState, setViewState } = useFarm();

  // Handle outside click for mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (isMobileOpen && window.innerWidth < 1024) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNav = (view: View, type?: TransactionType) => {
    setViewState({ view, type });
    setIsMobileOpen(false);
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) {
      setIsExpanded(false);
    }
  };

  const navItems = [
    { 
      view: "dashboard", 
      label: "Dashboard", 
      icon: <DashboardIcon className="w-5 h-5" />, 
      hasNotification: true
    },
    { 
      view: "crops", 
      label: "Crops", 
      icon: <CropsIcon className="w-5 h-5" />
    },
    { 
      view: "equipment", 
      label: "Hydroponics", 
      icon: <HydroponicsIcon className="w-5 h-5" />
    },
    { 
      view: "transactions", 
      type: TransactionType.INCOME, 
      label: "Income", 
      icon: <IncomeIcon className="w-5 h-5" />, 
      badge: "12"
    },
    { 
      view: "transactions", 
      type: TransactionType.EXPENSE, 
      label: "Expenses", 
      icon: <ExpensesIcon className="w-5 h-5" />
    },
    { 
      view: "reports", 
      label: "Reports", 
      icon: <ReportsIcon className="w-5 h-5" />
    },
    { 
      view: "summary", 
      label: "Summary", 
      icon: <DocumentIcon className="w-5 h-5" />
    },
    { 
      view: "farm-ai", 
      label: "Farm AI", 
      icon: <FarmAIIcon className="w-5 h-5" />, 
      hasNotification: true
    },
  ];

  const settingsItem = {
    view: "settings",
    label: "Settings",
    icon: <SettingsIcon className="w-5 h-5" />
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`
          fixed top-4 left-4 z-50 lg:hidden
          w-11 h-11 bg-white border border-slate-200 shadow-lg
          flex items-center justify-center transition-all duration-200
          hover:scale-105 active:scale-95 rounded-xl
          ${isMobileOpen ? 'text-green-600' : 'text-slate-600 hover:text-slate-900'}
        `}
      >
        <div className="relative w-5 h-5">
          <span className={`
            absolute top-1 left-0 w-5 h-0.5 bg-current rounded-full
            transition-all duration-200 origin-center
            ${isMobileOpen ? 'rotate-45 top-2.5' : ''}
          `} />
          <span className={`
            absolute top-2.5 left-0 w-5 h-0.5 bg-current rounded-full
            transition-all duration-200
            ${isMobileOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
          `} />
          <span className={`
            absolute top-4 left-0 w-5 h-0.5 bg-current rounded-full
            transition-all duration-200 origin-center
            ${isMobileOpen ? '-rotate-45 top-2.5' : ''}
          `} />
        </div>
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-slate-200 shadow-xl z-40
          flex flex-col transition-all duration-300 ease-out
          ${isExpanded ? 'w-64' : 'w-16'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`
          flex items-center h-16 px-4 border-b border-slate-200 bg-slate-50
          ${isExpanded ? 'justify-start' : 'justify-center'}
          transition-all duration-300
        `}>
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <CropsIcon className="w-5 h-5 text-white" />
            </div>
            
            {/* Brand name */}
            <div className={`
              transition-all duration-300
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'}
            `}>
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                FARMY'S
              </h1>
              <p className="text-xs font-medium text-green-600 -mt-0.5">LEDGER</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
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
                onClick={() => handleNav(item.view as View, item.type as TransactionType)}
                hasNotification={item.hasNotification}
                badge={item.badge}
              />
            ))}
          </div>
        </nav>

        {/* Settings */}
        <div className="px-3 py-4 border-t border-slate-200 bg-slate-50/50">
          <NavItem
            label={settingsItem.label}
            icon={settingsItem.icon}
            isExpanded={isExpanded}
            isActive={viewState.view === settingsItem.view}
            onClick={() => handleNav(settingsItem.view as View)}
          />
        </div>

        {/* User profile */}
        <div className={`
          p-4 border-t border-slate-200 bg-slate-50
          ${isExpanded ? 'block' : 'hidden'}
        `}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm flex-shrink-0">
              FJ
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Farmer John</p>
              <p className="text-xs text-slate-500 truncate">farmer@example.com</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Content spacer for desktop */}
      <div className={`
        hidden lg:block transition-all duration-300
        ${isExpanded ? 'w-64' : 'w-16'}
      `} />
    </>
  );
};

export default SideNav;
