import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Activity, Clock, CheckCircle2, ChevronDown, Zap, Sparkles, MessageSquare, Bell, LayoutGrid, Settings } from 'lucide-react';
import { Card, Badge, SectionHeader, Button } from '../components/ui/Primitives';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { AppModule } from '../types';

const StatCard = ({ title, value, change, trend, icon: Icon }: { title: string, value: string, change: string, trend: 'up' | 'down', icon: any }) => (
  <Card padding="p-5" className="animate-in fade-in zoom-in-95 duration-300 h-full">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 bg-surface-muted dark:bg-surface-muted-dark rounded-md border border-border/50 dark:border-border-dark/50">
        <Icon className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
      </div>
      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        trend === 'up' 
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30' 
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30'
      }`}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </span>
    </div>
    <div>
      <h3 className="text-text-secondary dark:text-text-secondary-dark text-sm font-medium tracking-wide uppercase">{title}</h3>
      <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mt-1 tracking-tight">{value}</p>
    </div>
  </Card>
);

const NexusPulse = ({ enabledModules }: { enabledModules: AppModule[] }) => {
    const { t } = useLanguage();
    const [events, setEvents] = useState([
        { id: 1, type: 'view', text: 'Anonymous user visiting Pricing Page', time: 'Just now' },
    ]);

    // Simulate Live Events based on enabled modules
    useEffect(() => {
        const interval = setInterval(() => {
            const possibleEvents = [
                { type: 'view', text: 'User visiting Pricing Page', module: 'analytics' },
                { type: 'view', text: 'Sarah opened "Proposal v2"', module: 'documents' },
            ];

            if (enabledModules.includes('payments')) {
                possibleEvents.push({ type: 'payment', text: 'Subscription renewed: TechStart Inc', module: 'payments' });
                possibleEvents.push({ type: 'payment', text: 'Received $1,200 from Globex', module: 'payments' });
            }
            if (enabledModules.includes('crm')) {
                possibleEvents.push({ type: 'lead', text: 'New Lead: John Wick (Continental)', module: 'crm' });
                possibleEvents.push({ type: 'lead', text: 'Deal moved to Negotiation', module: 'crm' });
            }
            if (enabledModules.includes('campaigns')) {
                possibleEvents.push({ type: 'email', text: 'Campaign "Q4 Promo" sent', module: 'campaigns' });
            }

            const randomEventTemplate = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            
            const newEvent = {
                id: Date.now(),
                type: randomEventTemplate.type,
                text: randomEventTemplate.text,
                time: 'Just now'
            };
            
            setEvents(prev => [newEvent, ...prev].slice(0, 6));
        }, 5000); 

        return () => clearInterval(interval);
    }, [enabledModules]);

    const getIcon = (type: string) => {
        switch(type) {
            case 'payment': return <DollarSign className="w-3 h-3 text-green-500" />;
            case 'lead': return <Users className="w-3 h-3 text-blue-500" />;
            case 'email': return <MessageSquare className="w-3 h-3 text-purple-500" />;
            default: return <Activity className="w-3 h-3 text-orange-500" />;
        }
    };

    return (
        <Card className="flex flex-col h-full bg-surface-subtle/50 dark:bg-surface-subtle-dark/50 border-dashed">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> {t('dashboard.pulse')}
                </h3>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
            </div>
            <div className="flex-1 space-y-4 overflow-hidden relative min-h-[150px]">
                {events.map((e, i) => (
                    <div key={e.id} className={`flex gap-3 items-start animate-in slide-in-from-top-2 fade-in duration-500`} style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="mt-1 w-6 h-6 rounded-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark flex items-center justify-center shrink-0 shadow-sm">
                            {getIcon(e.type)}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-primary dark:text-text-primary-dark">{e.text}</p>
                            <p className="text-[10px] text-text-tertiary">{e.time}</p>
                        </div>
                    </div>
                ))}
                {/* Fade out bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface to-transparent dark:from-surface-dark"></div>
            </div>
        </Card>
    );
};

export const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '1Y'>('7D');
  const { invoices, deals, appointments, userProfile, enabledModules } = useData();
  const { t } = useLanguage();

  const isModuleEnabled = (module: AppModule) => enabledModules.includes(module);

  // Calculate Real Revenue Data for Chart
  const chartData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayTotal = invoices
            .filter(inv => inv.status === 'Paid' && inv.date === dateString)
            .reduce((acc, inv) => acc + inv.amount, 0);
            
        data.push({ name: shortDay, fullDate: dateString, value: dayTotal });
    }
    return data;
  }, [invoices]);

  const stats = useMemo(() => {
    const totalRevenue = invoices
        .filter(i => i.status === 'Paid')
        .reduce((acc, i) => acc + i.amount, 0);
    
    const activeLeads = deals.filter(d => d.stage !== 'Closed').length;
    
    const wonDeals = deals.filter(d => d.stage === 'Closed');
    const totalDeals = deals.length;
    const conversionRate = totalDeals > 0 ? ((wonDeals.length / totalDeals) * 100).toFixed(1) : '0.0';

    const totalDealValue = deals.reduce((acc, d) => acc + d.value, 0);
    const avgDealSize = totalDeals > 0 ? totalDealValue / totalDeals : 0;

    return { 
        rev: `$${totalRevenue.toLocaleString()}`, 
        lead: activeLeads.toString(),
        conv: `${conversionRate}%`,
        avg: `$${avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    };
  }, [invoices, deals]);

  // If mostly everything is disabled, show a simpler view
  const showStats = isModuleEnabled('payments') || isModuleEnabled('crm') || isModuleEnabled('funnels');

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={t('dashboard.title')} 
        subtitle={`Good morning, ${userProfile.firstName}. ${t('dashboard.subtitle')}`}
        action={
          <div className="relative">
             <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark bg-white dark:bg-surface-dark border border-border dark:border-border-dark px-3 py-1.5 pr-8 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
             >
                 <option value="7D">Last 7 days</option>
                 <option value="30D">Last 30 days</option>
                 <option value="1Y">This Year</option>
             </select>
             <ChevronDown className="w-3 h-3 text-text-tertiary absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        }
      />

      {/* AI Executive Brief */}
      {isModuleEnabled('assistant') && (
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden mb-6 border border-indigo-700/50">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                  <Sparkles className="w-48 h-48 text-white animate-pulse" style={{ animationDuration: '4s' }} />
              </div>
              <div className="relative z-10 flex gap-6">
                  <div className="shrink-0 hidden sm:block">
                      <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                          <Sparkles className="w-7 h-7 text-indigo-200" />
                      </div>
                  </div>
                  <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {t('dashboard.ai_brief')}
                          <span className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">AI Generated</span>
                      </h3>
                      <p className="text-indigo-100 text-sm leading-relaxed max-w-3xl">
                          <strong>Revenue Alert:</strong> You are trending <span className="text-green-300 font-bold">+12.5%</span> above last week. 
                          Excellent work closing the <em>Acme Corp</em> deal. 
                          {isModuleEnabled('payments') && <><strong>Attention Needed:</strong> 2 invoices are overdue (Initech). </>}
                          {isModuleEnabled('crm') && <><strong>Suggestion:</strong> Schedule a follow-up call with <em>Sarah Connor</em>.</>}
                      </p>
                      <div className="pt-2 flex gap-3 flex-wrap">
                          {isModuleEnabled('payments') && (
                              <button className="text-xs bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg font-medium">View Overdue Invoices</button>
                          )}
                          {isModuleEnabled('crm') && (
                              <button className="text-xs bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg font-medium">Draft Email to Sarah</button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Dynamic Stat Cards */}
      {showStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isModuleEnabled('payments') && (
                <StatCard title={t('dashboard.revenue')} value={stats.rev} change="+12.5%" trend="up" icon={DollarSign} />
            )}
            {isModuleEnabled('crm') && (
                <StatCard title={t('dashboard.leads')} value={stats.lead} change="+4" trend="up" icon={Users} />
            )}
            {(isModuleEnabled('funnels') || isModuleEnabled('crm')) && (
                <StatCard title={t('dashboard.conversion')} value={stats.conv} change="-1.2%" trend="down" icon={Activity} />
            )}
            {isModuleEnabled('crm') && (
                <StatCard title={t('dashboard.avg_deal')} value={stats.avg} change="+8.2%" trend="up" icon={ArrowUpRight} />
            )}
          </div>
      ) : (
          <div className="p-6 border-2 border-dashed border-border dark:border-border-dark rounded-xl flex items-center justify-center text-text-tertiary bg-surface-subtle/30 dark:bg-surface-subtle-dark/30">
             <div className="text-center">
                 <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-50" />
                 <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Customize your Dashboard</p>
                 <p className="text-xs mt-1">Enable modules in Settings to see key metrics here.</p>
                 <Button variant="secondary" size="sm" className="mt-4" icon={Settings}>Go to Settings</Button>
             </div>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart */}
        {(isModuleEnabled('analytics') || isModuleEnabled('payments')) ? (
            <Card className="lg:col-span-3 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-text-primary dark:text-text-primary-dark">{t('dashboard.chart_title')}</h3>
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary-500"></span>
                  <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                      {t('dashboard.chart_subtitle')}
                  </span>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#8B5CF6', fontWeight: 600 }}
                      cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8B5CF6" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
        ) : (
            <Card className="lg:col-span-3 min-h-[400px] flex items-center justify-center text-center">
                <div className="text-text-tertiary">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Enable <strong>Analytics</strong> or <strong>Payments</strong> to view performance charts.</p>
                </div>
            </Card>
        )}

        {/* Right Column: Pulse & Appointments */}
        <div className="flex flex-col gap-6">
            <div className="flex-1 min-h-[200px]">
                <NexusPulse enabledModules={enabledModules} />
            </div>
            
            {isModuleEnabled('bookings') ? (
                <Card className="flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-text-primary dark:text-text-primary-dark">{t('dashboard.upcoming')}</h3>
                    <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700">{t('dashboard.view_all')}</button>
                  </div>
                  <div className="flex-1 space-y-3">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="group flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:bg-surface-muted dark:hover:bg-surface-muted-dark hover:border-border dark:hover:border-border-dark transition-all cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-100/50 dark:border-primary-800/30">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-medium text-text-primary dark:text-text-primary-dark truncate">{apt.clientName}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-text-secondary dark:text-text-secondary-dark">{apt.type}</span>
                            <span className="text-[10px] text-text-secondary dark:text-text-secondary-dark font-medium">{apt.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {appointments.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                         <CheckCircle2 className="w-8 h-8 text-text-tertiary mb-2" />
                         <p className="text-sm text-text-secondary dark:text-text-secondary-dark">No upcoming appointments</p>
                      </div>
                    )}
                  </div>
                </Card>
            ) : (
                <Card className="flex flex-col flex-1 items-center justify-center text-center p-6 text-text-tertiary min-h-[150px]">
                    <Clock className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs">Bookings module disabled.</p>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
};