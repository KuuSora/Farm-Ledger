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
          backdrop-blur-sm border will-change-transform
          ${isActive 
            ? "bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white shadow-xl shadow-green-500/30 border-green-400/50 transform scale-[1.02]" 
            : "text-green-700 hover:bg-green-50/80 hover:text-green-800 hover:shadow-lg hover:border-green-200/60 border-transparent hover:scale-[1.01]"
          }
          active:scale-[0.98] select-none group
        `}
      >
        {/* Glowing effect for active item */}
        {isActive && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-green-500/20 to-emerald-500/20 rounded-2xl blur-sm" />
            <div className="absolute left-1 top-2 bottom-2 w-1 bg-white/90 rounded-full" />
          </>
        )}
        
        {/* Icon container with enhanced styling */}
        <div className="relative flex items-center justify-center w-8 h-8 mr-3 flex-shrink-0">
          <div className={`
            transition-all duration-300 ease-out relative will-change-transform
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
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white shadow-lg animate-pulse">
              <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
          
          {/* Enhanced badge */}
          {badge && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-semibold shadow-lg">
              {badge}
            </div>
          )}
        </div>

        {/* Label with smooth animation */}
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

        {/* Ripple effect on hover */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-green-500/10 via-green-400/10 to-emerald-500/10 rounded-2xl
          transition-all duration-500 pointer-events-none
          ${!isActive ? 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100' : 'opacity-0'}
        `} />
      </div>

      {/* Tooltip */}
      {showTooltip && !isExpanded && (
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
          flex items-center justify-center transition-all duration-500 ease-out will-change-transform
          active:scale-90 hover:scale-105
          ${isMobileOpen 
            ? 'bg-gradient-to-br from-green-600 to-emerald-700 border-green-400/50 text-white shadow-green-500/25 rotate-90' 
            : 'bg-green-50/90 border-green-200/50 text-green-700 hover:text-green-800 hover:bg-green-50 hover:border-green-300/50'
          }
          rounded-2xl
        `}
      >
        <div className="relative w-6 h-6">
          {/* Animated hamburger/close icon */}
          <span className={`
            absolute top-1.5 left-0 w-6 h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center will-change-transform
            ${isMobileOpen ? 'rotate-45 top-3' : ''}
          `} />
          <span className={`
            absolute top-3 left-0 w-6 h-0.5 bg-current rounded-full
            transition-all duration-300 will-change-transform
            ${isMobileOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
          `} />
          <span className={`
            absolute top-4.5 left-0 w-6 h-0.5 bg-current rounded-full
            transition-all duration-300 origin-center will-change-transform
            ${isMobileOpen ? '-rotate-45 top-3' : ''}
          `} />
        </div>
        
        {/* Glow effect when active */}
        {isMobileOpen && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-2xl blur-xl -z-10 animate-pulse" />
        )}
      </button>

      {/* Enhanced sidebar with farm-themed design */}
      <nav
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full flex flex-col z-40
          backdrop-blur-2xl bg-gradient-to-b from-green-50/95 via-emerald-50/90 to-green-100/95
          border-r border-green-200/60 shadow-2xl shadow-green-900/10
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform
          ${isExpanded ? 'w-72' : 'w-20'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: `linear-gradient(180deg, 
            rgba(240, 253, 244, 0.95) 0%, 
            rgba(236, 253, 245, 0.90) 50%, 
            rgba(220, 252, 231, 0.95) 100%)`,
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Enhanced farm-themed header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-green-200/60 bg-gradient-to-r from-green-100/60 to-emerald-100/60">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {/* Farm logo container with enhanced styling */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-105 transition-transform duration-300 border border-green-400/20 will-change-transform">
                {/* Farm-themed logo - visible when collapsed */}
                <div className={`transition-all duration-300 will-change-transform ${isExpanded ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                  <svg className="w-7 h-7 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                    <path d="M12 16C12 16 8 18 8 22H16C16 18 12 16 12 16Z" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </div>
                {/* Crops icon when expanded */}
                <div className={`absolute transition-all duration-300 will-change-transform ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                  <CropsIcon className="w-7 h-7 text-white drop-shadow-sm" />
                </div>
              </div>
            </div>
            <div className={`
              transition-all duration-500 ease-out will-change-transform
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
            `}>
              <h1 className="text-xl font-black bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 bg-clip-text text-transparent leading-tight">
                FARMY'S
              </h1>
              <p className="text-sm font-semibold text-green-600 -mt-1">LEDGER</p>
            </div>
          </div>
          
          {/* Enhanced desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className={`
              hidden md:flex items-center justify-center w-10 h-10
              text-green-500 hover:text-green-700 rounded-xl
              hover:bg-green-100/60 backdrop-blur-sm border border-transparent hover:border-green-200/50
              transition-all duration-300 hover:scale-105 active:scale-95 will-change-transform
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
          <ul className="flex-1 space-y-2 overflow-y-auto px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
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
          <div className="border-t border-green-200/60 pt-4 mt-4">
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

        {/* Enhanced farm-themed user profile section */}
        <div className={`
          border-t border-green-200/60 p-5 bg-gradient-to-r from-green-100/60 to-emerald-100/60
          ${isExpanded ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-500
        `}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-2xl blur-md" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-green-500/25 border border-green-400/20">
                🚜
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-green-800 truncate">Farmer John</p>
              <p className="text-xs text-green-600 truncate">farmer@farmyledger.com</p>
            </div>
            <button className="w-8 h-8 text-green-500 hover:text-green-700 rounded-lg hover:bg-green-100/60 backdrop-blur-sm transition-all duration-300 flex items-center justify-center group">
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
          className="fixed inset-0 bg-gradient-to-br from-green-900/60 via-emerald-800/40 to-green-900/60 backdrop-blur-lg z-30 md:hidden"
          style={{ 
            animation: 'fadeIn 0.5s ease-out',
            WebkitBackdropFilter: 'blur(8px)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-in {
          animation: slideIn 0.2s ease-out;
        }
        
        .slide-in-from-left-2 {
          animation: slideInFromLeft 0.2s ease-out;
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInFromLeft {
          from { 
            opacity: 0;
            transform: translateX(-8px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Mobile viewport optimization */
        @media (max-width: 767px) {
          .transition-all {
            transition-duration: 0.25s;
          }
        }

        /* Hardware acceleration for smooth scrolling */
        .overflow-y-auto {
          overflow-scrolling: touch;
          -webkit-overflow-scrolling: touch;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: rgba(134, 239, 172, 0.8);
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Performance optimizations */
        .will-change-transform {
          will-change: transform;
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
