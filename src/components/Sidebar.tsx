import React from 'react';
import {
  LayoutDashboard,
  Route,
  Network,
  Cpu,
  Binary,
  Table,
  History,
  BarChart3,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  GitFork,
  Radio,
  FileText,
  Grid,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { activeTab, setActiveTab, setIsAboutModalOpen } = useApp();

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: LayoutDashboard },
    { id: 'route-planner' as ActiveTab, label: 'Module 1: Shortest Path', icon: Route },
    { id: 'matrix-relations' as ActiveTab, label: 'Module 2: Discrete Models', icon: Grid },
    { id: 'analytics' as ActiveTab, label: 'Results & Analysis', icon: BarChart3 },
    { id: 'contact' as ActiveTab, label: 'Contact', icon: User }
  ];

  const handleNavClick = (id: ActiveTab) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Root */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0 font-bold">
              <GitFork className="w-5 h-5 text-cyan-400" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-slate-100 truncate tracking-tight uppercase">
                  SIMATS Engineering
                </span>
                <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase font-semibold truncate">
                  Discrete Math Portal
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            id="btn-sidebar-collapse"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1.5 custom-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Institutional Copyright & Capstone Info */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950">
          <button
            id="btn-open-about-modal"
            onClick={() => setIsAboutModalOpen(true)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-slate-800 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="About SIMATS Engineering Discrete Math Project"
          >
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Academic Dossier</span>}
          </button>

          {!isCollapsed && (
            <div className="px-2 pt-1 text-[10px] text-slate-500 font-mono leading-tight">
              © SIMATS ENGINEERING
              <div className="text-[9px] text-slate-600">Saveetha University CSE</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
