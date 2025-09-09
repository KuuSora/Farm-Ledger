// App.tsx - Updated to include Home component
import React from 'react';
import { FarmProvider } from './context/FarmContext';
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
import { useFarm } from './context/FarmContext';

const AppContent: React.FC = () => {
  const { viewState } = useFarm();

  const renderView = () => {
    switch (viewState.view) {
      case 'home':
        return <Home />;
      case 'dashboard':
        return <Dashboard />;
      case 'crops':
        return <Crops payload={viewState.payload} />;
      case 'transactions':
        return <Transactions type={viewState.type} payload={viewState.payload} />;
      case 'equipment':
        return <Equipment payload={viewState.payload} />;
      case 'farm-ai':
        return <FarmAI />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />; // Default to Home instead of Dashboard
    }
  };

  const isHomePage = viewState.view === 'home' || !viewState.view;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Only show navigation if not on home page */}
      {!isHomePage && <Navigation />}
      
      <main className={!isHomePage ? "ml-0 lg:ml-64 transition-all duration-300" : ""}>
        <div className={!isHomePage ? "p-6" : ""}>
          {renderView()}
        </div>
      </main>
      
      {/* Only show UI hint if not on home page */}
      {!isHomePage && <UIHint />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FarmProvider>
      <AppContent />
    </FarmProvider>
  );
};

export default App;
