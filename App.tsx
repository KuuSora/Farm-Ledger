import React from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import Crops from './views/Crops';
import Transactions from './views/Transactions';
import Equipment from './views/Equipment';
import FarmAI from './views/FarmAI';
import Reports from './views/Reports';
import Settings from './views/Settings';
import Navigation from './components/Navigation';
import UIHint from './components/UIHint';

const AppContent: React.FC = () => {
  const { viewState } = useFarm();

  const renderView = () => {
    switch (viewState?.view) {
      case 'home':
        return <Home />;
      case 'dashboard':
        return <Dashboard />;
      case 'crops':
        return <Crops payload={viewState.payload} />;
      case 'transactions':
        return (
          <Transactions
            type={viewState.payload?.type ?? 'default'}
            payload={viewState.payload}
          />
        );
      case 'equipment':
        return <Equipment payload={viewState.payload} />;
      case 'farm-ai':
        return <FarmAI />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  const isHomePage = !viewState?.view || viewState.view === 'home';

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Navigation only on non-home pages */}
      {!isHomePage && <Navigation />}

      <main
        className={
          !isHomePage
            ? 'ml-0 lg:ml-64 transition-all duration-300'
            : ''
        }
      >
        <div className={!isHomePage ? 'p-6' : ''}>{renderView()}</div>
      </main>

      {/* UI hint only on non-home pages */}
      {!isHomePage && <UIHint />}
    </div>
  );
};

const App: React.FC = () => (
  <FarmProvider>
    <AppContent />
  </FarmProvider>
);

export default App;
