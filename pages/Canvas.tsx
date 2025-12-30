
import React, { useState, useRef, useEffect } from 'react';
import { SectionHeader, Button, Card, Modal, Input } from '../components/ui/Primitives';
import { 
    MousePointer2, 
    StickyNote, 
    Type, 
    Square, 
    Circle, 
    Sparkles, 
    Move, 
    Plus, 
    Minus,
    Download,
    Loader2,
    Trash2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { sendMessageToGemini } from '../services/gemini';
import { CanvasItem } from '../types';

export const Canvas: React.FC = () => {
    const { canvasItems, setCanvasItems, addCanvasItem } = useData();
    const { addNotification } = useNotifications();
    
    // Canvas Viewport State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // Tool State
    const [activeTool, setActiveTool] = useState<'select' | 'note' | 'text' | 'shape'>('select');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    
    // Item Dragging State
    const [isDraggingItem, setIsDraggingItem] = useState(false);
    const [draggedItemStart, setDraggedItemStart] = useState({ x: 0, y: 0 });

    // AI State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);

    // --- Canvas Manipulation ---
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(s => Math.min(Math.max(s * delta, 0.1), 5));
        } else {
            setPosition(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'select' && e.target === canvasRef.current) {
            setIsDraggingCanvas(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
            setSelectedItems([]);
        } else if (activeTool !== 'select') {
            // Place Item
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            
            const x = (e.clientX - rect.left - position.x) / scale;
            const y = (e.clientY - rect.top - position.y) / scale;
            
            const newItem: CanvasItem = {
                id: Date.now().toString(),
                type: activeTool,
                x,
                y,
                content: activeTool === 'note' ? 'New Note' : activeTool === 'text' ? 'Type here' : '',
                color: activeTool === 'note' ? 'yellow' : 'transparent',
                width: activeTool === 'shape' ? 100 : undefined,
                height: activeTool === 'shape' ? 100 : undefined
            };
            
            addCanvasItem(newItem);
            setActiveTool('select');
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (isDraggingCanvas) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
        
        if (isDraggingItem && selectedItems.length > 0) {
            const dx = (e.clientX - draggedItemStart.x) / scale;
            const dy = (e.clientY - draggedItemStart.y) / scale;
            
            setCanvasItems(canvasItems.map(item => {
                if (selectedItems.includes(item.id)) {
                    return { ...item, x: item.x + dx, y: item.y + dy };
                }
                return item;
            }));
            
            setDraggedItemStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleCanvasMouseUp = () => {
        setIsDraggingCanvas(false);
        setIsDraggingItem(false);
    };

    // --- Item Interaction ---
    const handleItemMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (activeTool === 'select') {
            setSelectedItems([id]);
            setIsDraggingItem(true);
            setDraggedItemStart({ x: e.clientX, y: e.clientY });
        }
    };

    // --- AI Generation ---
    const handleAiGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        
        const prompt = `Create a mind map for "${aiPrompt}". Return a JSON array of nodes. Each node object should have: "content" (string), "x" (number), "y" (number), "type" (must be "note"), "color" (string like "yellow", "blue", "green"). Space them out reasonably centered around 0,0.`;
        
        try {
            const response = await sendMessageToGemini(prompt);
            // Quick and dirty JSON extraction
            const jsonStr = response.substring(response.indexOf('['), response.lastIndexOf(']') + 1);
            const newItems = JSON.parse(jsonStr);
            
            const timestamp = Date.now();
            const formattedItems: CanvasItem[] = newItems.map((item: any, idx: number) => ({
                id: (timestamp + idx).toString(),
                type: 'note',
                x: item.x || Math.random() * 400,
                y: item.y || Math.random() * 400,
                content: item.content || 'Idea',
                color: item.color || 'yellow'
            }));
            
            setCanvasItems([...canvasItems, ...formattedItems]);
            setIsAiModalOpen(false);
            setAiPrompt('');
            addNotification({ title: 'Mind Map Generated', message: `${formattedItems.length} nodes created.`, type: 'success' });
        } catch (err) {
            addNotification({ title: 'AI Error', message: 'Could not generate mind map. Try a simpler prompt.', type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteSelected = () => {
        setCanvasItems(canvasItems.filter(i => !selectedItems.includes(i.id)));
        setSelectedItems([]);
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-[#F3F4F6] dark:bg-[#111827]">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg p-1.5 flex items-center gap-1">
                <button onClick={() => setActiveTool('select')} className={`p-2 rounded-lg transition-colors ${activeTool === 'select' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'text-text-secondary hover:bg-surface-muted dark:hover:bg-surface-muted-dark'}`} title="Select (V)">
                    <MousePointer2 className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-border dark:border-border-dark mx-1"></div>
                <button onClick={() => setActiveTool('note')} className={`p-2 rounded-lg transition-colors ${activeTool === 'note' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'text-text-secondary hover:bg-surface-muted dark:hover:bg-surface-muted-dark'}`} title="Sticky Note (N)">
                    <StickyNote className="w-5 h-5" />
                </button>
                <button onClick={() => setActiveTool('text')} className={`p-2 rounded-lg transition-colors ${activeTool === 'text' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'text-text-secondary hover:bg-surface-muted dark:hover:bg-surface-muted-dark'}`} title="Text (T)">
                    <Type className="w-5 h-5" />
                </button>
                <button onClick={() => setActiveTool('shape')} className={`p-2 rounded-lg transition-colors ${activeTool === 'shape' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'text-text-secondary hover:bg-surface-muted dark:hover:bg-surface-muted-dark'}`} title="Shape (R)">
                    <Square className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-border dark:border-border-dark mx-1"></div>
                <button onClick={() => setIsAiModalOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 shadow-md text-sm font-medium">
                    <Sparkles className="w-4 h-4" /> AI Brainstorm
                </button>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-lg flex items-center p-1">
                    <button onClick={() => setScale(s => Math.max(s - 0.1, 0.1))} className="p-2 hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded text-text-secondary">
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-xs font-medium text-text-secondary">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(s + 0.1, 5))} className="p-2 hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded text-text-secondary">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                {selectedItems.length > 0 && (
                    <button onClick={handleDeleteSelected} className="bg-white dark:bg-surface-dark border border-red-200 dark:border-red-900/30 text-red-500 rounded-lg shadow-lg p-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Canvas Area */}
            <div 
                ref={canvasRef}
                className="flex-1 cursor-grab active:cursor-grabbing relative overflow-hidden"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onWheel={handleWheel}
            >
                {/* Grid Background */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundPosition: `${position.x}px ${position.y}px`,
                        backgroundSize: `${20 * scale}px ${20 * scale}px`,
                        backgroundImage: `radial-gradient(circle, #9CA3AF 1px, transparent 1px)`
                    }}
                />

                {/* Content Container */}
                <div 
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {canvasItems.map(item => (
                        <div
                            key={item.id}
                            className={`absolute transition-shadow ${selectedItems.includes(item.id) ? 'ring-2 ring-blue-500 shadow-xl z-20' : 'shadow-md z-10 hover:shadow-lg'}`}
                            style={{
                                left: item.x,
                                top: item.y,
                                cursor: activeTool === 'select' ? 'grab' : 'default'
                            }}
                            onMouseDown={(e) => handleItemMouseDown(e, item.id)}
                        >
                            {/* Sticky Note */}
                            {item.type === 'note' && (
                                <div className={`w-48 h-48 p-4 flex flex-col ${item.color === 'yellow' ? 'bg-yellow-200 text-yellow-900' : 'bg-blue-200 text-blue-900'} shadow-sm rounded-sm rotate-1`}>
                                    <textarea 
                                        className="w-full h-full bg-transparent resize-none outline-none text-sm font-handwriting leading-relaxed"
                                        value={item.content}
                                        onChange={(e) => setCanvasItems(canvasItems.map(i => i.id === item.id ? { ...i, content: e.target.value } : i))}
                                    />
                                </div>
                            )}

                            {/* Text */}
                            {item.type === 'text' && (
                                <div className="min-w-[100px]">
                                    <input 
                                        className="bg-transparent outline-none text-2xl font-bold text-text-primary dark:text-text-primary-dark w-full"
                                        value={item.content}
                                        onChange={(e) => setCanvasItems(canvasItems.map(i => i.id === item.id ? { ...i, content: e.target.value } : i))}
                                    />
                                </div>
                            )}

                            {/* Shape */}
                            {item.type === 'shape' && (
                                <div className="w-32 h-32 border-4 border-text-primary dark:border-text-primary-dark rounded-xl flex items-center justify-center bg-white dark:bg-surface-dark">
                                    <span className="text-xs text-text-tertiary">Shape</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Modal */}
            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="AI Brainstorming">
                <form onSubmit={handleAiGenerate} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">What do you want to map out?</label>
                        <Input 
                            placeholder="e.g. Launch strategy for Product X, Q4 Marketing Goals..." 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsAiModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isGenerating}>
                            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</> : 'Generate Map'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <style>{`
                .font-handwriting {
                    font-family: 'Inter', cursive;
                }
            `}</style>
        </div>
    );
};
