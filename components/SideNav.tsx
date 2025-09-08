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

      {/* Enhanced tooltip for collapsed state */}
      {showTooltip && !isExpanded && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 animate-in slide-in-from-left-2 duration-300">
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
      view: "hydroponics", 
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

  const isExpanded = isMobileOpen || (isHovered && !isCollapsed) || isCollapsed;

  return (
    <>
      {/* Enhanced mobile menu button */}
      <button
        onClick={toggleMobile}
        className={`
          fixed top-6 left-6 z-50 lg:hidden
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
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full flex flex-col z-40
          bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl shadow-slate-900/5
          transition-all duration-400 ease-out
          ${isExpanded ? 'w-72' : 'w-20'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
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
            onClick={toggleCollapse}
            className={`
              hidden lg:flex items-center justify-center w-8 h-8 ml-auto
              text-slate-400 hover:text-slate-600 rounded-xl
              hover:bg-slate-100/80 backdrop-blur-sm transition-all duration-300
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
              hover:scale-110 active:scale-95
            `}
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    onClick={() => handleNav(item.view as View, item.type as TransactionType)}
                    onMouseEnter={() => triggerUIInteraction(item.hint)}
                    onMouseLeave={clearHint}
                    hasNotification={item.hasNotification}
                    badge={item.badge}
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
                    onClick={() => handleNav(item.view as View, item.type as TransactionType)}
                    onMouseEnter={() => triggerUIInteraction(item.hint)}
                    onMouseLeave={clearHint}
                    hasNotification={item.hasNotification}
                    badge={item.badge}
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
                    onClick={() => handleNav(item.view as View, item.type as TransactionType)}
                    onMouseEnter={() => triggerUIInteraction(item.hint)}
                    onMouseLeave={clearHint}
                    hasNotification={item.hasNotification}
                    badge={item.badge}
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
                onClick={() => handleNav(settingsItem.view as View)}
                onMouseEnter={() => triggerUIInteraction(settingsItem.hint)}
                onMouseLeave={clearHint}
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
                🌾
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-0.5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">Farmer John</p>
              <p className="text-xs text-slate-500 truncate">Premium Account • Active</p>
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Custom styles */}
      <style jsx>{`
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

        /* Smooth scrolling */
        .overflow-y-auto {
          scroll-behavior: smooth;
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Focus styles for keyboard navigation */
        button:focus-visible {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default SideNav;
