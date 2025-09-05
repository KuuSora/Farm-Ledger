import React, { useState } from 'react';
import { View, TransactionType } from '../types';
import {
  DashboardIcon, CropsIcon, IncomeIcon, ExpensesIcon,
  ReportsIcon, SettingsIcon, DocumentIcon,
  FarmAIIcon, HydroponicsIcon, MenuIcon, XIcon
} from './icons';
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
  icon, label, isActive, isExpanded,
  onClick, onMouseEnter, onMouseLeave
}) => (
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
      className={`whitespace-nowrap font-medium transition-opacity duration-200 ${
        isExpanded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {label}
    </span>
  </li>
);

interface SideNavProps {
  setIsExpanded: (isExpanded: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ setIsExpanded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { viewState, setViewState, triggerUIInteraction } = useFarm();

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) { // only desktop
      setIsHovered(true);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) { // only desktop
      setIsHovered(false);
      setIsExpanded(false);
    }
  };

  const handleNav = (view: View, type?: TransactionType) => {
    setViewState({ view, type });
    setIsMobileOpen(false); // auto close drawer on mobile
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
  
  const settingsItem = { view: 'settings', label: 'Settings', icon: <SettingsIcon />, hint: 'Configure your app settings.' };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <XIcon /> : <MenuIcon />}
      </button>

      {/* Sidebar */}
      <nav
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 h-screen flex flex-col no-print z-40 bg-card border-r border-gray-200/80 shadow-sm transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
          md:translate-x-0 ${isHovered ? 'md:w-64' : 'md:w-20'}
        `}
      >
        <div className="flex items-center h-20 flex-shrink-0 border-b border-gray-200/80 px-4 overflow-hidden">
          <CropsIcon className="w-9 h-9 text-primary flex-shrink-0" />
          <span
            className={`ml-2 text-xl font-bold text-primary whitespace-nowrap transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            FARMY's LEDGER
          </span>
        </div>

        <ul className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              isExpanded={isHovered || isMobileOpen}
              isActive={viewState.view === item.view && (item.type ? viewState.type === item.type : true)}
              onClick={() => handleNav(item.view as View, item.type as TransactionType)}
              onMouseEnter={() => triggerUIInteraction(item.hint)}
              onMouseLeave={clearHint}
            />
          ))}
        </ul>

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
    </>
  );
};

export default SideNav;
    
