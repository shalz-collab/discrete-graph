import React from 'react';
import {
  Home,
  Route,
  Radio,
  Grid,
  Binary,
  BarChart3,
  User,
  RotateCcw,
  Sun,
  Moon,
  Info,
  Menu,
  Sparkles,
  Code2,
  FileText,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    activeTab,
    setActiveTab,
    settings,
    updateSettings,
    resetDemoGraph,
    setIsAboutModalOpen
  } = useApp();

  const topNavLinks: { id: ActiveTab; label: string; sectionId: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: '1. Home', sectionId: 'section-overview', icon: Home },
    { id: 'route-planner', label: '2. Live Map (Poonamallee ↔ Saveetha)', sectionId: 'section-campus-map', icon: Route },
    { id: 'matrix-relations', label: '3. Discrete Models', sectionId: 'section-discrete-models', icon: Grid },
    { id: 'analytics', label: '4. Analysis', sectionId: 'section-analytics', icon: BarChart3 },
    { id: 'contact', label: '5. Contact', sectionId: 'section-contact', icon: User }
  ];

  const handleNavClick = (item: typeof topNavLinks[0]) => {
    setActiveTab(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const el = document.getElementById(item.sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <header className="h-16 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Brand Logo '< > DiscreteRoute' */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick(topNavLinks[0])}
          className="flex items-center gap-2 text-left group"
        >
          <div className="flex items-center font-mono font-black text-cyan-400 text-lg tracking-tighter">
            &lt;&gt;
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base text-slate-100 group-hover:text-cyan-400 transition-colors tracking-tight">
              DiscreteRoute
            </span>
            <span className="text-[9px] font-mono text-cyan-400 font-semibold tracking-wider uppercase hidden sm:block">
              SAVEETHA UNIVERSITY (SIMATS)
            </span>
          </div>
        </button>
      </div>

      {/* Center: Desktop Horizontal Top Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        {topNavLinks.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`top-nav-${item.id}`}
              onClick={() => handleNavClick(item)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Quick Actions & Status */}
      <div className="flex items-center gap-2">
        {/* Reset Graph */}
        <button
          id="btn-header-reset-demo"
          onClick={resetDemoGraph}
          title="Reset to Demo Graph"
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Demo</span>
        </button>

        {/* Academic Dossier */}
        <button
          id="btn-header-academic-dossier"
          onClick={() => setActiveTab('academic-report')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dossier</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() =>
            updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
          }
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
          title={`Switch Theme`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={() => setActiveTab('settings')}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
