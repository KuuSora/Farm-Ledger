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


// ✅ Define props and state properly for ErrorBoundary
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// FIXED: Error Boundary Component to catch rendering errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { viewState } = useFarm(); // must exist from FarmProvider

  // ✅ Safe view rendering
  const renderView = () => {
    if (!viewState) return <Home />; // fallback before context loads

    switch (viewState.view) {
      case 'home':
        return <Home />;
      case 'dashboard':
        return <Dashboard />;
      case 'crops':
        return <Crops payload={viewState.payload ?? null} />;
      case 'transactions':
        return (
          <Transactions
            type={viewState.payload?.type}
            payload={viewState.payload ?? null}
          />
        );
      case 'equipment':
        return <Equipment payload={viewState.payload ?? null} />;
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ✅ Only need 1 error boundary here */}
      {!isHomePage && (
        <ErrorBoundary>
          <Navigation />
        </ErrorBoundary>
      )}

      <main className={!isHomePage ? 'ml-0 lg:ml-64 transition-all duration-300' : ''}>
        <div className={!isHomePage ? 'p-6' : ''}>
          <ErrorBoundary>
            {renderView()}
          </ErrorBoundary>
        </div>
      </main>

      {!isHomePage && (
        <ErrorBoundary>
          <UIHint />
        </ErrorBoundary>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <FarmProvider>
        <AppContent />
      </FarmProvider>
    </ErrorBoundary>
  );
};

export default App;
