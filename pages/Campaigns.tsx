import React, { useState } from 'react';
import { SectionHeader, Card, Button, Badge, Modal, Input } from '../components/ui/Primitives';
import { Send, Plus, Users, BarChart3, ChevronLeft, Sparkles, Loader2, Image as ImageIcon, Type, Link as LinkIcon, Eye, Clock, Mail } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { sendMessageToGemini } from '../services/gemini';
import { Campaign } from '../types';

export const Campaigns: React.FC = () => {
    const { campaigns, addCampaign, updateCampaign } = useData();
    const { addNotification } = useNotifications();
    
    // UI State
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Editor State
    const [editorContent, setEditorContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Form State
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignSubject, setNewCampaignSubject] = useState('');

    const handleCreateCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        const campaign: Campaign = {
            id: Date.now().toString(),
            name: newCampaignName,
            subject: newCampaignSubject,
            status: 'Draft',
            audience: 'All Leads',
            stats: { sent: 0, openRate: 0, clickRate: 0 },
            content: ''
        };
        addCampaign(campaign);
        setSelectedCampaign(campaign);
        setEditorContent('');
        setView('editor');
        setIsCreateModalOpen(false);
        setNewCampaignName('');
        setNewCampaignSubject('');
        addNotification({ title: 'Campaign Created', message: 'Draft saved. Start designing your email.', type: 'success' });
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setEditorContent(campaign.content || '');
        setView('editor');
    };

    const handleAiWrite = async () => {
        if (!selectedCampaign) return;
        setIsGenerating(true);
        const prompt = `Write a professional marketing email body for a campaign titled "${selectedCampaign.name}" with subject "${selectedCampaign.subject}". Keep it engaging, 2 paragraphs, use HTML formatting with <p> and <strong> tags only.`;
        
        try {
            const text = await sendMessageToGemini(prompt);
            setEditorContent(prev => prev + text);
        } catch (e) {
            addNotification({ title: 'AI Error', message: 'Could not generate content.', type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendCampaign = () => {
        if (!selectedCampaign) return;
        setIsSending(true);
        setTimeout(() => {
            updateCampaign({
                ...selectedCampaign,
                status: 'Sent',
                sentDate: new Date().toLocaleDateString(),
                content: editorContent,
                stats: { sent: Math.floor(Math.random() * 500) + 100, openRate: 0, clickRate: 0 }
            });
            setIsSending(false);
            setView('list');
            addNotification({ title: 'Campaign Sent', message: 'Emails are being delivered to your audience.', type: 'success' });
        }, 2000);
    };

    const addBlock = (type: string) => {
        const blocks: any = {
            text: '<p class="text-gray-700 mb-4">Click to edit text...</p>',
            image: '<div class="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4 text-gray-400">Image Placeholder</div>',
            button: '<div class="text-center mb-4"><a href="#" class="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">Call to Action</a></div>'
        };
        setEditorContent(prev => prev + blocks[type]);
    };

    if (view === 'editor' && selectedCampaign) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border dark:border-border-dark">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => setView('list')}>Back</Button>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{selectedCampaign.name}</h2>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">Subject: {selectedCampaign.subject}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={Eye}>Preview</Button>
                        <Button 
                            icon={isSending ? Loader2 : Send} 
                            onClick={handleSendCampaign}
                            disabled={isSending}
                        >
                            {isSending ? 'Sending...' : 'Send Broadcast'}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Components Panel */}
                    <div className="w-72 flex flex-col gap-4 overflow-y-auto pr-2">
                        <Card padding="p-4" className="space-y-4">
                            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Drag Components</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => addBlock('text')} className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-surface-muted hover:border-primary-300 transition-all text-text-secondary hover:text-primary-600">
                                    <Type className="w-6 h-6 mb-2" />
                                    <span className="text-xs font-medium">Text</span>
                                </button>
                                <button onClick={() => addBlock('image')} className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-surface-muted hover:border-primary-300 transition-all text-text-secondary hover:text-primary-600">
                                    <ImageIcon className="w-6 h-6 mb-2" />
                                    <span className="text-xs font-medium">Image</span>
                                </button>
                                <button onClick={() => addBlock('button')} className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-surface-muted hover:border-primary-300 transition-all text-text-secondary hover:text-primary-600">
                                    <LinkIcon className="w-6 h-6 mb-2" />
                                    <span className="text-xs font-medium">Button</span>
                                </button>
                            </div>
                        </Card>

                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/30">
                            <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-400 font-semibold text-sm">
                                <Sparkles className="w-4 h-4" /> AI Magic Writer
                            </div>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-4 leading-relaxed">
                                Let Gemini write persuasive copy for your campaign based on the subject line.
                            </p>
                            <Button 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-transparent" 
                                size="sm"
                                onClick={handleAiWrite}
                                disabled={isGenerating}
                            >
                                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : 'Generate Content'}
                            </Button>
                        </div>
                    </div>

                    {/* Preview Canvas */}
                    <div className="flex-1 bg-surface-muted dark:bg-surface-subtle-dark rounded-xl border border-border dark:border-border-dark flex justify-center overflow-y-auto p-8">
                        <div className="w-[600px] min-h-[800px] bg-white text-black shadow-lg rounded-lg p-8">
                            <div className="border-b border-gray-100 pb-6 mb-6">
                                <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div 
                                className="prose max-w-none" 
                                dangerouslySetInnerHTML={{ __html: editorContent || '<div class="text-center text-gray-400 py-20 border-2 border-dashed border-gray-200 rounded-lg">Drag blocks or use AI to start writing</div>' }}
                            />
                            {editorContent && (
                                <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                                    <p>Sent via Nexus Business OS</p>
                                    <p className="mt-2">Unsubscribe | View in Browser</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="Campaigns"
                subtitle="Email marketing, newsletters, and broadcasts."
                action={<Button icon={Plus} size="sm" onClick={() => setIsCreateModalOpen(true)}>New Campaign</Button>}
            />

            {/* List View */}
            <div className="grid gap-4">
                {campaigns.map(campaign => (
                    <Card 
                        key={campaign.id} 
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary-200 dark:hover:border-primary-700 transition-colors cursor-pointer group"
                        onClick={() => handleEditCampaign(campaign)}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${campaign.status === 'Sent' ? 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400' : 'bg-surface-muted border-border dark:bg-surface-muted-dark dark:border-border-dark text-text-tertiary'}`}>
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-text-primary dark:text-text-primary-dark group-hover:text-primary-600 transition-colors">{campaign.name}</h3>
                                    <Badge variant={campaign.status === 'Sent' ? 'success' : campaign.status === 'Scheduled' ? 'warning' : 'neutral'}>{campaign.status}</Badge>
                                </div>
                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">{campaign.subject}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.audience}</span>
                                    {campaign.sentDate && <span>• Sent on {campaign.sentDate}</span>}
                                </div>
                            </div>
                        </div>

                        {campaign.status === 'Sent' ? (
                            <div className="flex items-center gap-8 border-t md:border-t-0 border-border dark:border-border-dark pt-4 md:pt-0">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Sent</span>
                                    <span className="text-sm font-bold text-text-primary dark:text-text-primary-dark">{campaign.stats.sent}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Open Rate</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">{campaign.stats.openRate}%</span>
                                        <BarChart3 className="w-3 h-3 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Clicks</span>
                                    <span className="text-sm font-bold text-text-primary dark:text-text-primary-dark">{campaign.stats.clickRate}%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center text-sm text-text-tertiary">
                                <Clock className="w-4 h-4 mr-2" />
                                Last edited just now
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Campaign">
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Campaign Name</label>
                        <Input 
                            placeholder="e.g. October Product Update" 
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Subject Line</label>
                        <Input 
                            placeholder="e.g. You won't believe what's new..." 
                            value={newCampaignSubject}
                            onChange={(e) => setNewCampaignSubject(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Audience</label>
                        <select className="w-full h-[38px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none">
                            <option>All Leads</option>
                            <option>Customers (Paid)</option>
                            <option>Newsletter Subscribers</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Draft</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};