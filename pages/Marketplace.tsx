
import React, { useState } from 'react';
import { SectionHeader, Card, Button, Badge, Modal, Input } from '../components/ui/Primitives';
import { Search, Grid, MessageSquare, Mail, BarChart3, CreditCard, Check, Settings2, Sparkles, Plus, Loader2, Video, Zap, FileText, Globe, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';

interface AppMetadata {
    id: string;
    name: string;
    description: string;
    category: 'Communication' | 'Finance' | 'Marketing' | 'Productivity';
    icon: React.ElementType;
    color: string;
    aiEnabled?: boolean;
}

export const Marketplace: React.FC = () => {
    const { addNotification } = useNotifications();
    const { integrations, connectIntegration, disconnectIntegration, isIntegrationConnected } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');
    
    // UI State
    const [isConfiguring, setIsConfiguring] = useState<AppMetadata | null>(null);
    const [configApiKey, setConfigApiKey] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    // Database of Available Apps
    const APPS: AppMetadata[] = [
        { id: 'slack', name: 'Slack', description: 'Send notifications and summaries to channels.', category: 'Communication', icon: MessageSquare, color: 'bg-[#4A154B]', aiEnabled: true },
        { id: 'notion', name: 'Notion', description: 'Export documents and CRM data to Notion pages.', category: 'Productivity', icon: FileText, color: 'bg-[#000000]', aiEnabled: true },
        { id: 'stripe', name: 'Stripe', description: 'Process payments and manage subscriptions.', category: 'Finance', icon: CreditCard, color: 'bg-[#635BFF]' },
        { id: 'gmail', name: 'Gmail', description: 'Sync emails and draft AI-powered replies.', category: 'Communication', icon: Mail, color: 'bg-[#EA4335]', aiEnabled: true },
        { id: 'qbooks', name: 'QuickBooks', description: 'Automated accounting and tax prep.', category: 'Finance', icon: BarChart3, color: 'bg-[#2CA01C]' },
        { id: 'hubspot', name: 'HubSpot', description: 'Two-way sync for marketing leads.', category: 'Marketing', icon: Globe, color: 'bg-[#FF7A59]' },
        { id: 'zoom', name: 'Zoom', description: 'Meeting transcripts and automatic notes.', category: 'Communication', icon: Video, color: 'bg-[#2D8CFF]', aiEnabled: true },
        { id: 'zapier', name: 'Zapier', description: 'Connect Echoes to 5,000+ third party tools.', category: 'Productivity', icon: Zap, color: 'bg-[#FF4F00]' },
    ];

    const categories = ['All', 'Communication', 'Finance', 'Marketing', 'Productivity'];

    const filteredApps = APPS.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || app.category === filter;
        return matchesSearch && matchesFilter;
    });

    const handleOpenConfig = (app: AppMetadata) => {
        if (isIntegrationConnected(app.id)) {
            // Disconnect or manage
            if (window.confirm(`Disconnect ${app.name}?`)) {
                disconnectIntegration(app.id);
                addNotification({ title: 'App Disconnected', message: `${app.name} removed.`, type: 'info' });
            }
        } else {
            setIsConfiguring(app);
            setConfigApiKey('');
        }
    };

    const handleSaveConfig = () => {
        if (!isConfiguring) return;
        setIsConnecting(true);
        
        // Simulate API Key Validation
        setTimeout(() => {
            connectIntegration({
                id: isConfiguring.id,
                name: isConfiguring.name,
                apiKey: configApiKey,
            });
            setIsConnecting(false);
            setIsConfiguring(null);
            addNotification({ 
                title: 'Integration Successful', 
                message: `${isConfiguring.name} is now connected to your workspace.`, 
                type: 'success' 
            });
        }, 1500);
    };

    const connectedApps = integrations.filter(i => i.status === 'connected');

    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="Integrations Marketplace"
                subtitle="Connect your tech stack to automate workflows."
            />

            <div className="flex flex-col gap-8">
                {/* Connected Apps Section (Pinned) */}
                {connectedApps.length > 0 && !searchQuery && filter === 'All' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-widest">Active Connections</h3>
                            <span className="text-xs font-medium text-primary-600">{connectedApps.length} Apps Syncing</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {connectedApps.map(int => {
                                const app = APPS.find(a => a.id === int.id);
                                if (!app) return null;
                                return (
                                    <div key={int.id} className="p-4 bg-surface dark:bg-surface-dark border border-primary-100 dark:border-primary-900/30 rounded-xl shadow-sm flex items-center gap-4 group">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${app.color}`}>
                                            <app.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold truncate">{app.name}</h4>
                                            <p className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Connected
                                            </p>
                                        </div>
                                        <button onClick={() => handleOpenConfig(app)} className="p-2 text-text-tertiary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all">
                                            <ShieldCheck className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input 
                            type="text" 
                            placeholder="Search apps..." 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
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

                {/* App Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                    {filteredApps.map(app => {
                        const isConnected = isIntegrationConnected(app.id);
                        return (
                            <Card key={app.id} className={`flex flex-col h-full hover:border-primary-200 dark:hover:border-primary-700 transition-all hover:shadow-md group ${isConnected ? 'bg-primary-50/10' : ''}`}>
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
                                        variant={isConnected ? 'secondary' : 'primary'}
                                        className={isConnected ? 'bg-surface-muted text-text-secondary border-transparent' : ''}
                                        onClick={() => handleOpenConfig(app)}
                                    >
                                        {isConnected ? (
                                            <>Connected <Check className="w-3.5 h-3.5 ml-1" /></>
                                        ) : (
                                            'Connect'
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Config Modal */}
            <Modal 
                isOpen={!!isConfiguring} 
                onClose={() => setIsConfiguring(null)} 
                title={`Connect ${isConfiguring?.name}`}
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-surface-muted dark:bg-surface-muted-dark rounded-xl">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${isConfiguring?.color}`}>
                            {isConfiguring && <isConfiguring.icon className="w-6 h-6" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Echoes & {isConfiguring?.name}</h4>
                            <p className="text-xs text-text-secondary">Echoes will request access to post updates and sync data.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">API Key / Token</label>
                            <Input 
                                type="password" 
                                placeholder="Paste your token here..." 
                                value={configApiKey}
                                onChange={(e) => setConfigApiKey(e.target.value)}
                            />
                            <p className="text-[10px] text-text-tertiary">Found in {isConfiguring?.name} settings under Developer Tools.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border dark:border-border-dark flex flex-col gap-3">
                        <Button 
                            className="w-full h-11" 
                            disabled={!configApiKey || isConnecting}
                            onClick={handleSaveConfig}
                        >
                            {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize Integration'}
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => setIsConfiguring(null)}>Cancel</Button>
                    </div>
                    
                    <p className="text-center text-[10px] text-text-tertiary flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Secure AES-256 Encryption
                    </p>
                </div>
            </Modal>
        </div>
    );
};
