
import React, { useState } from 'react';
import SideNav from './components/SideNav';
import Dashboard from './views/Dashboard';
import Crops from './views/Crops';
import Transactions from './views/Transactions';
import Reports from './views/Reports';
import Settings from './views/Settings';
import Summary from './views/Summary';
import FarmAI from './views/FarmAI';
import Equipment from './views/Equipment';
import Header from './components/Header';
import { View, TransactionType } from './types';
import { useFarm } from './context/FarmContext';
import FloatingAIChat from './components/FloatingAIChat';

const viewTitles: Record<View, string> = {
    'dashboard': 'Dashboard',
    'crops': 'Crops Management',
    'transactions': 'Transactions',
    'reports': 'Reports & Analytics',
    'settings': 'Settings',
    'summary': 'Summary & Export',
    'farm-ai': 'Farm AI Tools',
    'equipment': 'Hydroponic Machineries'
};

const App: React.FC = () => {
  const { viewState } = useFarm();
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);
  
  const getTitle = () => {
    const { view, type } = viewState;
    if (view === 'transactions') {
        return type === TransactionType.INCOME ? 'Income' : 'Expenses';
    }
    return viewTitles[view] || 'Dashboard';
  }

  const renderView = () => {
    const { view, payload, type } = viewState;
    // Use key prop to force remount on payload change, simplifying state management in views
    const key = type + (payload ? JSON.stringify(payload) : '');

    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'crops':
        return <Crops key={key} payload={payload} />;
      case 'transactions':
        return <Transactions key={key} defaultTransactionType={type || TransactionType.INCOME} payload={payload} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'summary':
        return <Summary />;
      case 'farm-ai':
        return <FarmAI />;
      case 'equipment':
        return <Equipment key={key} payload={payload} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="bg-background">
      <SideNav setIsExpanded={setIsSideNavExpanded} />
      <main className={`h-screen flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSideNavExpanded ? 'ml-64' : 'ml-20'}`}>
        <Header title={getTitle()} />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderView()}
        </div>
      </main>
      <FloatingAIChat />
    </div>
  );
};

export default App;
