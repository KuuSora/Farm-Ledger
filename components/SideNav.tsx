import React, { useState, useEffect, useRef } from "react";
import { View, TransactionType } from "../types";
import { DashboardIcon, CropsIcon, IncomeIcon, ExpensesIcon, ReportsIcon, SettingsIcon, DocumentIcon, FarmAIIcon, HydroponicsIcon } from "./icons";
import { useFarm } from "../context/FarmContext";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasNotification?: boolean;
  badge?: string | number;
  isMobile?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  onClick,
  hasNotification = false,
  badge,
  isMobile = false
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center h-12 px-4 rounded-2xl cursor-pointer
        transition-all duration-300 ease-out relative overflow-hidden
        backdrop-blur-sm border will-change-transform group
        ${isMobile ? 'w-full' : 'min-w-12'}
        ${isActive 
          ? "bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white shadow-xl shadow-green-500/30 border-green-400/50 transform scale-[1.02]" 
          : "text-green-700 hover:bg-green-50/80 hover:text-green-800 hover:shadow-lg hover:border-green-200/60 border-transparent hover:scale-[1.01]"
        }
        active:scale-[0.98] select-none
      `}
    >
      {/* Glowing effect for active item */}
      {isActive && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-green-500/20 to-emerald-500/20 rounded-2xl blur-sm" />
          <div className="absolute left-1 top-2 bottom-2 w-1 bg-white/90 rounded-full" />
        </>
      )}
      
      {/* Icon container */}
      <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
        <div className={`
          transition-all duration-300 ease-out relative will-change-transform
          ${isActive 
            ? 'scale-110 drop-shadow-sm' 
            : 'group-hover:scale-110 group-hover:drop-shadow-sm'
          }
        `}>
          {icon}
        </div>
        
        {/* Notification dot */}
        {hasNotification && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white shadow-lg animate-pulse">
            <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75" />
          </div>
        )}
        
        {/* Badge */}
        {badge && (
          <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-semibold shadow-lg">
            {badge}
          </div>
        )}
      </div>

      {/* Label for mobile */}
      {isMobile && (
        <span className="ml-3 font-semibold text-sm tracking-wide truncate">
          {label}
        </span>
      )}

      {/* Tooltip for desktop */}
      {!isMobile && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-xl whitespace-nowrap">
            {label}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
          </div>
        </div>
      )}
    </button>
  );
};

interface TopNavProps {
  // No need for setIsExpanded since we're not expanding
}

const TopNav: React.FC<TopNavProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { viewState, setViewState, triggerUIInteraction } = useFarm();

  // Handle outside click for mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (view: View, type?: TransactionType) => {
    setViewState({ view, type });
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { 
      view: "dashboard", 
      label: "Dashboard", 
      icon: <DashboardIcon />, 
      hasNotification: true
    },
    { 
      view: "crops", 
      label: "Crops", 
      icon: <CropsIcon />
    },
    { 
      view: "equipment", 
      label: "Hydroponics", 
      icon: <HydroponicsIcon />
    },
    { 
      view: "transactions", 
      type: TransactionType.INCOME, 
      label: "Income", 
      icon: <IncomeIcon />, 
      badge: "12"
    },
    { 
      view: "transactions", 
      type: TransactionType.EXPENSE, 
      label: "Expenses", 
      icon: <ExpensesIcon />
    },
    { 
      view: "reports", 
      label: "Reports", 
      icon: <ReportsIcon />
    },
    { 
      view: "summary", 
      label: "Summary", 
      icon: <DocumentIcon />
    },
    { 
      view: "farm-ai", 
      label: "Farm AI", 
      icon: <FarmAIIcon />, 
      hasNotification: true
    },
  ];

  const settingsItem = {
    view: "settings",
    label: "Settings",
    icon: <SettingsIcon />
  };

  return (
    <header className="relative">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-green-50/95 via-emerald-50/90 to-green-100/95 backdrop-blur-xl border-b border-green-200/60 shadow-lg">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-105 transition-transform duration-300 border border-green-400/20">
                  <CropsIcon className="w-7 h-7 text-white drop-shadow-sm" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 bg-clip-text text-transparent leading-tight">
                  FARMY'S
                </h1>
                <p className="text-sm font-semibold text-green-600 -mt-1">LEDGER</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavItem
                  key={`${item.view}-${item.type || ''}`}
                  label={item.label}
                  icon={item.icon}
                  isActive={
                    viewState.view === item.view &&
                    (item.type ? viewState.type === item.type : true)
                  }
                  onClick={() => handleNav(item.view as View, item.type as TransactionType)}
                  hasNotification={item.hasNotification}
                  badge={item.badge}
                />
              ))}
              
              {/* Separator */}
              <div className="w-px h-8 bg-green-200/60 mx-2" />
              
              {/* Settings */}
              <NavItem
                label={settingsItem.label}
                icon={settingsItem.icon}
                isActive={viewState.view === settingsItem.view}
                onClick={() => handleNav(settingsItem.view as View)}
              />
            </div>

            {/* User Profile & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              {/* User Profile (Desktop) */}
              <div className="hidden md:flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-2xl blur-md" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-green-500/25 border border-green-400/20">
                    🚜
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-800">Farmer John</p>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-12 h-12 bg-green-50 hover:bg-green-100 border border-green-200/50 hover:border-green-300/50 text-green-700 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="relative w-6 h-6">
                  <span className={`
                    absolute top-1.5 left-0 w-6 h-0.5 bg-current rounded-full
                    transition-all duration-300 origin-center
                    ${isMobileMenuOpen ? 'rotate-45 top-3' : ''}
                  `} />
                  <span className={`
                    absolute top-3 left-0 w-6 h-0.5 bg-current rounded-full
                    transition-all duration-300
                    ${isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
                  `} />
                  <span className={`
                    absolute top-4.5 left-0 w-6 h-0.5 bg-current rounded-full
                    transition-all duration-300 origin-center
                    ${isMobileMenuOpen ? '-rotate-45 top-3' : ''}
                  `} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        ref={menuRef}
        className={`
          absolute top-full left-0 right-0 z-50 md:hidden
          bg-gradient-to-b from-green-50/98 to-emerald-50/95 backdrop-blur-xl
          border-b border-green-200/60 shadow-2xl
          transition-all duration-300 ease-out
          ${isMobileMenuOpen 
            ? 'opacity-100 translate-y-0 visible' 
            : 'opacity-0 -translate-y-4 invisible'
          }
        `}
      >
        <div className="p-4">
          {/* User Profile (Mobile) */}
          <div className="flex items-center gap-4 p-4 bg-green-100/60 rounded-2xl mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                🚜
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-800">Farmer John</p>
              <p className="text-xs text-green-600">farmer@farmyledger.com</p>
            </div>
          </div>

          {/* Mobile Navigation Items */}
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={`${item.view}-${item.type || ''}-mobile`}
                label={item.label}
                icon={item.icon}
                isActive={
                  viewState.view === item.view &&
                  (item.type ? viewState.type === item.type : true)
                }
                onClick={() => handleNav(item.view as View, item.type as TransactionType)}
                hasNotification={item.hasNotification}
                badge={item.badge}
                isMobile={true}
              />
            ))}
            
            {/* Separator */}
            <div className="h-px bg-green-200/60 my-4" />
            
            {/* Settings (Mobile) */}
            <NavItem
              label={settingsItem.label}
              icon={settingsItem.icon}
              isActive={viewState.view === settingsItem.view}
              onClick={() => handleNav(settingsItem.view as View)}
              isMobile={true}
            />
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default TopNav;
