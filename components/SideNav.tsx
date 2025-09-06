import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, TransactionType } from "../types";
import { DashboardIcon, CropsIcon, IncomeIcon, ExpensesIcon, ReportsIcon, SettingsIcon, DocumentIcon, FarmAIIcon, HydroponicsIcon } from "./icons";
import { useFarm } from "../context/FarmContext";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
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

  const handleMouseEnter = useCallback(() => {
    onMouseEnter?.();
    if (!isExpanded && !isMobile) setShowTooltip(true);
  }, [onMouseEnter, isExpanded, isMobile]);

  const handleMouseLeave = useCallback(() => {
    onMouseLeave?.();
    setShowTooltip(false);
  }, [onMouseLeave]);

  return (
    <li className="relative group">
      <div
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          flex items-center h-10 sm:h-11 px-3 mx-2 rounded-lg sm:rounded-xl cursor-pointer
          transition-all duration-200 relative overflow-hidden
          ${isActive 
            ? "bg-green-600 text-white shadow-md border-green-500" 
            : "text-gray-700 hover:bg-green-50 hover:text-green-700 border-transparent hover:border-green-200"
          }
          active:scale-95 select-none group touch-manipulation min-h-[40px] border
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-1 top-2 bottom-2 w-1 bg-white rounded-full" />
        )}
        
        {/* Icon container */}
        <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0">
          <div className="transition-transform duration-200 group-hover:scale-110">
            {icon}
          </div>
          
          {/* Notification dot */}
          {hasNotification && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
          )}
          
          {/* Badge */}
          {badge && (
            <div className="absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border border-white font-medium px-1">
              <span className="text-[10px]">{badge}</span>
            </div>
          )}
        </div>

        {/* Label */}
        <span 
          className={`
            font-medium text-sm truncate transition-all duration-200
            ${isExpanded 
              ? "opacity-100 translate-x-0" 
              : "opacity-0 -translate-x-2 w-0 overflow-hidden"
            }
          `}
        >
          {label}
        </span>
      </div>

      {/* Tooltip for collapsed state */}
      {showTooltip && !isExpanded && !isMobile && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50">
          <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle clicks outside sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (isMobileOpen && isMobile) {
          setIsMobileOpen(false);
        }
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
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

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && !isCollapsed) {
      setIsHovered(true);
      setIsExpanded(true);
    }
  }, [isMobile, isCollapsed, setIsExpanded]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && !isCollapsed) {
      setIsHovered(false);
      setIsExpanded(false);
    }
  }, [isMobile, isCollapsed, setIsExpanded]);

  // Fast navigation without logging
  const handleNav = useCallback((view: View, type?: TransactionType) => {
    setViewState({ view, type });
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [setViewState, isMobile]);

  const clearHint = useCallback(() => triggerUIInteraction?.(null), [triggerUIInteraction]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const newCollapsed = !prev;
      setIsExpanded(newCollapsed);
      setIsHovered(false);
      return newCollapsed;
    });
  }, [setIsExpanded]);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen(prev => !prev);
  }, []);

  const navItems = [
    { 
      view: "dashboard", 
      label: "Dashboard", 
      icon: <DashboardIcon className="w-5 h-5" />, 
      hint: "Get a quick overview of your farm.",
      hasNotification: true
    },
    { 
      view: "crops", 
      label: "Crops", 
      icon: <CropsIcon className="w-5 h-5" />, 
      hint: "Manage your crops and fields." 
    },
    { 
      view: "hydroponics", 
      label: "Hydroponics", 
      icon: <HydroponicsIcon className="w-5 h-5" />, 
      hint: "Manage your hydroponic machineries." 
    },
    { 
      view: "transactions", 
      type: TransactionType.INCOME, 
      label: "Income", 
      icon: <IncomeIcon className="w-5 h-5" />, 
      hint: "Log and view all income.",
      badge: "12"
    },
    { 
      view: "transactions", 
      type: TransactionType.EXPENSE, 
      label: "Expenses", 
      icon: <ExpensesIcon className="w-5 h-5" />, 
      hint: "Log and view all expenses." 
    },
    { 
      view: "reports", 
      label: "Reports", 
      icon: <ReportsIcon className="w-5 h-5" />, 
      hint: "Analyze your farm's performance." 
    },
    { 
      view: "summary", 
      label: "Summary", 
      icon: <DocumentIcon className="w-5 h-5" />, 
      hint: "Generate printable summaries." 
    },
    { 
      view: "farm-ai", 
      label: "Farm AI", 
      icon: <FarmAIIcon className="w-5 h-5" />, 
      hint: "Use AI-powered tools for your farm.",
      hasNotification: true
    },
  ];

  const settingsItem = {
    view: "settings",
    label: "Settings",
    icon: <SettingsIcon className="w-5 h-5" />,
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
          w-11 h-11 backdrop-blur-sm border shadow-md
          flex items-center justify-center transition-all duration-200
          ${isMobileOpen 
            ? 'bg-green-600 border-green-500 text-white' 
            : 'bg-white/90 border-gray-200 text-gray-700 hover:text-green-600'
          }
          rounded-xl active:scale-95
        `}
        aria-label="Toggle menu"
      >
        <div className="relative w-5 h-5">
          <span className={`absolute top-1 left-0 w-5 h-0.5 bg-current rounded-full transition-all duration-200 ${isMobileOpen ? 'rotate-45 top-2' : ''}`} />
          <span className={`absolute top-2 left-0 w-5 h-0.5 bg-current rounded-full transition-all duration-200 ${isMobileOpen ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`absolute top-3 left-0 w-5 h-0.5 bg-current rounded-full transition-all duration-200 ${isMobileOpen ? '-rotate-45 top-2' : ''}`} />
        </div>
      </button>

      {/* Sidebar */}
      <nav
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full flex flex-col z-40
          bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-sm
          transition-all duration-300 ease-out
          ${isExpanded ? 'w-64' : 'w-16'}
          ${isMobileOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
              <CropsIcon className="w-5 h-5 text-white" />
            </div>
            <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-lg font-bold text-gray-900">FARMY'S</h1>
              <p className="text-xs font-medium text-green-600 -mt-1">LEDGER</p>
            </div>
          </div>
          
          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className={`
              hidden md:flex items-center justify-center w-8 h-8
              text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100
              transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <svg className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col py-4 overflow-hidden">
          <ul className="flex-1 space-y-1 overflow-y-auto px-1">
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
                onMouseEnter={() => triggerUIInteraction?.(item.hint)}
                onMouseLeave={clearHint}
                hasNotification={item.hasNotification}
                badge={item.badge}
                isMobile={isMobile}
              />
            ))}
          </ul>

          {/* Settings */}
          <div className="border-t border-gray-200 pt-4 px-1">
            <NavItem
              label={settingsItem.label}
              icon={settingsItem.icon}
              isExpanded={isExpanded}
              isActive={viewState.view === settingsItem.view}
              onClick={() => handleNav(settingsItem.view as View)}
              onMouseEnter={() => triggerUIInteraction?.(settingsItem.hint)}
              onMouseLeave={clearHint}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* User profile */}
        <div className={`border-t border-gray-200 p-4 bg-white/80 ${isExpanded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              F
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Farmer</p>
              <p className="text-xs text-gray-500 truncate">farmer@farmyledger.com</p>
            </div>
            <button className="w-7 h-7 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Dashboard content wrapper - this ensures your dashboard fits properly */}
      <div className={`
        transition-all duration-300 min-h-screen
        ${isMobile ? 'ml-0' : isExpanded ? 'ml-64' : 'ml-16'}
      `}>
        {/* Your dashboard content goes here and will automatically adjust */}
      </div>
    </>
  );
};

export default SideNav;
