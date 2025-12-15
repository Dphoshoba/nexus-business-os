
import React, { useState, useEffect, useRef } from 'react';
import { SectionHeader, Card, Button, Badge, Modal, Input } from '../components/ui/Primitives';
import { Target, TrendingUp, Calendar, ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Plus, MoreHorizontal, LayoutGrid, Network, ZoomIn, ZoomOut, Move, LocateFixed } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { Goal, KeyResult } from '../types';

export const Strategy: React.FC = () => {
    const { goals, addGoal, updateGoal, userProfile } = useData();
    const { addNotification } = useNotifications();
    
    // View State
    const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
    const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
    
    // Map Viewport State
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // Modals
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
    
    // Selection State
    const [selectedGoalForCheckIn, setSelectedGoalForCheckIn] = useState<Goal | null>(null);
    const [updatedProgress, setUpdatedProgress] = useState(0);

    // Form State for New Goal
    const [newGoal, setNewGoal] = useState({ title: '', description: '', owner: userProfile.firstName });

    // --- List View Helpers ---
    const toggleExpand = (id: string) => {
        setExpandedGoalId(prev => prev === id ? null : id);
    };

    // --- Actions ---
    const handleCreateGoal = (e: React.FormEvent) => {
        e.preventDefault();
        const goal: Goal = {
            id: Date.now().toString(),
            title: newGoal.title,
            description: newGoal.description,
            status: 'On Track',
            progress: 0,
            dueDate: 'Dec 31, 2024',
            owner: newGoal.owner,
            keyResults: [
                { id: `kr-${Date.now()}-1`, title: 'Key Result 1', current: 0, target: 100, unit: '%' }
            ]
        };
        addGoal(goal);
        setIsGoalModalOpen(false);
        setNewGoal({ title: '', description: '', owner: userProfile.firstName });
        addNotification({ title: 'Objective Created', message: 'New strategic goal added.', type: 'success' });
    };

    const openCheckIn = (goal: Goal, e?: React.MouseEvent) => {
        if(e) e.stopPropagation();
        setSelectedGoalForCheckIn(goal);
        setUpdatedProgress(goal.progress);
        setIsCheckInModalOpen(true);
    };

    const handleCheckInSubmit = () => {
        if (!selectedGoalForCheckIn) return;
        updateGoal({ ...selectedGoalForCheckIn, progress: updatedProgress, status: updatedProgress >= 100 ? 'Completed' : 'On Track' });
        setIsCheckInModalOpen(false);
        addNotification({ title: 'Progress Updated', message: 'Goal status updated successfully.', type: 'success' });
    };

    // --- Map Interaction ---
    const containerRef = useRef<HTMLDivElement>(null);

    const handleWheel = (e: React.WheelEvent) => {
        if (viewMode !== 'map') return;
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(s => Math.min(Math.max(s * delta, 0.4), 2));
        } else {
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (viewMode !== 'map') return;
        if ((e.target as HTMLElement).closest('.interactive-node')) return;
        
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    // --- Constants for Map Layout ---
    const NODE_WIDTH = 340;
    const KR_WIDTH = 280;
    const GAP_X = 60;
    const GAP_Y = 100;

    return (
        <div className="h-full flex flex-col pb-4">
            <SectionHeader
                title="Strategy & Goals"
                subtitle="Align your team with Objectives and Key Results (OKRs)."
                action={
                    <div className="flex gap-3">
                        <div className="flex bg-surface-muted dark:bg-surface-muted-dark p-1 rounded-lg border border-border dark:border-border-dark">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary-600' : 'text-text-secondary hover:text-text-primary'}`}
                                title="List View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('map')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary-600' : 'text-text-secondary hover:text-text-primary'}`}
                                title="Map View"
                            >
                                <Network className="w-4 h-4" />
                            </button>
                        </div>
                        <Button icon={Plus} size="sm" onClick={() => setIsGoalModalOpen(true)}>New Objective</Button>
                    </div>
                }
            />

            {/* Viewport for Strategy Map */}
            {viewMode === 'map' ? (
                <div 
                    ref={containerRef}
                    className="flex-1 bg-[#F1F5F9] dark:bg-[#0B1120] border border-border dark:border-border-dark rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing shadow-inner"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    {/* Grid Background */}
                    <div 
                        className="absolute inset-0 pointer-events-none opacity-[0.15]"
                        style={{
                            backgroundPosition: `${pan.x}px ${pan.y}px`,
                            backgroundSize: `${24 * scale}px ${24 * scale}px`,
                            backgroundImage: `radial-gradient(circle, #64748B 1.5px, transparent 1.5px)`
                        }}
                    />

                    {/* Canvas Controls */}
                    <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-lg flex items-center p-1">
                            <button onClick={() => setScale(s => Math.max(s - 0.1, 0.4))} className="p-2 hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded text-text-secondary">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-xs font-mono text-text-secondary">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="p-2 hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded text-text-secondary">
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>
                        <button onClick={() => setPan({x: 50, y: 50})} className="p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-lg text-text-secondary hover:text-primary-600 transition-colors">
                            <LocateFixed className="w-4 h-4" />
                        </button>
                    </div>

                    <div 
                        className="absolute top-0 left-0 transition-transform duration-75 ease-out origin-top-left"
                        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
                    >
                        {/* Connecting Lines Layer */}
                        <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] overflow-visible pointer-events-none z-0">
                            {goals.map((goal, i) => {
                                const parentX = i * (NODE_WIDTH + GAP_X) + NODE_WIDTH / 2;
                                const parentY = 140; // Approx height of Goal card
                                
                                return goal.keyResults.map((kr, kIdx) => {
                                    // Calculate relative positions
                                    const childX = parentX; // Vertically aligned for now or slightly offset if we wanted tree spread
                                    // Let's stack KRs vertically under parent
                                    const childY = parentY + GAP_Y + (kIdx * 80); 
                                    
                                    // Draw curve
                                    const controlY = parentY + GAP_Y/2;
                                    
                                    // Complex tree logic simplified: 
                                    // We'll actually render the KRs in the DOM relative to parent, so we just need lines 
                                    // connecting the bottom of Parent Card to Left of Child Card? 
                                    // Actually, let's keep it simple: Lines drawn from bottom center of Goal to left center of KRs?
                                    // Or better: Use the DOM layout below and assume positions.
                                    
                                    // Since we render in a flow below, let's just use CSS borders/pseudo-elements for tree lines in the DOM 
                                    // like a nested list, it's easier and cleaner than SVG for this specific layout type.
                                    // But to make it "Visual Map", SVG is cooler.
                                    // Let's stick to the DOM structure for nodes and use this SVG for "Global" links if we had dependencies.
                                    // For OKR hierarchy, CSS lines are robust.
                                    return null;
                                });
                            })}
                        </svg>

                        {/* Render Goals */}
                        <div className="flex gap-16 p-10">
                            {goals.map((goal) => (
                                <div key={goal.id} className="flex flex-col items-center interactive-node">
                                    {/* Goal Card */}
                                    <div 
                                        className={`w-[340px] bg-white dark:bg-surface-dark border rounded-2xl shadow-sm p-6 relative z-10 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group ${
                                            goal.status === 'At Risk' 
                                            ? 'border-amber-200 dark:border-amber-900/50 ring-1 ring-amber-500/20' 
                                            : goal.status === 'Completed'
                                            ? 'border-green-200 dark:border-green-900/50'
                                            : 'border-border dark:border-border-dark hover:border-primary-300 dark:hover:border-primary-600'
                                        }`}
                                        onClick={() => openCheckIn(goal)}
                                    >
                                        <div className="absolute -top-3 left-6">
                                            <Badge variant={goal.status === 'At Risk' ? 'warning' : goal.status === 'Completed' ? 'success' : 'brand'} className="shadow-sm">
                                                {goal.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="mt-2 mb-4">
                                            <h3 className="font-bold text-lg text-text-primary dark:text-text-primary-dark leading-snug">{goal.title}</h3>
                                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1 line-clamp-2">{goal.description}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex-1 h-2 bg-surface-muted dark:bg-surface-muted-dark rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        goal.status === 'At Risk' ? 'bg-amber-500' : 
                                                        goal.status === 'Completed' ? 'bg-green-500' : 'bg-primary-500'
                                                    }`} 
                                                    style={{ width: `${goal.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-text-primary dark:text-text-primary-dark font-mono">{goal.progress}%</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-text-tertiary border-t border-border dark:border-border-dark pt-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">
                                                    {goal.owner.charAt(0)}
                                                </div>
                                                <span>{goal.owner}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{goal.dueDate}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Connector Dot */}
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-surface-dark border-2 border-primary-300 rounded-full z-20"></div>
                                    </div>

                                    {/* Key Results Branch */}
                                    <div className="relative mt-8 flex flex-col items-center gap-4 w-full">
                                        {/* Vertical Stem */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border dark:bg-border-dark"></div>

                                        {goal.keyResults.map((kr, idx) => (
                                            <div key={kr.id} className="relative w-[280px]">
                                                {/* Connecting Curve */}
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-border dark:bg-border-dark"></div>
                                                
                                                <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-3 shadow-sm hover:border-primary-200 dark:hover:border-primary-700 transition-colors flex items-center justify-between group/kr">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`w-1 shrink-0 h-8 rounded-full ${goal.status === 'At Risk' ? 'bg-amber-400' : 'bg-primary-400'}`}></div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-text-primary dark:text-text-primary-dark truncate">{kr.title}</p>
                                                            <p className="text-[10px] text-text-tertiary truncate">Target: {kr.target} {kr.unit}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-mono font-medium text-text-secondary bg-surface-muted dark:bg-surface-muted-dark px-1.5 py-0.5 rounded">
                                                        {kr.current}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add KR Button */}
                                        <button className="mt-2 w-8 h-8 rounded-full border-2 border-dashed border-border dark:border-border-dark flex items-center justify-center text-text-tertiary hover:text-primary-500 hover:border-primary-300 transition-all bg-white dark:bg-surface-dark z-10 relative">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-full bg-border dark:bg-border-dark -z-0 opacity-50"></div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Add Goal Placeholder */}
                            <div className="h-[200px] flex items-center">
                                <button 
                                    onClick={() => setIsGoalModalOpen(true)}
                                    className="w-[100px] h-[100px] rounded-2xl border-2 border-dashed border-border dark:border-border-dark flex flex-col items-center justify-center text-text-tertiary hover:text-primary-500 hover:border-primary-300 hover:bg-primary-50/10 transition-all interactive-node"
                                >
                                    <Plus className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-medium">New Goal</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                    {/* KPI Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card padding="p-5">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Overall Progress</h3>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
                                    {Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / (goals.length || 1))}%
                                </span>
                                <span className="text-sm text-green-600 dark:text-green-400 mb-1 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">+5% vs last week</span>
                            </div>
                            <div className="w-full h-2 bg-surface-muted dark:bg-surface-muted-dark rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / (goals.length || 1))}%` }}></div>
                            </div>
                        </Card>
                        <Card padding="p-5">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">At Risk</h3>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">{goals.filter(g => g.status === 'At Risk').length}</span>
                                    <p className="text-xs text-text-secondary">Objectives require attention</p>
                                </div>
                            </div>
                        </Card>
                        <Card padding="p-5">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Quarterly Timeline</h3>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="p-3 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-500">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">42</span>
                                    <p className="text-xs text-text-secondary">Days remaining in Q4</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* List of Goals */}
                    <div className="space-y-4">
                        {goals.map(goal => (
                            <Card key={goal.id} className="transition-all hover:border-primary-200 dark:hover:border-primary-700 group overflow-hidden" padding="p-0">
                                <div 
                                    className="p-5 cursor-pointer flex items-center justify-between"
                                    onClick={() => toggleExpand(goal.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`p-2.5 rounded-xl ${
                                            goal.status === 'Completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                            goal.status === 'At Risk' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                            'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                        }`}>
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-base font-bold text-text-primary dark:text-text-primary-dark">{goal.title}</h4>
                                                <Badge variant={
                                                    goal.status === 'Completed' ? 'success' :
                                                    goal.status === 'At Risk' ? 'warning' : 'brand'
                                                }>{goal.status}</Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                                                <span className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[9px] font-bold">{goal.owner.charAt(0)}</div> {goal.owner}</span>
                                                <span>•</span>
                                                <span>Due {goal.dueDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="w-40 hidden md:block">
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-text-secondary">Progress</span>
                                                <span className="font-bold text-text-primary dark:text-text-primary-dark">{goal.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-surface-muted dark:bg-surface-muted-dark rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${
                                                    goal.status === 'At Risk' ? 'bg-amber-500' : 'bg-primary-600'
                                                }`} style={{ width: `${goal.progress}%` }}></div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={(e) => openCheckIn(goal, e)}>Check-in</Button>
                                        <div className={`transition-transform duration-200 ${expandedGoalId === goal.id ? 'rotate-180' : ''}`}>
                                            <ChevronDown className="w-5 h-5 text-text-tertiary" />
                                        </div>
                                    </div>
                                </div>

                                {expandedGoalId === goal.id && (
                                    <div className="border-t border-border dark:border-border-dark bg-surface-subtle/30 dark:bg-surface-subtle-dark/30 p-5 animate-in slide-in-from-top-2">
                                        <h5 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 pl-1">Key Results</h5>
                                        <div className="space-y-2">
                                            {goal.keyResults.map(kr => (
                                                <div key={kr.id} className="flex items-center justify-between p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg hover:border-primary-200 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                                                        <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{kr.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-mono bg-surface-muted dark:bg-surface-muted-dark px-2 py-1 rounded border border-border dark:border-border-dark text-text-secondary">
                                                            {kr.current.toLocaleString()} / {kr.target.toLocaleString()} {kr.unit}
                                                        </span>
                                                        <button className="text-text-tertiary hover:text-text-primary"><MoreHorizontal className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="flex items-center gap-2 text-xs font-medium text-primary-600 hover:text-primary-700 px-3 py-2 mt-2 opacity-80 hover:opacity-100 transition-opacity">
                                                <Plus className="w-3 h-3" /> Add Key Result
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Check-in Modal */}
            <Modal isOpen={isCheckInModalOpen} onClose={() => setIsCheckInModalOpen(false)} title="Update Progress">
                <div className="space-y-8 py-2">
                    <div className="text-center">
                        <div className="inline-block p-3 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 mb-3">
                            <Target className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-xl text-text-primary dark:text-text-primary-dark">{selectedGoalForCheckIn?.title}</h4>
                        <p className="text-sm text-text-secondary mt-1">Update the overall completion percentage.</p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6">
                        <button onClick={() => setUpdatedProgress(Math.max(0, updatedProgress - 5))} className="w-12 h-12 rounded-full bg-surface-muted dark:bg-surface-muted-dark flex items-center justify-center font-bold text-lg text-text-secondary hover:bg-surface-subtle border border-border dark:border-border-dark transition-colors">-</button>
                        <div className="text-center w-32">
                            <span className="text-5xl font-bold text-primary-600 dark:text-primary-400 tracking-tighter">{updatedProgress}%</span>
                        </div>
                        <button onClick={() => setUpdatedProgress(Math.min(100, updatedProgress + 5))} className="w-12 h-12 rounded-full bg-surface-muted dark:bg-surface-muted-dark flex items-center justify-center font-bold text-lg text-text-secondary hover:bg-surface-subtle border border-border dark:border-border-dark transition-colors">+</button>
                    </div>
                    
                    <div>
                        <label className="text-xs font-medium text-text-secondary mb-2 block">Comment (Optional)</label>
                        <textarea 
                            className="w-full p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl text-sm focus:ring-2 focus:ring-primary-100 outline-none resize-none h-24" 
                            placeholder="What progress did you make this week?"
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={handleCheckInSubmit} size="lg" className="w-full">Save Update</Button>
                    </div>
                </div>
            </Modal>

            {/* New Goal Modal */}
            <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Create Objective">
                <form onSubmit={handleCreateGoal} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Objective Title</label>
                        <Input 
                            placeholder="e.g. Expand into European Market" 
                            value={newGoal.title}
                            onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                            required
                            className="text-lg font-medium"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Description</label>
                        <textarea 
                            className="w-full p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none resize-none h-20"
                            placeholder="Why is this important?" 
                            value={newGoal.description}
                            onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-text-secondary">Owner</label>
                            <Input 
                                value={newGoal.owner}
                                onChange={(e) => setNewGoal({...newGoal, owner: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-text-secondary">Quarter</label>
                            <select className="w-full h-[42px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none">
                                <option>Q4 2024</option>
                                <option>Q1 2025</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsGoalModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Objective</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
