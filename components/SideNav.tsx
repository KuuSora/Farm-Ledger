import React, { useState } from 'react';
import { View, TransactionType } from '../types';
import { DashboardIcon, CropsIcon, IncomeIcon, ExpensesIcon, ReportsIcon, SettingsIcon, DocumentIcon, FarmAIIcon, HydroponicsIcon } from './icons';
import { useFarm } from '../context/FarmContext';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  isExpanded,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <li
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center h-12 rounded-lg cursor-pointer transition-colors duration-200 group overflow-hidden ${
        isActive
          ? 'bg-primary text-white shadow-md'
          : 'text-text-secondary hover:bg-gray-100 hover:text-primary'
      }`}
    >
      <div className="w-6 h-6 mx-4 flex-shrink-0">{icon}</div>
      <span
        className={`whitespace-nowrap font-medium transition-all duration-300 ${
          isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
        }`}
      >
        {label}
      </span>
    </li>
  );
};

interface SideNavProps {
  setIsExpanded: (isExpanded: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ setIsExpanded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // ✅ drawer for mobile
  const { viewState, setViewState, triggerUIInteraction } = useFarm();

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      setIsHovered(true);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      setIsHovered(false);
      setIsExpanded(false);
    }
  };

  const handleNav = (view: View, type?: TransactionType) => {
    setViewState({ view, type });
    setIsMobileOpen(false); // ✅ close on mobile
  };

  const clearHint = () => triggerUIInteraction(null);

  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, hint: 'Get a quick overview of your farm.' },
    { view: 'crops', label: 'Crops', icon: <CropsIcon />, hint: 'Manage your crops and fields.' },
    { view: 'equipment', label: 'Hydroponics', icon: <HydroponicsIcon />, hint: 'Track your hydroponic machinery.' },
    { view: 'transactions', type: TransactionType.INCOME, label: 'Income', icon: <IncomeIcon />, hint: 'Log and view all income.' },
    { view: 'transactions', type: TransactionType.EXPENSE, label: 'Expenses', icon: <ExpensesIcon />, hint: 'Log and view all expenses.' },
    { view: 'reports', label: 'Reports', icon: <ReportsIcon />, hint: 'Analyze your farm\'s performance.' },
    { view: 'summary', label: 'Summary', icon: <DocumentIcon />, hint: 'Generate printable summaries.' },
    { view: 'farm-ai', label: 'Farm AI', icon: <FarmAIIcon />, hint: 'Use AI-powered tools for your farm.' },
  ];

  const settingsItem = {
    view: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    hint: 'Configure your app settings.',
  };

  return (
    <>
      {/* ✅ Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-lg shadow-lg focus:outline-none"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? '✖' : '☰'}
      </button>

      {/* ✅ Sidebar */}
      <nav
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 h-screen flex flex-col no-print z-40 bg-card/95 backdrop-blur-md border-r border-gray-200/80 shadow-lg transition-all duration-300 ease-in-out
        ${isHovered ? 'w-64' : 'w-20'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Logo / Header */}
        <div className="flex items-center h-20 flex-shrink-0 border-b border-gray-200/80 px-4 overflow-hidden">
          <CropsIcon className="w-9 h-9 text-primary flex-shrink-0" />
          <span
            className={`ml-2 text-xl font-bold text-primary whitespace-nowrap transition-all duration-300 ${
              isHovered || isMobileOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
          >
            FARMY's LEDGER
          </span>
        </div>

        {/* Navigation Items */}
        <ul className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              isExpanded={isHovered || isMobileOpen}
              isActive={
                viewState.view === item.view &&
                (item.type ? viewState.type === item.type : true)
              }
              onClick={() => handleNav(item.view as View, item.type as TransactionType)}
              onMouseEnter={() => triggerUIInteraction(item.hint)}
              onMouseLeave={clearHint}
            />
          ))}
        </ul>

        {/* Settings (bottom) */}
        <div className="px-3 py-4 border-t border-gray-200/80">
          <NavItem
            label={settingsItem.label}
            icon={settingsItem.icon}
            isExpanded={isHovered || isMobileOpen}
            isActive={viewState.view === settingsItem.view}
            onClick={() => handleNav(settingsItem.view as View)}
            onMouseEnter={() => triggerUIInteraction(settingsItem.hint)}
            onMouseLeave={clearHint}
          />
        </div>
      </nav>

      {/* ✅ Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default SideNav;
