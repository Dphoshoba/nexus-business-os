
import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, Clock, Zap, Sparkles, Bell, Target, TrendingUp, Lightbulb, Loader2, ShieldCheck } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Primitives';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { AppModule } from '../types';
import { performQuickAnalysis } from '../services/gemini';

const StatCard = ({ title, value, change, trend, icon: Icon }: { title: string, value: string, change: string, trend: 'up' | 'down', icon: any }) => (
  <Card padding="p-5" className="animate-in fade-in zoom-in-95 duration-300 h-full hover:shadow-xl transition-all border-white/5 bg-surface/60 dark:bg-surface-dark/40 backdrop-blur-sm group">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 bg-surface-muted dark:bg-surface-muted-dark rounded-xl border border-border/50 dark:border-white/5 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-text-secondary dark:text-primary-400" />
      </div>
      <Badge variant={trend === 'up' ? 'success' : 'danger'} className="px-2 py-0.5 font-bold text-[10px]">
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
        {change}
      </Badge>
    </div>
    <div>
      <h3 className="text-text-tertiary text-[10px] font-bold tracking-[0.2em] uppercase">{title}</h3>
      <p className="text-3xl font-serif font-bold text-text-primary dark:text-white mt-1 tracking-tight">{value}</p>
    </div>
  </Card>
);

const EchoesPulse = ({ enabledModules }: { enabledModules: AppModule[] }) => {
    const [events, setEvents] = useState([
        { id: 1, type: 'view', text: 'Strategic Lead viewing Pricing', time: 'Just now' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const possibleEvents = [
                { type: 'view', text: 'Anonymous user on landing page', module: 'analytics' },
                { type: 'view', text: 'Agreement signed by Nexus Corp', module: 'documents' },
            ];
            if (enabledModules.includes('payments')) possibleEvents.push({ type: 'payment', text: 'Received $2,400 from Wayne Ent', module: 'payments' });
            if (enabledModules.includes('crm')) possibleEvents.push({ type: 'lead', text: 'New Target identified: Cyberdyne', module: 'crm' });
            
            const rand = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            setEvents(prev => [{ id: Date.now(), ...rand, time: 'Just now' }, ...prev].slice(0, 6));
        }, 6000); 
        return () => clearInterval(interval);
    }, [enabledModules]);

    const getIcon = (type: string) => {
        switch(type) {
            case 'payment': return <DollarSign className="w-3 h-3 text-emerald-500" />;
            case 'lead': return <Target className="w-3 h-3 text-sky-500" />;
            default: return <Activity className="w-3 h-3 text-primary-500" />;
        }
    };

    return (
        <Card className="flex flex-col h-full bg-surface-subtle/50 dark:bg-black/20 border-dashed border-primary-500/20">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.3em] flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-primary-500 animate-pulse" /> Live Transmission
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> SYNCED
                </div>
            </div>
            <div className="flex-1 space-y-5 overflow-hidden relative">
                {events.map((e, i) => (
                    <div key={e.id} className="flex gap-4 items-start animate-in slide-in-from-top-4 fade-in duration-700" style={{ animationDelay: `${i * 150}ms` }}>
                        <div className="mt-1 w-7 h-7 rounded-lg bg-surface dark:bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                            {getIcon(e.type)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-text-primary dark:text-gray-200 truncate">{e.text}</p>
                            <p className="text-[9px] text-text-tertiary font-medium uppercase tracking-widest mt-0.5">{e.time}</p>
                        </div>
                    </div>
                ))}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-subtle/50 dark:from-black/40 to-transparent pointer-events-none" />
            </div>
        </Card>
    );
};

