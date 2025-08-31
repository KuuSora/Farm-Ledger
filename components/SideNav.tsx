import React from 'react';
import { View, TransactionType } from '../types';
import { DashboardIcon, CropsIcon, IncomeIcon, ExpensesIcon, ReportsIcon, SettingsIcon, DocumentIcon, FarmAIIcon } from './icons';
import { useFarm } from '../context/FarmContext';

interface SideNavProps {}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <li
      onClick={onClick}
      className={`flex items-center p-3 my-1 text-lg rounded-r-lg cursor-pointer transition-colors duration-200 border-l-4 ${
        isActive
          ? 'border-primary bg-primary/10 text-primary-dark font-semibold'
          : 'border-transparent text-text-secondary hover:bg-primary/5 hover:text-text-primary'
      }`}
    >
      <div className="w-7 h-7 mr-4">{icon}</div>
      <span>{label}</span>
    </li>
  );
};

const SideNav: React.FC<SideNavProps> = () => {
  const { viewState, setViewState } = useFarm();

  const handleNav = (view: View, type?: TransactionType) => {
    setViewState({ view, type });
  };

  return (
    <nav className="w-64 h-screen bg-white p-4 shadow-lg flex flex-col no-print">
      <div className="flex items-center mb-10">
        <CropsIcon className="w-12 h-12 text-primary" />
        <h1 className="text-2xl font-bold ml-2 text-text-primary">Farm Ledger</h1>
      </div>
      <ul className="flex-grow">
        <NavItem
          label="Dashboard"
          icon={<DashboardIcon />}
          isActive={viewState.view === 'dashboard'}
          onClick={() => handleNav('dashboard')}
        />
        <NavItem
          label="Crops"
          icon={<CropsIcon />}
          isActive={viewState.view === 'crops'}
          onClick={() => handleNav('crops')}
        />
        <NavItem
          label="Income"
          icon={<IncomeIcon />}
          isActive={viewState.view === 'transactions' && viewState.type === TransactionType.INCOME}
          onClick={() => handleNav('transactions', TransactionType.INCOME)}
        />
        <NavItem
          label="Expenses"
          icon={<ExpensesIcon />}
          isActive={viewState.view === 'transactions' && viewState.type === TransactionType.EXPENSE}
          onClick={() => handleNav('transactions', TransactionType.EXPENSE)}
        />
        <NavItem
          label="Reports"
          icon={<ReportsIcon />}
          isActive={viewState.view === 'reports'}
          onClick={() => handleNav('reports')}
        />
         <NavItem
          label="Summary"
          icon={<DocumentIcon />}
          isActive={viewState.view === 'summary'}
          onClick={() => handleNav('summary')}
        />
        <NavItem
          label="Farm AI"
          icon={<FarmAIIcon />}
          isActive={viewState.view === 'farm-ai'}
          onClick={() => handleNav('farm-ai')}
        />
      </ul>
      <div className="mt-auto">
        <NavItem
          label="Settings"
          icon={<SettingsIcon />}
          isActive={viewState.view === 'settings'}
          onClick={() => handleNav('settings')}
        />
      </div>
    </nav>
  );
};

export default SideNav;