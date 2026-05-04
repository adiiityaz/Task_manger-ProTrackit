import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Shell from '../components/layout/Shell';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Task, TaskStatus, Project, TaskPriority } from '../types';
import { 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  ClipboardList,
  Sparkles,
  Circle,
  ChevronDown,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Components ──────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

function TaskCard({ task, isOverlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'LOW': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[140px] bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-800"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "bg-zinc-900 p-5 rounded-xl border border-zinc-800 transition-all hover:border-zinc-700 shadow-sm relative group/card",
        task.priority === 'HIGH' && task.status !== 'DONE' ? 'border-l-4 border-l-red-500' : 
        task.priority === 'MEDIUM' && task.status !== 'DONE' ? 'border-l-4 border-l-amber-500' : '',
        isOverlay && "shadow-2xl ring-2 ring-indigo-500/50 cursor-grabbing"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={cn(
          "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border",
          getPriorityColor(task.priority)
        )}>
          {task.priority}
        </span>
        <div {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-zinc-600 hover:text-zinc-400 transition-colors">
          <GripVertical size={14} />
        </div>
      </div>

      <div className="mb-4">
        <p className={cn(
          "text-sm font-semibold leading-relaxed tracking-tight",
          task.status === 'DONE' ? 'text-zinc-500 line-through' : 'text-zinc-100'
        )}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-[11px] text-zinc-500 mt-2 line-clamp-2 italic font-serif">
            {task.description}
          </p>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">
            {(task.assignee?.name || 'U').charAt(0)}
          </div>
          <span className="text-[10px] font-bold text-zinc-500">{task.assignee?.name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-600">
          <Calendar size={10} />
          <span className="text-[9px] font-bold uppercase">
            {task.dueDate ? format(parseISO(task.dueDate), 'MMM d') : 'No date'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL');

  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    priority: 'MEDIUM' as TaskPriority,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });

  const [dbUsers, setDbUsers] = useState<{id: string, name: string}[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get(projectId ? `/tasks?projectId=${projectId}` : '/tasks'),
        api.get('/projects'),
        api.get('/auth/users')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setDbUsers(usersRes.data);
      
      if (usersRes.data.length > 0) {
        setNewTask(prev => ({ ...prev, assignedTo: usersRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const assigneeName = task.assignee?.name || 'Unassigned';
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           assigneeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchTerm, filterPriority]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    // If dragging over another task in a different column
    if (activeTask && overTask && activeTask.status !== overTask.status) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);
        
        const newTasks = [...tasks];
        newTasks[activeIndex] = { ...activeTask, status: overTask.status };
        return arrayMove(newTasks, activeIndex, overIndex);
      });
    }
    
    // If dragging over a column container
    const isColumn = ['TODO', 'IN_PROGRESS', 'DONE'].includes(overId as string);
    if (activeTask && isColumn && activeTask.status !== overId) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex] = { ...activeTask, status: overId as TaskStatus };
        return arrayMove(newTasks, activeIndex, tasks.length - 1);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const activeTask = tasks.find(t => t.id === activeId);
    
    if (activeTask) {
      try {
        await api.patch(`/tasks/${activeId}`, { status: activeTask.status });
        toast.success(`Moved to ${activeTask.status.replace('_', ' ')}`);
      } catch (err: any) {
        toast.error('Failed to update status in backend');
        fetchData(); // Revert on error
      }
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !projectId) return;
    try {
      const res = await api.post('/tasks', { 
        projectId, 
        ...newTask
      });
      setTasks([...tasks, res.data]);
      setNewTask({
        title: '',
        assignedTo: dbUsers[0]?.id || '',
        priority: 'MEDIUM',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        description: ''
      });
      setShowAddModal(false);
      toast.success('Task created successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const currentProject = projects.find(p => p.id === projectId);

  const columns: { status: TaskStatus, label: string, icon: any, color: string }[] = [
    { status: 'TODO', label: 'To Do', icon: Circle, color: 'text-zinc-500' },
    { status: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'text-indigo-500' },
    { status: 'DONE', label: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <Shell>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
              {currentProject ? currentProject.name : 'All Tasks'}
            </h1>
            <p className="text-zinc-500 mt-2 text-sm">
              {currentProject ? currentProject.description : 'Viewing across all your projects'}
            </p>
          </div>
          {projectId && user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={18} />
              Add Task
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
            <input 
              type="text" 
              placeholder="Search tasks, descriptions, or assignees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="appearance-none bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-10 text-xs font-bold text-zinc-400 outline-none hover:bg-zinc-900 transition-all cursor-pointer uppercase tracking-widest"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col lg:flex-row gap-8 overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide">
            {columns.map((column) => (
              <div key={column.status} className="flex-1 min-w-[320px] flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-500 uppercase tracking-[0.2em] text-[10px]">
                      {column.label}
                    </h3>
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-black text-zinc-500">
                      {filteredTasks.filter(t => t.status === column.status).length}
                    </span>
                  </div>
                </div>

                <SortableContext
                  id={column.status}
                  items={filteredTasks.filter(t => t.status === column.status).map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div 
                    id={column.status}
                    className="space-y-4 bg-zinc-950/50 p-3 rounded-2xl min-h-[600px] border border-zinc-900/50"
                  >
                    <AnimatePresence mode='popLayout'>
                      {filteredTasks.filter(t => t.status === column.status).map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </AnimatePresence>
                    
                    {filteredTasks.filter(t => t.status === column.status).length === 0 && (
                      <div className="py-20 flex flex-col items-center justify-center opacity-30">
                        <ClipboardList size={32} className="text-zinc-700 mb-2" />
                        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest leading-none">Drop here</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {tasks.length === 0 && !loading && (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-500">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-bold text-zinc-100 mb-2">Workspace Empty</h3>
          <p className="text-sm text-zinc-500 max-w-xs">This project is a clean slate. Use the "Add Task" button to start building your workflow.</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-zinc-900 rounded-2xl p-10 w-full max-w-xl shadow-2xl border border-zinc-800"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-500 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 italic">Create New Initiative</h2>
                <p className="text-zinc-500 text-xs">Define a new task for {currentProject?.name}</p>
              </div>
            </div>

            <form onSubmit={handleAddTask} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Detailed Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-100 text-sm font-medium transition-all"
                    placeholder="e.g. Implement the high-level API synchronization"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Priority Level</label>
                  <select
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-100 text-sm font-medium appearance-none transition-all cursor-pointer"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                  >
                    <option value="LOW">Low Efficiency</option>
                    <option value="MEDIUM">Medium Impact</option>
                    <option value="HIGH">High Criticality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Target Deadline</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-100 text-sm font-medium transition-all"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Assign Fellow</label>
                  <select
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-100 text-sm font-medium appearance-none transition-all cursor-pointer"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  >
                    {dbUsers.map(u => <option key={u.id} value={u.id} className="bg-zinc-900">{u.name}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Brief Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-100 text-sm font-medium transition-all resize-none"
                    placeholder="Provide some context for this objective..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 bg-zinc-800 text-zinc-400 rounded-xl text-sm font-bold hover:bg-zinc-700 hover:text-zinc-100 transition-all uppercase tracking-widest"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-[0.2em]"
                >
                  Commit Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Shell>
  );
}