export const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '1Y'>('7D');
  const { invoices, deals, appointments, userProfile, enabledModules } = useData();
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
      const runInitialBriefing = async () => {
          setIsAnalyzing(true);
          const snapshot = JSON.stringify({
              deals: deals.slice(0, 3),
              overdue: invoices.filter(i => i.status === 'Overdue'),
              upcoming: appointments.slice(0, 2)
          });
          const brief = await performQuickAnalysis(snapshot);
          setAiAnalysis(brief);
          setIsAnalyzing(false);
      };
      runInitialBriefing();
  }, [deals, invoices, appointments]);

  const chartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const val = invoices.filter(inv => inv.status === 'Paid' && inv.date === dateString).reduce((acc, inv) => acc + inv.amount, 0);
        return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), value: val || Math.floor(Math.random() * 2000) + 1000 };
    });
  }, [invoices]);

  const stats = useMemo(() => ({
      rev: `$${(invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0) || 45200).toLocaleString()}`,
      lead: (deals.filter(d => d.stage !== 'Closed').length || 24).toString(),
      conv: '12.4%',
      avg: '$8,400'
  }), [invoices, deals]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
              <h1 className="text-4xl font-serif font-bold text-text-primary dark:text-white tracking-tight">Mission Control</h1>
              <p className="text-text-secondary dark:text-text-tertiary mt-1 font-medium">Welcome back, {userProfile.firstName}. Your operation is currently <span className="text-emerald-500 font-bold">Stable</span>.</p>
          </div>
          <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={ShieldCheck} className="text-[10px] uppercase font-bold tracking-widest bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30">System Audit: OK</Button>
              <Button variant="secondary" size="sm" icon={Bell} className="relative">
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-600 rounded-full border-2 border-surface" />
              </Button>
          </div>
      </div>

      {/* Visionary Intelligence Briefing */}
      {enabledModules.includes('assistant') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-indigo-600/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <Card className="relative h-full border-white/5 bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 text-white shadow-2xl overflow-hidden rounded-[2rem]">
                      <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-6 transition-transform">
                          <Sparkles className="w-64 h-64 text-white" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full">
                          <div className="flex items-center gap-4 mb-10">
                              <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                                  <TrendingUp className="w-7 h-7 text-indigo-300" />
                              </div>
                              <div>
                                  <Badge className="bg-primary-500 text-white border-none text-[10px] font-bold px-2.5 mb-1.5">PROACTIVE VISION</Badge>
                                  <h2 className="text-2xl font-serif font-bold tracking-tight">Intelligence Briefing</h2>
                              </div>
                          </div>
                          <div className="space-y-6 flex-1 max-w-2xl">
                              {isAnalyzing ? (
                                  <div className="flex items-center gap-3 text-indigo-200/50">
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                      <span className="animate-pulse">Synthesizing neural snapshot...</span>
                                  </div>
                              ) : (
                                  <p className="text-indigo-100 text-lg leading-relaxed font-medium animate-in fade-in duration-500">
                                      "{aiAnalysis}"
                                  </p>
                              )}
                              <div className="flex flex-wrap gap-4 pt-4">
                                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-950 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-xl">
                                      Generate Action Items <ArrowUpRight className="w-4 h-4" />
                                  </button>
                                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold text-sm transition-all border border-white/10">
                                      View Deep Analytics
                                  </button>
                              </div>
                          </div>
                          <div className="mt-12 flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-300/60">
                              <span className="flex items-center gap-2"><Lightbulb className="w-3.5 h-3.5" /> Context Resolved</span>
                              <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Next Insight in 4h</span>
                          </div>
                      </div>
                  </Card>
              </div>

              <div className="space-y-6 flex flex-col h-full">
                  <StatCard title="Capital Inflow" value={stats.rev} change="+12.8%" trend="up" icon={DollarSign} />
                  <StatCard title="Strategic Pipeline" value={stats.lead} change="+4 Leads" trend="up" icon={Target} />
                  <StatCard title="Network Yield" value={stats.conv} change="-0.8%" trend="down" icon={Activity} />
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 min-h-[450px] bg-white/80 dark:bg-surface-dark/40 backdrop-blur-md border-white/5">
          <div className="flex items-center justify-between mb-10">
            <div>
                <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-[0.2em] mb-1">Neural Performance</h3>
                <h2 className="text-xl font-serif font-bold dark:text-white">Revenue Ecosystem</h2>
            </div>
            <div className="flex bg-surface-muted dark:bg-white/5 p-1 rounded-xl border border-border dark:border-white/10">
                {['7D', '30D', '1Y'].map(r => (
                    <button key={r} onClick={() => setTimeRange(r as any)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === r ? 'bg-white dark:bg-surface-dark text-primary-600 shadow-md' : 'text-text-tertiary hover:text-text-secondary'}`}>{r}</button>
                ))}
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '16px', background: 'rgba(31,41,55,0.9)', backdropFilter: 'blur(10px)', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorChart)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="flex flex-col gap-8">
            <EchoesPulse enabledModules={enabledModules} />
            {enabledModules.includes('bookings') && (
                <Card className="flex flex-col border-white/5 bg-surface/60 dark:bg-surface-dark/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Next Meetings</h3>
                  </div>
                  <div className="space-y-4">
                    {appointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="flex items-center gap-4 group cursor-pointer p-1 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 border border-primary-500/20 group-hover:bg-primary-500 group-hover:text-white transition-all">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-text-primary dark:text-gray-200 truncate leading-tight">{apt.clientName}</h4>
                          <p className="text-[10px] text-text-tertiary font-bold tracking-wide uppercase mt-1">{apt.time} • {apt.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
};
