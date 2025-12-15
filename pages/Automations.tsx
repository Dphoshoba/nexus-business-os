
import React, { useState, useEffect, useRef } from 'react';
import { 
    Play, Mail, Clock, Plus, Zap, CheckCircle, Split, 
    Bot, Globe, User, MessageSquare, LayoutList, Network,
    ChevronDown, Edit2, Trash2, ArrowRight
} from 'lucide-react';
import { Button, SectionHeader, Modal, Input, Drawer } from '../components/ui/Primitives';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';
import { AutomationNode, DealStage } from '../types';

// --- Constants ---
const NODE_WIDTH = 280;
const NODE_HEIGHT = 100;

interface Connection {
    id: string;
    source: string;
    target: string;
}

export const Automations: React.FC = () => {
  const { addNotification } = useNotifications();
  const { teamMembers, addTask, deals, updateDeal } = useData();
  
  // --- View State ---
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas');

  // --- Workflow State ---
  const [nodes, setNodes] = useState<AutomationNode[]>([
      { id: '1', type: 'trigger', title: 'New Lead', description: 'When a new contact is added', x: 100, y: 300, icon: Zap, color: 'emerald', config: {} },
      { id: '2', type: 'condition', title: 'Check Source', description: 'If source is "Website"', x: 500, y: 300, icon: Split, color: 'amber', config: {} },
      { id: '3', type: 'email', title: 'Send Welcome Email', description: 'Template: Onboarding V1', x: 900, y: 150, icon: Mail, color: 'blue', config: { template: 'Onboarding V1' } },
      { id: '4', type: 'ai', title: 'AI Score Lead', description: 'Analyze potential value', x: 900, y: 450, icon: Bot, color: 'violet', config: { prompt: 'Analyze lead quality based on title and company size.' } },
      { id: '5', type: 'action', title: 'Create Task', description: 'Assign to Sales Rep', x: 1300, y: 300, icon: CheckCircle, color: 'blue', config: { actionType: 'create_task', assignee: 'Jane Doe' } },
      { id: '6', type: 'action', title: 'Update Deal', description: 'Move to "Contacted"', x: 1300, y: 500, icon: ArrowRight, color: 'rose', config: { actionType: 'update_deal', newStage: DealStage.CONTACTED } },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
      { id: 'c1', source: '1', target: '2' },
      { id: 'c2', source: '2', target: '3' },
      { id: 'c3', source: '2', target: '4' },
      { id: 'c4', source: '4', target: '5' },
      { id: 'c5', source: '4', target: '6' },
  ]);

  // Viewport State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Node Dragging & Selection
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeEdge, setActiveEdge] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ title: '', description: '', type: 'action' });

  // Responsive Check
  useEffect(() => {
      const handleResize = () => {
          if (window.innerWidth < 768) {
              setViewMode('list');
          }
      };
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Interaction Handlers ---

  const handleWheel = (e: React.WheelEvent) => {
      if (viewMode !== 'canvas') return;
      if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          setScale(s => Math.min(Math.max(s * delta, 0.5), 2));
      } else {
          setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
      }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.automation-node')) return;

      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      // Deselect on bg click
      if (!target.closest('.automation-node')) setSelectedNodeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (isDraggingCanvas) {
          setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
      
      if (draggingNode) {
          const zoomAdjustedX = e.movementX / scale;
          const zoomAdjustedY = e.movementY / scale;

          setNodes(prev => prev.map(n => {
              if (n.id === draggingNode) {
                  return { ...n, x: n.x + zoomAdjustedX, y: n.y + zoomAdjustedY };
              }
              return n;
          }));
      }
  };

  const handleMouseUp = () => {
      setIsDraggingCanvas(false);
      setDraggingNode(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDraggingNode(id);
      setSelectedNodeId(id);
  };

  // --- Logic Helpers ---

  const getPath = (source: AutomationNode, target: AutomationNode) => {
      const sourceX = source.x + NODE_WIDTH;
      const sourceY = source.y + NODE_HEIGHT / 2;
      const targetX = target.x;
      const targetY = target.y + NODE_HEIGHT / 2;

      const c1x = sourceX + (targetX - sourceX) * 0.5;
      const c1y = sourceY;
      const c2x = targetX - (targetX - sourceX) * 0.5;
      const c2y = targetY;

      return `M ${sourceX} ${sourceY} C ${c1x} ${c1y} ${c2x} ${c2y} ${targetX} ${targetY}`;
  };

  // --- Graph Traversal Logic ---
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runSimulation = async () => {
      if (isSimulating) return;
      setIsSimulating(true);
      addNotification({ title: 'Automation Started', message: 'Analyzing workflow graph...', type: 'info' });

      // Reset Visuals
      setActiveNode(null);
      setActiveEdge(null);

      // Find Start Node
      const startNode = nodes.find(n => n.type === 'trigger');
      if (!startNode) {
          addNotification({ title: 'Error', message: 'No trigger node found.', type: 'error' });
          setIsSimulating(false);
          return;
      }

      // Recursive Execution Function
      const traverse = async (nodeId: string) => {
          // Highlight Node
          setActiveNode(nodeId);
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return;

          // EXECUTE LOGIC
          await sleep(1000); // Thinking time

          if (node.type === 'action') {
              if (node.config?.actionType === 'create_task') {
                  addTask({
                      id: `auto-${Date.now()}`,
                      projectId: '1',
                      title: 'Auto-Task from Workflow',
                      status: 'To Do',
                      priority: 'High',
                      assignee: node.config?.assignee || 'Unassigned',
                      startDate: new Date().toISOString().split('T')[0],
                      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
                  });
                  addNotification({ title: 'Task Created', message: `Assigned to ${node.config?.assignee}`, type: 'success' });
              } else if (node.config?.actionType === 'update_deal' && node.config.newStage) {
                  // Simulate updating the first deal for demo purposes
                  const targetDeal = deals[0];
                  if (targetDeal) {
                      updateDeal({ ...targetDeal, stage: node.config.newStage, lastActivity: 'Just now via Automation' });
                      addNotification({ title: 'Deal Updated', message: `${targetDeal.title} moved to ${node.config.newStage}`, type: 'success' });
                  } else {
                      addNotification({ title: 'Warning', message: 'No active deals to update in simulation.', type: 'warning' });
                  }
              }
          } 
          else if (node.type === 'ai') {
              addNotification({ title: 'AI Analysis', message: 'Processing lead score...', type: 'info' });
              await sleep(500);
              addNotification({ title: 'AI Result', message: 'Lead Score: 92/100', type: 'success' });
          }
          else if (node.type === 'email') {
              addNotification({ title: 'Email Sent', message: `Template: ${node.config?.template}`, type: 'success' });
          }

          // Find Outgoing Edges
          const outgoingEdges = connections.filter(c => c.source === nodeId);
          
          if (outgoingEdges.length > 0) {
              // BFS: Execute all branches
              // For visual clarity in this linear-ish demo, we'll await them one by one
              for (const edge of outgoingEdges) {
                  setActiveEdge(edge.id);
                  await sleep(600); // Travel time
                  await traverse(edge.target);
              }
          }
      };

      await traverse(startNode.id);

      setIsSimulating(false);
      setActiveNode(null);
      setActiveEdge(null);
      addNotification({ title: 'Workflow Complete', message: 'Automation finished successfully.', type: 'success' });
  };

  const handleAddNode = (e: React.FormEvent) => {
      e.preventDefault();
      const id = Date.now().toString();
      const rightMostX = Math.max(...nodes.map(n => n.x));
      const rightMostY = nodes.find(n => n.x === rightMostX)?.y || 300;

      let icon = Zap;
      let color = 'emerald';
      
      switch(newNodeData.type) {
          case 'condition': icon = Split; color = 'amber'; break;
          case 'delay': icon = Clock; color = 'violet'; break;
          case 'ai': icon = Bot; color = 'violet'; break;
          case 'email': icon = Mail; color = 'blue'; break;
          case 'webhook': icon = Globe; color = 'rose'; break;
          case 'action': icon = CheckCircle; color = 'blue'; break;
          default: icon = Zap; color = 'emerald';
      }

      const newNode: AutomationNode = {
          id,
          type: newNodeData.type as any,
          title: newNodeData.title || 'New Step',
          description: newNodeData.description || 'Description',
          x: rightMostX + 350,
          y: rightMostY,
          icon,
          color,
          config: { 
              actionType: newNodeData.type === 'action' ? 'create_task' : undefined 
          }
      };

      setNodes(prev => [...prev, newNode]);
      if (nodes.length > 0) {
          const previousLastNode = nodes.reduce((prev, current) => (prev.x > current.x) ? prev : current);
          setConnections(prev => [...prev, { id: `c-${Date.now()}`, source: previousLastNode.id, target: id }]);
      }
      
      setIsAddModalOpen(false);
      setNewNodeData({ title: '', description: '', type: 'action' });
      addNotification({ title: 'Node Added', message: 'Workflow step created.', type: 'success' });
  };

  const updateNodeConfig = (id: string, key: string, value: any) => {
      setNodes(prev => prev.map(n => {
          if (n.id === id) {
              return { ...n, config: { ...n.config, [key]: value } };
          }
          return n;
      }));
  };

  // Helper to get selected node data
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="h-full flex flex-col">
        <SectionHeader
            title="Automations"
            subtitle="Visual workflow builder for business logic."
            action={
                <div className="flex gap-2">
                    <div className="flex bg-surface-muted dark:bg-surface-muted-dark p-1 rounded-lg border border-border dark:border-border-dark">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary-600' : 'text-text-secondary hover:text-text-primary'}`}
                            title="List View"
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('canvas')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'canvas' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary-600' : 'text-text-secondary hover:text-text-primary'}`}
                            title="Canvas View"
                        >
                            <Network className="w-4 h-4" />
                        </button>
                    </div>
                    <Button variant="secondary" icon={Play} size="sm" onClick={runSimulation} disabled={isSimulating}>
                        {isSimulating ? 'Running...' : 'Test Workflow'}
                    </Button>
                    <Button icon={Plus} size="sm" onClick={() => setIsAddModalOpen(true)}>Add Step</Button>
                </div>
            }
        />

        {viewMode === 'canvas' ? (
            <div className="flex-1 bg-[#F1F5F9] dark:bg-[#0B1120] border border-border dark:border-border-dark rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing shadow-inner"
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

                <div 
                    className="absolute top-0 left-0 transition-transform duration-75 ease-out origin-top-left"
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
                >
                    {/* Connections Layer */}
                    <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] overflow-visible pointer-events-none z-0">
                        {connections.map(conn => {
                            const source = nodes.find(n => n.id === conn.source);
                            const target = nodes.find(n => n.id === conn.target);
                            if (!source || !target) return null;
                            
                            const isActive = activeEdge === conn.id;

                            return (
                                <g key={conn.id}>
                                    <path 
                                        d={getPath(source, target)}
                                        stroke={isActive ? '#6366F1' : '#94A3B8'} 
                                        strokeWidth={isActive ? 4 : 2}
                                        fill="none"
                                        className="transition-colors duration-300"
                                    />
                                    {isActive && (
                                        <circle r="4" fill="#6366F1">
                                            <animateMotion dur="0.5s" repeatCount="1" path={getPath(source, target)} />
                                        </circle>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Nodes Layer */}
                    {nodes.map(node => {
                        const isActive = activeNode === node.id;
                        const isSelected = selectedNodeId === node.id;
                        
                        let colorClass = 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
                        let iconColorClass = 'text-blue-600 dark:text-blue-400';

                        if (node.color === 'emerald') { colorClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'; iconColorClass = 'text-emerald-600 dark:text-emerald-400'; }
                        if (node.color === 'amber') { colorClass = 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'; iconColorClass = 'text-amber-600 dark:text-amber-400'; }
                        if (node.color === 'violet') { colorClass = 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'; iconColorClass = 'text-violet-600 dark:text-violet-400'; }
                        if (node.color === 'rose') { colorClass = 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'; iconColorClass = 'text-rose-600 dark:text-rose-400'; }

                        const NodeIcon = node.icon || Zap;

                        return (
                            <div
                                key={node.id}
                                className={`automation-node absolute w-[280px] h-[100px] rounded-xl border-2 shadow-sm flex items-center p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 
                                    ${colorClass} 
                                    ${isActive ? 'ring-4 ring-primary-500/30 scale-105 z-20 shadow-xl' : 'z-10'} 
                                    ${isSelected ? 'ring-2 ring-primary-500 border-primary-500' : 'border-border dark:border-border-dark'}
                                `}
                                style={{ left: node.x, top: node.y }}
                                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                            >
                                <div className={`w-12 h-12 rounded-lg bg-white dark:bg-surface-dark border border-border dark:border-border-dark flex items-center justify-center shrink-0 shadow-sm ${iconColorClass}`}>
                                    <NodeIcon className="w-6 h-6" />
                                </div>
                                <div className="ml-4 min-w-0">
                                    <h4 className="text-sm font-bold text-text-primary dark:text-text-primary-dark truncate">{node.title}</h4>
                                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1 line-clamp-2 leading-relaxed">{node.description}</p>
                                </div>
                                
                                {node.type !== 'trigger' && <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-surface-dark border-2 border-text-tertiary rounded-full"></div>}
                                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-surface-dark border-2 border-text-tertiary rounded-full"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ) : (
            /* --- List View for Mobile --- */
            <div className="flex-1 overflow-y-auto space-y-4 pb-10">
                {nodes.sort((a,b) => a.x - b.x).map((node, index) => {
                    const NodeIcon = node.icon || Zap;
                    return (
                        <div key={node.id} className="relative pl-8">
                            {/* Vertical Line */}
                            {index !== nodes.length - 1 && (
                                <div className="absolute left-[15px] top-8 bottom-[-16px] w-0.5 bg-border dark:bg-border-dark"></div>
                            )}
                            <div 
                                className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary-300"
                                onClick={() => setSelectedNodeId(node.id)}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                    ${node.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 
                                      node.color === 'amber' ? 'bg-amber-100 text-amber-600' : 
                                      node.color === 'violet' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}
                                `}>
                                    <NodeIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-text-primary dark:text-text-primary-dark">{node.title}</h4>
                                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{node.description}</p>
                                </div>
                                <Edit2 className="w-4 h-4 text-text-tertiary" />
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* Configuration Drawer */}
        <Drawer isOpen={!!selectedNodeId} onClose={() => setSelectedNodeId(null)} title="Configure Step">
            {selectedNode && (
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-medium text-text-secondary mb-1.5 block">Step Name</label>
                        <Input 
                            value={selectedNode.title} 
                            onChange={(e) => setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, title: e.target.value } : n))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-text-secondary mb-1.5 block">Description</label>
                        <Input 
                            value={selectedNode.description} 
                            onChange={(e) => setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, description: e.target.value } : n))}
                        />
                    </div>

                    <div className="border-t border-border dark:border-border-dark pt-6">
                        <h4 className="text-sm font-bold text-text-primary dark:text-text-primary-dark mb-4">Step Settings</h4>
                        
                        {selectedNode.type === 'action' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Action Type</label>
                                    <select 
                                        className="w-full h-[38px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none"
                                        value={selectedNode.config?.actionType || 'create_task'}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, 'actionType', e.target.value)}
                                    >
                                        <option value="create_task">Create Task</option>
                                        <option value="update_deal">Update Deal Stage</option>
                                        <option value="send_slack">Send Slack Message</option>
                                    </select>
                                </div>

                                {selectedNode.config?.actionType === 'create_task' && (
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1.5 block">Assign Task To</label>
                                        <select 
                                            className="w-full h-[38px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none"
                                            value={selectedNode.config?.assignee || ''}
                                            onChange={(e) => updateNodeConfig(selectedNode.id, 'assignee', e.target.value)}
                                        >
                                            <option value="">Select team member...</option>
                                            {teamMembers.map(m => (
                                                <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {selectedNode.config?.actionType === 'update_deal' && (
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1.5 block">New Stage</label>
                                        <select 
                                            className="w-full h-[38px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none"
                                            value={selectedNode.config?.newStage || ''}
                                            onChange={(e) => updateNodeConfig(selectedNode.id, 'newStage', e.target.value)}
                                        >
                                            <option value="">Select stage...</option>
                                            {Object.values(DealStage).map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-text-tertiary mt-2">
                                            Simulation will target the first active deal in your pipeline.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedNode.type === 'email' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email Template</label>
                                    <select 
                                        className="w-full h-[38px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none"
                                        value={selectedNode.config?.template || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, 'template', e.target.value)}
                                    >
                                        <option value="">Select a template...</option>
                                        <option value="Onboarding V1">Onboarding V1</option>
                                        <option value="Welcome Series">Welcome Series</option>
                                        <option value="Re-engagement">Re-engagement</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {selectedNode.type === 'ai' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">AI Prompt</label>
                                    <textarea 
                                        className="w-full p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none h-24 resize-none"
                                        value={selectedNode.config?.prompt || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, 'prompt', e.target.value)}
                                        placeholder="Describe what the AI should analyze..."
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {(selectedNode.type === 'trigger' || selectedNode.type === 'condition' || selectedNode.type === 'delay' || selectedNode.type === 'webhook') && (
                            <div className="p-4 bg-surface-subtle dark:bg-surface-subtle-dark rounded-lg border border-dashed border-border dark:border-border-dark text-center text-xs text-text-tertiary">
                                No additional configuration needed for this step type in this demo.
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex justify-between items-center">
                        <Button variant="danger" size="sm" icon={Trash2} onClick={() => {
                            setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
                            setConnections(prev => prev.filter(c => c.source !== selectedNode.id && c.target !== selectedNode.id));
                            setSelectedNodeId(null);
                        }}>Delete Step</Button>
                        <Button onClick={() => setSelectedNodeId(null)}>Done</Button>
                    </div>
                </div>
            )}
        </Drawer>

        {/* Add Node Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Workflow Step">
            <form onSubmit={handleAddNode} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">Step Title</label>
                    <Input 
                        placeholder="e.g. Send Slack Notification" 
                        value={newNodeData.title}
                        onChange={(e) => setNewNodeData({...newNodeData, title: e.target.value})}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">Description</label>
                    <Input 
                        placeholder="Brief detail of action" 
                        value={newNodeData.description}
                        onChange={(e) => setNewNodeData({...newNodeData, description: e.target.value})}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">Type</label>
                    <select 
                        className="w-full h-[38px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none"
                        value={newNodeData.type}
                        onChange={(e) => setNewNodeData({...newNodeData, type: e.target.value as any})}
                    >
                        <option value="action">Action</option>
                        <option value="trigger">Trigger</option>
                        <option value="condition">Condition</option>
                        <option value="delay">Delay</option>
                        <option value="ai">AI Processing</option>
                        <option value="email">Send Email</option>
                        <option value="webhook">Webhook</option>
                    </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Add to Canvas</Button>
                </div>
            </form>
        </Modal>
    </div>
  );
};
