import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AboutModal } from './components/AboutModal';

// Single-page modules
import { DashboardView } from './views/DashboardView';
import { RoutePlannerView } from './views/RoutePlannerView';
import { DiscreteMathematicsModuleView } from './views/DiscreteMathematicsModuleView';
import { AcademicReportView } from './views/AcademicReportView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { ContactView } from './views/ContactView';

import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  Home,
  Route,
  Grid,
  BarChart3,
  User,
  Settings as SettingsIcon,
  BookOpen
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    toasts,
    notifications,
    dismissToast,
    dismissNotification,
    settings,
    isAboutModalOpen,
    setIsAboutModalOpen
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState<boolean>(false);

  // Watch for activeTab changes to open modals if requested from buttons
  React.useEffect(() => {
    if (activeTab === 'settings') {
      setIsSettingsModalOpen(true);
    } else if (activeTab === 'academic-report') {
      setIsReportModalOpen(true);
    }
  }, [activeTab]);

  const [viewMode, setViewMode] = React.useState<'pages' | 'scroll'>('pages');

  // Automatically update active top nav link as user scrolls (only in scroll mode)
  React.useEffect(() => {
    if (viewMode !== 'scroll') return;
    const handleScroll = () => {
      const sections = [
        { id: 'dashboard' as const, elId: 'section-overview' },
        { id: 'route-planner' as const, elId: 'section-campus-map' },
        { id: 'matrix-relations' as const, elId: 'section-discrete-models' },
        { id: 'analytics' as const, elId: 'section-analytics' },
        { id: 'contact' as const, elId: 'section-contact' }
      ];

      const scrollPosition = window.scrollY + 180;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].elId);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveTab, viewMode]);

  const activeToasts = toasts || notifications || [];
  const handleDismiss = dismissToast || dismissNotification || (() => {});

  const navItems = [
    { id: 'dashboard', label: '1. Home', targetId: 'section-overview', icon: Home },
    { id: 'route-planner', label: '2. Live Map (Poonamallee ↔ Saveetha)', targetId: 'section-campus-map', icon: Route },
    { id: 'matrix-relations', label: '3. Discrete Models', targetId: 'section-discrete-models', icon: Grid },
    { id: 'analytics', label: '4. Analysis', targetId: 'section-analytics', icon: BarChart3 },
    { id: 'contact', label: '5. Contact', targetId: 'section-contact', icon: User }
  ];

  const handleMobileNavClick = (tabId: string, targetId: string) => {
    setIsMobileMenuOpen(false);
    setActiveTab(tabId as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (viewMode === 'scroll') {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        settings?.theme === 'light' ? 'theme-light bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      } flex flex-col antialiased selection:bg-cyan-500 selection:text-white`}
    >
      {/* Sticky Top Header */}
      <Header onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

      {/* Mobile Drawer Menu for Quick Jump */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col animate-in fade-in duration-150">
          <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
              <span className="text-cyan-400 font-mono">&lt;&gt;</span>
              <span>Quick Navigation Menu</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-2 flex-1 overflow-y-auto bg-slate-950">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNavClick(item.id, item.targetId)}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-sm font-semibold text-slate-200 flex items-center gap-3 transition-colors"
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2"
              >
                <SettingsIcon className="w-4 h-4 text-cyan-400" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsReportModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Single-Page Content Stream */}
      <main
        id="main-content"
        className={`flex-1 px-4 sm:px-6 lg:px-8 py-8 ${
          settings?.theme === 'light' ? 'bg-slate-50' : 'bg-slate-950'
        } flex flex-col justify-between`}
      >
        <div className="max-w-7xl mx-auto space-y-8 w-full flex-1">
          {/* Quick Page Navigation Tabs & Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 font-mono mr-1">
                PAGES:
              </span>
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isCurrent = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`page-tab-btn-${item.id}`}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as any);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isCurrent ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setViewMode('pages');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'pages'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dedicated Page Mode: Map is on Page 2"
              >
                📑 Dedicated Pages
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('scroll');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'scroll'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Continuous Vertical Scroll Mode"
              >
                📜 All-in-One Scroll
              </button>
            </div>
          </div>

          {/* DEDICATED PAGE MODE (Default) - Map is on Page 2 */}
          {viewMode === 'pages' ? (
            <div className="animate-in fade-in duration-150">
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'route-planner' && <RoutePlannerView />}
              {activeTab === 'matrix-relations' && <DiscreteMathematicsModuleView />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'contact' && <ContactView />}
            </div>
          ) : (
            /* ALL-IN-ONE SCROLL MODE */
            <div className="space-y-16">
              {/* Section 1: Overview, Research Architecture & Team Intro */}
              <section id="section-overview" className="scroll-mt-20">
                <DashboardView />
              </section>

              {/* Section 2: Real-Time Saveetha University Campus Map & Shortest Path Planner */}
              <section id="section-campus-map" className="scroll-mt-20 border-t border-slate-800/80 pt-10">
                <RoutePlannerView />
              </section>

              {/* Section 3: Discrete Mathematics Engine (Shalini M 192311434 & Infant Leoraj 192311373) */}
              <section id="section-discrete-models" className="scroll-mt-20 border-t border-slate-800/80 pt-10">
                <DiscreteMathematicsModuleView />
              </section>

              {/* Section 4: Performance, Benchmark Comparisons & Complexity Analytics */}
              <section id="section-analytics" className="scroll-mt-20 border-t border-slate-800/80 pt-10">
                <AnalyticsView />
              </section>

              {/* Section 5: Academic Research Team & Contact */}
              <section id="section-contact" className="scroll-mt-20 border-t border-slate-800/80 pt-10">
                <ContactView />
              </section>
            </div>
          )}
        </div>

        {/* Academic Footer with SIMATS Saveetha University Department Info */}
        <footer className="mt-16 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-slate-300 font-mono">SAVEETHA UNIVERSITY (SIMATS)</span>
            <span className="hidden sm:inline">•</span>
            <span>Department of Computer Science & Engineering</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-cyan-400 font-medium">Discrete Mathematics & Graph Theoretical Navigation Engine</span>
          </div>
          <div className="text-slate-500 text-[11px] font-mono">
            © 2026 SIMATS ENGINEERING • All Rights Reserved
          </div>
        </footer>
      </main>

      {/* Settings Modal (Clean floating overlay for single-page experience) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-slate-100">Application & Algorithm Settings</h3>
              </div>
              <button
                onClick={() => {
                  setIsSettingsModalOpen(false);
                  if (activeTab === 'settings') setActiveTab('dashboard');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <SettingsView />
            </div>
          </div>
        </div>
      )}

      {/* Academic Report Dossier Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-slate-100">Academic Capstone Research Dossier</h3>
              </div>
              <button
                onClick={() => {
                  setIsReportModalOpen(false);
                  if (activeTab === 'academic-report') setActiveTab('dashboard');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <AcademicReportView />
            </div>
          </div>
        </div>
      )}

      {/* Capstone Documentation Modal */}
      <AboutModal />

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {activeToasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/30'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-950/30'
                : toast.type === 'warning'
                ? 'bg-slate-900/95 border-amber-500/40 text-amber-300 shadow-amber-950/30'
                : 'bg-slate-900/95 border-cyan-500/40 text-cyan-300 shadow-cyan-950/30'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
              <div>
                <h5 className="font-bold text-xs text-slate-100">{toast.title}</h5>
                {toast.message && <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>}
              </div>
            </div>

            <button
              onClick={() => handleDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

