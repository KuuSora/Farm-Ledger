import React from 'react';
import Dashboard from './views/Dashboard';
import Crops from './views/Crops';
import Transactions from './views/Transactions';
import Reports from './views/Reports';
import Settings from './views/Settings';
import Summary from './views/Summary';
import FarmAI from './views/FarmAI';
import Equipment from './views/Equipment';
import { View, TransactionType } from './types';
import { useFarm } from './context/FarmContext';
import IntegratedLayout from './components/IntegratedLayout';

const viewTitles: Record<View, string> = {
  dashboard: 'Dashboard',
  crops: 'Crops Management',
  transactions: 'Transactions',
  reports: 'Reports & Analytics',
  settings: 'Settings',
  summary: 'Summary & Export',
  'farm-ai': 'Farm AI Tools',
  equipment: 'Hydroponic Machineries',
};

const App: React.FC = () => {
  const { viewState } = useFarm();

  const renderView = () => {
    const { view, payload, type } = viewState;
    const key = type + (payload ? JSON.stringify(payload) : '');

    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'crops':
        return <Crops key={key} payload={payload} />;
      case 'transactions':
        return (
          <Transactions
            key={key}
            defaultTransactionType={type || TransactionType.INCOME}
            payload={payload}
          />
        );
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

  return <IntegratedLayout>{renderView()}</IntegratedLayout>;
};

export default App;
