import React from 'react';
import {
  Radio,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/GraphCanvas';
import { RealTimeTrafficPanel } from '../components/RealTimeTrafficPanel';

export const LiveTrafficView: React.FC = () => {
  const {
    graph,
    activeResult,
    isLiveTrafficActive,
    setIsLiveTrafficActive,
    telemetryTicks,
    triggerRandomIncident,
    clearAllIncidents,
    liveIncidents,
    settings
  } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Live Traffic & Dynamic Telemetry
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
              isLiveTrafficActive
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {isLiveTrafficActive ? 'LIVE STREAMING' : 'PAUSED'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time urban road network simulation with dynamic edge weights, incident injection, and vehicle tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-simulate-traffic-incident"
            onClick={() => triggerRandomIncident()}
            className="px-3 py-2 bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Simulate Incident</span>
          </button>
          {liveIncidents.length > 0 && (
            <button
              id="btn-clear-incidents-header"
              onClick={clearAllIncidents}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Clear Incidents</span>
            </button>
          )}
        </div>
      </div>

      {/* LIVE MAP VISUALIZER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Real-Time Network Topology Map</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Low (50+ km/h)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" /> Heavy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> Severe / Alert
            </span>
          </div>
        </div>

        <GraphCanvas
          height={480}
          highlightPath={activeResult?.path || []}
          interactive={true}
          showDetailsOverlay={true}
        />
      </div>

      {/* REAL-TIME TELEMETRY & CONTROLS DASHBOARD */}
      <RealTimeTrafficPanel />

      {/* MATHEMATICAL FOUNDATION CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Cpu className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Discrete Mathematics: Time-Dependent Graph Theory (G = (V, E, W(t)))
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Dynamic Edge Weight Equation
            </h4>
            <p className="text-slate-400">
              In static graph theory, w(e) is constant. In real-time intelligent transportation systems, weight evolves dynamically as a function of live velocity multiplier μ(e, t) and incident delay δ(e, t):
            </p>
            <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-cyan-300 text-xs border border-slate-800">
              {"w'(e, t) = [w_base(e) / μ(e, t)] + δ(e, t)"}
            </div>
            <p className="text-slate-400 text-[11px]">
              Where μ ∈ [0.2, 1.3] represents congestion coefficient and δ ≥ 0 represents discrete localized disruptions.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-400" />
              Real-Time Dijkstra Relaxation
            </h4>
            <p className="text-slate-400">
              {"When an active route experiences a sudden edge cost spike (w'(e) > θ), the system re-runs shortest-path verification:"}
            </p>
            <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-emerald-300 text-xs border border-slate-800">
              {"d(v) = min_{u ∈ N(v)} [d(u) + w'(u, v, t)]"}
            </div>
            <p className="text-slate-400 text-[11px]">
              {"If Cost(P_new) < Cost(P_current) - ε, an automated dynamic reroute suggestion is dispatched immediately."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
