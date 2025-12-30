
import React, { useState, useMemo, useEffect } from 'react';
import { SectionHeader, Card, Button, Input, Badge, Tabs } from '../components/ui/Primitives';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, 
    Legend, LineChart, Line, ComposedChart 
} from 'recharts';
import { 
    Download, Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight, 
    Users, Target, Search, BrainCircuit, Globe, Activity, 
    Calendar, Zap, AlertTriangle, Lightbulb, Info, Filter,
    ChevronRight, Loader2, Play
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { sendMessageToGemini } from '../services/gemini';
import { ForecastPoint } from '../types';

const COLORS = ['#8B5CF6', '#6366F1', '#10B981', '#F59E0B', '#EC4899'];

export const Analytics: React.FC = () => {
    const { invoices, deals, userProfile, consumeAiCredit } = useData();
    const { addNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState('Intelligence');
    
    // AI State
    const [query, setQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [generatedChart, setGeneratedChart] = useState<{type: string, title: string, data: any[]} | null>(null);
    const [predictiveInsight, setPredictiveInsight] = useState<string>('');
    const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);

    // --- Mock Data ---
    const revenueData = [
        { name: 'Mon', revenue: 4200, expenses: 2400 },
        { name: 'Tue', revenue: 3800, expenses: 1398 },
        { name: 'Wed', revenue: 2500, expenses: 2800 }, // Anomaly
        { name: 'Thu', revenue: 5780, expenses: 3908 },
        { name: 'Fri', revenue: 4890, expenses: 3100 },
        { name: 'Sat', revenue: 3390, expenses: 2800 },
        { name: 'Sun', revenue: 6490, expenses: 4300 },
    ];

    const forecastData: ForecastPoint[] = [
        { name: 'Week 1', actual: 42000, predicted: 42000, confidenceHigh: 43000, confidenceLow: 41000 },
        { name: 'Week 2', actual: 38000, predicted: 39000, confidenceHigh: 41000, confidenceLow: 37000 },
        { name: 'Week 3', actual: 45000, predicted: 44000, confidenceHigh: 46000, confidenceLow: 42000 },
        { name: 'Week 4', predicted: 48000, confidenceHigh: 52000, confidenceLow: 44000 },
        { name: 'Week 5', predicted: 53000, confidenceHigh: 58000, confidenceLow: 48000 },
        { name: 'Week 6', predicted: 51000, confidenceHigh: 57000, confidenceLow: 45000 },
    ];

    const segmentData = [
        { name: 'Enterprise', value: 45, ltv: 12500, growth: 15 },
        { name: 'SME', value: 30, ltv: 2400, growth: 8 },
        { name: 'Startup', value: 25, ltv: 1100, growth: -2 },
    ];

    // --- AI Actions ---
    const handleGenerateForecastAnalysis = async () => {
        if (!consumeAiCredit()) {
            addNotification({ title: 'Limit Reached', message: 'Upgrade to Pro for Predictive Analytics.', type: 'warning' });
            return;
        }

        setIsGeneratingForecast(true);
        const prompt = `Based on a revenue trend of [42k, 38k, 45k] over the last 3 weeks, and a projected growth to 53k by Week 5, provide a strategic visionary analysis. Identify 1 risk and 2 opportunities. Keep it under 100 words.`;
        
        try {
            const result = await sendMessageToGemini(prompt);
            setPredictiveInsight(result);
            addNotification({ title: 'Intelligence Ready', message: 'Predictive forecast has been updated.', type: 'success' });
        } catch (e) {
            setPredictiveInsight("Analysis engine encountered an error. Historical patterns suggest continued growth in the Enterprise segment.");
        } finally {
            setIsGeneratingForecast(false);
        }
    };

    const handleAskData = (e: React.FormEvent) => {
        e.preventDefault();
        if(!query.trim()) return;
        
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            const lowerQ = query.toLowerCase();
            if (lowerQ.includes('churn') || lowerQ.includes('retention')) {
                setGeneratedChart({
                    type: 'area',
                    title: 'Predictive Churn Projection (Next 30 Days)',
                    data: revenueData.map(d => ({ name: d.name, value1: Math.random() * 3 + 1, value2: 92 + Math.random() * 4 }))
                });
            } else {
                setGeneratedChart({
                    type: 'bar',
                    title: 'Segment Performance Analysis',
                    data: segmentData.map(s => ({ name: s.name, value: s.ltv }))
                });
            }
        }, 1500);
    };

    // --- Render Components ---

    const IntelligenceTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Anomaly Detection Strip */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">Anomaly Detected: Wednesday Revenue Drop</h4>
                        <p className="text-xs text-amber-800 dark:text-amber-300">Revenue was 35% lower than normal seasonal patterns. Potential link to CRM downtime.</p>
                    </div>
                </div>
                <Button size="sm" variant="secondary" className="bg-white/50 dark:bg-black/20">Investigate</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Composed Chart */}
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold">Predictive Growth Engine</h3>
                            <p className="text-xs text-text-secondary">Historical actuals vs Machine Learning projections</p>
                        </div>
                        <div className="flex gap-4">
                             <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="w-2 h-2 rounded-full bg-primary-500"></span> Actual</div>
                             <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="w-2 h-2 rounded-full bg-primary-300 border-dashed border"></span> Forecast</div>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={forecastData}>
                                <defs>
                                    <linearGradient id="confidenceArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill:'#9CA3AF'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill:'#9CA3AF'}} tickFormatter={(v) => `$${v/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="confidenceHigh" fill="url(#confidenceArea)" stroke="none" />
                                <Area type="monotone" dataKey="confidenceLow" fill="#111827" stroke="none" />
                                <Bar dataKey="actual" barSize={30} fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                                <Line type="monotone" dataKey="predicted" stroke="#A78BFA" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#A78BFA' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* AI Predictive Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-indigo-600 text-white border-none shadow-xl relative overflow-hidden h-full flex flex-col">
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <Badge className="bg-white/20 text-white border-none">AI Insight</Badge>
                                <Sparkles className="w-5 h-5 text-indigo-200" />
                            </div>
                            
                            {!predictiveInsight ? (
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold">Unlock Revenue Forecasting</h4>
                                    <p className="text-indigo-100 text-sm leading-relaxed">
                                        Let Nexus analyze your pipeline and seasonal trends to predict the next 90 days.
                                    </p>
                                    <Button 
                                        className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none font-bold"
                                        onClick={handleGenerateForecastAnalysis}
                                        disabled={isGeneratingForecast}
                                    >
                                        {isGeneratingForecast ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Prediction Engine'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="animate-in fade-in zoom-in-95">
                                    <p className="text-sm italic text-indigo-100 leading-relaxed mb-4">
                                        "{predictiveInsight}"
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <div className="p-3 bg-white/10 rounded-lg">
                                            <p className="text-[10px] uppercase font-bold text-indigo-200 mb-1">Target</p>
                                            <p className="text-lg font-bold">$125k</p>
                                        </div>
                                        <div className="p-3 bg-white/10 rounded-lg">
                                            <p className="text-[10px] uppercase font-bold text-indigo-200 mb-1">Confidence</p>
                                            <p className="text-lg font-bold">92%</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="w-full mt-6 text-white hover:bg-white/10 border-white/20" size="sm" onClick={() => setPredictiveInsight('')}>Reset Analysis</Button>
                                </div>
                            )}
                        </div>
                        <BrainCircuit className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
                    </Card>
                </div>
            </div>

            {/* Segment Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <h3 className="font-bold mb-6 flex items-center gap-2"><Target className="w-4 h-4 text-primary-500" /> Revenue by Segment</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={segmentData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {segmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-3">
                        {segmentData.map((s, i) => (
                            <div key={s.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                                    <span className="text-text-secondary">{s.name}</span>
                                </div>
                                <span className="font-bold text-text-primary dark:text-text-primary-dark">{s.value}%</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="lg:col-span-2">
                     <h3 className="font-bold mb-6">Efficiency Matrix</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         {segmentData.map((s, i) => (
                             <div key={s.name} className="p-4 rounded-xl bg-surface-subtle dark:bg-surface-muted-dark border border-border dark:border-border-dark flex flex-col gap-3">
                                 <div className="flex justify-between items-start">
                                     <h4 className="text-sm font-bold">{s.name}</h4>
                                     <Badge variant={s.growth > 0 ? 'success' : 'danger'} className="text-[9px]">
                                         {s.growth > 0 ? '+' : ''}{s.growth}% Growth
                                     </Badge>
                                 </div>
                                 <div>
                                     <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold">Avg LTV</p>
                                     <p className="text-xl font-bold text-text-primary dark:text-text-primary-dark">${s.ltv.toLocaleString()}</p>
                                 </div>
                                 <div className="flex items-center gap-2 text-xs text-text-secondary">
                                     <Users className="w-3 h-3" />
                                     <span>{Math.round(s.value * 12.4)} Users</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                     <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800 flex items-center gap-4">
                         <Lightbulb className="w-6 h-6 text-primary-600 dark:text-primary-400 shrink-0" />
                         <p className="text-sm text-primary-900 dark:text-primary-200">
                            <strong>Strategic Edge:</strong> Your Enterprise segment is growing 2x faster than Startups. Focus Q4 campaigns on high-tier service agreements.
                         </p>
                     </div>
                </Card>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            <SectionHeader
                title="Nexus Intelligence"
                subtitle="Advanced business analytics with predictive modeling."
                action={
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={Download} size="sm">Export Raw Data</Button>
                        <Button variant="secondary" icon={Zap} size="sm" className="bg-primary-50 text-primary-700 border-primary-200">Go Live View</Button>
                    </div>
                }
            />

            <Tabs 
                tabs={['Intelligence', 'Ask Data', 'Retention', 'Market Dynamics']} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            {activeTab === 'Intelligence' && <IntelligenceTab />}

            {activeTab === 'Ask Data' && (
                <div className="h-[600px] flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
                    <div className="text-center mb-8 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">Neural Data Explorer</h2>
                        <p className="text-text-secondary dark:text-text-secondary-dark">Use natural language to query and visualize your data.</p>
                    </div>

                    <div className="max-w-2xl mx-auto w-full mb-10 relative z-20">
                        <form onSubmit={handleAskData} className="relative shadow-2xl rounded-2xl group">
                            <Input 
                                className="pl-12 py-5 text-lg rounded-2xl border-primary-100 dark:border-primary-900 focus:ring-4 focus:ring-primary-100/50 dark:focus:ring-primary-900/20 shadow-lg bg-white dark:bg-surface-dark transition-all" 
                                placeholder="e.g. Compare retention rates for the last two cohorts..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <BrainCircuit className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 w-6 h-6 group-focus-within:animate-pulse" />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Button size="md" type="submit" disabled={isAnalyzing || !query} className="rounded-xl px-6">
                                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {generatedChart && (
                        <div className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-8 shadow-sm animate-in zoom-in-95 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{generatedChart.title}</h3>
                                <Badge variant="brand">AI Vision Generated</Badge>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {generatedChart.type === 'area' ? (
                                        <AreaChart data={generatedChart.data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip contentStyle={{ borderRadius: '12px', background: '#111827', border: 'none' }} />
                                            <Area type="monotone" dataKey="value1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} name="Churn Rate" />
                                            <Area type="monotone" dataKey="value2" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Retention" />
                                        </AreaChart>
                                    ) : (
                                        <BarChart data={generatedChart.data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip contentStyle={{ borderRadius: '12px', background: '#111827', border: 'none' }} />
                                            <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Value ($)" />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Retention' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <Card>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold">Cohort Heatmap</h3>
                                <p className="text-sm text-text-secondary">Sticky user analysis over 12 weeks</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-text-tertiary">Week index</span>
                                <div className="flex border border-border dark:border-border-dark rounded-lg overflow-hidden">
                                    <button className="px-3 py-1 bg-surface-muted dark:bg-surface-muted-dark text-xs font-bold">0-4</button>
                                    <button className="px-3 py-1 hover:bg-surface-muted dark:hover:bg-surface-muted-dark text-xs font-bold border-l border-border dark:border-border-dark">5-8</button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-4 px-2">
                            <div className="col-span-1">Cohort</div>
                            <div className="text-center">W0</div>
                            <div className="text-center">W1</div>
                            <div className="text-center">W2</div>
                            <div className="text-center">W3</div>
                            <div className="text-center">W4</div>
                            <div className="text-center">Trend</div>
                        </div>

                        {[
                            { name: 'Oct 01', size: 240, data: [100, 85, 78, 72, 68], trend: 'up' },
                            { name: 'Oct 08', size: 190, data: [100, 82, 75, 70, 0], trend: 'down' },
                            { name: 'Oct 15', size: 210, data: [100, 88, 81, 0, 0], trend: 'up' },
                            { name: 'Oct 22', size: 255, data: [100, 89, 0, 0, 0], trend: 'up' },
                        ].map(c => (
                            <div key={c.name} className="flex items-center gap-2 mb-2 group">
                                <div className="w-1/7 min-w-[120px] px-2">
                                    <span className="text-sm font-bold text-text-primary dark:text-text-primary-dark">{c.name}</span>
                                    <span className="text-[10px] text-text-tertiary block">{c.size} users</span>
                                </div>
                                <div className="flex-1 flex gap-1">
                                    {c.data.map((v, i) => v > 0 ? (
                                        <div 
                                            key={i} 
                                            className="flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
                                            style={{ backgroundColor: `rgba(139, 92, 246, ${v/100})`, color: v > 70 ? '#fff' : 'inherit' }}
                                        >
                                            {v}%
                                        </div>
                                    ) : (
                                        <div key={i} className="flex-1 h-10 rounded-lg bg-surface-subtle dark:bg-surface-muted-dark opacity-30"></div>
                                    ))}
                                </div>
                                <div className="w-12 flex justify-center">
                                    {c.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>
            )}
        </div>
    );
};
