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
          flex items-center h-12 px-4 mx-3 rounded-2xl cursor-pointer
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden
          backdrop-blur-sm border
          ${isActive 
            ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-500/30 border-emerald-400/50 transform scale-[1.02]" 
            : "text-slate-600 hover:bg-white/60 hover:text-emerald-700 hover:shadow-lg hover:border-emerald-200/50 border-transparent hover:scale-[1.01]"
          }
          active:scale-[0.98] select-none group
        `}
      >
        {/* Glowing effect for active item */}
        {isActive && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-emerald-500/20 to-teal-500/20 rounded-2xl blur-sm" />
            <div className="absolute left-1 top-2 bottom-2 w-1 bg-white/80 rounded-full" />
          </>
        )}
        
        {/* Icon container with enhanced styling */}
        <div className="relative flex items-center justify-center w-8 h-8 mr-3 flex-shrink-0">
          <div className={`
            transition-all duration-300 ease-out relative
            ${isActive 
              ? 'scale-110 drop-shadow-sm' 
              : 'group-hover:scale-110 group-hover:drop-shadow-sm'
            }
          `}>
            {icon}
            {/* Subtle glow effect */}
            {(isActive || false) && (
              <div className="absolute inset-0 bg-white/30 rounded-lg blur-md -z-10" />
            )}
          </div>
          
          {/* Enhanced notification dot */}
          {hasNotification && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white shadow-lg animate-pulse">
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
          
          {/* Enhanced badge */}
          {badge && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-semibold shadow-lg">
              {badge}
            </div>
          )}
        </div>

        {/* Label with smooth animation */}
        <span 
          className={`
            font-semibold text-sm tracking-wide truncate transition-all duration-300 ease-out
            ${isExpanded 
              ? "opacity-100 translate-x-0 max-w-none" 
              : "opacity-0 translate-x-4 max-w-0 overflow-hidden"
            }
          `}
        >
          {label}
        </span>

        {/* Ripple effect on hover */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-400/10 to-teal-500/10 rounded-2xl
          transition-all duration-500 pointer-events-none
          ${!isActive ? 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100' : 'opacity-0'}
        `} />
      </div>

      {/* Enhanced tooltip */}
      {showTooltip && !isExpanded && (
        <div className="absolute left-20 top-1/2 -translate-y-1/2 z-50 animate-in slide-in-from-left-2 duration-200">
          <div className="bg-slate-900/95 backdrop-blur-xl text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl whitespace-nowrap border border-slate-700/50">
            {label}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-slate-900/95 rotate-45 border-l border-b border-slate-700/50" />
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
      {/* Enhanced mobile menu button */}
      <button
        onClick={toggleMobile}
        className={`
          fixed top-5 left-5 z-50 md:hidden
          w-14 h-14 backdrop-blur-xl border shadow-2xl
          flex items-center justify-center transition-all duration-500 ease-out
          active:scale-90 hover:scale-105
          ${isMobileOpen 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/50 text-white shadow-emerald-500/25 rotate-90' 
            : 'bg-white/90 border-slate-200/50 text-slate-600 hover:text-emerald-600 hover:bg-white hover:border-emerald-200/50'
          }
          rounded-2xl
        `}
      >
        <div className="relative w-6 h-6">
          {/* Animated hamburger/close icon */}
          <span className={`
            absolute top-1.5 left-0 w-6 h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center
            ${isMobileOpen ? 'rotate-45 top-3' : ''}
          `} />
          <span className={`
            absolute top-3 left-0 w-6 h-0.5 bg-current rounded-full
            transition-all duration-300
            ${isMobileOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
          `} />
          <span className={`
            absolute top-4.5 left-0 w-6 h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center
            ${isMobileOpen ? '-rotate-45 top-3' : ''}
          `} />
        </div>
        
        {/* Glow effect when active */}
        {isMobileOpen && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl -z-10 animate-pulse" />
        )}
      </button>

      {/* Enhanced sidebar */}
      <nav
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full flex flex-col z-40
          backdrop-blur-2xl bg-gradient-to-b from-white/95 via-slate-50/90 to-slate-100/95
          border-r border-slate-200/60 shadow-2xl shadow-slate-900/10
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isExpanded ? 'w-72' : 'w-20'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Enhanced header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-200/60 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
                <CropsIcon className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
            </div>
            <div className={`
              transition-all duration-500 ease-out
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
            `}>
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                FARMY'S
              </h1>
              <p className="text-sm font-semibold text-slate-500 -mt-1">LEDGER</p>
            </div>
          </div>
          
          {/* Enhanced desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className={`
              hidden md:flex items-center justify-center w-10 h-10
              text-slate-400 hover:text-emerald-600 rounded-xl
              hover:bg-white/60 backdrop-blur-sm border border-transparent hover:border-emerald-200/50
              transition-all duration-300 hover:scale-105 active:scale-95
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
            `}
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Enhanced navigation items */}
        <div className="flex-1 flex flex-col py-6 overflow-hidden">
          <ul className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent px-1">
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

          {/* Enhanced settings section */}
          <div className="border-t border-slate-200/60 pt-4 mt-4">
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

        {/* Enhanced user profile section */}
        <div className={`
          border-t border-slate-200/60 p-5 bg-gradient-to-r from-emerald-50/50 to-teal-50/50
          ${isExpanded ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-500
        `}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-md" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/25">
                F
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">Farmer</p>
              <p className="text-xs text-slate-500 truncate">farmer@farmyledger.com</p>
            </div>
            <button className="w-8 h-8 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-white/60 backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-lg z-30 md:hidden animate-in fade-in duration-500"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default SideNav;
