import React, { useState } from 'react';
import { SectionHeader, Card, Button, Badge, Modal, Input, Drawer } from '../components/ui/Primitives';
import { Plus, BarChart3, Users, MousePointer2, ExternalLink, MoreHorizontal, Filter, LayoutTemplate, ArrowLeft, Globe, FileText, CheckCircle2, ChevronRight, PieChart } from 'lucide-react';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';
import { Funnel, FunnelStep } from '../types';

export const Funnels: React.FC = () => {
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const { funnels, addFunnel, updateFunnel } = useData();
    const { addNotification } = useNotifications();

    // Drawer for editing steps
    const [editingStep, setEditingStep] = useState<FunnelStep | null>(null);

    // Form state
    const [newFunnelName, setNewFunnelName] = useState('');

    const handleCreateFunnel = (e: React.FormEvent) => {
        e.preventDefault();
        
        const funnel: Funnel = { 
            id: Date.now().toString(), 
            name: newFunnelName || 'New Campaign', 
            steps: 3, 
            visits: 0, 
            conversions: 0, 
            rate: '0%', 
            status: 'Draft',
            stepsDetail: [
                { id: Date.now().toString() + '1', name: 'Traffic Source', type: 'traffic', visitors: 0, conversionRate: 100 },
                { id: Date.now().toString() + '2', name: 'Landing Page', type: 'page', visitors: 0, conversionRate: 0 },
                { id: Date.now().toString() + '3', name: 'Thank You', type: 'conversion', visitors: 0, conversionRate: 0 },
            ]
        };

        addFunnel(funnel);
        setIsModalOpen(false);
        setNewFunnelName('');
        addNotification({ title: 'Funnel Created', message: 'New funnel draft has been created.', type: 'success' });
        
        // Auto-open builder
        setSelectedFunnel(funnel);
        setView('builder');
    };

    const handleSelectTemplate = () => {
        setIsTemplatesOpen(false);
        setIsModalOpen(true); 
        addNotification({ title: 'Template Selected', message: 'Starting with "SaaS Landing Page" template.', type: 'info' });
    };

    const handleFunnelClick = (funnel: Funnel) => {
        setSelectedFunnel(funnel);
        setView('builder');
    };

    const handleStepUpdate = (updatedStep: FunnelStep) => {
        if (!selectedFunnel || !selectedFunnel.stepsDetail) return;
        const newSteps = selectedFunnel.stepsDetail.map(s => s.id === updatedStep.id ? updatedStep : s);
        updateFunnel({ ...selectedFunnel, stepsDetail: newSteps });
        setEditingStep(null);
        addNotification({ title: 'Step Updated', message: 'Funnel configuration saved.', type: 'success' });
    };

    const StepIcon = ({ type }: { type: string }) => {
        switch(type) {
            case 'traffic': return <Globe className="w-5 h-5" />;
            case 'page': return <FileText className="w-5 h-5" />;
            case 'action': return <MousePointer2 className="w-5 h-5" />;
            case 'conversion': return <CheckCircle2 className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    // --- Builder View ---
    if (view === 'builder' && selectedFunnel) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => setView('list')} icon={ArrowLeft}>Back</Button>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark tracking-tight">{selectedFunnel.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={selectedFunnel.status === 'Active' ? 'success' : 'neutral'}>{selectedFunnel.status}</Badge>
                                <span className="text-xs text-text-secondary dark:text-text-secondary-dark">• Last edited just now</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="secondary" icon={ExternalLink}>Preview</Button>
                         <Button icon={CheckCircle2}>Publish</Button>
                    </div>
                </div>

                <div className="flex-1 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded-xl overflow-hidden relative flex">
                     {/* Editor Canvas */}
                     <div className="flex-1 p-8 overflow-y-auto relative bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px]">
                        <div className="max-w-3xl mx-auto space-y-0">
                            {selectedFunnel.stepsDetail?.map((step, index) => {
                                const isLast = index === (selectedFunnel.stepsDetail?.length || 0) - 1;
                                const dropOff = 100 - step.conversionRate;
                                
                                return (
                                    <div key={step.id} className="relative pl-12 pb-12 last:pb-0 group">
                                         {/* Vertical Connector */}
                                         {!isLast && (
                                            <div className="absolute left-[39px] top-12 bottom-0 w-0.5 bg-border dark:bg-border-dark group-hover:bg-primary-300 transition-colors"></div>
                                         )}

                                         {/* Step Node */}
                                         <div className="relative">
                                             <div 
                                                className={`absolute -left-[54px] w-14 h-14 rounded-full border-4 border-surface-subtle dark:border-surface-subtle-dark z-10 flex items-center justify-center bg-surface dark:bg-surface-dark shadow-sm transition-transform hover:scale-105 cursor-pointer ${
                                                    step.type === 'conversion' ? 'text-green-600 dark:text-green-400' : 'text-text-secondary dark:text-text-secondary-dark'
                                                }`}
                                                onClick={() => setEditingStep(step)}
                                             >
                                                 <StepIcon type={step.type} />
                                             </div>
                                             
                                             <Card className="ml-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 transition-all" onClick={() => setEditingStep(step)}>
                                                 <div className="flex items-center justify-between">
                                                     <div>
                                                         <h4 className="font-semibold text-text-primary dark:text-text-primary-dark">{step.name}</h4>
                                                         <p className="text-xs text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider font-medium mt-1">{step.type}</p>
                                                     </div>
                                                     <div className="text-right">
                                                         <p className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{step.visitors.toLocaleString()}</p>
                                                         <p className="text-xs text-text-tertiary">Visitors</p>
                                                     </div>
                                                 </div>
                                                 
                                                 {/* Stats Bar */}
                                                 <div className="mt-4 pt-4 border-t border-border dark:border-border-dark flex items-center justify-between">
                                                     <div className="flex items-center gap-2">
                                                         <div className={`h-2 w-2 rounded-full ${step.conversionRate > 50 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                         <span className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">{step.conversionRate}% conversion</span>
                                                     </div>
                                                      <span className="text-xs text-text-tertiary">Next Step &rarr;</span>
                                                 </div>
                                             </Card>

                                             {/* Drop Off Indicator */}
                                             {!isLast && (
                                                 <div className="absolute left-[50%] -bottom-8 translate-x-4 flex items-center gap-2">
                                                     <div className="h-6 w-0.5 bg-red-200 dark:bg-red-900/40"></div>
                                                     <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30">
                                                         {dropOff}% Drop-off
                                                     </span>
                                                 </div>
                                             )}
                                         </div>
                                    </div>
                                );
                            })}
                            
                            <div className="pl-12 pt-8">
                                <button className="w-full py-4 border-2 border-dashed border-border dark:border-border-dark rounded-xl flex items-center justify-center gap-2 text-text-secondary dark:text-text-secondary-dark hover:text-primary-600 hover:border-primary-300 hover:bg-surface dark:hover:bg-surface-dark transition-all">
                                    <Plus className="w-5 h-5" />
                                    <span className="font-medium">Add Step</span>
                                </button>
                            </div>
                        </div>
                     </div>
                </div>

                <Drawer 
                    isOpen={!!editingStep} 
                    onClose={() => setEditingStep(null)} 
                    title="Configure Step"
                >
                    {editingStep && (
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-text-secondary">Step Name</label>
                                <Input value={editingStep.name} onChange={(e) => setEditingStep({...editingStep, name: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-text-secondary">Step Type</label>
                                <select 
                                    className="w-full h-[38px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none"
                                    value={editingStep.type}
                                    onChange={(e) => setEditingStep({...editingStep, type: e.target.value as any})}
                                >
                                    <option value="traffic">Traffic Source</option>
                                    <option value="page">Landing Page</option>
                                    <option value="action">Action / Form</option>
                                    <option value="conversion">Conversion / Success</option>
                                </select>
                            </div>
                            
                            <div className="p-4 bg-surface-subtle dark:bg-surface-subtle-dark rounded-lg border border-border dark:border-border-dark">
                                <h4 className="text-sm font-semibold mb-3">Analytics Simulator</h4>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-text-secondary">Visitors Count</label>
                                        <Input type="number" value={editingStep.visitors} onChange={(e) => setEditingStep({...editingStep, visitors: parseInt(e.target.value) || 0})} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-text-secondary">Conversion Rate (%)</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="100" 
                                                value={editingStep.conversionRate} 
                                                className="flex-1 accent-primary-600 h-2 bg-border rounded-lg appearance-none cursor-pointer"
                                                onChange={(e) => setEditingStep({...editingStep, conversionRate: parseInt(e.target.value) || 0})}
                                            />
                                            <span className="text-sm font-mono w-12 text-right">{editingStep.conversionRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleStepUpdate(editingStep)}>Save Changes</Button>
                            </div>
                        </div>
                    )}
                </Drawer>
            </div>
        );
    }

    // --- List View ---
    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="Funnels"
                subtitle="Build high-converting landing pages and lead forms."
                action={<Button icon={Plus} size="sm" onClick={() => setIsModalOpen(true)}>Create Funnel</Button>}
            />

            <div className="grid grid-cols-1 gap-4">
                {funnels.map(funnel => (
                    <Card key={funnel.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary-200 dark:hover:border-primary-700 transition-colors group cursor-pointer" onClick={() => handleFunnelClick(funnel)}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-surface-muted dark:bg-surface-muted-dark border border-border dark:border-border-dark flex items-center justify-center text-primary-600 dark:text-primary-400">
                                <Filter className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-base font-semibold text-text-primary dark:text-text-primary-dark group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{funnel.name}</h3>
                                    <Badge variant={funnel.status === 'Active' ? 'success' : 'neutral'}>{funnel.status}</Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
                                    <span>{funnel.steps} Steps</span>
                                    <span className="text-text-tertiary">•</span>
                                    <span className="flex items-center gap-1 hover:text-primary-600 hover:underline" onClick={(e) => {e.stopPropagation(); window.open('#', '_blank')}}>
                                        View Live <ExternalLink className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 border-t md:border-t-0 border-border dark:border-border-dark pt-4 md:pt-0">
                             <div className="flex flex-col">
                                 <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Visitors</span>
                                 <div className="flex items-center gap-1.5">
                                     <Users className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
                                     <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">{funnel.visits.toLocaleString()}</span>
                                 </div>
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Conversions</span>
                                 <div className="flex items-center gap-1.5">
                                     <MousePointer2 className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
                                     <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">{funnel.conversions.toLocaleString()}</span>
                                 </div>
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Conv. Rate</span>
                                 <div className="flex items-center gap-1.5">
                                     <BarChart3 className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
                                     <span className="text-sm font-semibold text-green-600 dark:text-green-400">{funnel.rate}</span>
                                 </div>
                             </div>
                             <ChevronRight className="w-5 h-5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </Card>
                ))}
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white shadow-lg">
                    <h3 className="text-lg font-bold mb-2">Template Library</h3>
                    <p className="text-primary-100 text-sm mb-4">Launch faster with 50+ conversion-optimized templates for any industry.</p>
                    <button 
                        onClick={() => setIsTemplatesOpen(true)}
                        type="button"
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors border border-white/20 cursor-pointer"
                    >
                        Browse Templates
                    </button>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Create New Funnel"
            >
                <form onSubmit={handleCreateFunnel} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Funnel Name</label>
                        <Input 
                            placeholder="e.g. Summer Sale Campaign" 
                            value={newFunnelName}
                            onChange={(e) => setNewFunnelName(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Goal</label>
                        <select className="w-full h-[38px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none">
                            <option>Collect Leads</option>
                            <option>Sell Product</option>
                            <option>Book Appointments</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Funnel</Button>
                    </div>
                </form>
            </Modal>

            <Modal 
                isOpen={isTemplatesOpen} 
                onClose={() => setIsTemplatesOpen(false)} 
                title="Select a Template"
            >
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div 
                            key={i} 
                            onClick={handleSelectTemplate}
                            className="group cursor-pointer border border-border dark:border-border-dark rounded-lg overflow-hidden hover:border-primary-500 hover:ring-1 hover:ring-primary-500 transition-all"
                        >
                            <div className="h-24 bg-surface-muted dark:bg-surface-muted-dark flex items-center justify-center text-text-tertiary group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-500 transition-colors">
                                <LayoutTemplate className="w-8 h-8" />
                            </div>
                            <div className="p-3">
                                <h4 className="text-sm font-medium text-text-primary dark:text-text-primary-dark">SaaS Landing Page {i}</h4>
                                <p className="text-xs text-text-tertiary mt-1">High conversion layout</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-4 flex justify-end">
                     <Button type="button" variant="ghost" onClick={() => setIsTemplatesOpen(false)}>Close</Button>
                </div>
            </Modal>
        </div>
    );
};