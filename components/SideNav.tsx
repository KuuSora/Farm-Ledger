// @ts-nocheck
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
    <li className="relative">
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
          relative flex items-center h-11 px-3 mx-3 rounded-lg cursor-pointer group
          transition-all duration-200 ease-out
          ${isActive 
            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 ml-2 pl-4" 
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }
        `}
      >
        {/* Icon container */}
        <div className="relative flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
          <div className={`
            transition-all duration-200 ease-out
            ${isActive ? 'scale-110' : 'group-hover:scale-105'}
          `}>
            {icon}
          </div>
          
          {/* Notification dot */}
          {hasNotification && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white">
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
          
          {/* Badge */}
          {badge && (
            <div className="absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border border-white font-medium">
              <span className="text-xs">{badge}</span>
            </div>
          )}
        </div>

        {/* Label */}
        <span 
          className={`
            font-medium text-sm truncate transition-all duration-200 ease-out
            ${isExpanded 
              ? "opacity-100 translate-x-0" 
              : "opacity-0 translate-x-2 w-0 overflow-hidden"
            }
          `}
        >
          {label}
        </span>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute right-3 w-1.5 h-1.5 bg-blue-600 rounded-full" />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && !isExpanded && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg whitespace-nowrap">
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
        if (isMobileOpen && window.innerWidth < 1024) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024 && !isCollapsed) {
      setIsHovered(true);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024 && !isCollapsed) {
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
      view: "hydroponics", 
      label: "Hydroponics", 
      icon: <HydroponicsIcon />, 
      hint: "Advanced hydroponic system management and monitoring." 
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
          fixed top-4 left-4 z-50 lg:hidden
          w-12 h-12 backdrop-blur-sm shadow-lg
          flex items-center justify-center transition-all duration-300 ease-out
          ${isMobileOpen 
            ? 'bg-blue-600 text-white shadow-blue-500/25' 
            : 'bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
          }
          rounded-xl
        `}
      >
        <div className="relative w-5 h-5">
          <span className={`
            absolute top-1 left-0 w-5 h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center
            ${isMobileOpen ? 'rotate-45 top-2' : ''}
          `} />
          <span className={`
            absolute top-2 left-0 w-5 h-0.5 bg-current rounded-full
            transition-all duration-300
            ${isMobileOpen ? 'opacity-0' : 'opacity-100'}
          `} />
          <span className={`
            absolute top-3 left-0 w-5 h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center
            ${isMobileOpen ? '-rotate-45 top-2' : ''}
          `} />
        </div>
      </button>

      {/* Sidebar */}
      <nav
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full flex flex-col z-40
          bg-white border-r border-gray-200 shadow-sm
          transition-all duration-300 ease-out
          ${isExpanded ? 'w-64' : 'w-16'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                  <path d="M12 16C12 16 8 18 8 22H16C16 18 12 16 12 16Z" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </div>
            </div>
            <div className={`
              transition-all duration-300 ease-out
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
            `}>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                FARMY'S
              </h1>
              <p className="text-sm font-medium text-gray-500 -mt-1">LEDGER</p>
            </div>
          </div>
          
          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className={`
              hidden lg:flex items-center justify-center w-7 h-7
              text-gray-400 hover:text-gray-600 rounded-md
              hover:bg-gray-100 transition-all duration-200
              ${isExpanded ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <svg className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 flex flex-col py-4 overflow-hidden">
          <ul className="flex-1 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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

          {/* Settings section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
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
          border-t border-gray-200 p-4 bg-gray-50/50
          ${isExpanded ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-300
        `}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-semibold text-lg">
              🚜
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Farmer John</p>
              <p className="text-xs text-gray-500 truncate">farmer@farmyledger.com</p>
            </div>
            <button className="w-6 h-6 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default SideNav;
