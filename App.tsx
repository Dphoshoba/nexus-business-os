
import React, { useState } from 'react';
import { View } from './types';
import { Layout } from './components/ui/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { CRM } from './pages/CRM';
import { Bookings } from './pages/Bookings';
import { Automations } from './pages/Automations';
import { Assistant } from './pages/Assistant';
import { Payments } from './pages/Payments';
import { Settings } from './pages/Settings';
import { Funnels } from './pages/Funnels';
import { Help } from './pages/Help';
import { Documents } from './pages/Documents';
import { Projects } from './pages/Projects';
import { Analytics } from './pages/Analytics';
import { Inbox } from './pages/Inbox';
import { Storage } from './pages/Storage';
import { Marketplace } from './pages/Marketplace';
import { Strategy } from './pages/Strategy';
import { Social } from './pages/Social';
import { Team } from './pages/Team';
import { Canvas } from './pages/Canvas';
import { Campaigns } from './pages/Campaigns';
import { SmartScan } from './pages/SmartScan';
import { ClientPortal } from './pages/ClientPortal';
import { BlogAdmin } from './pages/BlogAdmin';
import { AuditLanding } from './pages/AuditLanding';
import { MarketIntel } from './pages/MarketIntel';
import { NotificationProvider } from './components/ui/NotificationSystem';
import { DataProvider } from './context/DataContext';
import { LanguageProvider } from './context/LanguageContext';

const AppContent: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'none' | 'team' | 'client'>('none');
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const handleLogin = (role: 'team' | 'client') => {
    setAuthStatus(role);
    setCurrentView(role === 'team' ? 'dashboard' : 'client_portal');
  };

  const handleLogout = () => {
    setAuthStatus('none');
    setCurrentView('dashboard');
  };

  const renderView = () => {
    if (authStatus === 'client') {
      return <ClientPortal onLogout={handleLogout} />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'crm':
        return <CRM />;
      case 'bookings':
        return <Bookings />;
      case 'automations':
        return <Automations />;
      case 'payments':
        return <Payments />;
      case 'funnels':
        return <Funnels />;
      case 'documents':
        return <Documents />;
      case 'projects':
        return <Projects />;
      case 'analytics':
        return <Analytics />;
      case 'inbox':
        return <Inbox />;
      case 'storage':
        return <Storage />;
      case 'marketplace':
        return <Marketplace />;
      case 'strategy':
        return <Strategy />;
      case 'social':
        return <Social />;
      case 'team':
        return <Team />;
      case 'canvas':
        return <Canvas />;
      case 'campaigns':
        return <Campaigns />;
      case 'scan':
        return <SmartScan />;
      case 'blog_admin':
        return <BlogAdmin />;
      case 'audit_landing':
        return <AuditLanding />;
      case 'market_intel':
        return <MarketIntel />;
      case 'settings':
        return <Settings />;
      case 'help':
        return <Help />;
      case 'assistant':
        return <Assistant />;
      default:
        return <Dashboard />;
    }
  };

  if (authStatus === 'none') {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
};

export default App;
