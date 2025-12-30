
import React, { useState } from 'react';
import { 
    Search, FileText, PlayCircle, MessageSquare, ChevronRight, 
    BookOpen, Layers, Users, Zap, Calendar, CreditCard, 
    Filter, Briefcase, BarChart2, Inbox, HardDrive, 
    Share2, Target, PenTool, Mic, ScanLine, Settings,
    Lightbulb, Info, Grid, Bot, Check, Sparkles, Keyboard
} from 'lucide-react';
import { SectionHeader, Card, Input, Button, Badge } from '../components/ui/Primitives';

type TopicId = 'start' | 'whats_new' | 'shortcuts' | 'dashboard' | 'crm' | 'bookings' | 'automations' | 'payments' | 'funnels' | 'documents' | 'projects' | 'analytics' | 'inbox' | 'storage' | 'strategy' | 'social' | 'team' | 'canvas' | 'campaigns' | 'scan' | 'marketplace' | 'assistant' | 'settings';

interface HelpTopic {
    id: TopicId;
    title: string;
    icon: React.ElementType;
    description: string;
    content: React.ReactNode;
}

export const Help: React.FC = () => {
    const [activeTopic, setActiveTopic] = useState<TopicId>('start');
    const [searchQuery, setSearchQuery] = useState('');

    const TOPICS: HelpTopic[] = [
        {
            id: 'start',
            title: 'Getting Started',
            icon: BookOpen,
            description: 'Welcome to Echoes Business OS. Start here.',
            content: (
                <div className="space-y-8">
                    <section>
                        <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">Welcome to Echoes & Visions</h3>
                        <p className="text-text-secondary dark:text-text-secondary-dark leading-relaxed text-lg">
                            Echoes & Visions is your all-in-one Business Operating System. It consolidates CRM, Project Management, Invoicing, and AI Automation into a single, cohesive platform.
                        </p>
                    </section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
                            <h4 className="font-bold text-primary-800 dark:text-primary-200 mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Quick Actions</h4>
                            <p className="text-sm text-primary-700 dark:text-primary-300">Use <code className="bg-white dark:bg-black/20 px-1.5 py-0.5 rounded font-mono">Cmd+K</code> anywhere to open the Command Menu.</p>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2"><Bot className="w-4 h-4" /> AI Powered</h4>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">Look for the <strong>Sparkles</strong> icon throughout the app. Echoes AI can draft emails, summarize documents, and analyze your data.</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const filteredTopics = TOPICS.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const activeContent = TOPICS.find(t => t.id === activeTopic);

    return (
        <div className="h-full flex flex-col pb-6">
            <SectionHeader title="Help & Documentation" subtitle="Master the Echoes Business OS with detailed guides." />
            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 overflow-hidden">
                <div className="w-full lg:w-80 flex flex-col gap-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-sm shrink-0">
                    <div className="p-4 border-b border-border dark:border-border-dark"><Input icon={Search} placeholder="Search topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-surface-subtle dark:bg-surface-subtle-dark border-transparent focus:bg-surface" /></div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredTopics.map(topic => (<button key={topic.id} onClick={() => setActiveTopic(topic.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${activeTopic === topic.id ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium' : 'text-text-secondary dark:text-text-secondary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark hover:text-text-primary'}`}><topic.icon className={`w-4 h-4 ${activeTopic === topic.id ? 'text-primary-600 dark:text-primary-400' : 'text-text-tertiary group-hover:text-text-secondary'}`} /><span className="flex-1 text-left rtl:text-right">{topic.title}</span>{activeTopic === topic.id && <ChevronRight className="w-3 h-3 text-primary-500 rtl:rotate-180" />}</button>))}
                    </div>
                    <div className="p-4 border-t border-border dark:border-border-dark bg-surface-subtle/50 dark:bg-surface-subtle-dark/50">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-md"><Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" /></div>
                                <span className="font-serif text-xs font-bold text-text-primary dark:text-text-primary-dark tracking-wide uppercase">Echoes & Visions</span>
                            </div>
                            <div className="flex items-center gap-3 pl-1">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0"><MessageSquare className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-xs font-bold text-text-primary dark:text-text-primary-dark">Need Human Help?</p>
                                    <a href="mailto:support@eternalechoes.com" className="text-xs text-primary-600 hover:underline">Contact Support</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-sm flex flex-col">
                    {activeContent ? (
                        <><div className="h-48 bg-gradient-to-r from-primary-600 to-indigo-700 p-8 text-white relative overflow-hidden shrink-0"><div className="relative z-10"><div className="flex items-center gap-3 mb-2 opacity-80"><activeContent.icon className="w-5 h-5" /><span className="text-sm font-medium uppercase tracking-wider">Manual</span></div><h1 className="text-3xl font-bold mb-2">{activeContent.title}</h1><p className="text-indigo-100 max-w-xl text-lg">{activeContent.description}</p></div><activeContent.icon className="absolute -bottom-6 -right-6 w-64 h-64 text-white opacity-10 rotate-12" /></div><div className="flex-1 overflow-y-auto p-8 custom-scrollbar"><div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">{activeContent.content}</div></div></>
                    ) : (<div className="flex-1 flex flex-col items-center justify-center text-text-tertiary"><BookOpen className="w-16 h-16 mb-4 opacity-20" /><p>Select a topic to view documentation.</p></div>)}
                </div>
            </div>
        </div>
    );
};
