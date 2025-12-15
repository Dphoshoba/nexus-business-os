import React, { useState } from 'react';
import { SectionHeader, Card, Button, Badge, Modal, Input } from '../components/ui/Primitives';
import { Megaphone, Plus, Calendar, Twitter, Linkedin, Instagram, Sparkles, Loader2, Image as ImageIcon, Send, Clock, MoreHorizontal, Heart, MessageSquare } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { sendMessageToGemini } from '../services/gemini';
import { SocialPost, SocialPlatform } from '../types';

export const Social: React.FC = () => {
    const { socialPosts, addSocialPost, userProfile } = useData();
    const { addNotification } = useNotifications();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Create Post State
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('twitter');
    const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
    const [scheduleTime, setScheduleTime] = useState('09:00');
    
    // AI State
    const [isGenerating, setIsGenerating] = useState(false);

    // Filter Logic
    const upcomingPosts = socialPosts.filter(p => p.status === 'Scheduled' || p.status === 'Published').sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    const PlatformIcon = ({ platform, className="w-4 h-4" }: { platform: SocialPlatform, className?: string }) => {
        switch(platform) {
            case 'twitter': return <Twitter className={`${className} text-sky-500`} />;
            case 'linkedin': return <Linkedin className={`${className} text-blue-700`} />;
            case 'instagram': return <Instagram className={`${className} text-pink-600`} />;
            default: return <Megaphone className={className} />;
        }
    };

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        const post: SocialPost = {
            id: Date.now().toString(),
            content: newPostContent,
            platform: selectedPlatform,
            status: 'Scheduled',
            scheduledDate: scheduleDate,
            scheduledTime: scheduleTime,
            likes: 0,
            comments: 0
        };
        addSocialPost(post);
        setIsCreateModalOpen(false);
        setNewPostContent('');
        addNotification({ title: 'Post Scheduled', message: `Content queued for ${selectedPlatform}.`, type: 'success' });
    };

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        const prompt = `Write a viral, professional social media post for ${selectedPlatform} about a new software feature launch for "Nexus Business OS". Include 2 emojis and 3 hashtags. Keep it under 280 characters if Twitter.`;
        try {
            const text = await sendMessageToGemini(prompt);
            setNewPostContent(text);
        } catch (e) {
            addNotification({ title: 'AI Error', message: 'Could not generate content.', type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="Social Marketing"
                subtitle="Plan, create, and schedule your brand content."
                action={<Button icon={Plus} size="sm" onClick={() => setIsCreateModalOpen(true)}>Create Post</Button>}
            />

            <div className="flex flex-col lg:flex-row h-full min-h-0 gap-6">
                {/* Calendar Grid (Simulated) */}
                <div className="flex-1 bg-surface border border-border dark:border-border-dark rounded-xl overflow-hidden flex flex-col shadow-sm">
                    <div className="p-4 border-b border-border dark:border-border-dark flex items-center justify-between bg-surface-subtle/30">
                        <h3 className="font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Content Calendar
                        </h3>
                        <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500"></span> Twitter</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-700"></span> LinkedIn</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {upcomingPosts.map(post => (
                                <div key={post.id} className="border border-border dark:border-border-dark rounded-xl p-4 bg-surface hover:shadow-md transition-shadow relative group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <PlatformIcon platform={post.platform} />
                                            <span className="text-xs font-semibold capitalize text-text-secondary">{post.platform}</span>
                                        </div>
                                        <Badge variant={post.status === 'Published' ? 'success' : 'brand'}>{post.status}</Badge>
                                    </div>
                                    <p className="text-sm text-text-primary dark:text-text-primary-dark mb-4 line-clamp-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                    <div className="flex items-center justify-between text-xs text-text-tertiary pt-3 border-t border-border dark:border-border-dark">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {post.scheduledDate} {post.scheduledTime}
                                        </span>
                                        {post.status === 'Published' && (
                                            <div className="flex gap-3">
                                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                                                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button className="absolute top-2 right-2 p-1 text-text-tertiary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            
                            {/* Empty State / Add Placeholder */}
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="border-2 border-dashed border-border dark:border-border-dark rounded-xl p-4 flex flex-col items-center justify-center text-text-tertiary hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50/10 transition-all min-h-[150px]"
                            >
                                <Plus className="w-8 h-8 mb-2" />
                                <span className="text-sm font-medium">Schedule Post</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="w-full lg:w-80 flex flex-col gap-6">
                    <Card>
                        <h3 className="font-bold text-text-primary dark:text-text-primary-dark mb-4">Channel Performance</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="flex items-center gap-1"><Twitter className="w-3 h-3 text-sky-500" /> Twitter</span>
                                    <span className="font-medium">1.2k followers</span>
                                </div>
                                <div className="w-full h-1.5 bg-surface-muted dark:bg-surface-muted-dark rounded-full overflow-hidden">
                                    <div className="h-full bg-sky-500 w-[65%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="flex items-center gap-1"><Linkedin className="w-3 h-3 text-blue-700" /> LinkedIn</span>
                                    <span className="font-medium">850 followers</span>
                                </div>
                                <div className="w-full h-1.5 bg-surface-muted dark:bg-surface-muted-dark rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-700 w-[45%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="flex items-center gap-1"><Instagram className="w-3 h-3 text-pink-600" /> Instagram</span>
                                    <span className="font-medium">2.4k followers</span>
                                </div>
                                <div className="w-full h-1.5 bg-surface-muted dark:bg-surface-muted-dark rounded-full overflow-hidden">
                                    <div className="h-full bg-pink-600 w-[80%]"></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">AI Content Studio</h3>
                            <p className="text-sm text-indigo-100 mb-4">Generate a full week of content in seconds based on your industry trends.</p>
                            <Button className="bg-white text-indigo-700 hover:bg-indigo-50 border-none w-full">
                                <Sparkles className="w-4 h-4 mr-2" /> Auto-Generate Plan
                            </Button>
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-20">
                            <Sparkles className="w-32 h-32" />
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Post">
                <div className="flex flex-col md:flex-row gap-6">
                    <form onSubmit={handleCreatePost} className="flex-1 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-text-secondary">Platform</label>
                            <div className="flex gap-2">
                                {['twitter', 'linkedin', 'instagram'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setSelectedPlatform(p as SocialPlatform)}
                                        className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                                            selectedPlatform === p 
                                            ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
                                            : 'border-border hover:bg-surface-muted dark:border-border-dark dark:hover:bg-surface-muted-dark'
                                        }`}
                                    >
                                        <PlatformIcon platform={p as SocialPlatform} />
                                        <span className="capitalize text-sm font-medium">{p}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <label className="text-xs font-medium text-text-secondary">Content</label>
                                <button 
                                    type="button" 
                                    onClick={handleAiGenerate} 
                                    className="text-xs font-medium text-primary-600 flex items-center gap-1 hover:underline"
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    AI Assist
                                </button>
                            </div>
                            <textarea 
                                className="w-full p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 min-h-[120px]"
                                placeholder="What's on your mind?"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-text-secondary">Date</label>
                                <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-text-secondary">Time</label>
                                <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} required />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="secondary" className="flex-1" icon={ImageIcon}>Add Media</Button>
                            <Button type="submit" className="flex-1">Schedule</Button>
                        </div>
                    </form>

                    {/* Live Preview */}
                    <div className="w-full md:w-72 bg-surface-muted/50 dark:bg-surface-muted-dark/30 rounded-xl p-4 border border-border/50 dark:border-border-dark/50 flex flex-col">
                        <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3 text-center">Preview</h4>
                        <div className="bg-white dark:bg-surface-dark rounded-lg p-4 shadow-sm border border-border dark:border-border-dark flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div>
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                                    <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                </div>
                                <div className="ml-auto">
                                    <PlatformIcon platform={selectedPlatform} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                {newPostContent ? (
                                    <p className="text-sm text-text-primary dark:text-text-primary-dark whitespace-pre-wrap">{newPostContent}</p>
                                ) : (
                                    <>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                                        <div className="h-2 w-[90%] bg-gray-100 dark:bg-gray-800 rounded"></div>
                                        <div className="h-2 w-[60%] bg-gray-100 dark:bg-gray-800 rounded"></div>
                                    </>
                                )}
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between text-gray-400">
                                <div className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                <div className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                <div className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};