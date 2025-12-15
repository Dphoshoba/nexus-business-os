
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, Task } from '../types';
import { Plus, MoreHorizontal, LayoutGrid, List as ListIcon, Calendar, CheckCircle2, Clock, Sparkles, Loader2, ArrowRight, GanttChart } from 'lucide-react';
import { Button, Card, Badge, SectionHeader, Modal, Input } from '../components/ui/Primitives';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';
import { sendMessageToGemini } from '../services/gemini';

export const Projects: React.FC = () => {
    const { projects, addProject, tasks, addTask, updateTask } = useData();
    const { addNotification } = useNotifications();
    
    // UI State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [viewMode, setViewMode] = useState<'kanban' | 'gantt'>('kanban');
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    // Forms
    const [newProject, setNewProject] = useState({ name: '', client: '', deadline: '', description: '' });
    const [newTask, setNewTask] = useState({ title: '', status: 'To Do', priority: 'Medium', assignee: 'JD', startDate: '', dueDate: '' });

    // AI State
    const [isAiPlanning, setIsAiPlanning] = useState(false);

    // Derived State
    const currentProject = selectedProject || projects[0];
    const projectTasks = tasks.filter(t => t.projectId === currentProject?.id);

    // --- Kanban Helpers ---
    const columns = {
        'To Do': projectTasks.filter(t => t.status === 'To Do'),
        'In Progress': projectTasks.filter(t => t.status === 'In Progress'),
        'Review': projectTasks.filter(t => t.status === 'Review'),
        'Done': projectTasks.filter(t => t.status === 'Done'),
    };

    const getProjectProgress = (pid: string) => {
        const pTasks = tasks.filter(t => t.projectId === pid);
        if (pTasks.length === 0) return 0;
        const done = pTasks.filter(t => t.status === 'Done').length;
        return Math.round((done / pTasks.length) * 100);
    };

    // --- Actions ---
    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        const project: Project = {
            id: Date.now().toString(),
            name: newProject.name,
            client: newProject.client,
            status: 'Active',
            deadline: newProject.deadline,
            description: newProject.description
        };
        addProject(project);
        
        if (isAiPlanning) {
           handleAiPlan(project.id, project.name, project.description);
        }

        setIsProjectModalOpen(false);
        setNewProject({ name: '', client: '', deadline: '', description: '' });
        setSelectedProject(project);
        addNotification({ title: 'Project Created', message: `${project.name} initialized.`, type: 'success' });
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProject) return;
        
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

        const task: Task = {
            id: Date.now().toString(),
            projectId: currentProject.id,
            title: newTask.title,
            status: newTask.status as any,
            priority: newTask.priority as any,
            assignee: newTask.assignee,
            startDate: newTask.startDate || today,
            dueDate: newTask.dueDate || nextWeek
        };
        addTask(task);
        setIsTaskModalOpen(false);
        setNewTask({ title: '', status: 'To Do', priority: 'Medium', assignee: 'JD', startDate: '', dueDate: '' });
        addNotification({ title: 'Task Added', message: 'New task created.', type: 'success' });
    };

    const handleAiPlan = async (projectId: string, name: string, desc: string) => {
        setIsAiPlanning(true);
        const prompt = `Generate 5 key tasks for a project named "${name}": ${desc}. Return strictly a JSON array of strings, e.g. ["Task 1", "Task 2"].`;
        try {
            const result = await sendMessageToGemini(prompt);
            let taskTitles: string[] = [];
            try {
                const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
                taskTitles = JSON.parse(cleanJson);
            } catch {
                taskTitles = result.split('\n').filter(l => l.length > 3).slice(0, 5);
            }

            if (Array.isArray(taskTitles)) {
                taskTitles.forEach((title, idx) => {
                    const start = new Date(Date.now() + idx * 2 * 86400000);
                    const end = new Date(start.getTime() + 2 * 86400000);
                    
                    addTask({
                        id: Date.now().toString() + idx,
                        projectId: projectId,
                        title: title.replace(/^\d+\.\s*/, '').replace(/^- /, ''), 
                        status: 'To Do',
                        priority: 'Medium',
                        assignee: 'AI',
                        startDate: start.toISOString().split('T')[0],
                        dueDate: end.toISOString().split('T')[0]
                    });
                });
                addNotification({ title: 'AI Plan Generated', message: `${taskTitles.length} tasks added to project.`, type: 'success' });
            }
        } catch (e) {
            console.error(e);
            addNotification({ title: 'AI Error', message: 'Failed to generate plan.', type: 'error' });
        } finally {
            setIsAiPlanning(false);
        }
    };

    // --- Drag and Drop (Kanban) ---
    const onDragStart = (id: string) => setDraggedTaskId(id);
    const onDragOver = (e: React.DragEvent) => e.preventDefault();
    const onDrop = (status: string) => {
        if (!draggedTaskId) return;
        const task = tasks.find(t => t.id === draggedTaskId);
        if (task && task.status !== status) {
            updateTask({ ...task, status: status as any });
        }
        setDraggedTaskId(null);
    };

    // --- Gantt Chart Helpers ---
    const getDaysArray = (start: Date, end: Date) => {
        const arr = [];
        for(let dt = new Date(start); dt <= end; dt.setDate(dt.getDate()+1)){
            arr.push(new Date(dt));
        }
        return arr;
    };

    const GanttView = () => {
        // Timeline range: start from earliest task start or today - 5 days, end at latest due date + 5 days
        const dates = projectTasks.flatMap(t => [new Date(t.startDate || ''), new Date(t.dueDate || '')]);
        if (dates.length === 0) dates.push(new Date());
        
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        minDate.setDate(minDate.getDate() - 3); // buffer
        
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        maxDate.setDate(maxDate.getDate() + 7); // buffer

        const timelineDays = getDaysArray(minDate, maxDate);
        const dayWidth = 50; // px per day

        const getTaskPosition = (task: Task) => {
            if (!task.startDate || !task.dueDate) return { left: 0, width: 0 };
            const start = new Date(task.startDate);
            const end = new Date(task.dueDate);
            const diffDays = Math.ceil((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1; // inclusive
            
            return {
                left: diffDays * dayWidth,
                width: Math.max(duration * dayWidth, dayWidth)
            };
        };

        return (
            <div className="flex flex-col h-full bg-surface dark:bg-surface-dark overflow-hidden">
                {/* Timeline Header */}
                <div className="flex border-b border-border dark:border-border-dark overflow-hidden ml-64 bg-surface-subtle dark:bg-surface-subtle-dark">
                    {timelineDays.map((date, i) => (
                        <div key={i} className="flex-shrink-0 border-r border-border dark:border-border-dark py-2 text-center text-[10px] text-text-secondary font-medium" style={{ width: dayWidth }}>
                            {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-auto relative">
                    {/* Rows */}
                    {projectTasks.map((task, idx) => {
                        const { left, width } = getTaskPosition(task);
                        return (
                            <div key={task.id} className="flex items-center border-b border-border/50 dark:border-border-dark/50 hover:bg-surface-subtle/30 h-12 group">
                                {/* Task Name (Sticky) */}
                                <div className="w-64 flex-shrink-0 sticky left-0 bg-surface dark:bg-surface-dark border-r border-border dark:border-border-dark px-4 flex items-center justify-between z-10 h-full shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                    <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate pr-2">{task.title}</span>
                                    <Badge variant={task.status === 'Done' ? 'success' : 'neutral'} className="text-[9px] px-1.5">{task.status}</Badge>
                                </div>

                                {/* Timeline Bar */}
                                <div className="relative flex-1 h-full">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex pointer-events-none">
                                        {timelineDays.map((_, i) => (
                                            <div key={i} className="flex-shrink-0 border-r border-border/30 dark:border-border-dark/30 h-full" style={{ width: dayWidth }}></div>
                                        ))}
                                    </div>

                                    {/* Bar */}
                                    <div 
                                        className={`absolute top-2.5 h-7 rounded-md shadow-sm border border-white/20 flex items-center px-2 cursor-pointer transition-all hover:brightness-110 group/bar ${
                                            task.status === 'Done' ? 'bg-green-500' :
                                            task.priority === 'High' ? 'bg-red-500' : 
                                            task.priority === 'Medium' ? 'bg-amber-500' : 'bg-primary-500'
                                        }`}
                                        style={{ left: `${left}px`, width: `${width}px` }}
                                        title={`${task.startDate} - ${task.dueDate}`}
                                    >
                                        <span className="text-[10px] font-medium text-white truncate drop-shadow-md">{task.assignee}</span>
                                        
                                        {/* Drag Handles (Visual Only) */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/50 rounded-l-md opacity-0 group-hover/bar:opacity-100"></div>
                                        <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/50 rounded-r-md opacity-0 group-hover/bar:opacity-100"></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {projectTasks.length === 0 && (
                        <div className="p-10 text-center text-text-tertiary">No tasks scheduled. Switch to Kanban to add cards quickly.</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="Projects"
                subtitle="Manage tasks, deadlines, and delivery."
                action={
                    <div className="flex gap-3">
                        <div className="flex bg-surface-muted dark:bg-surface-muted-dark p-1 rounded-lg border border-border dark:border-border-dark">
                            <button 
                                onClick={() => setViewMode('kanban')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary-600' : 'text-text-secondary hover:text-text-primary'}`}
                                title="Kanban View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('gantt')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'gantt' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary-600' : 'text-text-secondary hover:text-text-primary'}`}
                                title="Gantt Chart View"
                            >
                                <GanttChart className="w-4 h-4" />
                            </button>
                        </div>
                        <Button icon={Plus} size="sm" onClick={() => setIsProjectModalOpen(true)}>New Project</Button>
                    </div>
                }
            />

            <div className="flex flex-col lg:flex-row h-full min-h-0 gap-6">
                {/* Sidebar Project List */}
                <div className="w-full lg:w-64 flex flex-col gap-3 overflow-y-auto pr-2 pb-4 shrink-0">
                    {projects.map(project => {
                        const progress = getProjectProgress(project.id);
                        const isActive = currentProject?.id === project.id;
                        
                        return (
                            <div 
                                key={project.id}
                                onClick={() => setSelectedProject(project)}
                                className={`
                                    p-4 rounded-xl border cursor-pointer transition-all duration-200 group
                                    ${isActive 
                                        ? 'bg-surface dark:bg-surface-dark border-primary-500 ring-1 ring-primary-500 shadow-md' 
                                        : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark hover:border-primary-300 dark:hover:border-primary-600'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant={project.status === 'Active' ? 'success' : 'neutral'}>{project.status}</Badge>
                                    <span className="text-[10px] text-text-tertiary">{project.deadline}</span>
                                </div>
                                <h3 className={`font-bold ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-text-primary dark:text-text-primary-dark'}`}>{project.name}</h3>
                                <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-3 truncate">{project.client}</p>
                                
                                <div className="w-full h-1.5 bg-surface-muted dark:bg-surface-muted-dark rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-surface-subtle dark:bg-surface-subtle-dark border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                    {currentProject ? (
                        <>
                             {/* Project Header */}
                             <div className="px-6 py-4 border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark flex items-center justify-between shrink-0">
                                 <div className="flex items-center gap-4">
                                     <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{currentProject.name}</h2>
                                     <div className="h-5 w-px bg-border dark:bg-border-dark"></div>
                                     <div className="flex items-center gap-2 text-sm text-text-secondary">
                                         <Clock className="w-4 h-4" />
                                         <span>Due {currentProject.deadline}</span>
                                     </div>
                                 </div>
                                 <Button size="sm" variant="secondary" icon={Plus} onClick={() => setIsTaskModalOpen(true)}>Add Task</Button>
                             </div>
                             
                             <div className="flex-1 min-h-0 overflow-hidden">
                                 {viewMode === 'kanban' ? (
                                     <div className="h-full overflow-x-auto overflow-y-hidden p-6">
                                         <div className="h-full flex gap-6 min-w-max">
                                             {Object.entries(columns).map(([colId, colTasks]) => (
                                                 <div 
                                                    key={colId} 
                                                    className="w-72 flex flex-col h-full"
                                                    onDragOver={onDragOver}
                                                    onDrop={() => onDrop(colId)}
                                                >
                                                     <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                                                         <span className="text-xs font-bold text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">{colId}</span>
                                                         <span className="bg-surface-muted dark:bg-surface-muted-dark text-text-tertiary text-[10px] px-1.5 py-0.5 rounded border border-border dark:border-border-dark">{colTasks.length}</span>
                                                     </div>
                                                     <div className="flex-1 bg-surface-muted/30 dark:bg-surface-muted-dark/30 rounded-xl border border-border/50 dark:border-border-dark/50 p-2 space-y-3 overflow-y-auto custom-scrollbar">
                                                         {colTasks.map(task => (
                                                             <div 
                                                                key={task.id}
                                                                draggable
                                                                onDragStart={() => onDragStart(task.id)}
                                                                className={`
                                                                    bg-surface dark:bg-surface-dark p-3 rounded-lg border shadow-sm cursor-grab hover:shadow-md transition-all
                                                                    ${draggedTaskId === task.id ? 'opacity-50 rotate-2' : 'border-border dark:border-border-dark hover:border-primary-300 dark:hover:border-primary-600'}
                                                                `}
                                                             >
                                                                 <div className="flex justify-between items-start mb-2">
                                                                     <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'neutral'} className="text-[9px] px-1.5 py-0.5">{task.priority}</Badge>
                                                                     <Button variant="ghost" size="sm" className="h-5 w-5 p-0"><MoreHorizontal className="w-3 h-3" /></Button>
                                                                 </div>
                                                                 <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-3 leading-snug">{task.title}</p>
                                                                 <div className="flex items-center justify-between border-t border-border dark:border-border-dark pt-2 mt-2">
                                                                     <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-[9px] font-bold text-primary-700 dark:text-primary-400">
                                                                         {task.assignee?.charAt(0)}
                                                                     </div>
                                                                     <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                                                                         <Clock className="w-3 h-3" /> {task.dueDate?.slice(5)}
                                                                     </span>
                                                                 </div>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 ) : (
                                     <GanttView />
                                 )}
                             </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <LayoutGrid className="w-16 h-16 text-text-tertiary mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Select a Project</h3>
                            <p className="text-text-secondary dark:text-text-secondary-dark max-w-sm mt-1">Choose a project from the sidebar to view its roadmap.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="New Project">
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="space-y-1.5">
                         <label className="text-xs font-medium text-text-secondary">Project Name</label>
                         <Input 
                            placeholder="e.g. Mobile App Redesign" 
                            value={newProject.name}
                            onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                            required
                         />
                    </div>
                    <div className="space-y-1.5">
                         <label className="text-xs font-medium text-text-secondary">Client</label>
                         <Input 
                            placeholder="e.g. Acme Corp" 
                            value={newProject.client}
                            onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                            required
                         />
                    </div>
                    <div className="space-y-1.5">
                         <label className="text-xs font-medium text-text-secondary">Description</label>
                         <textarea 
                            className="w-full px-3 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none min-h-[80px]"
                            placeholder="Brief project goal..."
                            value={newProject.description}
                            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                         ></textarea>
                    </div>
                    <div className="space-y-1.5">
                         <label className="text-xs font-medium text-text-secondary">Deadline</label>
                         <Input 
                            type="date"
                            value={newProject.deadline}
                            onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                         />
                    </div>
                    
                    <div className="pt-2 flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="aiPlan" 
                            checked={isAiPlanning} 
                            onChange={(e) => setIsAiPlanning(e.target.checked)}
                            className="rounded border-border text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="aiPlan" className="text-sm text-text-secondary flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                            Auto-generate initial tasks with AI
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsProjectModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isAiPlanning && !newProject.name}>
                            {isAiPlanning ? 'Create & Generate' : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Add Task">
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div className="space-y-1.5">
                         <label className="text-xs font-medium text-text-secondary">Task Title</label>
                         <Input 
                            placeholder="e.g. Setup Database" 
                            value={newTask.title}
                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                            required
                         />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                             <label className="text-xs font-medium text-text-secondary">Priority</label>
                             <select 
                                className="w-full h-[38px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none"
                                value={newTask.priority}
                                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                             >
                                 <option>Low</option>
                                 <option>Medium</option>
                                 <option>High</option>
                             </select>
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-xs font-medium text-text-secondary">Assignee</label>
                             <Input 
                                value={newTask.assignee}
                                onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                             />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                             <label className="text-xs font-medium text-text-secondary">Start Date</label>
                             <Input 
                                type="date"
                                value={newTask.startDate}
                                onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                             />
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-xs font-medium text-text-secondary">Due Date</label>
                             <Input 
                                type="date"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                             />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Add Task</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
