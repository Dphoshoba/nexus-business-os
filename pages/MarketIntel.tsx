
import React, { useState } from 'react';
import { 
    Search, Sparkles, Loader2, ExternalLink, Globe, 
    TrendingUp, ShieldCheck, ArrowRight, BrainCircuit,
    BarChart3, Target, Info, MessageSquare, Plus,
    RefreshCw, BookOpen, Share2
} from 'lucide-react';
import { SectionHeader, Card, Button, Input, Badge } from '../components/ui/Primitives';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';
import { GoogleGenAI } from "@google/genai";

interface Source {
    uri: string;
    title: string;
}

export const MarketIntel: React.FC = () => {
    const { addNotification } = useNotifications();
    const { consumeAiCredit } = useData();
    
    // UI State
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [sources, setSources] = useState<Source[]>([]);
    
    // Search Grounding Handler
    const handleIntelligenceResearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        if (!consumeAiCredit()) {
            addNotification({ 
                title: 'Limit Reached', 
                message: 'Upgrade to Pro for real-time market grounding.', 
                type: 'warning' 
            });
            return;
        }

        setIsSearching(true);
        setReport(null);
        setSources([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Research request with Google Search tool
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Perform a deep strategic analysis of: ${query}. 
                Synthesize current trends, competitive landscape, and strategic opportunities. 
                Format with bold headers and bullet points.`,
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });

            // Extract content and URLs
            const text = response.text;
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            
            const extractedSources: Source[] = [];
            if (groundingChunks) {
                groundingChunks.forEach((chunk: any) => {
                    if (chunk.web) {
                        extractedSources.push({
                            uri: chunk.web.uri,
                            title: chunk.web.title
                        });
                    }
                });
            }

            setReport(text || "No intelligence found for this query.");
            setSources(extractedSources);
            
            addNotification({ 
                title: 'Analysis Complete', 
                message: `Intelligence synthesized from ${extractedSources.length} external sources.`, 
                type: 'success' 
            });

        } catch (error) {
            console.error("Grounding Error:", error);
            addNotification({ 
                title: 'Intelligence Gap', 
                message: 'Could not connect to external search grounding.', 
                type: 'error' 
            });
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="h-full flex flex-col pb-10">
            <SectionHeader
                title="Market Intelligence"
                subtitle="Real-time industry research powered by Google Search grounding."
                action={
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={RefreshCw} size="sm">Reset Feed</Button>
                        <Button variant="secondary" icon={Share2} size="sm">Export Report</Button>
                    </div>
                }
            />

            <div className="flex-1 flex flex-col gap-8">
                {/* Global Search Bar */}
                <div className="max-w-3xl mx-auto w-full">
                    <form onSubmit={handleIntelligenceResearch} className="relative group">
                        <div className="absolute inset-0 bg-primary-500/10 blur-2xl rounded-full group-focus-within:bg-primary-500/20 transition-all"></div>
                        <div className="relative flex gap-2 p-1.5 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl shadow-xl">
                            <div className="flex-1 flex items-center pl-4">
                                <Search className="w-5 h-5 text-text-tertiary" />
                                <input 
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 text-text-primary dark:text-text-primary-dark placeholder:text-text-tertiary"
                                    placeholder="Research competitor, industry trend, or market shift..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    disabled={isSearching}
                                />
                            </div>
                            <Button 
                                type="submit" 
                                size="lg" 
                                className="rounded-xl px-8 shadow-lg shadow-primary-500/20"
                                disabled={isSearching || !query}
                            >
                                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Analyze</>}
                            </Button>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            {['Competitors', 'Latest News', 'Trends', 'Sentiment'].map(tag => (
                                <button key={tag} type="button" onClick={() => setQuery(tag + " for " + query)} className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary hover:text-primary-600 transition-colors">
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
                    {/* Main Intelligence View */}
                    <div className="lg:col-span-3 flex flex-col">
                        {!report && !isSearching ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-20">
                                <BrainCircuit className="w-20 h-20 mb-6" />
                                <h3 className="text-xl font-bold">Waiting for Research Objective</h3>
                                <p className="text-sm max-w-sm mt-2">Enter a query to bridge your internal OS with live market intelligence.</p>
                            </div>
                        ) : (
                            <Card className="flex-1 overflow-y-auto p-8 relative min-h-[400px]">
                                {isSearching && (
                                    <div className="absolute inset-0 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in">
                                        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                                        <p className="text-lg font-bold text-primary-700 dark:text-primary-400">Grounding Analysis...</p>
                                        <p className="text-sm text-text-secondary">Synthesizing live web data</p>
                                    </div>
                                )}
                                
                                {report && (
                                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border dark:border-border-dark">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="brand" className="px-3 py-1">Grounded Report</Badge>
                                                <span className="text-xs text-text-tertiary font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" icon={Plus}>Add to Projects</Button>
                                                <Button size="sm" variant="ghost" icon={BookOpen}>Save to Blog</Button>
                                            </div>
                                        </div>
                                        
                                        <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-1 prose-h3:mt-10">
                                            <div className="whitespace-pre-wrap text-text-primary dark:text-text-primary-dark">
                                                {report}
                                            </div>
                                        </div>

                                        {/* MANDATORY SOURCES SECTION */}
                                        <div className="mt-12 pt-8 border-t border-border dark:border-border-dark">
                                            <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                <Globe className="w-4 h-4" /> Grounding Sources
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {sources.length > 0 ? sources.map((source, i) => (
                                                    <a 
                                                        key={i} 
                                                        href={source.uri} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-start gap-3 p-4 bg-surface-subtle dark:bg-surface-muted-dark rounded-xl border border-border dark:border-border-dark hover:border-primary-400 transition-all group"
                                                    >
                                                        <div className="p-2 bg-white dark:bg-surface-dark rounded-lg border border-border">
                                                            <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-primary-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-text-primary dark:text-text-primary-dark truncate group-hover:text-primary-600">
                                                                {source.title || source.uri}
                                                            </p>
                                                            <p className="text-[10px] text-text-tertiary truncate mt-1">{source.uri}</p>
                                                        </div>
                                                    </a>
                                                )) : (
                                                    <p className="text-xs text-text-tertiary italic">General intelligence synthesized from broad search context.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>

                    {/* Right Sidebar: Contextual Tools */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border-none shadow-lg overflow-hidden relative group">
                            <div className="relative z-10">
                                <h4 className="font-bold flex items-center gap-2 mb-4">
                                    <Target className="w-4 h-4 text-indigo-300" /> Sector Watch
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { n: 'SaaS Platforms', v: '+12.4%', c: 'text-green-400' },
                                        { n: 'Fintech AI', v: '+8.1%', c: 'text-green-400' },
                                        { n: 'Digital Marketing', v: '-2.3%', c: 'text-rose-400' }
                                    ].map(s => (
                                        <div key={s.n} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-none">
                                            <span className="text-indigo-100">{s.n}</span>
                                            <span className={`font-bold ${s.c}`}>{s.v}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full mt-6 bg-white/10 hover:bg-white/20 border-white/10 text-white text-xs h-9">Configure Monitoring</Button>
                            </div>
                            <Activity className="absolute -bottom-10 -right-10 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity" />
                        </Card>

                        <Card>
                            <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">Strategic Radar</h4>
                            <div className="space-y-4">
                                <div className="p-3 bg-surface-subtle dark:bg-surface-muted-dark rounded-xl border border-border dark:border-border-dark">
                                    <p className="text-xs font-bold text-text-primary dark:text-text-primary-dark">Competitor A</p>
                                    <p className="text-[10px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">Just launched a new feature for multi-currency invoicing.</p>
                                    <div className="flex items-center gap-1 text-[9px] text-primary-600 font-bold mt-2">
                                        <TrendingUp className="w-3 h-3" /> High Impact
                                    </div>
                                </div>
                                <div className="p-3 bg-surface-subtle dark:bg-surface-muted-dark rounded-xl border border-border dark:border-border-dark">
                                    <p className="text-xs font-bold text-text-primary dark:text-text-primary-dark">Global Regulation</p>
                                    <p className="text-[10px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">New GDPR updates for AI-driven data processing.</p>
                                    <div className="flex items-center gap-1 text-[9px] text-amber-600 font-bold mt-2">
                                        <ShieldCheck className="w-3 h-3" /> Legal Review
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                            <h5 className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-sm mb-2">
                                <Info className="w-4 h-4" /> Intelligence Tip
                            </h5>
                            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                Connect **Market Intelligence** to your **Automations** to receive real-time alerts whenever your primary competitor updates their pricing.
                            </p>
                            <button className="text-xs font-bold text-amber-900 dark:text-amber-100 mt-4 hover:underline flex items-center gap-1">
                                Learn Workflow <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Activity = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);
