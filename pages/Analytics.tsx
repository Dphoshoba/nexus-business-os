import React, { useState, useMemo, useEffect } from 'react';
import { SectionHeader, Card, Button, Input, Badge, Tabs } from '../components/ui/Primitives';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Download, Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight, Users, Target, Search, BrainCircuit, Globe, Activity, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];

export const Analytics: React.FC = () => {
    const { invoices, deals } = useData();
    const { addNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState('Overview');
    
    // Ask Data State
    const [query, setQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [generatedChart, setGeneratedChart] = useState<{type: string, title: string, data: any[]} | null>(null);

    // --- Mock Data ---
    const revenueData = [
        { name: 'Mon', revenue: 4000, expenses: 2400 },
        { name: 'Tue', revenue: 3000, expenses: 1398 },
        { name: 'Wed', revenue: 2000, expenses: 9800 },
        { name: 'Thu', revenue: 2780, expenses: 3908 },
        { name: 'Fri', revenue: 1890, expenses: 4800 },
        { name: 'Sat', revenue: 2390, expenses: 3800 },
        { name: 'Sun', revenue: 3490, expenses: 4300 },
    ];

    const retentionData = [
        { cohort: 'Oct 1-7', size: 154, w0: 100, w1: 85, w2: 78, w3: 72, w4: 68 },
        { cohort: 'Oct 8-14', size: 142, w0: 100, w1: 82, w2: 75, w3: 70, w4: null },
        { cohort: 'Oct 15-21', size: 168, w0: 100, w1: 88, w2: 81, w3: null, w4: null },
        { cohort: 'Oct 22-28', size: 185, w0: 100, w1: 89, w2: null, w3: null, w4: null },
        { cohort: 'Oct 29-Nov 4', size: 190, w0: 100, w1: null, w2: null, w3: null, w4: null },
    ];

    const geoData = [
        { name: 'North America', value: 45 },
        { name: 'Europe', value: 30 },
        { name: 'Asia', value: 15 },
        { name: 'Other', value: 10 },
    ];

    // --- Actions ---
    const handleAskData = (e: React.FormEvent) => {
        e.preventDefault();
        if(!query.trim()) return;
        
        setIsAnalyzing(true);
        // Simulate AI Analysis
        setTimeout(() => {
            setIsAnalyzing(false);
            
            // Simple keyword matching simulation
            const lowerQ = query.toLowerCase();
            if (lowerQ.includes('churn') || lowerQ.includes('retention')) {
                setGeneratedChart({
                    type: 'area',
                    title: 'Churn Rate vs Retention (Last 30 Days)',
                    data: revenueData.map(d => ({ name: d.name, value1: Math.random() * 5 + 1, value2: 90 + Math.random() * 5 }))
                });
            } else if (lowerQ.includes('sales') || lowerQ.includes('revenue')) {
                setGeneratedChart({
                    type: 'bar',
                    title: 'Sales Performance by Channel',
                    data: [
                        { name: 'Direct', value: 12000 },
                        { name: 'Social', value: 8500 },
                        { name: 'Email', value: 4000 },
                        { name: 'Partners', value: 9000 },
                    ]
                });
            } else {
                setGeneratedChart({
                    type: 'line',
                    title: 'Trend Analysis: ' + query,
                    data: revenueData.map(d => ({ name: d.name, value: d.revenue * (Math.random() + 0.5) }))
                });
            }
            addNotification({ title: 'Analysis Complete', message: 'Chart generated from your query.', type: 'success' });
        }, 1500);
    };

    const RetentionCell = ({ value }: { value: number | null }) => {
        if (value === null) return <div className="flex-1 h-10 bg-surface-subtle dark:bg-surface-subtle-dark m-0.5 rounded-sm"></div>;
        
        // Heatmap color logic
        let bg = 'bg-primary-50 dark:bg-primary-900/10 text-primary-900 dark:text-primary-100';
        if (value < 70) bg = 'bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100';
        if (value > 85) bg = 'bg-green-50 dark:bg-green-900/10 text-green-900 dark:text-green-100';
        if (value === 100) bg = 'bg-surface-muted dark:bg-surface-muted-dark text-text-secondary';

        const opacity = value === 100 ? 1 : Math.max(0.1, value / 100);

        return (
            <div 
                className={`flex-1 h-10 m-0.5 rounded-sm flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-pointer relative group`}
                style={{ backgroundColor: value < 100 ? `rgba(99, 102, 241, ${opacity * 0.5})` : undefined }}
            >
                <span className="relative z-10">{value}%</span>
                {value < 100 && <div className="absolute inset-0 bg-current opacity-10 rounded-sm"></div>}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-10">
            <SectionHeader
                title="Nexus IQ Analytics"
                subtitle="Business Intelligence powered by generative insights."
                action={
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={Calendar} size="sm">Oct 2023</Button>
                        <Button variant="secondary" icon={Download} size="sm">Export Report</Button>
                    </div>
                }
            />

            <Tabs 
                tabs={['Overview', 'Ask Data', 'Retention', 'Geography']} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'Overview' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card padding="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">MRR</p>
                                    <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mt-1">$24,500</h3>
                                </div>
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs">
                                <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                    <ArrowUpRight className="w-3 h-3" /> 12%
                                </span>
                                <span className="text-text-tertiary ml-2">vs last month</span>
                            </div>
                        </Card>
                        <Card padding="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Active Users</p>
                                    <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mt-1">1,240</h3>
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs">
                                <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                    <ArrowUpRight className="w-3 h-3" /> 8.5%
                                </span>
                                <span className="text-text-tertiary ml-2">vs last month</span>
                            </div>
                        </Card>
                        <Card padding="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Churn Rate</p>
                                    <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mt-1">2.1%</h3>
                                </div>
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
                                    <ArrowDownRight className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs">
                                <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                                    <ArrowUpRight className="w-3 h-3" /> 0.4%
                                </span>
                                <span className="text-text-tertiary ml-2">vs last month</span>
                            </div>
                        </Card>
                        <Card padding="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">LTV</p>
                                    <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mt-1">$980</h3>
                                </div>
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                                    <Target className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs">
                                <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                    <ArrowUpRight className="w-3 h-3" /> 5%
                                </span>
                                <span className="text-text-tertiary ml-2">vs last month</span>
                            </div>
                        </Card>
                    </div>

                    {/* Main Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 min-h-[400px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-text-primary dark:text-text-primary-dark">Financial Performance</h3>
                                <div className="flex gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-primary-500"></span> Revenue
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-red-400"></span> Expenses
                                    </div>
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F87171" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                            cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                        <Area type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <div className="flex flex-col gap-6">
                            {/* Insight Card */}
                            <div className="p-6 bg-gradient-to-br from-indigo-900 to-purple-800 rounded-xl text-white relative overflow-hidden shadow-lg flex-1">
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <Sparkles className="w-4 h-4 text-indigo-100" />
                                        </div>
                                        <span className="text-sm font-bold tracking-wide text-indigo-200 uppercase">Nexus IQ</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 leading-tight">Revenue is trending up 12%</h3>
                                    <p className="text-indigo-200 text-sm leading-relaxed mb-6 flex-1">
                                        Your Saturday expenses were higher than average. 
                                        Consider reviewing your weekend operational costs. 
                                        Retention for the "Oct 15" cohort is exceptionally strong at 88%.
                                    </p>
                                    <Button className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white" size="sm">
                                        View Full Analysis
                                    </Button>
                                </div>
                                <div className="absolute -bottom-10 -right-10 opacity-20">
                                    <BrainCircuit className="w-48 h-48" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ASK DATA TAB --- */}
            {activeTab === 'Ask Data' && (
                <div className="h-[600px] flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
                    <div className="text-center mb-8 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">Ask Nexus Intelligence</h2>
                        <p className="text-text-secondary dark:text-text-secondary-dark">Type any question about your data, and Nexus will generate the visualization instantly.</p>
                    </div>

                    <div className="max-w-2xl mx-auto w-full mb-10 relative z-20">
                        <form onSubmit={handleAskData} className="relative shadow-xl rounded-2xl">
                            <Input 
                                className="pl-12 py-4 text-lg rounded-2xl border-primary-200 dark:border-primary-800 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 shadow-sm" 
                                placeholder="e.g. Show revenue breakdown by region for Q3..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 w-6 h-6" />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Button size="sm" type="submit" disabled={isAnalyzing || !query}>
                                    {isAnalyzing ? 'Analyzing...' : 'Generate'}
                                </Button>
                            </div>
                        </form>
                        <div className="flex gap-2 mt-3 justify-center text-xs text-text-tertiary">
                            <span>Try:</span>
                            <button onClick={() => {setQuery("Show sales trend vs expenses"); handleAskData({preventDefault:()=>{}} as any)}} className="hover:text-primary-600 underline">Sales vs Expenses</button>
                            <span>&bull;</span>
                            <button onClick={() => {setQuery("Churn rate by cohort"); handleAskData({preventDefault:()=>{}} as any)}} className="hover:text-primary-600 underline">Churn Analysis</button>
                            <span>&bull;</span>
                            <button onClick={() => {setQuery("Revenue by channel distribution"); handleAskData({preventDefault:()=>{}} as any)}} className="hover:text-primary-600 underline">Revenue Channels</button>
                        </div>
                    </div>

                    {generatedChart && (
                        <div className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-8 shadow-sm animate-in zoom-in-95 duration-500">
                            <h3 className="text-lg font-bold text-center mb-6 text-text-primary dark:text-text-primary-dark">{generatedChart.title}</h3>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {generatedChart.type === 'area' ? (
                                        <AreaChart data={generatedChart.data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                            <Legend />
                                            <Area type="monotone" dataKey="value1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} name="Churn Rate" />
                                            <Area type="monotone" dataKey="value2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} name="Retention" />
                                        </AreaChart>
                                    ) : generatedChart.type === 'bar' ? (
                                        <BarChart data={generatedChart.data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                            <Legend />
                                            <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Sales" />
                                        </BarChart>
                                    ) : (
                                        <LineChart data={generatedChart.data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} dot={{r: 4}} />
                                        </LineChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- RETENTION TAB --- */}
            {activeTab === 'Retention' && (
                <Card className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-text-primary dark:text-text-primary-dark">Cohort Retention Analysis</h3>
                            <p className="text-sm text-text-secondary">User engagement over weeks.</p>
                        </div>
                        <Badge variant="brand">Last 5 Weeks</Badge>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            {/* Header */}
                            <div className="flex mb-2">
                                <div className="w-32 text-xs font-bold text-text-secondary uppercase pt-3 pl-2">Cohort</div>
                                <div className="w-20 text-xs font-bold text-text-secondary uppercase pt-3 text-center">Users</div>
                                {[0,1,2,3,4].map(w => (
                                    <div key={w} className="flex-1 text-xs font-bold text-text-secondary uppercase text-center pt-3">Week {w}</div>
                                ))}
                            </div>
                            
                            {/* Rows */}
                            {retentionData.map((row, i) => (
                                <div key={i} className="flex items-center mb-1 hover:bg-surface-subtle/50 rounded-lg transition-colors p-1">
                                    <div className="w-32 text-sm font-medium text-text-primary dark:text-text-primary-dark pl-2">{row.cohort}</div>
                                    <div className="w-20 text-sm text-text-secondary text-center">{row.size}</div>
                                    
                                    <RetentionCell value={row.w0} />
                                    <RetentionCell value={row.w1} />
                                    <RetentionCell value={row.w2} />
                                    <RetentionCell value={row.w3} />
                                    <RetentionCell value={row.w4} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-4 text-xs text-text-secondary justify-end">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-50 rounded"></div> &lt; 70%</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary-50 rounded"></div> 70-85%</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-50 rounded"></div> &gt; 85%</div>
                    </div>
                </Card>
            )}

            {/* --- GEOGRAPHY TAB --- */}
            {activeTab === 'Geography' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    <Card>
                        <h3 className="font-bold text-text-primary dark:text-text-primary-dark mb-6">User Distribution</h3>
                        <div className="h-[300px] flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={geoData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {geoData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Globe className="w-8 h-8 text-text-tertiary opacity-20" />
                            </div>
                        </div>
                    </Card>
                    <div className="space-y-4">
                        <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-1">North America</h3>
                            <p className="text-blue-50 text-sm mb-4">Top performing region</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold">45%</span>
                                <span className="text-sm mb-1 opacity-80">of total revenue</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Card padding="p-4" className="bg-surface-subtle dark:bg-surface-subtle-dark">
                                <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Europe</p>
                                <span className="text-xl font-bold text-text-primary dark:text-text-primary-dark">30%</span>
                            </Card>
                            <Card padding="p-4" className="bg-surface-subtle dark:bg-surface-subtle-dark">
                                <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Asia</p>
                                <span className="text-xl font-bold text-text-primary dark:text-text-primary-dark">15%</span>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};