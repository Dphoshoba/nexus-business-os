
import React, { useState } from 'react';
import { SectionHeader, Card, Button, Input, Badge, Tabs } from '../components/ui/Primitives';
import { 
    Plus, Search, Edit2, Trash2, Eye, Sparkles, Loader2, 
    Image as ImageIcon, Send, Clock, BookOpen, Globe,
    Layout, FileText, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';
import { BlogPost } from '../types';
import { sendMessageToGemini } from '../services/gemini';

export const BlogAdmin: React.FC = () => {
    const { addNotification } = useNotifications();
    const { consumeAiCredit } = useData();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [activeTab, setActiveTab] = useState('All Posts');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editorTitle, setEditorTitle] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [aiIdea, setAiIdea] = useState('');

    const handleGenerateDraft = async () => {
        if (!aiIdea.trim()) return;
        if (!consumeAiCredit()) {
            addNotification({ title: 'Limit Reached', message: 'Upgrade to Pro to use AI Blog Writer.', type: 'warning' });
            return;
        }

        setIsGenerating(true);
        const prompt = `Write a professional, long-form blog post about "${aiIdea}". 
            Format the output with HTML tags: <h3> for subheadings, <p> for body text, and a <blockquote> for a key insight. 
            Keep the tone strategic and visionary.`;
        
        try {
            const result = await sendMessageToGemini(prompt);
            setEditorContent(result);
            setEditorTitle(aiIdea);
            setView('editor');
            addNotification({ title: 'Draft Generated', message: 'AI has finished writing your post.', type: 'success' });
        } catch (e) {
            addNotification({ title: 'AI Error', message: 'Could not generate draft.', type: 'error' });
        } finally {
            setIsGenerating(false);
            setAiIdea('');
        }
    };

    if (view === 'editor') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border dark:border-border-dark">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => setView('list')}>Back</Button>
                        <Input 
                            value={editorTitle} 
                            onChange={(e) => setEditorTitle(e.target.value)}
                            placeholder="Post Title" 
                            className="font-bold text-xl bg-transparent border-none p-0 focus:ring-0 w-96" 
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={Eye}>Preview</Button>
                        <Button icon={Send} onClick={() => { setView('list'); addNotification({title:'Published', message:'Post is live on your journal.', type:'success'}); }}>Publish Post</Button>
                    </div>
                </div>

                <div className="flex-1 flex gap-8 overflow-hidden">
                    <div className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-8 overflow-y-auto">
                        <textarea 
                            className="w-full h-full bg-transparent resize-none outline-none font-mono text-sm leading-relaxed"
                            value={editorContent}
                            onChange={(e) => setEditorContent(e.target.value)}
                            placeholder="Write your story in HTML or Markdown..."
                        ></textarea>
                    </div>
                    
                    <div className="w-80 flex flex-col gap-6 shrink-0">
                        <Card>
                            <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-4">Post Settings</h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text-secondary">Category</label>
                                    <select className="w-full bg-surface-subtle dark:bg-surface-muted-dark border border-border dark:border-border-dark rounded-lg text-sm px-3 py-2 outline-none">
                                        <option>Intelligence</option>
                                        <option>Operations</option>
                                        <option>Growth</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text-secondary">Featured Image</label>
                                    <div className="aspect-video bg-surface-muted dark:bg-surface-muted-dark rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border dark:border-border-dark cursor-pointer hover:border-primary-500 transition-colors">
                                        <ImageIcon className="w-6 h-6 text-text-tertiary mb-2" />
                                        <span className="text-[10px] text-text-tertiary">Click to upload</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        
                        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                            <h5 className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm mb-2">
                                <Sparkles className="w-4 h-4" /> SEO Wizard
                            </h5>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-4">Echoes is optimizing this post for "AI Strategy" and "Business Growth" keywords.</p>
                            <Button size="sm" variant="secondary" className="w-full">Re-calculate Score</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="Content Manager"
                subtitle="Draft, publish, and automate your company journal."
                action={<Button icon={Plus} size="sm" onClick={() => { setEditorTitle(''); setEditorContent(''); setView('editor'); }}>New Post</Button>}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                <div className="space-y-6">
                    <Tabs tabs={['All Posts', 'Drafts', 'Published']} activeTab={activeTab} onTabChange={setActiveTab} />
                    
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <Card key={i} className="flex items-center justify-between hover:border-primary-200 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-12 rounded bg-surface-muted dark:bg-surface-muted-dark flex items-center justify-center overflow-hidden">
                                        <FileText className="w-5 h-5 text-text-tertiary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary dark:text-text-primary-dark group-hover:text-primary-600 transition-colors">How AI is scaling agencies to 7-figures</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary font-medium uppercase tracking-wider">
                                            <span>Operations</span>
                                            <span>•</span>
                                            <span>Nov 12, 2024</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" icon={Edit2} />
                                    <Button variant="ghost" size="sm" icon={Trash2} className="text-red-500" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-bold tracking-wide text-indigo-100 uppercase">Echoes Writer</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Generate a new article</h3>
                            <p className="text-indigo-100 text-xs mb-4 leading-relaxed">Enter a topic or idea, and Echoes will draft a strategic blog post for you instantly.</p>
                            <Input 
                                placeholder="Topic idea..." 
                                className="bg-white/10 border-white/20 text-white placeholder:text-indigo-200 mb-3" 
                                value={aiIdea}
                                onChange={(e) => setAiIdea(e.target.value)}
                            />
                            <Button 
                                className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border-none font-bold" 
                                size="sm"
                                onClick={handleGenerateDraft}
                                disabled={isGenerating || !aiIdea}
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Draft'}
                            </Button>
                        </div>
                        <Sparkles className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
                    </Card>

                    <Card>
                        <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-primary-500" /> Social Syndication</h4>
                        <p className="text-xs text-text-secondary leading-relaxed mb-4">Auto-post summaries to LinkedIn and Twitter whenever you publish.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 rounded bg-surface-subtle dark:bg-white/5">
                                <span className="text-xs font-medium">LinkedIn</span>
                                <Badge variant="success">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded bg-surface-subtle dark:bg-white/5">
                                <span className="text-xs font-medium">Twitter</span>
                                <Badge variant="neutral">Disabled</Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
