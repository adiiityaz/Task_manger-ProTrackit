import { useState, useEffect } from 'react';
import Shell from '../components/layout/Shell';
import api from '../services/api';
import { Task } from '../types';
import { 
  CheckCircle2, 
  CircleDashed, 
  ClipboardList, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { format, isPast, isToday, parseISO } from 'date-fns';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        setTasks(response.data);
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const statusData = [
    { name: 'Todo', value: tasks.filter(t => t.status === 'TODO').length, color: '#71717a' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: '#6366f1' },
    { name: 'Done', value: tasks.filter(t => t.status === 'DONE').length, color: '#10b981' },
  ];

  const priorityData = [
    { name: 'Low', count: tasks.filter(t => t.priority === 'LOW').length, fill: '#10b981' },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'MEDIUM').length, fill: '#8b5cf6' },
    { name: 'High', count: tasks.filter(t => t.priority === 'HIGH').length, fill: '#ef4444' },
  ];

  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    try {
      const date = parseISO(t.dueDate);
      return t.status !== 'DONE' && isPast(date) && !isToday(date);
    } catch {
      return false;
    }
  });

  const stats = [
    { 
      label: 'Total Tasks', 
      value: tasks.length, 
      icon: ClipboardList, 
      color: 'bg-zinc-800 text-zinc-400',
      description: 'Active tasks in your workspace'
    },
    { 
      label: 'Completed', 
      value: tasks.filter(t => t.status === 'DONE').length, 
      icon: CheckCircle2, 
      color: 'bg-zinc-800 text-emerald-400',
      description: 'Tasks reached the finish line'
    },
    { 
      label: 'In Progress', 
      value: tasks.filter(t => t.status === 'IN_PROGRESS').length, 
      icon: TrendingUp, 
      color: 'bg-zinc-800 text-indigo-400',
      description: 'Currently being worked on'
    },
    { 
      label: 'Overdue', 
      value: overdueTasks.length, 
      icon: AlertCircle, 
      color: 'bg-zinc-800 text-red-400',
      description: 'Tasks past their deadline'
    },
  ];

  if (loading) {
// ...
    return (
      <Shell>
        <div className="flex animate-pulse flex-col space-y-4">
          <div className="h-10 w-48 bg-zinc-900 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-xl border border-zinc-800"></div>)}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-500 mt-2 text-sm">Welcome back! Here's what's happening with your projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm hover:border-zinc-700 transition-all group"
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
            <h3 className="text-3xl font-bold text-zinc-100">{stat.value}</h3>
            <p className="text-[10px] text-zinc-600 mt-2">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Task Breakdown Chart */}
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Status Distribution</h3>
              <p className="text-xs text-zinc-500">Tasks categorized by current state</p>
            </div>
            <PieChartIcon size={20} className="text-zinc-600" />
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Chart */}
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Task Priorities</h3>
              <p className="text-xs text-zinc-500">Resource allocation by urgency</p>
            </div>
            <BarChart3 size={20} className="text-zinc-600" />
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-zinc-100">Recent Activity</h2>
            <button className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">View All</button>
          </div>
          <div className="space-y-6">
            {tasks.slice(-5).reverse().map((task) => (
              <div key={task.id} className="flex items-center justify-between pb-6 border-b border-zinc-800 last:border-0 last:pb-0 group/item">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border border-zinc-800 group-hover/item:border-zinc-700 transition-colors",
                    task.status === 'DONE' ? 'bg-emerald-500/5 text-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-indigo-500/5 text-indigo-500' : 'bg-zinc-800 text-zinc-500'
                  )}>
                    {task.status === 'DONE' ? <CheckCircle2 size={16} /> : <ClipboardList size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-100 group-hover/item:text-white transition-colors">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Calendar size={10} />
                        Due {task.dueDate ? format(parseISO(task.dueDate), 'MMM d') : 'No date'}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        task.priority === 'HIGH' ? 'text-red-400' : task.priority === 'MEDIUM' ? 'text-indigo-400' : 'text-emerald-400'
                      )}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{task.assignee?.name || 'Unassigned'}</p>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
                    task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400' : task.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-800 text-zinc-500'
                  )}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-zinc-600 py-10 italic text-sm">No tasks found yet.</p>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-zinc-100">Upcoming</h2>
            <Calendar size={18} className="text-zinc-600" />
          </div>
          <div className="space-y-4">
            {tasks
              .filter(t => t.status !== 'DONE')
              .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
              .slice(0, 3)
              .map(task => (
                <div key={task.id} className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
                  <p className="text-xs font-semibold text-zinc-100 mb-2 truncate">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded outline-1",
                      isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) ? "bg-red-500/10 text-red-500 outline-red-500/20" : "bg-zinc-800 text-zinc-400 outline-zinc-700"
                    )}>
                      {task.dueDate ? (isToday(parseISO(task.dueDate)) ? 'Today' : format(parseISO(task.dueDate), 'MMM d')) : 'No date'}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] font-bold">
                      {(task.assignee?.name || 'U').charAt(0)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
