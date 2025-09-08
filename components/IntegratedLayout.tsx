// IntegratedLayout.tsx
import React, { useState, useEffect } from 'react';
import SideNav from './SideNav';
import Dashboard from '../views/Dashboard';

interface IntegratedLayoutProps {
  children?: React.ReactNode; // optional, so Dashboard is default
}

const IntegratedLayout: React.FC<IntegratedLayoutProps> = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile, default to collapsed
      if (mobile) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40">
      {/* Sidebar Component */}
      <SideNav setIsExpanded={setSidebarExpanded} />
      
      {/* Main Content Area */}
      <div
        className={`
          flex-1 transition-all duration-400 ease-out
          ${!isMobile ? (sidebarExpanded ? 'ml-72' : 'ml-20') : 'ml-0'}
        `}
      >
        <div className="min-h-screen">
          <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-6 py-6 pt-20 md:pt-6">
            {/* If no children are passed, show Dashboard */}
            {children || <Dashboard />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedLayout;
