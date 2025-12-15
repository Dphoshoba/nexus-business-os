import React, { useState } from 'react';
import { SectionHeader, Card, Button, Badge, Modal, Input, Drawer, Tabs } from '../components/ui/Primitives';
import { Users, UserPlus, Mail, MessageSquare, MoreHorizontal, Sparkles, Loader2, GripVertical, CheckCircle2, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { sendMessageToGemini } from '../services/gemini';
import { Candidate, TeamMember } from '../types';

export const Team: React.FC = () => {
    const { teamMembers, candidates, addCandidate, updateCandidate, userProfile } = useData();
    const { addNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState('Directory');
    
    // Recruiting State
    const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
    const [newCandidate, setNewCandidate] = useState({ name: '', role: '', email: '' });
    const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);
    
    // AI Interviewer State
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [interviewScript, setInterviewScript] = useState('');
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);

    const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

    // --- Actions ---
    const handleAddCandidate = (e: React.FormEvent) => {
        e.preventDefault();
        const candidate: Candidate = {
            id: Date.now().toString(),
            name: newCandidate.name,
            role: newCandidate.role,
            email: newCandidate.email,
            stage: 'Applied',
            appliedDate: 'Just now',
            matchScore: Math.floor(Math.random() * 30) + 70 // Mock score
        };
        addCandidate(candidate);
        setIsAddCandidateOpen(false);
        setNewCandidate({ name: '', role: '', email: '' });
        addNotification({ title: 'Candidate Added', message: `${candidate.name} added to pipeline.`, type: 'success' });
    };

    const handleGenerateInterview = async (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsGeneratingScript(true);
        const prompt = `Generate a structured interview script for a ${candidate.role} position. The candidate is ${candidate.name}. Include 3 technical questions, 2 behavioral questions, and a key trait to look for. Format in markdown.`;
        
        try {
            const script = await sendMessageToGemini(prompt);
            setInterviewScript(script);
        } catch (e) {
            setInterviewScript("Could not generate script.");
        } finally {
            setIsGeneratingScript(false);
        }
    };

    // --- Drag and Drop ---
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedCandidateId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, stage: string) => {
        e.preventDefault();
        setDragOverStage(stage);
    };

    const handleDrop = (e: React.DragEvent, stage: string) => {
        e.preventDefault();
        setDragOverStage(null);
        if (draggedCandidateId) {
            const candidate = candidates.find(c => c.id === draggedCandidateId);
            if (candidate && candidate.stage !== stage) {
                updateCandidate({ ...candidate, stage: stage as any });
                addNotification({ title: 'Stage Updated', message: `${candidate.name} moved to ${stage}`, type: 'info' });
            }
            setDraggedCandidateId(null);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="Team & Recruiting"
                subtitle="Manage your people and grow your team."
                action={<Button icon={UserPlus} size="sm" onClick={() => setIsAddCandidateOpen(true)}>Add Candidate</Button>}
            />

            <Tabs 
                tabs={['Directory', 'Recruiting']} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            {activeTab === 'Directory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-4">
                    {teamMembers.map(member => (
                        <Card key={member.id} className="flex flex-col items-center text-center p-6 hover:border-primary-200 dark:hover:border-primary-700 transition-colors group relative">
                            <button className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                            
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-md">
                                {member.name ? member.name.charAt(0) : 'U'}
                            </div>
                            
                            <h3 className="font-bold text-lg text-text-primary dark:text-text-primary-dark">{member.name || 'Invited User'}</h3>
                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{member.role}</p>
                            <p className="text-xs text-text-tertiary mt-1">{member.department || 'General'}</p>
                            
                            <div className="mt-6 flex gap-3 w-full">
                                <Button variant="secondary" size="sm" className="flex-1" icon={Mail}>Email</Button>
                                <Button variant="secondary" size="sm" className="flex-1" icon={MessageSquare}>Chat</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {activeTab === 'Recruiting' && (
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 -mx-6 px-6">
                    <div className="h-full flex gap-5 min-w-max">
                        {STAGES.map(stage => {
                            const stageCandidates = candidates.filter(c => c.stage === stage);
                            const isOver = dragOverStage === stage;

                            return (
                                <div 
                                    key={stage}
                                    className={`w-80 flex flex-col group rounded-xl transition-colors duration-200 ${isOver ? 'bg-primary-50/50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-800 ring-inset' : ''}`}
                                    onDragOver={(e) => handleDragOver(e, stage)}
                                    onDrop={(e) => handleDrop(e, stage)}
                                >
                                    <div className="flex items-center justify-between mb-3 px-1 pt-2">
                                        <span className="text-xs font-bold text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">{stage}</span>
                                        <span className="text-[10px] font-medium text-text-tertiary bg-surface-muted dark:bg-surface-muted-dark px-2 py-0.5 rounded-full border border-border dark:border-border-dark">
                                            {stageCandidates.length}
                                        </span>
                                    </div>

                                    <div className="flex-1 bg-surface-subtle/50 dark:bg-surface-subtle-dark/50 rounded-xl border border-border/50 dark:border-border-dark/50 p-2 overflow-y-auto custom-scrollbar space-y-3">
                                        {stageCandidates.map(candidate => (
                                            <div 
                                                key={candidate.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, candidate.id)}
                                                className={`bg-surface dark:bg-surface-dark p-4 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group/card relative ${draggedCandidateId === candidate.id ? 'opacity-50 rotate-3 scale-95 border-primary-300' : 'border-border dark:border-border-dark hover:border-primary-200 dark:hover:border-primary-700'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold text-text-primary dark:text-text-primary-dark">{candidate.name}</h4>
                                                    {candidate.matchScore && candidate.matchScore > 85 && (
                                                        <Badge variant="success" className="text-[9px] px-1.5 py-0.5 flex items-center gap-1">
                                                            <Sparkles className="w-2 h-2" /> {candidate.matchScore}%
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium">{candidate.role}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-text-tertiary mt-2">
                                                    <Clock className="w-3 h-3" /> {candidate.appliedDate}
                                                </div>
                                                
                                                <div className="mt-3 pt-3 border-t border-border/50 dark:border-border-dark/50 flex justify-end">
                                                    <button 
                                                        onClick={() => handleGenerateInterview(candidate)}
                                                        className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                    >
                                                        <Sparkles className="w-3 h-3" /> Interview Prep
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <Modal isOpen={isAddCandidateOpen} onClose={() => setIsAddCandidateOpen(false)} title="Add Candidate">
                <form onSubmit={handleAddCandidate} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Full Name</label>
                        <Input 
                            placeholder="Alex Johnson" 
                            value={newCandidate.name}
                            onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Role Applying For</label>
                        <Input 
                            placeholder="Senior Developer" 
                            value={newCandidate.role}
                            onChange={(e) => setNewCandidate({...newCandidate, role: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Email</label>
                        <Input 
                            type="email"
                            placeholder="alex@example.com" 
                            value={newCandidate.email}
                            onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsAddCandidateOpen(false)}>Cancel</Button>
                        <Button type="submit">Add to Pipeline</Button>
                    </div>
                </form>
            </Modal>

            <Drawer isOpen={!!selectedCandidate} onClose={() => setSelectedCandidate(null)} title="Interview Assistant">
                {selectedCandidate && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-surface-subtle dark:bg-surface-subtle-dark rounded-xl border border-border dark:border-border-dark">
                            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
                                {selectedCandidate.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary dark:text-text-primary-dark">{selectedCandidate.name}</h3>
                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{selectedCandidate.role}</p>
                            </div>
                        </div>

                        {isGeneratingScript ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
                                <p className="text-sm text-text-secondary">Generating tailored questions...</p>
                            </div>
                        ) : interviewScript ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <div className="p-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                                    {interviewScript}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </Drawer>
        </div>
    );
};