import React, { useState } from 'react';
import { SectionHeader, Card, Button, Badge, Modal, Input } from '../components/ui/Primitives';
import { Search, Grid, MessageSquare, Mail, BarChart3, CreditCard, Check, Settings2, Sparkles, Plus, Loader2 } from 'lucide-react';
import { useNotifications } from '../components/ui/NotificationSystem';

interface App {
    id: string;
    name: string;
    description: string;
    category: 'Communication' | 'Finance' | 'Marketing' | 'Productivity';
    icon: React.ElementType;
    color: string;
    installed: boolean;
    aiEnabled?: boolean;
}

export const Marketplace: React.FC = () => {
    const { addNotification } = useNotifications();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const [isConnecting, setIsConnecting] = useState<string | null>(null);

    // Mock Database of Apps
    const [apps, setApps] = useState<App[]>([
        { id: '1', name: 'Slack', description: 'Send notifications and summaries to channels.', category: 'Communication', icon: MessageSquare, color: 'bg-[#4A154B]', installed: true, aiEnabled: true },
        { id: '2', name: 'Stripe', description: 'Process payments and manage subscriptions.', category: 'Finance', icon: CreditCard, color: 'bg-[#635BFF]', installed: true },
        { id: '3', name: 'Gmail', description: 'Sync emails and draft replies.', category: 'Communication', icon: Mail, color: 'bg-[#EA4335]', installed: false, aiEnabled: true },
        { id: '4', name: 'QuickBooks', description: 'Automated accounting and bookkeeping.', category: 'Finance', icon: BarChart3, color: 'bg-[#2CA01C]', installed: false },
        { id: '5', name: 'HubSpot', description: 'Two-way sync for CRM contacts.', category: 'Marketing', icon: Grid, color: 'bg-[#FF7A59]', installed: false },
        { id: '6', name: 'Notion', description: 'Embed docs and project wikis.', category: 'Productivity', icon: FileTextIcon, color: 'bg-[#000000]', installed: false, aiEnabled: true },
        { id: '7', name: 'Zoom', description: 'Generate meeting transcripts automatically.', category: 'Communication', icon: VideoIcon, color: 'bg-[#2D8CFF]', installed: false, aiEnabled: true },
        { id: '8', name: 'Zapier', description: 'Connect to 5,000+ other apps.', category: 'Productivity', icon: ZapIcon, color: 'bg-[#FF4F00]', installed: false },
    ]);

    const categories = ['All', 'Communication', 'Finance', 'Marketing', 'Productivity'];

    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || app.category === filter;
        return matchesSearch && matchesFilter;
    });

    const handleConnect = (id: string) => {
        setIsConnecting(id);
        setTimeout(() => {
            setApps(prev => prev.map(a => a.id === id ? { ...a, installed: !a.installed } : a));
            setIsConnecting(null);
            const app = apps.find(a => a.id === id);
            addNotification({ 
                title: app?.installed ? 'App Disconnected' : 'App Connected', 
                message: app?.installed ? `${app.name} removed.` : `${app.name} is now integrated with Nexus.`, 
                type: app?.installed ? 'info' : 'success' 
            });
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="App Store"
                subtitle="Supercharge your OS with integrations."
            />

            <div className="flex flex-col gap-6">
                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input 
                            type="text" 
                            placeholder="Search apps..." 
                            className="w-full pl-9 pr-4 py-2 bg-surface-subtle border border-border dark:border-border-dark rounded-lg text-sm focus:outline-none focus:border-primary-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                                    filter === cat 
                                    ? 'bg-primary-600 text-white shadow-sm' 
                                    : 'bg-surface border border-border dark:border-border-dark text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                {filter === 'All' && !searchQuery && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <Badge variant="brand" className="bg-white/20 text-white border-none mb-3">Featured</Badge>
                                <h3 className="text-xl font-bold mb-2">Connect Slack</h3>
                                <p className="text-white/80 text-sm mb-6 max-w-sm">Enable the Nexus AI bot to summarize daily standups and create tasks directly from your channels.</p>
                                <Button className="bg-white text-indigo-700 hover:bg-white/90 border-none" onClick={() => handleConnect('1')}>
                                    {apps.find(a => a.id === '1')?.installed ? 'Manage Settings' : 'Connect Now'}
                                </Button>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-8 translate-y-8">
                                <MessageSquare className="w-48 h-48" />
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-surface border border-border dark:border-border-dark flex flex-col justify-center relative overflow-hidden">
                             <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-2">Build your own</h3>
                             <p className="text-text-secondary dark:text-text-secondary-dark text-sm mb-6 max-w-sm">Use our Developer API to build custom integrations for your unique workflow.</p>
                             <div className="flex gap-3">
                                 <Button variant="secondary">Read Docs</Button>
                                 <Button variant="secondary" icon={Settings2}>API Keys</Button>
                             </div>
                        </div>
                    </div>
                )}

                {/* App Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                    {filteredApps.map(app => (
                        <Card key={app.id} className="flex flex-col h-full hover:border-primary-200 dark:hover:border-primary-700 transition-all hover:shadow-md group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${app.color}`}>
                                    <app.icon className="w-6 h-6" />
                                </div>
                                {app.aiEnabled && (
                                    <Badge variant="brand" className="flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> AI Ready
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-base font-bold text-text-primary dark:text-text-primary-dark">{app.name}</h3>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1 flex-1 leading-relaxed">{app.description}</p>
                            
                            <div className="mt-6 pt-4 border-t border-border dark:border-border-dark flex items-center justify-between">
                                <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">{app.category}</span>
                                <Button 
                                    size="sm" 
                                    variant={app.installed ? 'secondary' : 'primary'}
                                    className={app.installed ? 'bg-surface-muted text-text-secondary border-transparent' : ''}
                                    onClick={() => handleConnect(app.id)}
                                    disabled={isConnecting === app.id}
                                >
                                    {isConnecting === app.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : app.installed ? (
                                        <>Installed <Check className="w-3.5 h-3.5 ml-1" /></>
                                    ) : (
                                        'Connect'
                                    )}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Icons placeholders
const FileTextIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const VideoIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
const ZapIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
