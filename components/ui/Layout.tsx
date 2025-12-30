
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, AppModule } from '../../types';
import { 
  LayoutDashboard, Users, Calendar, Workflow, Bot, Settings, 
  Menu, Bell, Search, Plus, Command, CreditCard, Building2, 
  Filter, HelpCircle, LogOut, Check, FileText, Mail, Sun, 
  Moon, ChevronRight, ArrowRight, Briefcase, PieChart, 
  Inbox, HardDrive, Grid, Target, Megaphone, Smile, 
  PenTool, Send, ScanLine, X, Globe, Sparkles, 
  PanelLeftClose, PanelLeftOpen, ChevronLeft, BookOpen, SearchCode
} from 'lucide-react';
import { Button, Input, Badge } from './Primitives';
import { useNotifications } from './NotificationSystem';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { PricingModal } from './PricingModal';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick,
  collapsed
}: { 
  icon: React.ElementType; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  collapsed: boolean;
}) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`
      flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group relative
      ${collapsed ? 'w-10 justify-center' : 'w-full'}
      ${isActive 
        ? 'text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400' 
        : 'text-text-secondary dark:text-text-secondary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark'
      }
    `}
  >
    {isActive && (
      <div className={`absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-500 rounded-r-full ${collapsed ? '-left-2' : 'left-0'}`} />
    )}
    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-text-tertiary group-hover:text-text-secondary dark:text-text-tertiary-dark dark:group-hover:text-text-secondary-dark'}`} />
    {!collapsed && <span className="truncate">{label}</span>}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { notifications, unreadCount, markAllAsRead, addNotification } = useNotifications();
  const { theme, toggleTheme, deals, contacts, invoices, documents, projects, subscriptionPlan, enabledModules } = useData();
  const { t, language, setLanguage, dir } = useLanguage();

  const notificationRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setNotificationOpen(false);
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) setQuickActionOpen(false);
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) setLanguageMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCommandOpen(prev => !prev); }
      if (e.key === 'Escape' && commandOpen) setCommandOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); setIsCollapsed(prev => !prev); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandOpen]);

  useEffect(() => { if (commandOpen && searchInputRef.current) setTimeout(() => searchInputRef.current?.focus(), 50); }, [commandOpen]);

  // --- Real-time Index Search Logic ---
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return {
        deals: deals.filter(d => d.title.toLowerCase().includes(q) || d.company.toLowerCase().includes(q)).slice(0, 3),
        contacts: contacts.filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)).slice(0, 3),
        invoices: invoices.filter(i => i.id.toLowerCase().includes(q) || i.client.toLowerCase().includes(q)).slice(0, 3),
        documents: documents.filter(doc => doc.title.toLowerCase().includes(q)).slice(0, 3),
        projects: projects.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3)
    };
  }, [searchQuery, deals, contacts, invoices, documents, projects]);

  const handleNavClick = (view: View) => { setCurrentView(view); setMobileMenuOpen(false); };
  const handleQuickAction = (action: string, view: View) => { setQuickActionOpen(false); setCurrentView(view); addNotification({ title: 'Navigation', message: `Redirecting to ${action}...`, type: 'info' }); };
  const handleCommandSelect = (view: View) => { setCurrentView(view); setCommandOpen(false); setSearchQuery(''); };
  const isModuleEnabled = (module: AppModule) => enabledModules.includes(module);

  const LANGUAGES = [
      { code: 'en', label: 'English', flag: '🇺🇸' }, { code: 'es', label: 'Español', flag: '🇪🇸' }, { code: 'fr', label: 'Français', flag: '🇫🇷' }, { code: 'de', label: 'Deutsch', flag: '🇩🇪' }, { code: 'zh', label: '中文', flag: '🇨🇳' }, { code: 'ja', label: '日本語', flag: '🇯🇵' }, { code: 'ru', label: 'Русский', flag: '🇷🇺' }, { code: 'pt', label: 'Português', flag: '🇧🇷' }, { code: 'ar', label: 'العربية', flag: '🇸🇦' }, { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' }, { code: 'it', label: 'Italiano', flag: '🇮🇹' }, { code: 'ko', label: '한국어', flag: '🇰🇷' }, { code: 'tr', label: 'Türkçe', flag: '🇹🇷' }, { code: 'nl', label: 'Nederlands', flag: '🇳🇱' }, { code: 'pl', label: 'Polski', flag: '🇵🇱' }, { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' }, { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' }, { code: 'th', label: 'ไทย', flag: '🇹🇭' }, { code: 'sv', label: 'Svenska', flag: '🇸🇪' }, { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
  ];

  const SectionLabel = ({ label }: { label: string }) => (isCollapsed ? <div className="h-px w-6 bg-border dark:bg-border-dark mx-auto my-3" /> : <div className="px-3 mb-2 mt-6 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">{label}</div>);

  const growthModules = ['crm', 'funnels', 'campaigns', 'social', 'analytics'];
  const operationsModules = ['projects', 'team', 'payments', 'documents'];
  const intelligenceModules = ['scan', 'automations', 'canvas', 'strategy', 'assistant', 'marketplace', 'blog_admin', 'market_intel'];
  const hasVisibleModules = (modules: string[]) => modules.some(m => isModuleEnabled(m as AppModule));

  return (
    <div className="flex h-screen bg-surface-subtle dark:bg-surface-subtle-dark overflow-hidden font-sans text-text-primary dark:text-text-primary-dark" dir={dir}>
      <aside className={`fixed inset-y-0 left-0 z-[60] bg-surface dark:bg-surface-dark border-r border-border dark:border-border-dark transform transition-all duration-300 ease-in-out flex flex-col md:relative md:translate-x-0 ${isCollapsed ? 'w-[70px]' : 'w-64'} ${mobileMenuOpen ? 'translate-x-0 shadow-2xl w-64' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="h-full flex flex-col">
          <div className={`h-16 flex items-center border-b border-border dark:border-border-dark/50 justify-between ${isCollapsed ? 'px-2 justify-center' : 'px-6'}`}>
            <button className={`flex items-center gap-3 hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-lg p-1 transition-colors ${isCollapsed ? 'w-auto' : 'w-full -ml-1'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shrink-0">
                <Sun className="w-5 h-5 text-white fill-white" />
              </div>
              {!isCollapsed && (
                  <div className="flex-1 text-left rtl:text-right overflow-hidden">
                    <span className="block font-serif font-bold text-sm tracking-tight truncate">Echoes & Visions</span>
                    <span className="block text-[10px] text-text-tertiary truncate">{subscriptionPlan} Plan</span>
                  </div>
              )}
              {!isCollapsed && <Building2 className="w-3 h-3 text-text-tertiary rtl:rotate-180 shrink-0" />}
            </button>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-text-tertiary"><X className="w-5 h-5" /></button>
          </div>

          <div className={`flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar ${isCollapsed ? 'px-2' : 'px-3'}`}>
            <NavItem collapsed={isCollapsed} icon={LayoutDashboard} label={t('nav.dashboard')} isActive={currentView === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
            {isModuleEnabled('inbox') && <NavItem collapsed={isCollapsed} icon={Inbox} label={t('nav.inbox')} isActive={currentView === 'inbox'} onClick={() => handleNavClick('inbox')} />}
            {isModuleEnabled('bookings') && <NavItem collapsed={isCollapsed} icon={Calendar} label={t('nav.bookings')} isActive={currentView === 'bookings'} onClick={() => handleNavClick('bookings')} />}
            {isModuleEnabled('storage') && <NavItem collapsed={isCollapsed} icon={HardDrive} label={t('nav.drive')} isActive={currentView === 'storage'} onClick={() => handleNavClick('storage')} />}
            {hasVisibleModules(growthModules) && <SectionLabel label={t('nav.growth')} />}
            {isModuleEnabled('crm') && <NavItem collapsed={isCollapsed} icon={Users} label={t('nav.crm')} isActive={currentView === 'crm'} onClick={() => handleNavClick('crm')} />}
            {isModuleEnabled('funnels') && <NavItem collapsed={isCollapsed} icon={Filter} label={t('nav.funnels')} isActive={currentView === 'funnels'} onClick={() => handleNavClick('funnels')} />}
            {isModuleEnabled('campaigns') && <NavItem collapsed={isCollapsed} icon={Send} label={t('nav.campaigns')} isActive={currentView === 'campaigns'} onClick={() => handleNavClick('campaigns')} />}
            {isModuleEnabled('social') && <NavItem collapsed={isCollapsed} icon={Megaphone} label={t('nav.social')} isActive={currentView === 'social'} onClick={() => handleNavClick('social')} />}
            {isModuleEnabled('analytics') && <NavItem collapsed={isCollapsed} icon={PieChart} label={t('nav.analytics')} isActive={currentView === 'analytics'} onClick={() => handleNavClick('analytics')} />}
            {hasVisibleModules(operationsModules) && <SectionLabel label={t('nav.operations')} />}
            {isModuleEnabled('projects') && <NavItem collapsed={isCollapsed} icon={Briefcase} label={t('nav.projects')} isActive={currentView === 'projects'} onClick={() => handleNavClick('projects')} />}
            {isModuleEnabled('team') && <NavItem collapsed={isCollapsed} icon={Smile} label={t('nav.team')} isActive={currentView === 'team'} onClick={() => handleNavClick('team')} />}
            {isModuleEnabled('payments') && <NavItem collapsed={isCollapsed} icon={CreditCard} label={t('nav.payments')} isActive={currentView === 'payments'} onClick={() => handleNavClick('payments')} />}
            {isModuleEnabled('documents') && <NavItem collapsed={isCollapsed} icon={FileText} label={t('nav.documents')} isActive={currentView === 'documents'} onClick={() => handleNavClick('documents')} />}
            {hasVisibleModules(intelligenceModules) && <SectionLabel label={t('nav.intelligence')} />}
            {isModuleEnabled('scan') && <NavItem collapsed={isCollapsed} icon={ScanLine} label={t('nav.lens')} isActive={currentView === 'scan'} onClick={() => handleNavClick('scan')} />}
            {isModuleEnabled('automations') && <NavItem collapsed={isCollapsed} icon={Workflow} label={t('nav.automations')} isActive={currentView === 'automations'} onClick={() => handleNavClick('automations')} />}
            {isModuleEnabled('market_intel') && <NavItem collapsed={isCollapsed} icon={SearchCode} label={t('nav.market_intel')} isActive={currentView === 'market_intel'} onClick={() => handleNavClick('market_intel')} />}
            {isModuleEnabled('canvas') && <NavItem collapsed={isCollapsed} icon={PenTool} label={t('nav.canvas')} isActive={currentView === 'canvas'} onClick={() => handleNavClick('canvas')} />}
            {isModuleEnabled('strategy') && <NavItem collapsed={isCollapsed} icon={Target} label={t('nav.strategy')} isActive={currentView === 'strategy'} onClick={() => handleNavClick('strategy')} />}
            {isModuleEnabled('blog_admin') && <NavItem collapsed={isCollapsed} icon={BookOpen} label="Content" isActive={currentView === 'blog_admin'} onClick={() => handleNavClick('blog_admin')} />}
            {isModuleEnabled('assistant') && <NavItem collapsed={isCollapsed} icon={Bot} label={t('nav.assistant')} isActive={currentView === 'assistant'} onClick={() => handleNavClick('assistant')} />}
            {isModuleEnabled('marketplace') && <NavItem collapsed={isCollapsed} icon={Grid} label={t('nav.store')} isActive={currentView === 'marketplace'} onClick={() => handleNavClick('marketplace')} />}
          </div>

          <div className={`p-4 border-t border-border dark:border-border-dark/50 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
             {subscriptionPlan === 'Starter' && !isCollapsed && (<div className="mb-4 p-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white shadow-lg relative overflow-hidden group"><div className="relative z-10"><h4 className="font-bold text-sm mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Upgrade to Pro</h4><p className="text-[10px] opacity-90 mb-2">Unlock AI insights & unlimited automation.</p><button onClick={() => setPricingModalOpen(true)} className="w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors cursor-pointer">View Plans</button></div><Sparkles className="absolute -bottom-2 -right-2 w-12 h-12 opacity-20 rotate-12 group-hover:scale-110 transition-transform" /></div>)}
             {subscriptionPlan === 'Starter' && isCollapsed && (<button onClick={() => setPricingModalOpen(true)} className="mb-2 w-full flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"><Sparkles className="w-4 h-4" /></button>)}
             <button onClick={toggleTheme} className={`flex items-center gap-3 px-3 py-2 text-text-secondary dark:text-text-secondary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-md transition-colors text-sm font-medium mb-1 ${isCollapsed ? 'justify-center w-full' : 'w-full'}`} title="Toggle Theme">{theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}{!isCollapsed && t(theme === 'light' ? 'nav.mode_dark' : 'nav.mode_light')}</button>
            <NavItem collapsed={isCollapsed} icon={HelpCircle} label={t('nav.help')} isActive={currentView === 'help'} onClick={() => handleNavClick('help')} />
            <div className="pt-2"><div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-surface-muted dark:hover:bg-surface-muted-dark cursor-pointer transition-colors group ${currentView === 'settings' ? 'bg-surface-muted dark:bg-surface-muted-dark' : ''} ${isCollapsed ? 'justify-center' : ''}`} onClick={() => handleNavClick('settings')} title="Settings"><div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border border-white dark:border-gray-600 shadow-sm flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0">JD</div>{!isCollapsed && (<div className="flex-1 min-w-0 text-left rtl:text-right"><p className="text-sm font-medium truncate">Jane Doe</p><p className="text-xs text-text-tertiary truncate">Admin</p></div>)}{!isCollapsed && <Settings className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary" />}</div>{!isCollapsed && (<button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 mt-1 text-text-secondary dark:text-text-secondary-dark hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-sm font-medium"><LogOut className="w-4 h-4" />{t('nav.logout')}</button>)}</div>
            <div className="hidden md:flex justify-center pt-2 border-t border-border dark:border-border-dark/50 mt-2"><button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-md hover:bg-surface-muted dark:hover:bg-surface-muted-dark text-text-tertiary hover:text-text-secondary transition-colors">{isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}</button></div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border dark:border-border-dark flex items-center justify-between px-4 md:px-6 z-10 sticky top-0"><div className="flex items-center gap-4 flex-1"><button className="md:hidden text-text-secondary hover:text-text-primary p-2 -ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu className="w-6 h-6" /></button><div className="hidden md:block w-64"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary rtl:left-auto rtl:right-3" /><input type="text" placeholder={t('common.search')} className="w-full pl-9 pr-4 py-2 rtl:pr-9 rtl:pl-4 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 transition-all cursor-text" onClick={() => setCommandOpen(true)} readOnly /><div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none rtl:right-auto rtl:left-2"><span className="text-[10px] text-text-tertiary border border-border dark:border-border-dark rounded px-1.5 py-0.5 bg-surface dark:bg-surface-dark">⌘K</span></div></div></div></div><div className="flex items-center gap-2 md:gap-3"><Button variant="secondary" size="sm" icon={Command} className="hidden lg:flex text-xs" onClick={() => setCommandOpen(true)}><span className="font-normal">K</span></Button><div className="relative" ref={languageRef}><button className="p-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none flex items-center gap-1" onClick={() => setLanguageMenuOpen(!languageMenuOpen)}><Globe className="w-5 h-5" /><span className="text-xs font-medium uppercase hidden sm:inline">{language}</span></button>{languageMenuOpen && (<div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 rtl:left-0 rtl:right-auto max-h-[300px] overflow-y-auto custom-scrollbar"><div className="py-1">{LANGUAGES.map(lang => (<button key={lang.code} onClick={() => { setLanguage(lang.code as any); setLanguageMenuOpen(false); }} className={`w-full text-left rtl:text-right px-4 py-2 text-sm flex items-center gap-2 hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-colors ${language === lang.code ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/10' : 'text-text-primary dark:text-text-primary-dark'}`}><span>{lang.flag}</span><span>{lang.label}</span>{language === lang.code && <Check className="w-3.5 h-3.5 ml-auto text-primary-600" />}</button>))}</div></div>)}</div><div className="relative" ref={notificationRef}><button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none" onClick={() => setNotificationOpen(!notificationOpen)}><Bell className="w-5 h-5" />{unreadCount > 0 && (<span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>)}</button>{notificationOpen && (<div className="absolute right-0 mt-2 w-80 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 rtl:left-0 rtl:right-auto"><div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark bg-surface-subtle dark:bg-surface-subtle-dark"><h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">{t('common.notifications')}</h3><button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"><Check className="w-3 h-3" /> {t('common.mark_read')}</button></div><div className="max-h-80 overflow-y-auto">{notifications.length === 0 ? (<div className="p-8 text-center text-text-tertiary"><p className="text-xs">{t('common.no_notifications')}</p></div>) : (notifications.map((n) => (<div key={n.id} className={`p-4 border-b border-border/50 dark:border-border-dark/50 hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark transition-colors ${!n.read ? 'bg-primary-50/30 dark:bg-primary-900/20' : ''}`}><div className="flex items-start gap-3"><div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-primary-500'}`}></div><div><h4 className="text-xs font-semibold text-text-primary dark:text-text-primary-dark">{n.title}</h4><p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">{n.message}</p><span className="text-[10px] text-text-tertiary mt-2 block">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div></div></div>)))}</div></div>)}</div><div className="h-6 w-px bg-border dark:bg-border-dark mx-1 hidden md:block"></div><div className="relative" ref={quickActionRef}><Button size="sm" icon={Plus} className="hidden md:flex" onClick={() => setQuickActionOpen(!quickActionOpen)}>{t('common.create_new')}</Button><button className="md:hidden p-2 text-primary-600" onClick={() => setQuickActionOpen(!quickActionOpen)}><Plus className="w-6 h-6" /></button>{quickActionOpen && (<div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 rtl:left-0 rtl:right-auto"><div className="p-1">{isModuleEnabled('payments') && (<button onClick={() => handleQuickAction('New Invoice', 'payments')} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-lg transition-colors"><FileText className="w-4 h-4" /> New Invoice</button>)}{isModuleEnabled('crm') && (<button onClick={() => handleQuickAction('New Deal', 'crm')} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-lg transition-colors"><Users className="w-4 h-4" /> New Deal</button>)}{isModuleEnabled('bookings') && (<button onClick={() => handleQuickAction('New Appointment', 'bookings')} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-lg transition-colors"><Calendar className="w-4 h-4" /> New Appointment</button>)}{isModuleEnabled('projects') && (<button onClick={() => handleQuickAction('New Project', 'projects')} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-lg transition-colors"><Briefcase className="w-4 h-4" /> New Project</button>)}</div></div>)}</div></div></header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"><div className="max-w-7xl mx-auto h-full">{children}</div></main>
      </div>
      <PricingModal isOpen={pricingModalOpen} onClose={() => setPricingModalOpen(false)} />
      {commandOpen && (<div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4"><div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" onClick={() => setCommandOpen(false)} /><div className="relative w-full max-w-xl bg-surface dark:bg-surface-dark rounded-xl shadow-2xl border border-border dark:border-border-dark overflow-hidden animate-in zoom-in-95 duration-200"><div className="flex items-center gap-3 px-4 py-3 border-b border-border dark:border-border-dark"><Search className="w-5 h-5 text-text-tertiary" /><input ref={searchInputRef} type="text" placeholder="Type to search OS..." className="flex-1 bg-transparent text-lg text-text-primary dark:text-text-primary-dark placeholder:text-text-tertiary focus:outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><div className="flex items-center gap-1"><span className="text-[10px] bg-surface-muted dark:bg-surface-muted-dark text-text-secondary dark:text-text-secondary-dark px-1.5 py-0.5 rounded border border-border dark:border-border-dark">ESC</span></div></div><div className="max-h-[60vh] overflow-y-auto py-2">
      {searchQuery.length === 0 ? (<><div className="px-4 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Navigation</div><button onClick={() => handleCommandSelect('dashboard')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-text-secondary dark:text-text-secondary-dark hover:text-primary-700 dark:hover:text-primary-400 transition-colors"><LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}</button><button onClick={() => { setCommandOpen(false); setPricingModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-text-secondary dark:text-text-secondary-dark hover:text-primary-700 dark:hover:text-primary-400 transition-colors"><CreditCard className="w-4 h-4" /> Upgrade Plan</button></>) : (
          <div className="space-y-4">
              {searchResults?.deals.length! > 0 && (
                  <div>
                      <div className="px-4 py-1 text-[10px] font-bold text-text-tertiary uppercase tracking-widest bg-surface-subtle dark:bg-white/5">Pipeline</div>
                      {searchResults?.deals.map(d => (<button key={d.id} onClick={() => handleCommandSelect('crm')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"><Building2 className="w-4 h-4 text-primary-500" /><div className="text-left"><p className="text-sm font-medium">{d.title}</p><p className="text-[10px] text-text-tertiary">{d.company} • ${d.value.toLocaleString()}</p></div><Badge className="ml-auto text-[8px]">{d.stage}</Badge></button>))}
                  </div>
              )}
              {searchResults?.contacts.length! > 0 && (
                  <div>
                      <div className="px-4 py-1 text-[10px] font-bold text-text-tertiary uppercase tracking-widest bg-surface-subtle dark:bg-white/5">Contacts</div>
                      {searchResults?.contacts.map(c => (<button key={c.id} onClick={() => handleCommandSelect('crm')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"><Users className="w-4 h-4 text-blue-500" /><div className="text-left"><p className="text-sm font-medium">{c.name}</p><p className="text-[10px] text-text-tertiary">{c.role} @ {c.company}</p></div></button>))}
                  </div>
              )}
               {searchResults?.invoices.length! > 0 && (
                  <div>
                      <div className="px-4 py-1 text-[10px] font-bold text-text-tertiary uppercase tracking-widest bg-surface-subtle dark:bg-white/5">Finance</div>
                      {searchResults?.invoices.map(i => (<button key={i.id} onClick={() => handleCommandSelect('payments')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"><FileText className="w-4 h-4 text-emerald-500" /><div className="text-left"><p className="text-sm font-medium">{i.id}</p><p className="text-[10px] text-text-tertiary">{i.client} • ${i.amount.toLocaleString()}</p></div><Badge variant={i.status === 'Paid' ? 'success' : 'warning'} className="ml-auto text-[8px]">{i.status}</Badge></button>))}
                  </div>
              )}
              {(!searchResults?.deals.length && !searchResults?.contacts.length && !searchResults?.invoices.length) && (
                   <div className="p-8 text-center text-text-tertiary">
                       <SearchCode className="w-8 h-8 mx-auto mb-2 opacity-20" />
                       <p className="text-sm">No neural matches for "{searchQuery}"</p>
                   </div>
              )}
          </div>
      )}
      </div><div className="px-4 py-2 bg-surface-muted dark:bg-surface-muted-dark border-t border-border dark:border-border-dark flex items-center justify-between text-[10px] text-text-tertiary"><div className="flex gap-3"><span><strong className="font-medium text-text-secondary dark:text-text-secondary-dark">↑↓</strong> to navigate</span><span><strong className="font-medium text-text-secondary dark:text-text-secondary-dark">↵</strong> to select</span></div><span>Neural Index v1.2</span></div></div></div>)}
      {mobileMenuOpen && (<div className="fixed inset-0 bg-black/40 z-50 md:hidden backdrop-blur-sm animate-in fade-in" onClick={() => setMobileMenuOpen(false)} />)}
    </div>
  );
};
