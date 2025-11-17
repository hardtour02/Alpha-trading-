import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './views/Dashboard';
import RiskManagement from './views/RiskManagement';
import Profile from './views/Profile';
import History from './views/History';
import Signals from './views/Signals';
import { TradingProvider, useTradingContext } from './context/TradingContext';

// This component is isolated and only re-renders when the alert state changes.
const AlertNotifier: React.FC = () => {
  const { alert } = useTradingContext();
  const alertBgColor = alert.type === 'error' ? 'bg-risk-alert' : 'bg-success-alert';

  return (
    <>
      {alert.visible && (
        <div className={`fixed top-20 right-5 z-50 text-white font-bold py-2 px-4 rounded-lg shadow-lg animate-fade-in-out ${alertBgColor}`}>
          {alert.message}
        </div>
      )}
    </>
  );
};


// MainLayout is now stable and does not re-render due to context changes from other views.
const MainLayout: React.FC = () => {
  return (
    <div className="bg-background text-text font-sans min-h-screen lg:flex">
      <Navigation />
      
      <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <AlertNotifier />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <TradingProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/risk-management" element={<RiskManagement />} />
            <Route path="/signals" element={<Signals />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Routes>
      </TradingProvider>
    </HashRouter>
  );
};

export default App;