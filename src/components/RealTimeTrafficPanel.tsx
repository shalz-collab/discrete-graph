import React, { useState, useMemo } from 'react';
import {
  Radio,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  Play,
  Square,
  FastForward,
  Activity,
  Sliders,
  RefreshCw,
  Clock,
  Gauge,
  Layers,
  Car
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CongestionLevel, LiveTrafficEdgeState, GraphNode } from '../types';

export const RealTimeTrafficPanel: React.FC = () => {
  const {
    graph,
    liveTraffic,
    liveIncidents,
    isLiveTrafficActive,
    setIsLiveTrafficActive,
    triggerRandomIncident,
    resolveIncident,
    clearAllIncidents,
    updateEdgeTraffic,
    telemetryTicks,
    vehicleDriveState,
    startDrivingSimulation,
    stopDrivingSimulation,
    setDriveSpeedMultiplier,
    activeResult,
    settings,
    updateSettings
  } = useApp();

  const [selectedEdgeForEdit, setSelectedEdgeForEdit] = useState<string>(graph.edges[0]?.id || '');
  const [customIncidentTitle, setCustomIncidentTitle] = useState('');
  const [customIncidentSeverity, setCustomIncidentSeverity] = useState<'warning' | 'critical' | 'info'>('warning');

  // Congestion stats
  const trafficValues: LiveTrafficEdgeState[] = Object.values(liveTraffic);
  const totalEdges = graph.edges.length || 1;
  const lowCount = trafficValues.filter(t => t.congestion === 'low').length;
  const modCount = trafficValues.filter(t => t.congestion === 'moderate').length;
  const heavyCount = trafficValues.filter(t => t.congestion === 'heavy').length;
  const severeCount = trafficValues.filter(t => t.congestion === 'severe' || t.isIncident).length;

  const nodeMap = useMemo(() => new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n])), [graph.nodes]);

  const currentEditedEdgeTraffic = liveTraffic[selectedEdgeForEdit];
  const currentEditedEdge = graph.edges.find(e => e.id === selectedEdgeForEdit);

  return (
    <div className="space-y-6">
      {/* HEADER TELEMETRY STATUS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isLiveTrafficActive
              ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <Radio className={`w-5 h-5 ${isLiveTrafficActive ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">Citywide Live Telemetry Stream</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                isLiveTrafficActive ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-800 text-slate-400'
              }`}>
                {isLiveTrafficActive ? 'STREAMING ACTIVE' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ticks received: <span className="font-mono text-cyan-400 font-semibold">{telemetryTicks}</span> • Interval: {settings.liveTrafficIntervalSeconds || 4}s • Active network segments: {graph.edges.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-telemetry-panel"
            onClick={() => setIsLiveTrafficActive(!isLiveTrafficActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow ${
              isLiveTrafficActive
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isLiveTrafficActive ? <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> : <Play className="w-3.5 h-3.5" />}
            {isLiveTrafficActive ? 'Pause Stream' : 'Resume Stream'}
          </button>
        </div>
      </div>

      {/* CONGESTION OVERVIEW TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Smooth Flow</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">{lowCount}</span>
            <span className="text-xs text-slate-500 font-mono">({Math.round((lowCount / totalEdges) * 100)}%)</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Moderate Traffic</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-400">{modCount}</span>
            <span className="text-xs text-slate-500 font-mono">({Math.round((modCount / totalEdges) * 100)}%)</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Heavy Congestion</span>
            <span className="w-2 h-2 rounded-full bg-orange-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-orange-400">{heavyCount}</span>
            <span className="text-xs text-slate-500 font-mono">({Math.round((heavyCount / totalEdges) * 100)}%)</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Severe / Incidents</span>
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-rose-400">{severeCount}</span>
            <span className="text-xs text-slate-500 font-mono">({Math.round((severeCount / totalEdges) * 100)}%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVE INCIDENTS FEED */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-slate-200">Active Roadway Incidents</h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
                  {liveIncidents.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-inject-random-incident"
                  onClick={() => triggerRandomIncident()}
                  className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/60 text-amber-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  + Simulate Incident
                </button>
                {liveIncidents.length > 0 && (
                  <button
                    id="btn-clear-all-incidents"
                    onClick={clearAllIncidents}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Clear All Incidents"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {liveIncidents.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-300">No Active Traffic Disruptions</p>
                <p className="text-xs text-slate-500 mt-0.5">All monitored road segments are operating within baseline parameters.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {liveIncidents.map(inc => (
                  <div
                    key={inc.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                      inc.severity === 'critical'
                        ? 'bg-rose-950/30 border-rose-800/60'
                        : 'bg-amber-950/30 border-amber-800/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        inc.severity === 'critical' ? 'bg-rose-900/50 text-rose-300' : 'bg-amber-900/50 text-amber-300'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">{inc.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                            +{inc.delayImpactMinutes}m delay
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{inc.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span className="text-cyan-400 font-medium">{inc.locationLabel}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => resolveIncident(inc.id)}
                      className="px-2 py-1 bg-slate-800 hover:bg-emerald-900/50 border border-slate-700 hover:border-emerald-600 text-slate-300 hover:text-emerald-300 rounded-md text-xs font-medium shrink-0 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* EDGE TRAFFIC LIVE OVERRIDE CONTROLLER */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-slate-200">Roadway Telemetry Override</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Select Roadway Edge</label>
              <select
                value={selectedEdgeForEdit}
                onChange={e => setSelectedEdgeForEdit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {graph.edges.map(e => {
                  const s = nodeMap.get(e.source)?.label || e.source;
                  const t = nodeMap.get(e.target)?.label || e.target;
                  const st = liveTraffic[e.id]?.congestion || 'low';
                  return (
                    <option key={e.id} value={e.id}>
                      {s} ➔ {t} ({e.weight}km, {st.toUpperCase()})
                    </option>
                  );
                })}
              </select>
            </div>

            {currentEditedEdge && currentEditedEdgeTraffic && (
              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Congestion State:</span>
                  <span className={`font-bold uppercase font-mono px-2 py-0.5 rounded text-[11px] ${
                    currentEditedEdgeTraffic.congestion === 'severe'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : currentEditedEdgeTraffic.congestion === 'heavy'
                      ? 'bg-orange-950 text-orange-300 border border-orange-800'
                      : currentEditedEdgeTraffic.congestion === 'moderate'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {currentEditedEdgeTraffic.congestion}
                  </span>
                </div>

                {/* Fast Congestion Presets */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Set Congestion Level</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['low', 'moderate', 'heavy', 'severe'] as CongestionLevel[]).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => {
                          const mult = lvl === 'low' ? 1.0 : lvl === 'moderate' ? 0.8 : lvl === 'heavy' ? 0.6 : 0.35;
                          const del = lvl === 'low' ? 0 : lvl === 'moderate' ? 3 : lvl === 'heavy' ? 6 : 12;
                          updateEdgeTraffic(selectedEdgeForEdit, {
                            congestion: lvl,
                            speedMultiplier: mult,
                            delayMinutes: del,
                            currentSpeedKmH: Math.round(50 * mult)
                          });
                        }}
                        className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          currentEditedEdgeTraffic.congestion === lvl
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed & Delay Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-slate-500">Live Speed:</span>
                    <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                      {currentEditedEdgeTraffic.currentSpeedKmH} km/h
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Incident Delay:</span>
                    <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">
                      +{currentEditedEdgeTraffic.delayMinutes} mins
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GPS VEHICLE DRIVE SIMULATION DASHBOARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700/50 text-cyan-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Live GPS Vehicle Driving Simulator</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Animates an interactive telemetry beacon along the calculated Dijkstra / A* optimal path in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeResult && activeResult.success ? (
              vehicleDriveState.isActive ? (
                <button
                  onClick={stopDrivingSimulation}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  Stop Simulation
                </button>
              ) : (
                <button
                  onClick={() => startDrivingSimulation()}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Launch Route Drive
                </button>
              )
            ) : (
              <span className="text-xs text-slate-500 italic">Compute a route in Route Planner first</span>
            )}
          </div>
        </div>

        {vehicleDriveState.isActive && (
          <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-800/40 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-slate-500">Telemetry Speed</span>
                <div className="text-base font-mono font-bold text-cyan-300 mt-0.5">
                  {vehicleDriveState.speedKmH} km/h
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Distance Remaining</span>
                <div className="text-base font-mono font-bold text-slate-200 mt-0.5">
                  {vehicleDriveState.distanceRemainingKm} km
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">ETA Clock</span>
                <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                  {Math.ceil(vehicleDriveState.timeRemainingSeconds / 60)} min
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Simulation Warp</span>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setDriveSpeedMultiplier(s)}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                        vehicleDriveState.speedMultiplier === s
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{vehicleDriveState.currentStepInstruction}</span>
                <span className="font-mono font-semibold text-cyan-400">{Math.round(vehicleDriveState.progress * 100)}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-150"
                  style={{ width: `${Math.round(vehicleDriveState.progress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
