import React, { useEffect } from 'react';
import { View, TransactionType } from '../types';
import { DashboardIcon, CropsIcon, IncomeIcon, ExpensesIcon, ReportsIcon, SettingsIcon, DocumentIcon, FarmAIIcon, EquipmentIcon } from './icons';
import { useFarm } from '../context/FarmContext';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, onMouseEnter, onMouseLeave }) => {
  return (
    <li
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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

const SideNav: React.FC = () => {
  const { viewState, setViewState, triggerUIInteraction } = useFarm();

  useEffect(() => {
    const welcomeMessages: { [key: string]: string } = {
        dashboard: "This is your dashboard! Get a quick look at your farm's health. 🌿",
        crops: "Here are your crops! Track planting and harvests. 🌱",
        equipment: "Manage your tractors, combines, and other machinery here. 🚜",
        transactions: "Manage your finances here. Every entry helps! ✍️",
        reports: "Charts and graphs to visualize your progress. 📊",
        settings: "Customize your app settings here. ✨",
        summary: "Generate and print summaries for your records. 📄",
        'farm-ai': "Let's explore some AI tools together! 🤖",
    };
    const message = welcomeMessages[viewState.view];
    if (message) {
      triggerUIInteraction(message);
      const timer = setTimeout(() => {
        // Check if the user is hovering over something else before clearing
        triggerUIInteraction(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [viewState.view, triggerUIInteraction]);

  const handleNav = (view: View, type?: TransactionType) => {
    setViewState({ view, type });
  };

  const clearHint = () => triggerUIInteraction(null);

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
          onMouseEnter={() => triggerUIInteraction("View your farm's main overview.")}
          onMouseLeave={clearHint}
        />
        <NavItem
          label="Crops"
          icon={<CropsIcon />}
          isActive={viewState.view === 'crops'}
          onClick={() => handleNav('crops')}
          onMouseEnter={() => triggerUIInteraction("Manage all your crops and fields.")}
          onMouseLeave={clearHint}
        />
        <NavItem
          label="Equipment"
          icon={<EquipmentIcon />}
          isActive={viewState.view === 'equipment'}
          onClick={() => handleNav('equipment')}
          onMouseEnter={() => triggerUIInteraction("Track your machinery and maintenance.")}
          onMouseLeave={clearHint}
        />
        <NavItem
          label="Income"
          icon={<IncomeIcon />}
          isActive={viewState.view === 'transactions' && viewState.type === TransactionType.INCOME}
          onClick={() => handleNav('transactions', TransactionType.INCOME)}
          onMouseEnter={() => triggerUIInteraction("Log and view all income transactions.")}
          onMouseLeave={clearHint}
        />
        <NavItem
          label="Expenses"
          icon={<ExpensesIcon />}
          isActive={viewState.view === 'transactions' && viewState.type === TransactionType.EXPENSE}
          onClick={() => handleNav('transactions', TransactionType.EXPENSE)}
          onMouseEnter={() => triggerUIInteraction("Log and view all expense transactions.")}
          onMouseLeave={clearHint}
        />
        <NavItem
          label="Reports"
          icon={<ReportsIcon />}
          isActive={viewState.view === 'reports'}
          onClick={() => handleNav('reports')}
          onMouseEnter={() => triggerUIInteraction("Visualize your farm's data with charts.")}
          onMouseLeave={clearHint}
        />
         <NavItem
          label="Summary"
          icon={<DocumentIcon />}
          isActive={viewState.view === 'summary'}
          onClick={() => handleNav('summary')}
          onMouseEnter={() => triggerUIInteraction("Generate printable and downloadable summaries.")}
          onMouseLeave={clearHint}
        />
        <NavItem
          label="Farm AI"
          icon={<FarmAIIcon />}
          isActive={viewState.view === 'farm-ai'}
          onClick={() => handleNav('farm-ai')}
          onMouseEnter={() => triggerUIInteraction("Use powerful AI tools for your farm.")}
          onMouseLeave={clearHint}
        />
      </ul>
      <div className="mt-auto">
        <NavItem
          label="Settings"
          icon={<SettingsIcon />}
          isActive={viewState.view === 'settings'}
          onClick={() => handleNav('settings')}
          onMouseEnter={() => triggerUIInteraction("Configure the app and manage data.")}
          onMouseLeave={clearHint}
        />
      </div>
    </nav>
  );
};

export default SideNav;