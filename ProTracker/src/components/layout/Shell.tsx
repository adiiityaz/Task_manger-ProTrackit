import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Layout } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Projects', icon: FolderKanban, path: '/projects' },
    { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-800 bg-zinc-950">
            <img src="/favicon.png" alt="ProTrackIt Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xl text-zinc-100 tracking-tight italic">ProTrackIt</span>
        </div>

        <nav className="flex-1 space-y-1">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">Menu</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium",
                location.pathname === item.path 
                  ? "bg-zinc-800 text-indigo-400" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              )}
            >
              <item.icon size={18} className={cn(
                "transition-colors",
                location.pathname === item.path ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-100"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800">
          <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center border border-zinc-600 text-xs font-bold text-zinc-100">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-100 truncate">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-950">
        <div className="p-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
