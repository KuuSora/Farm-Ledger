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
  isMobile?: boolean;
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
  badge,
  isMobile = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <li className="relative group">
      <div
        onClick={onClick}
        onMouseEnter={() => {
          onMouseEnter();
          if (!isExpanded && !isMobile) setShowTooltip(true);
        }}
        onMouseLeave={() => {
          onMouseLeave();
          setShowTooltip(false);
        }}
        className={`
          flex items-center h-11 sm:h-12 px-3 sm:px-4 mx-2 sm:mx-3 rounded-xl sm:rounded-2xl cursor-pointer
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden
          backdrop-blur-sm border
          ${isActive 
            ? "bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white shadow-lg sm:shadow-xl shadow-green-500/30 border-green-400/50 transform scale-[1.01] sm:scale-[1.02]" 
            : "text-green-700 hover:bg-green-50/80 hover:text-green-800 hover:shadow-md sm:hover:shadow-lg hover:border-green-200/60 border-transparent hover:scale-[1.01]"
          }
          active:scale-[0.98] select-none group touch-manipulation min-h-[44px]
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-green-500/20 to-emerald-500/20 rounded-xl sm:rounded-2xl blur-sm" />
            <div className="absolute left-1 top-2 bottom-2 w-0.5 sm:w-1 bg-white/90 rounded-full" />
          </>
        )}
        
         {/* Icon container */}
    <div className="relative flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 flex-shrink-0">
      <div className={`
        transition-all duration-300 ease-out relative
        ${isActive 
          ? 'scale-110 drop-shadow-sm' 
          : 'group-hover:scale-110 group-hover:drop-shadow-sm'
        }
      `}>
        <div className="w-5 h-5 sm:w-6 sm:h-6">
          {icon}
        </div>
      </div>
      
      {/* Notification dot - mobile optimized */}
      {hasNotification && (
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border border-white shadow-sm animate-pulse">
          <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75" />
        </div>
      )}
      
      {/* Badge - mobile optimized */}
      {badge && (
        <div className="absolute -top-0.5 -right-0.5 min-w-4 h-4 sm:min-w-5 sm:h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center border border-white font-semibold shadow-sm">
          <span className="text-[10px] sm:text-xs">{badge}</span>
        </div>
      )}
    </div>

    {/* Label with smooth animation */}
    <span 
      className={`
        font-semibold text-xs sm:text-sm tracking-wide truncate transition-all duration-300 ease-out flex-1
        ${isExpanded || isMobile
          ? "opacity-100 translate-x-0 max-w-none" 
          : "opacity-0 translate-x-4 max-w-0 overflow-hidden"
        }
      `}
    >
      {label}
    </span>

    {/* Hover effect */}
    <div className={`
      absolute inset-0 bg-gradient-to-r from-green-500/10 via-green-400/10 to-emerald-500/10 rounded-xl sm:rounded-2xl
      transition-all duration-500 pointer-events-none
      ${!isActive ? 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100' : 'opacity-0'}
    `} />
  </div>

  {/* Desktop tooltip */}
  {showTooltip && !isExpanded && !isMobile && (
    <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 animate-in slide-in-from-left-2 duration-200">
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-xl whitespace-nowrap">
        {label}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
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
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { viewState, setViewState, triggerUIInteraction } = useFarm();

  // Check if device is mobile
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
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (isMobileOpen && isMobile) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen, isMobile]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
  document.body.style.overflow = 'unset';
   };
  }, [isMobileOpen, isMobile]);

  const handleMouseEnter = () => {
    if (!isMobile && !isCollapsed) {
      setIsHovered(true);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isCollapsed) {
      setIsHovered(false);
      setIsExpanded(false);
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
      hint: "Manage your hydroponic machineries." 
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
      {/* Mobile menu button - improved touch target */}
      <button
        onClick={toggleMobile}
        className={`
          fixed top-3 left-3 z-50 md:hidden
          w-12 h-12 sm:w-14 sm:h-14 backdrop-blur-xl border shadow-lg
          flex items-center justify-center transition-all duration-500 ease-out
          active:scale-90 hover:scale-105 touch-manipulation
          ${isMobileOpen 
            ? 'bg-gradient-to-br from-green-600 to-emerald-700 border-green-400/50 text-white shadow-green-500/25' 
            : 'bg-green-50/90 border-green-200/50 text-green-700 hover:text-green-800 hover:bg-green-50 hover:border-green-300/50'
          }
          rounded-xl sm:rounded-2xl
        `}
        aria-label="Toggle navigation menu"
      >
        <div className="relative w-5 h-5 sm:w-6 sm:h-6">
          {/* Animated hamburger/close icon */}
          <span className={`
            absolute top-1 left-0 w-5 h-0.5 sm:w-6 sm:h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center
            ${isMobileOpen ? 'rotate-45 top-2 sm:top-2.5' : ''}
          `} />
          <span className={`
            absolute top-2 left-0 w-5 h-0.5 sm:top-2.5 sm:w-6 sm:h-0.5 bg-current rounded-full
            transition-all duration-300
            ${isMobileOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
          `} />
          <span className={`
            absolute top-3 left-0 w-5 h-0.5 sm:top-4 sm:w-6 sm:h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center
            ${isMobileOpen ? '-rotate-45 top-2 sm:top-2.5' : ''}
          `} />
        </div>
            {/* Active glow effect */}
    {isMobileOpen && (
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-xl sm:rounded-2xl blur-lg -z-10 animate-pulse" />
    )}
  </button>

  {/* Sidebar - mobile optimized */}
  <nav
    ref={sidebarRef}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    className={`
      fixed top-0 left-0 h-full flex flex-col z-40
      backdrop-blur-2xl bg-gradient-to-b from-green-50/95 via-emerald-50/90 to-green-100/95
      border-r border-green-200/60 shadow-xl sm:shadow-2xl shadow-green-900/10
      transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
      ${isExpanded ? 'w-64 sm:w-72' : 'w-16 sm:w-20'}
      ${isMobileOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'}
      safe-area-inset-left
    `}
    style={{
      background: `linear-gradient(180deg, 
        rgba(240, 253, 244, 0.95) 0%, 
        rgba(236, 253, 245, 0.90) 50%, 
        rgba(220, 252, 231, 0.95) 100%)`
    }}
  >
    {/* Header - mobile optimized */}
    <div className="flex items-center justify-between h-16 sm:h-20 px-3 sm:px-5 border-b border-green-200/60 bg-gradient-to-r from-green-100/60 to-emerald-100/60">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative group">
          {/* Farm logo - responsive sizing */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-xl sm:rounded-2xl blur-md sm:blur-lg group-hover:blur-xl transition-all duration-300" />
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg shadow-green-500/25 group-hover:scale-105 transition-transform duration-300 border border-green-400/20">
            {/* Logo transitions */}
            <div className={`transition-all duration-300 ${isExpanded || isMobile ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
              <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                <path d="M12 16C12 16 8 18 8 22H16C16 18 12 16 12 16Z" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </div>
            <div className={`absolute transition-all duration-300 ${isExpanded || isMobile ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
              <CropsIcon className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>
        
        {/* Brand text - responsive */}
        <div className={`
          transition-all duration-500 ease-out
          ${isExpanded || isMobile ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
        `}>
          <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 bg-clip-text text-transparent leading-tight">
            FARMY'S
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-green-600 -mt-1">LEDGER</p>
        </div>
      </div>
      
      {/* Desktop collapse button */}
      <button
        onClick={toggleCollapse}
        className={`
          hidden md:flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10
          text-green-500 hover:text-green-700 rounded-lg sm:rounded-xl
          hover:bg-green-100/60 backdrop-blur-sm border border-transparent hover:border-green-200/50
          transition-all duration-300 hover:scale-105 active:scale-95
          ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
        `}
      >
        <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    {/* Navigation items - mobile optimized */}
    <div className="flex-1 flex flex-col py-3 sm:py-6 overflow-hidden">
      <ul className="flex-1 space-y-1 sm:space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent px-1">
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
            isMobile={isMobile}
          />
        ))}
      </ul>

      {/* Settings section */}
      <div className="border-t border-green-200/60 pt-2 sm:pt-4 mt-2 sm:mt-4">
        <NavItem
          label={settingsItem.label}
          icon={settingsItem.icon}
          isExpanded={isExpanded}
          isActive={viewState.view === settingsItem.view}
          onClick={() => handleNav(settingsItem.view as View)}
          onMouseEnter={() => triggerUIInteraction(settingsItem.hint)}
          onMouseLeave={clearHint}
          isMobile={isMobile}
        />
      </div>
    </div>

    {/* User profile - mobile optimized */}
    <div className={`
      border-t border-green-200/60 p-3 sm:p-5 bg-gradient-to-r from-green-100/60 to-emerald-100/60
      ${isExpanded || isMobile ? 'opacity-100' : 'opacity-0'}
      transition-opacity duration-500
    `}>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-xl sm:rounded-2xl blur-sm sm:blur-md" />
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-base sm:text-lg shadow-md sm:shadow-lg shadow-green-500/25 border border-green-400/20">
            <span className="text-sm sm:text-lg">ðŸ‘¨â€ðŸŒ¾</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold text-green-800 truncate">Farmer</p>
          <p className="text-xs text-green-600 truncate">farmer@farmyledger.com</p>
        </div>
        <button className="w-7 h-7 sm:w-8 sm:h-8 text-green-500 hover:text-green-700 rounded-lg hover:bg-green-100/60 backdrop-blur-sm transition-all duration-300 flex items-center justify-center group touch-manipulation">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  </nav>

  {/* Mobile overlay - improved */}
  {isMobileOpen && isMobile && (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-green-900/50 via-emerald-800/30 to-green-900/50 backdrop-blur-sm z-30 animate-in fade-in duration-500"
      onClick={() => setIsMobileOpen(false)}
      aria-label="Close navigation menu"
    />
  )}
</>
                              
export default SideNav;
