import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import Markets from './views/Markets';
import Signals from './views/Signals';
import RiskManagement from './views/RiskManagement';
import Profile from './views/Profile';
import History from './views/History';
import { TradingProvider, useTradingContext } from './context/TradingContext';

const AppLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { alert } = useTradingContext();

  return (
    <HashRouter>
      <div className="flex h-screen bg-background font-sans">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Alert Notification */}
          {alert.visible && (
            <div className="absolute top-5 right-5 z-50 bg-success-alert text-white font-bold py-2 px-4 rounded-lg shadow-lg animate-fade-in-out">
              {alert.message}
            </div>
          )}

          <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/risk-management" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/risk-management" element={<RiskManagement />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/signals" element={<Signals />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}


const App: React.FC = () => {
  return (
    <TradingProvider>
      <AppLayout />
    </TradingProvider>
  );
};

export default App;