import React, { useState, useEffect, useRef } from 'react';
import { SectionHeader, Card, Button, Input, Badge } from '../components/ui/Primitives';
import { Mail, Search, Paperclip, Send, MoreHorizontal, Phone, Star, Trash2, Archive, Loader2, Sparkles, User, Tag, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { sendMessageToGemini } from '../services/gemini';
import { Message, Conversation } from '../types';

export const Inbox: React.FC = () => {
    const { conversations, messages, contacts, addMessage, markConversationRead, deals, invoices } = useData();
    const { addNotification } = useNotifications();
    
    // UI State
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isAiDrafting, setIsAiDrafting] = useState(false);
    const [filter, setFilter] = useState<'All' | 'Unread'>('All');
    
    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Derived State
    const filteredConversations = conversations.filter(c => filter === 'All' || c.unread);
    const selectedConversation = conversations.find(c => c.id === selectedConversationId);
    const currentMessages = messages.filter(m => m.conversationId === selectedConversationId);
    const currentContact = contacts.find(c => c.id === selectedConversation?.contactId);

    // Context Data for Sidebar
    const relatedDeals = deals.filter(d => d.company === currentContact?.company);
    const relatedInvoices = invoices.filter(i => i.client === currentContact?.company || i.client === currentContact?.name);

    useEffect(() => {
        if (selectedConversationId && selectedConversation?.unread) {
            markConversationRead(selectedConversationId);
        }
        scrollToBottom();
    }, [selectedConversationId, messages]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!replyText.trim() || !selectedConversationId) return;

        const msg: Message = {
            id: Date.now().toString(),
            conversationId: selectedConversationId,
            sender: 'me',
            text: replyText,
            timestamp: 'Just now'
        };
        addMessage(msg);
        setReplyText('');
    };

    const handleAiDraft = async () => {
        if (!selectedConversation || !currentMessages.length) return;
        setIsAiDrafting(true);

        const historyText = currentMessages.map(m => `${m.sender === 'me' ? 'Me' : 'Client'}: ${m.text}`).join('\n');
        const prompt = `Draft a professional and concise reply to the following conversation thread. Address the client's last point directly.
        
        Thread:
        ${historyText}
        
        Draft:`;

        try {
            const draft = await sendMessageToGemini(prompt);
            setReplyText(draft);
            addNotification({ title: 'AI Draft Ready', message: 'Review the draft before sending.', type: 'info' });
        } catch (e) {
            addNotification({ title: 'AI Error', message: 'Failed to generate draft.', type: 'error' });
        } finally {
            setIsAiDrafting(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <SectionHeader
                title="Inbox"
                subtitle="Unified communication hub."
            />

            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                {/* Conversation List */}
                <div className="w-80 flex flex-col bg-surface border border-border dark:border-border-dark rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-border dark:border-border-dark space-y-3">
                         <Input icon={Search} placeholder="Search messages..." />
                         <div className="flex gap-2">
                             {['All', 'Unread'].map(f => (
                                 <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex-1 ${
                                        filter === f 
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
                                        : 'bg-surface-muted text-text-secondary hover:bg-surface-subtle dark:hover:bg-surface-muted-dark'
                                    }`}
                                 >
                                     {f}
                                 </button>
                             ))}
                         </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.map(conv => {
                            const contact = contacts.find(c => c.id === conv.contactId);
                            const isActive = conv.id === selectedConversationId;
                            
                            return (
                                <div 
                                    key={conv.id}
                                    onClick={() => setSelectedConversationId(conv.id)}
                                    className={`p-4 border-b border-border dark:border-border-dark cursor-pointer transition-colors hover:bg-surface-subtle dark:hover:bg-surface-muted-dark ${isActive ? 'bg-primary-50/50 dark:bg-primary-900/10 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-bold ${conv.unread ? 'text-text-primary dark:text-text-primary-dark' : 'text-text-secondary dark:text-text-secondary-dark'}`}>
                                            {contact?.name || 'Unknown'}
                                        </h4>
                                        <span className="text-[10px] text-text-tertiary">{conv.timestamp}</span>
                                    </div>
                                    <p className="text-xs font-medium text-text-primary dark:text-text-primary-dark mb-1 truncate">{conv.subject}</p>
                                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark truncate opacity-80">{conv.lastMessage}</p>
                                    <div className="flex gap-1 mt-2">
                                        {conv.tags.map(t => (
                                            <span key={t} className="text-[9px] px-1.5 py-0.5 bg-surface-muted dark:bg-surface-muted-dark rounded border border-border dark:border-border-dark text-text-secondary">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Message View */}
                <div className="flex-1 flex flex-col bg-surface border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="h-16 border-b border-border dark:border-border-dark flex items-center justify-between px-6 bg-surface-subtle/30">
                                 <div>
                                     <h3 className="font-bold text-text-primary dark:text-text-primary-dark">{selectedConversation.subject}</h3>
                                     <div className="flex items-center gap-2 text-xs text-text-secondary">
                                         <span className="flex items-center gap-1"><User className="w-3 h-3" /> {currentContact?.name}</span>
                                         <span>&bull;</span>
                                         <span>{currentContact?.email}</span>
                                     </div>
                                 </div>
                                 <div className="flex gap-2">
                                     <Button variant="ghost" size="sm" icon={Phone} />
                                     <Button variant="ghost" size="sm" icon={Star} />
                                     <Button variant="ghost" size="sm" icon={Archive} />
                                     <Button variant="ghost" size="sm" icon={Trash2} className="text-red-500 hover:text-red-600 hover:bg-red-50" />
                                 </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-subtle/10">
                                {currentMessages.map(msg => {
                                    const isMe = msg.sender === 'me';
                                    return (
                                        <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                 {isMe ? 'Me' : currentContact?.name.charAt(0)}
                                             </div>
                                             <div className={`max-w-[70%] space-y-1`}>
                                                 <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                                                     isMe 
                                                     ? 'bg-primary-600 text-white rounded-tr-none' 
                                                     : 'bg-white dark:bg-surface-dark border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark rounded-tl-none'
                                                 }`}>
                                                     {msg.text}
                                                 </div>
                                                 <p className={`text-[10px] text-text-tertiary ${isMe ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
                                             </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Composer */}
                            <div className="p-4 border-t border-border dark:border-border-dark bg-surface">
                                {replyText && (
                                    <div className="mb-2 flex justify-end">
                                        <Badge variant="brand" className="animate-in fade-in zoom-in">Draft</Badge>
                                    </div>
                                )}
                                <div className="relative">
                                    <textarea 
                                        className="w-full p-4 pr-12 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 min-h-[100px] resize-none"
                                        placeholder="Type your reply..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                handleSendMessage();
                                            }
                                        }}
                                    ></textarea>
                                    
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" icon={Paperclip} />
                                            <Button 
                                                variant="secondary" 
                                                size="sm" 
                                                className="text-primary-600 border-primary-200 bg-primary-50"
                                                icon={isAiDrafting ? Loader2 : Sparkles}
                                                onClick={handleAiDraft}
                                                disabled={isAiDrafting}
                                            >
                                                {isAiDrafting ? 'Drafting...' : 'AI Draft'}
                                            </Button>
                                        </div>
                                        <Button icon={Send} onClick={() => handleSendMessage()}>Send Reply</Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary">
                            <Mail className="w-12 h-12 mb-3 opacity-20" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>

                {/* Context Sidebar */}
                {selectedConversation && (
                    <div className="w-72 hidden xl:flex flex-col gap-4">
                        <Card className="flex-1 overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto rounded-full bg-surface-muted dark:bg-surface-muted-dark border border-border dark:border-border-dark flex items-center justify-center text-2xl font-bold text-text-secondary mb-3">
                                    {currentContact?.name.charAt(0)}
                                </div>
                                <h3 className="font-bold text-text-primary dark:text-text-primary-dark">{currentContact?.name}</h3>
                                <p className="text-sm text-text-secondary">{currentContact?.role} at {currentContact?.company}</p>
                                <div className="flex justify-center gap-2 mt-3">
                                    <Badge variant={currentContact?.status === 'Active' ? 'success' : 'neutral'}>{currentContact?.status}</Badge>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Active Deals</h4>
                                    {relatedDeals.length > 0 ? (
                                        <div className="space-y-2">
                                            {relatedDeals.map(deal => (
                                                <div key={deal.id} className="p-3 bg-surface-subtle dark:bg-surface-muted-dark rounded-lg border border-border dark:border-border-dark">
                                                    <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">{deal.title}</p>
                                                    <div className="flex justify-between mt-1 text-xs">
                                                        <span className="font-medium text-primary-600">${deal.value.toLocaleString()}</span>
                                                        <span className="text-text-secondary">{deal.stage}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-text-tertiary italic">No active deals.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Recent Invoices</h4>
                                    {relatedInvoices.length > 0 ? (
                                        <div className="space-y-2">
                                            {relatedInvoices.map(inv => (
                                                <div key={inv.id} className="flex justify-between items-center text-sm">
                                                    <span className="text-text-secondary">#{inv.id}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">${inv.amount}</span>
                                                        <span className={`w-2 h-2 rounded-full ${inv.status === 'Paid' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-text-tertiary italic">No invoices found.</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};