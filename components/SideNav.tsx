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
          backdrop-blur-sm border will-change-transform select-none
          ${isActive 
            ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 border-blue-400/30 scale-[1.02]" 
            : "text-gray-700 hover:bg-white/80 hover:text-gray-900 hover:shadow-md hover:border-gray-200/60 border-transparent hover:scale-[1.01]"
          }
          active:scale-[0.98] group
        `}
      >
        {/* Active state indicator */}
        {isActive && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-indigo-500/10 to-purple-500/10 rounded-xl blur-sm" />
            <div className="absolute left-1 top-2 bottom-2 w-1 bg-white/80 rounded-full shadow-sm" />
          </>
        )}
        
        {/* Icon container */}
        <div className="relative flex items-center justify-center w-6 h-6 mr-3 flex-shrink-0">
          <div className={`
            transition-all duration-300 ease-out relative will-change-transform
            ${isActive 
              ? 'scale-110 drop-shadow-sm' 
              : 'group-hover:scale-110 group-hover:drop-shadow-sm'
            }
          `}>
            <div className="w-5 h-5">
              {icon}
            </div>
            {/* Glow effect for active state */}
            {isActive && (
              <div className="absolute inset-0 bg-white/20 rounded-lg blur-md -z-10" />
            )}
          </div>
          
          {/* Notification dot */}
          {hasNotification && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border border-white shadow-lg animate-pulse">
              <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
          
          {/* Badge */}
          {badge && (
            <div className="absolute -top-1 -right-1 min-w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center border border-white font-semibold shadow-lg">
              <span className="text-xs">{badge}</span>
            </div>
          )}
        </div>

        {/* Label */}
        <span 
          className={`
            font-semibold text-sm tracking-wide truncate transition-all duration-300 ease-out will-change-transform
            ${isExpanded 
              ? "opacity-100 translate-x-0 max-w-none" 
              : "opacity-0 translate-x-4 max-w-0 overflow-hidden"
            }
          `}
        >
          {label}
        </span>

        {/* Hover ripple effect */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-400/10 to-purple-500/10 rounded-xl
          transition-all duration-500 pointer-events-none
          ${!isActive ? 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100' : 'opacity-0'}
        `} />
      </div>

      {/* Tooltip */}
      {showTooltip && !isExpanded && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 animate-in slide-in-from-left-2 duration-200">
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
          w-10 h-10 backdrop-blur-xl border shadow-lg
          flex items-center justify-center transition-all duration-300 ease-out will-change-transform
          active:scale-90 hover:scale-105
          ${isMobileOpen 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400/50 text-white shadow-blue-500/25 rotate-90' 
            : 'bg-white/90 border-gray-200/50 text-gray-700 hover:text-gray-900 hover:bg-white hover:border-gray-300/50'
          }
          rounded-xl
        `}
      >
        <div className="relative w-4 h-4">
          {/* Animated hamburger/close icon */}
          <span className={`
            absolute top-1 left-0 w-4 h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center will-change-transform
            ${isMobileOpen ? 'rotate-45 top-1.5' : ''}
          `} />
          <span className={`
            absolute top-1.5 left-0 w-4 h-0.5 bg-current rounded-full
            transition-all duration-300 will-change-transform
            ${isMobileOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
          `} />
          <span className={`
            absolute top-2 left-0 w-4 h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center will-change-transform
            ${isMobileOpen ? '-rotate-45 top-1.5' : ''}
          `} />
        </div>
        
        {/* Glow effect when active */}
        {isMobileOpen && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-xl blur-xl -z-10 animate-pulse" />
        )}
      </button>

      {/* Sidebar */}
      <nav
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full flex flex-col z-40
          backdrop-blur-xl bg-white/90 border-r border-gray-200/50 shadow-xl shadow-gray-900/5
          transition-all duration-500 ease-out will-change-transform
          ${isExpanded ? 'w-64' : 'w-16'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/60 to-gray-100/40">
          <div className="flex items-center gap-3">
            <div className="relative group">
              {/* Logo container */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 border border-blue-400/20">
                {/* Logo - visible when collapsed */}
                <div className={`transition-all duration-300 will-change-transform ${isExpanded ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                  <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                    <path d="M12 16C12 16 8 18 8 22H16C16 18 12 16 12 16Z" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </div>
                {/* Crops icon when expanded */}
                <div className={`absolute transition-all duration-300 will-change-transform ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                  <div className="w-5 h-5 text-white drop-shadow-sm">
                    <CropsIcon />
                  </div>
                </div>
              </div>
            </div>
            <div className={`
              transition-all duration-500 ease-out will-change-transform
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
            `}>
              <h1 className="text-lg font-black bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent leading-tight">
                FARMY'S
              </h1>
              <p className="text-sm font-semibold text-gray-600 -mt-1">LEDGER</p>
            </div>
          </div>
          
          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className={`
              hidden lg:flex items-center justify-center w-8 h-8
              text-gray-500 hover:text-gray-700 rounded-lg
              hover:bg-gray-100/60 backdrop-blur-sm border border-transparent hover:border-gray-200/50
              transition-all duration-300 hover:scale-105 active:scale-95 will-change-transform
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
            `}
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 flex flex-col py-4 overflow-hidden">
          <ul className="flex-1 space-y-1 overflow-y-auto px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
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
          <div className="border-t border-gray-200/50 pt-3 mt-3">
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
          border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50
          ${isExpanded ? 'opacity-100' : 'opacity-0'}
          transition-all duration-300
        `}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-300">
              🚜
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">Farmer John</p>
              <p className="text-xs text-gray-600 truncate">farmer@farmyledger.com</p>
            </div>
            <button className="w-6 h-6 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center">
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <style jsx>{`
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.6);
          border-radius: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default SideNav;
