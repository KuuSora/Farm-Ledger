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
  hasNotification?: boolean;
  badge?: string | number;
}

const NavItem = ({ icon, label, isActive, isExpanded, onClick, hasNotification = false, badge }) => (
  <li className="relative">
    <button
      onClick={onClick}
      className={`
        w-full flex items-center h-10 px-3 mx-2 rounded-lg cursor-pointer
        transition-all duration-200 relative
        ${isActive 
          ? "bg-green-600 text-white shadow-md" 
          : "text-gray-700 hover:bg-green-50 hover:text-green-700"
        }
        focus:outline-none focus:ring-2 focus:ring-green-500/50
      `}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-6 h-6 mr-3 flex-shrink-0 relative">
        {icon}
        
        {/* Notification dot */}
        {hasNotification && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
        )}
        
        {/* Badge */}
        {badge && (
          <div className="absolute -top-1 -right-2 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border border-white font-medium">
            {badge}
          </div>
        )}
      </div>

      {/* Label */}
      <span className={`
        font-medium text-sm truncate transition-all duration-200
        ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
      `}>
        {label}
      </span>
    </button>
  </li>
);

interface SideNavProps {
  setIsExpanded: (isExpanded: boolean) => void;
}

const SideNav = ({ setIsExpanded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const sidebarRef = useRef(null);
  const userMenuRef = useRef(null);
  const { viewState, setViewState } = useFarm();

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close sidebar on mobile
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 768) {
        setIsMobileOpen(false);
      }
      // Close user menu
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fast navigation handler - no logging
  const handleNav = useCallback((view, type) => {
    setViewState({ view, type });
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  }, [setViewState]);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen(prev => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  const navItems = [
    { view: "dashboard", label: "Dashboard", icon: <DashboardIcon className="w-5 h-5" />, hasNotification: true },
    { view: "crops", label: "Crops", icon: <CropsIcon className="w-5 h-5" /> },
    { view: "hydroponics", label: "Hydroponics", icon: <HydroponicsIcon className="w-5 h-5" /> },
    { view: "transactions", type: TransactionType.INCOME, label: "Income", icon: <IncomeIcon className="w-5 h-5" />, badge: "12" },
    { view: "transactions", type: TransactionType.EXPENSE, label: "Expenses", icon: <ExpensesIcon className="w-5 h-5" /> },
    { view: "reports", label: "Reports", icon: <ReportsIcon className="w-5 h-5" /> },
    { view: "summary", label: "Summary", icon: <DocumentIcon className="w-5 h-5" /> },
    { view: "farm-ai", label: "Farm AI", icon: <FarmAIIcon className="w-5 h-5" />, hasNotification: true },
  ];

  const isExpanded = isMobileOpen || isHovered;

  return (
    <>
      {/* Top Header with Menu Button and User Menu */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 flex items-center justify-between px-4">
        {/* Mobile menu button */}
        <button
          onClick={toggleMobile}
          className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <div className="relative w-5 h-5">
            <span className={`absolute top-1 left-0 w-5 h-0.5 bg-current rounded-full transition-all duration-200 ${isMobileOpen ? 'rotate-45 top-2' : ''}`} />
            <span className={`absolute top-2 left-0 w-5 h-0.5 bg-current rounded-full transition-all duration-200 ${isMobileOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute top-3 left-0 w-5 h-0.5 bg-current rounded-full transition-all duration-200 ${isMobileOpen ? '-rotate-45 top-2' : ''}`} />
          </div>
        </button>

        {/* Logo/Title */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <CropsIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-gray-900 hidden sm:block">FARMY'S LEDGER</h1>
        </div>

        {/* Right side with notifications and user menu */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <button className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5c-.3-.3-.3-.7 0-1l3.5-3.5h-5m-6 0H4l3.5 3.5c.3.3.3.7 0 1L4 17h5m6-10V7a3 3 0 00-6 0v0M9 21h6" />
            </svg>
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                F
              </div>
              <span className="hidden sm:block text-sm font-medium">Farmer</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <nav
        ref={sidebarRef}
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        className={`
          fixed top-14 left-0 h-[calc(100vh-3.5rem)] flex flex-col z-40
          bg-white border-r border-gray-200 shadow-sm
          transition-all duration-300 ease-out
          ${isExpanded ? 'w-64' : 'w-16'}
          ${isMobileOpen ? 'translate-x-0' : window.innerWidth < 768 ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Navigation items */}
        <div className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={`${item.view}-${item.type || ''}`}
                label={item.label}
                icon={item.icon}
                isExpanded={isExpanded}
                isActive={viewState.view === item.view && (item.type ? viewState.type === item.type : true)}
                onClick={() => handleNav(item.view, item.type)}
                hasNotification={item.hasNotification}
                badge={item.badge}
              />
            ))}
          </ul>

          {/* Settings at bottom */}
          <div className="border-t border-gray-200 mt-4 pt-4">
            <ul>
              <NavItem
                label="Settings"
                icon={<SettingsIcon className="w-5 h-5" />}
                isExpanded={isExpanded}
                isActive={viewState.view === "settings"}
                onClick={() => handleNav("settings")}
              />
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main content margin adjustment */}
      <div className={`transition-all duration-300 ${isExpanded ? 'md:ml-64' : 'md:ml-16'} mt-14`}>
        {/* This div ensures content doesn't overlap with sidebar */}
      </div>
    </>
  );
};

export default SideNav;
