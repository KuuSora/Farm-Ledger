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
    <li className="relative group">
      <div
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
          flex items-center h-12 px-3 mx-2 rounded-xl cursor-pointer
          transition-all duration-300 ease-out relative overflow-hidden
          ${isActive 
            ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 scale-[0.98]" 
            : "text-gray-600 hover:bg-gray-50 hover:text-primary hover:shadow-md"
          }
          active:scale-95 select-none
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 w-1 h-full bg-white rounded-r-full opacity-80" />
        )}
        
        {/* Icon container */}
        <div className="relative flex items-center justify-center w-7 h-7 mr-3 flex-shrink-0">
          <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
            {icon}
          </div>
          
          {/* Notification dot */}
          {hasNotification && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
          
          {/* Badge */}
          {badge && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-medium">
              {badge}
            </div>
          )}
        </div>

        {/* Label */}
        <span 
          className={`
            font-medium text-sm tracking-wide truncate transition-all duration-300
            ${isExpanded 
              ? "opacity-100 translate-x-0 max-w-none" 
              : "opacity-0 translate-x-2 max-w-0 overflow-hidden"
            }
          `}
        >
          {label}
        </span>

        {/* Hover effect */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl
          transition-opacity duration-300 pointer-events-none
          ${isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
        `} />
      </div>

      {/* Tooltip for collapsed state */}
      {showTooltip && !isExpanded && (
        <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 animate-in slide-in-from-left-2 duration-200">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-xl whitespace-nowrap">
            {label}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      )}
    </li>
  );
};

interface SideNavProps {
  setIsExpanded: (isExpanded: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ setIsExpanded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { viewState, setViewState, triggerUIInteraction } = useFarm();

  // Handle outside click for mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (isMobileOpen && window.innerWidth < 768) {
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
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768 && !isCollapsed) {
      setIsHovered(true);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768 && !isCollapsed) {
      setIsHovered(false);
      setIsExpanded(false);
    }
  };

  const handleNav = (view: View, type?: TransactionType) => {
    setViewState({ view, type });
    setIsMobileOpen(false);
  };

  const clearHint = () => triggerUIInteraction(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setIsExpanded(!isCollapsed);
    setIsHovered(false);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const navItems = [
    { 
      view: "dashboard", 
      label: "Dashboard", 
      icon: <DashboardIcon />, 
      hint: "Get a quick overview of your farm.",
      hasNotification: true
    },
    { 
      view: "crops", 
      label: "Crops", 
      icon: <CropsIcon />, 
      hint: "Manage your crops and fields." 
    },
    { 
      view: "equipment", 
      label: "Hydroponics", 
      icon: <HydroponicsIcon />, 
      hint: "Track your hydroponic machinery." 
    },
    { 
      view: "transactions", 
      type: TransactionType.INCOME, 
      label: "Income", 
      icon: <IncomeIcon />, 
      hint: "Log and view all income.",
      badge: "12"
    },
    { 
      view: "transactions", 
      type: TransactionType.EXPENSE, 
      label: "Expenses", 
      icon: <ExpensesIcon />, 
      hint: "Log and view all expenses." 
    },
    { 
      view: "reports", 
      label: "Reports", 
      icon: <ReportsIcon />, 
      hint: "Analyze your farm's performance." 
    },
    { 
      view: "summary", 
      label: "Summary", 
      icon: <DocumentIcon />, 
      hint: "Generate printable summaries." 
    },
    { 
      view: "farm-ai", 
      label: "Farm AI", 
      icon: <FarmAIIcon />, 
      hint: "Use AI-powered tools for your farm.",
      hasNotification: true
    },
  ];

  const settingsItem = {
    view: "settings",
    label: "Settings",
    icon: <SettingsIcon />,
    hint: "Configure your app settings.",
  };

  const isExpanded = isMobileOpen || (isHovered && !isCollapsed) || isCollapsed;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className={`
          fixed top-4 left-4 z-50 md:hidden
          w-12 h-12 bg-white border border-gray-200 rounded-xl shadow-lg
          flex items-center justify-center text-gray-600 hover:text-primary
          transition-all duration-300 hover:shadow-xl active:scale-95
          ${isMobileOpen ? 'bg-primary text-white' : ''}
        `}
      >
        <div className="relative w-5 h-5">
          <span className={`
            absolute top-1 left-0 w-5 h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center
            ${isMobileOpen ? 'rotate-45 top-2.5' : ''}
          `} />
          <span className={`
            absolute top-2.5 left-0 w-5 h-0.5 bg-current rounded-full
            transition-all duration-300
            ${isMobileOpen ? 'opacity-0' : ''}
          `} />
          <span className={`
            absolute top-4 left-0 w-5 h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center
            ${isMobileOpen ? '-rotate-45 top-2.5' : ''}
          `} />
        </div>
      </button>

      {/* Sidebar */}
      <nav
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full flex flex-col
          bg-white/80 backdrop-blur-xl border-r border-gray-200/50 
          shadow-2xl shadow-gray-900/10 z-40
          transition-all duration-500 ease-out
          ${isExpanded ? 'w-64' : 'w-16'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <CropsIcon className="w-8 h-8 text-primary drop-shadow-sm" />
              <div className="absolute -inset-1 bg-primary/20 rounded-lg blur opacity-30" />
            </div>
            <h1 className={`
              text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent
              transition-all duration-500
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
            `}>
              FARMY's LEDGER
            </h1>
          </div>
          
          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className={`
              hidden md:flex items-center justify-center w-8 h-8
              text-gray-400 hover:text-primary rounded-lg
              hover:bg-gray-100 transition-all duration-300
              ${isExpanded ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col py-4 overflow-hidden">
          <ul className="flex-1 space-y-1 overflow-y-auto scrollbar-none">
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
                onMouseEnter={() => triggerUIInteraction(item.hint)}
                onMouseLeave={clearHint}
                hasNotification={item.hasNotification}
                badge={item.badge}
              />
            ))}
          </ul>

          {/* Settings */}
          <div className="border-t border-gray-200/50 pt-4">
            <NavItem
              label={settingsItem.label}
              icon={settingsItem.icon}
              isExpanded={isExpanded}
              isActive={viewState.view === settingsItem.view}
              onClick={() => handleNav(settingsItem.view as View)}
              onMouseEnter={() => triggerUIInteraction(settingsItem.hint)}
              onMouseLeave={clearHint}
            />
          </div>
        </div>

        {/* User profile section */}
        <div className={`
          border-t border-gray-200/50 p-4
          ${isExpanded ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-500
        `}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
              F
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Farmer</p>
              <p className="text-xs text-gray-500 truncate">farmer@farmyledger.com</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default SideNav;
