import React, { useState } from 'react';
import { View, TransactionType } from '../types';
import {
  DashboardIcon, CropsIcon, IncomeIcon, ExpensesIcon,
  ReportsIcon, SettingsIcon, DocumentIcon,
  FarmAIIcon, HydroponicsIcon
} from './icons';
import { useFarm } from '../context/FarmContext';

// Import icons from lucide-react
import { Menu, X } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
  isExpanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, onClick, isActive, isExpanded }) => (
  <li>
    <button
      onClick={onClick}
      className={`
        w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-200
        hover:bg-primary/10 hover:text-primary group relative
        ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:text-primary'}
      `}
    >
      <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
        {icon}
      </span>
      <span
        className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {label}
      </span>
      {!isExpanded && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
          {label}
        </div>
      )}
    </button>
  </li>
);

interface SideNavProps {
  setIsExpanded: (expanded: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ setIsExpanded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
    setIsMobileOpen(false); // auto-close on mobile
  };

  const clearHint = () => triggerUIInteraction(null);

  const navItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', view: 'dashboard' as View },
    { icon: <CropsIcon />, label: 'Crops', view: 'crops' as View },
    { icon: <IncomeIcon />, label: 'Income', view: 'transactions' as View, type: 'income' as TransactionType },
    { icon: <ExpensesIcon />, label: 'Expenses', view: 'transactions' as View, type: 'expense' as TransactionType },
    { icon: <ReportsIcon />, label: 'Reports', view: 'reports' as View },
    { icon: <DocumentIcon />, label: 'Documents', view: 'documents' as View },
    { icon: <FarmAIIcon />, label: 'Farm AI', view: 'farm-ai' as View },
    { icon: <HydroponicsIcon />, label: 'Hydroponics', view: 'hydroponics' as View },
  ];

  const settingsItem = { icon: <SettingsIcon />, label: 'Settings', view: 'settings' as View };

  return (
    <div className="relative">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <nav
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
          md:translate-x-0 ${isHovered ? 'md:w-64' : 'md:w-20'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-20 flex-shrink-0 border-b border-gray-200/80 px-4 overflow-hidden">
          <CropsIcon className="w-9 h-9 text-primary flex-shrink-0" />
          <span
            className={`ml-2 text-xl font-bold text-primary whitespace-nowrap transition-opacity duration-200 ${
              isHovered || isMobileOpen ? 'opacity-100' : 'opacity-0'
            }`}
          >
            FARMY's LEDGER
          </span>
        </div>

        {/* Nav Items */}
        <ul className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              onClick={() => {
                handleNav(item.view, item.type);
                clearHint();
              }}
              isActive={viewState.view === item.view && (!item.type || viewState.type === item.type)}
              isExpanded={isHovered || isMobileOpen}
            />
          ))}
        </ul>

        {/* Settings */}
        <div className="px-3 py-4 border-t border-gray-200/80">
          <NavItem
            label={settingsItem.label}
            icon={settingsItem.icon}
            onClick={() => {
              handleNav(settingsItem.view);
              clearHint();
            }}
            isActive={viewState.view === settingsItem.view}
            isExpanded={isHovered || isMobileOpen}
          />
        </div>
      </nav>
    </div>
  );
};

export default SideNav;
