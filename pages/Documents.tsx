
import React, { useState } from 'react';
import { SectionHeader, Card, Button, Badge, Modal, Input } from '../components/ui/Primitives';
import { FileText, Plus, Search, MoreHorizontal, PenTool, Download, Send, CheckCircle2, ChevronLeft, Sparkles, Loader2, Image as ImageIcon, Type, AlignLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Document } from '../types';
import { useNotifications } from '../components/ui/NotificationSystem';
import { sendMessageToGemini } from '../services/gemini';

export const Documents: React.FC = () => {
    const { documents, addDocument, deals, userProfile, consumeAiCredit } = useData();
    const { addNotification } = useNotifications();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    // AI State for Editor
    const [isGenerating, setIsGenerating] = useState(false);
    const [editorContent, setEditorContent] = useState('');

    // AI State for List Summaries
    const [summaries, setSummaries] = useState<Record<string, string>>({});
    const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});

    const handleCreateDoc = (template: string) => {
        const newDoc: Document = {
            id: Date.now().toString(),
            title: `New ${template}`,
            client: 'Select Client',
            type: template.includes('Proposal') ? 'Proposal' : 'Contract',
            status: 'Draft',
            value: 0,
            lastModified: 'Just now',
            content: ''
        };
        addDocument(newDoc);
        setSelectedDoc(newDoc);
        setEditorContent('');
        setView('editor');
        setIsTemplateModalOpen(false);
    };

    const handleOpenDoc = (doc: Document) => {
        setSelectedDoc(doc);
        setEditorContent(doc.content || "<h1>Proposal for Services</h1><p>Prepared for: " + doc.client + "</p>");
        setView('editor');
    };

    const handleAiWrite = async () => {
        if (!selectedDoc) return;
        
        if (!consumeAiCredit()) {
            addNotification({ title: 'Limit Reached', message: 'Upgrade to Pro to use AI Magic Writer.', type: 'warning' });
            return;
        }

        setIsGenerating(true);
        const prompt = `Write a professional executive summary for a ${selectedDoc.type} document titled "${selectedDoc.title}". The client is ${selectedDoc.client}. Keep it persuasive and professional. Format with HTML p tags.`;
        
        try {
            const text = await sendMessageToGemini(prompt);
            setEditorContent(prev => prev + `<h3>Executive Summary</h3><p>${text}</p>`);
            addNotification({ title: 'AI Content Generated', message: 'Executive summary added to document.', type: 'success' });
        } catch (e) {
            addNotification({ title: 'Error', message: 'Failed to generate content.', type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateSummary = async (e: React.MouseEvent, doc: Document) => {
        e.stopPropagation();
        if (summaries[doc.id] || loadingSummaries[doc.id]) return;

        if (!consumeAiCredit()) {
            addNotification({ title: 'Limit Reached', message: 'Upgrade to Pro to use AI Summaries.', type: 'warning' });
            return;
        }

        setLoadingSummaries(prev => ({ ...prev, [doc.id]: true }));
        
        // Simulate checking document content
        const prompt = `Analyze the ${doc.type} titled "${doc.title}" for client "${doc.client}". 
        Create a concise 3-bullet point summary of what this document likely entails. 
        Format as plain text bullet points (e.g. • Point 1).`;

        try {
            const text = await sendMessageToGemini(prompt);
            setSummaries(prev => ({ ...prev, [doc.id]: text }));
            addNotification({ title: 'Summary Ready', message: 'Hover over the sparkle icon to view summary.', type: 'success' });
        } catch (error) {
            addNotification({ title: 'Error', message: 'Failed to generate summary.', type: 'error' });
        } finally {
            setLoadingSummaries(prev => ({ ...prev, [doc.id]: false }));
        }
    };

    if (view === 'editor' && selectedDoc) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border dark:border-border-dark">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => setView('list')}>Back</Button>
                        <div>
                            <Input 
                                value={selectedDoc.title} 
                                className="font-bold text-lg bg-transparent border-none p-0 focus:ring-0 h-auto"
                            />
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="neutral">Draft</Badge>
                                <span className="text-xs text-text-secondary">Last saved just now</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={Download}>PDF</Button>
                        <Button icon={Send} onClick={() => { addNotification({ title: 'Sent', message: 'Document sent to client.', type: 'success' }); setView('list'); }}>Send to Client</Button>
                    </div>
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Toolbar */}
                    <div className="w-64 flex flex-col gap-4 overflow-y-auto pr-2">
                         <Card padding="p-4" className="space-y-4">
                             <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Blocks</h4>
                             <div className="grid grid-cols-2 gap-2">
                                 <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-border hover:bg-surface-muted hover:border-primary-300 transition-all text-text-secondary hover:text-primary-600">
                                     <Type className="w-5 h-5 mb-1" />
                                     <span className="text-[10px] font-medium">Text</span>
                                 </button>
                                 <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-border hover:bg-surface-muted hover:border-primary-300 transition-all text-text-secondary hover:text-primary-600">
                                     <ImageIcon className="w-5 h-5 mb-1" />
                                     <span className="text-[10px] font-medium">Image</span>
                                 </button>
                                 <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-border hover:bg-surface-muted hover:border-primary-300 transition-all text-text-secondary hover:text-primary-600">
                                     <AlignLeft className="w-5 h-5 mb-1" />
                                     <span className="text-[10px] font-medium">Table</span>
                                 </button>
                                 <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-border hover:bg-surface-muted hover:border-primary-300 transition-all text-text-secondary hover:text-primary-600">
                                     <PenTool className="w-5 h-5 mb-1" />
                                     <span className="text-[10px] font-medium">Sign</span>
                                 </button>
                             </div>
                         </Card>

                         <Card padding="p-4" className="space-y-4">
                             <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Variables</h4>
                             <div className="space-y-2">
                                 {['{{Client.Name}}', '{{Deal.Value}}', '{{Date.Today}}', '{{User.Name}}'].map(v => (
                                     <div key={v} className="bg-surface-muted px-3 py-2 rounded text-xs font-mono text-text-secondary border border-border cursor-copy hover:border-primary-300 hover:text-primary-600 transition-colors">
                                         {v}
                                     </div>
                                 ))}
                             </div>
                         </Card>

                         <Button 
                            variant="secondary" 
                            className="bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-100 text-indigo-700"
                            icon={isGenerating ? Loader2 : Sparkles}
                            onClick={handleAiWrite}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Writing...' : 'Auto-Write Content'}
                        </Button>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 bg-surface-muted dark:bg-surface-subtle-dark overflow-y-auto p-8 rounded-xl border border-border flex justify-center">
                        <div className="w-[800px] min-h-[1000px] bg-white text-black p-12 shadow-sm rounded-sm">
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: editorContent || '<div class="text-gray-300 text-center py-20">Start typing or drag blocks here...</div>' }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="Documents"
                subtitle="Create proposals, contracts, and invoices."
                action={<Button icon={Plus} size="sm" onClick={() => setIsTemplateModalOpen(true)}>New Document</Button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => setIsTemplateModalOpen(true)}>
                     <div className="relative z-10">
                        <FileText className="w-8 h-8 mb-4 opacity-90" />
                        <h3 className="text-lg font-bold mb-1">Create Proposal</h3>
                        <p className="text-blue-100 text-sm">Win more deals with stunning proposals.</p>
                     </div>
                     <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                         <FileText className="w-32 h-32" />
                     </div>
                 </div>
                 <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => setIsTemplateModalOpen(true)}>
                     <div className="relative z-10">
                        <PenTool className="w-8 h-8 mb-4 opacity-90" />
                        <h3 className="text-lg font-bold mb-1">Send Contract</h3>
                        <p className="text-emerald-100 text-sm">Secure e-signatures in minutes.</p>
                     </div>
                     <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                         <PenTool className="w-32 h-32" />
                     </div>
                 </div>
                 <div className="p-6 rounded-xl bg-surface border border-border group cursor-pointer hover:border-primary-300 transition-all flex flex-col justify-center items-center text-center">
                     <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-3 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6" />
                     </div>
                     <h3 className="font-semibold text-text-primary">AI Generator</h3>
                     <p className="text-sm text-text-secondary mt-1">Let Nexus draft it for you.</p>
                 </div>
            </div>

            <Card className="flex-1 flex flex-col" padding="p-0">
                <div className="flex items-center gap-4 p-4 border-b border-border">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input type="text" placeholder="Search documents..." className="w-full pl-9 pr-4 py-2 bg-surface-subtle border border-border rounded-lg text-sm focus:outline-none focus:border-primary-500" />
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-subtle border-b border-border sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase">Title</th>
                                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase">Client</th>
                                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase">Type</th>
                                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase">Details</th>
                                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase">AI Summary</th>
                                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase text-right">Last Modified</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {documents.map(doc => (
                                <tr key={doc.id} className="hover:bg-surface-subtle/50 cursor-pointer group" onClick={() => handleOpenDoc(doc)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-primary-50 flex items-center justify-center text-primary-600">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-text-primary">{doc.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">{doc.client}</td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">{doc.type}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-sm font-medium text-text-primary">${doc.value.toLocaleString()}</span>
                                            <Badge variant={
                                                doc.status === 'Signed' ? 'success' :
                                                doc.status === 'Sent' ? 'brand' :
                                                'neutral'
                                            }>{doc.status}</Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative flex items-center group/tooltip w-max">
                                            <button 
                                                onClick={(e) => handleGenerateSummary(e, doc)}
                                                className={`p-2 rounded-full transition-all ${
                                                    summaries[doc.id] 
                                                    ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-200' 
                                                    : 'hover:bg-surface-muted text-text-tertiary hover:text-primary-500'
                                                }`}
                                            >
                                                {loadingSummaries[doc.id] ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4" />
                                                )}
                                            </button>
                                            
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1F2937] text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-700">
                                                {summaries[doc.id] ? (
                                                    <>
                                                        <div className="font-bold mb-1.5 flex items-center gap-1.5 text-primary-400 border-b border-gray-700 pb-1">
                                                            <Sparkles className="w-3 h-3" /> AI Summary
                                                        </div>
                                                        <div className="whitespace-pre-wrap leading-relaxed text-gray-300 font-normal">
                                                            {summaries[doc.id]}
                                                        </div>
                                                    </>
                                                ) : (
                                                    "Click to generate AI Summary"
                                                )}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1F2937]"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-tertiary text-right">{doc.lastModified}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title="Choose Template">
                <div className="grid grid-cols-2 gap-4">
                    {['Marketing Proposal', 'SaaS Contract', 'NDA Agreement', 'Project Brief'].map(t => (
                        <button 
                            key={t}
                            onClick={() => handleCreateDoc(t)}
                            className="p-4 border border-border rounded-xl text-left hover:border-primary-500 hover:ring-1 hover:ring-primary-500 transition-all group"
                        >
                            <div className="w-10 h-10 bg-surface-muted rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-50 group-hover:text-primary-600">
                                <FileText className="w-5 h-5 text-text-secondary group-hover:text-primary-600" />
                            </div>
                            <h4 className="font-medium text-text-primary">{t}</h4>
                            <p className="text-xs text-text-secondary mt-1">Professional template</p>
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
};
