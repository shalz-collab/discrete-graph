import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Cpu,
  Compass,
  Sliders,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Download,
  Upload,
  CheckCircle2,
  Info,
  ShieldAlert,
  Radio,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AlgorithmType, WeightType } from '../types';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetDemoGraph,
    clearHistory,
    resetApplicationData,
    graph,
    history,
    setGraph,
    notify
  } = useApp();

  // Confirmation modal states
  const [confirmAction, setConfirmAction] = useState<'reset-graph' | 'clear-history' | 'reset-app' | null>(null);

  const handleConfirm = () => {
    if (confirmAction === 'reset-graph') {
      resetDemoGraph();
    } else if (confirmAction === 'clear-history') {
      clearHistory();
    } else if (confirmAction === 'reset-app') {
      resetApplicationData();
    }
    setConfirmAction(null);
  };

  // Full App State Backup Export
  const handleExportAppState = () => {
    const statePayload = {
      app: 'Graph-Based Smart Route Planner',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      graph,
      history,
      settings
    };

    const blob = new Blob([JSON.stringify(statePayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_route_planner_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('success', 'Backup Exported', 'Downloaded full application state snapshot.');
  };

  // Full App State Restore
  const handleImportAppState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.graph && parsed.graph.nodes) {
          setGraph(parsed.graph);
          if (parsed.settings) updateSettings(parsed.settings);
          notify('success', 'State Restored', 'Successfully loaded application state from backup file.');
        } else {
          notify('error', 'Invalid Backup', 'File does not match the required application state format.');
        }
      } catch {
        notify('error', 'Import Failed', 'Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <span>System Settings & Preferences</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize search defaults, interface appearance, visual animations, and storage persistence.
        </p>
      </div>

      {/* SECTION 1: APPEARANCE & THEME */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Interface Appearance</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Toggle high-contrast technical dark mode or light mode.</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark Mode</span>
            </button>
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                settings.theme === 'light'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: DEFAULT ROUTING PARAMETERS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Default Routing & Search Preferences</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Default Algorithm */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Default Search Algorithm</label>
            <select
              value={settings.defaultAlgorithm}
              onChange={e => updateSettings({ defaultAlgorithm: e.target.value as AlgorithmType })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="dijkstra">Dijkstra's Shortest Path</option>
              <option value="astar">A* Heuristic Search</option>
            </select>
          </div>

          {/* Default Weight Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Default Edge Weight Metric</label>
            <select
              value={settings.defaultWeightType}
              onChange={e => updateSettings({ defaultWeightType: e.target.value as WeightType })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="distance">Distance (Kilometers)</option>
              <option value="travelTime">Travel Time (Minutes)</option>
              <option value="customWeight">Custom Toll Fee ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: VISUAL & CANVAS ANIMATION SETTINGS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Graph Canvas & Display Controls</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Show Node Coordinates</span>
              <span className="text-[11px] text-slate-400">Display (X, Y) pixel Cartesian coordinates below vertex labels.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showCoordinates}
              onChange={e => updateSettings({ showCoordinates: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Snap to Grid (20px)</span>
              <span className="text-[11px] text-slate-400">Automatically align vertex coordinates to grid intersections when dragging.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.snapToGrid}
              onChange={e => updateSettings({ snapToGrid: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: REAL-TIME TRAFFIC & TELEMETRY STREAM */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Real-Time Traffic & Telemetry Configuration</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Live Traffic Telemetry Streaming</span>
              <span className="text-[11px] text-slate-400">Stream dynamic congestion updates and incident alerts across all network edges.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.liveTrafficEnabled}
              onChange={e => updateSettings({ liveTrafficEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Automated Dynamic Rerouting Prompts</span>
              <span className="text-[11px] text-slate-400">Prompt immediate shortest-path recalculated alternatives when active route encounters severe delays.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoRerouteOnIncident}
              onChange={e => updateSettings({ autoRerouteOnIncident: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Telemetry Refresh Interval</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{settings.liveTrafficIntervalSeconds || 4} seconds</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={settings.liveTrafficIntervalSeconds || 4}
              onChange={e => updateSettings({ liveTrafficIntervalSeconds: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Fast (2s)</span>
              <span>Standard (4s)</span>
              <span>Relaxed (15s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: DATA MANAGEMENT & BACKUPS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Data Management & Snapshots</span>
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportAppState}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Complete State JSON</span>
          </button>

          <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Import State JSON</span>
            <input type="file" accept=".json" onChange={handleImportAppState} className="hidden" />
          </label>
        </div>
      </div>

      {/* SECTION 5: DESTRUCTIVE ACTIONS & RESETS */}
      <div className="bg-slate-900 border border-rose-950/40 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-rose-400 flex items-center gap-2 pb-3 border-b border-slate-800">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Reset & Dangerous Actions</span>
        </h3>

        <div className="space-y-3">
          {/* Action 1: Reset Demo Graph */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Reset Demo Graph</span>
              <span className="text-[11px] text-slate-400">Restore the initial Chennai road network sample graph.</span>
            </div>
            <button
              onClick={() => setConfirmAction('reset-graph')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset Graph</span>
            </button>
          </div>

          {/* Action 2: Clear Route History */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Clear Route History</span>
              <span className="text-[11px] text-slate-400">Delete all stored route calculation records from local storage.</span>
            </div>
            <button
              onClick={() => setConfirmAction('clear-history')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          {/* Action 3: Clear All Application Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/30 gap-3">
            <div>
              <span className="text-xs font-semibold text-rose-300 block">Purge All Application Data</span>
              <span className="text-[11px] text-rose-400/80">Wipe all graphs, history logs, evaluated expressions, and reset preferences.</span>
            </div>
            <button
              onClick={() => setConfirmAction('reset-app')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-md shadow-rose-700/30"
            >
              Reset Everything
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">Confirm Action</h4>
                <p className="text-xs text-slate-400">Please confirm before proceeding.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmAction === 'reset-graph' &&
                'Are you sure you want to reset the graph to the default Chennai road network? Custom added locations and connections will be lost.'}
              {confirmAction === 'clear-history' &&
                'Are you sure you want to delete all saved route computation logs? This action cannot be undone.'}
              {confirmAction === 'reset-app' &&
                'Are you sure you want to reset all application state? This will purge local storage, restored default graphs, and clear all history logs.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/30"
              >
                Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
