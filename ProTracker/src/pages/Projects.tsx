import React, { useState, useEffect } from 'react';
import Shell from '../components/layout/Shell';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Project } from '../types';
import { FolderKanban, Plus, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setCreating(true);
    try {
      await api.post('/projects', { name: newName, description: newDesc });
      setNewName('');
      setNewDesc('');
      setShowNewModal(false);
      toast.success('Project created successfully');
      fetchProjects();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create project');
      console.error('Failed to create project', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Shell>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Projects</h1>
          <p className="text-zinc-500 mt-2 text-sm">Manage your development initiatives.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10"
          >
            <Plus size={18} />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-zinc-900 rounded-2xl border border-zinc-800"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/tasks?projectId=${project.id}`)}
              className="group bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-700 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-800 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FolderKanban size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-2 truncate">{project.name}</h3>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-6 h-10">{project.description}</p>
              
              {project.tasks && project.tasks.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Progress</span>
                    <span className="text-[10px] font-bold text-indigo-400">
                      {Math.round((project.tasks.filter(t => t.status === 'DONE').length / project.tasks.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(project.tasks.filter(t => t.status === 'DONE').length / project.tasks.length) * 100}%` }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-indigo-400">
                <span className="text-[10px] font-bold uppercase tracking-widest">View Tasks</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-500">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">No projects yet</h3>
              <p className="text-sm text-zinc-500 max-w-xs">Start by creating your first project to organize your team's tasks.</p>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setShowNewModal(true)}
                  className="mt-6 text-indigo-400 text-sm font-bold hover:text-indigo-300 transition-colors"
                >
                  Create Project Now
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-zinc-800"
          >
            <h2 className="text-xl font-bold text-zinc-100 mb-6">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 px-1">Project Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg outline-none focus:border-indigo-500 text-zinc-100 text-sm font-medium transition-colors"
                  placeholder="e.g. Mobile App"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 px-1">Description</label>
                <textarea
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg outline-none focus:border-indigo-500 text-zinc-100 text-sm font-medium h-32 resize-none transition-colors"
                  placeholder="What is this project about?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-400 rounded-lg text-sm font-bold hover:bg-zinc-700 hover:text-zinc-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="animate-spin" size={18} /> : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Shell>
  );
}
