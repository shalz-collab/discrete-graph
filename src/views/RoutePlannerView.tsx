import React, { useState, useMemo, useEffect } from 'react';
import {
  Route,
  ArrowUpDown,
  Play,
  RotateCcw,
  Copy,
  Download,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
  Sliders,
  Volume2,
  Radio,
  Car,
  Bike,
  Maximize2,
  Minimize2,
  Zap,
  Square,
  Flame,
  AlertTriangle,
  VolumeX,
  Bell,
  FastForward,
  Rewind,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/GraphCanvas';
import { AlgorithmType, WeightType, VehicleMode } from '../types';
import { getEdgeWeight } from '../utils/graphAlgorithms';

export const RoutePlannerView: React.FC = () => {
  const {
    graph,
    selectedSource,
    setSelectedSource,
    selectedDestination,
    setSelectedDestination,
    selectedVehicle,
    setSelectedVehicle,
    selectedAlgorithm,
    setSelectedAlgorithm,
    selectedWeightType,
    setSelectedWeightType,
    activeResult,
    calculateRoute,
    clearActiveRoute,
    notify,
    isLiveTrafficActive,
    setIsLiveTrafficActive,
    liveTraffic,
    liveIncidents,
    vehicleDriveState,
    startDrivingSimulation,
    stopDrivingSimulation,
    triggerRandomIncident,
    isSoundEnabled,
    setIsSoundEnabled,
    isVoiceEnabled,
    setIsVoiceEnabled,
    playStopSound,
    setActiveTab
  } = useApp();

  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isPlayingSteps, setIsPlayingSteps] = useState<boolean>(false);
  const [isBigPage, setIsBigPage] = useState<boolean>(false);
  const [mapHeight, setMapHeight] = useState<number>(680);
  const [activeAudioStopId, setActiveAudioStopId] = useState<string | null>(null);

  const handlePlayStopAudio = (stopId: string, isDest: boolean = false) => {
    setActiveAudioStopId(stopId);
    playStopSound(stopId, isDest);
    setTimeout(() => setActiveAudioStopId(null), 2000);
  };

  const handleStepNextStop = () => {
    if (!activeResult || !activeResult.path.length) return;
    const currentIdx = activeAudioStopId ? activeResult.path.indexOf(activeAudioStopId) : -1;
    const nextIdx = currentIdx + 1 < activeResult.path.length ? currentIdx + 1 : 0;
    const nextId = activeResult.path[nextIdx];
    const isDest = nextIdx === activeResult.path.length - 1;
    handlePlayStopAudio(nextId, isDest);
  };

  const handleStepPrevStop = () => {
    if (!activeResult || !activeResult.path.length) return;
    const currentIdx = activeAudioStopId ? activeResult.path.indexOf(activeAudioStopId) : 0;
    const prevIdx = currentIdx - 1 >= 0 ? currentIdx - 1 : activeResult.path.length - 1;
    const prevId = activeResult.path[prevIdx];
    const isDest = prevIdx === activeResult.path.length - 1;
    handlePlayStopAudio(prevId, isDest);
  };

  const nodeMap = useMemo(() => new Map(graph.nodes.map(n => [n.id, n])), [graph.nodes]);

  // Handle auto-calculation if none exists but valid source & destination selected
  const handleCalculate = () => {
    if (!selectedSource || !selectedDestination) {
      notify('error', 'Missing Selection', 'Please select both a source and destination location.');
      return;
    }
    const res = calculateRoute(selectedSource, selectedDestination, selectedAlgorithm, selectedWeightType);
    setActiveStepIndex(-1);
  };

  const handleSwap = () => {
    const temp = selectedSource;
    setSelectedSource(selectedDestination);
    setSelectedDestination(temp);
    clearActiveRoute();
    setActiveStepIndex(-1);
  };

  const handleClear = () => {
    clearActiveRoute();
    setActiveStepIndex(-1);
    notify('info', 'Reset', 'Route configuration and path results cleared.');
  };

  // Step-by-step path details calculation
  const stepBreakdown = useMemo(() => {
    if (!activeResult || !activeResult.success || activeResult.path.length < 2) return [];

    const steps = [];
    let accumulatedDist = 0;

    for (let i = 0; i < activeResult.path.length - 1; i++) {
      const u = activeResult.path[i];
      const v = activeResult.path[i + 1];

      // Find connecting edge
      const edge = graph.edges.find(
        e => (e.source === u && e.target === v) || (!graph.directed && e.source === v && e.target === u)
      );

      const segmentWeight = edge ? getEdgeWeight(edge, selectedWeightType) : 0;
      accumulatedDist += segmentWeight;

      steps.push({
        fromId: u,
        fromLabel: nodeMap.get(u)?.label || u,
        toId: v,
        toLabel: nodeMap.get(v)?.label || v,
        segmentCost: segmentWeight,
        totalSoFar: accumulatedDist,
        edgeId: edge?.id
      });
    }

    return steps;
  }, [activeResult, graph, selectedWeightType, nodeMap]);

  // Copy Route Summary
  const handleCopyRoute = () => {
    if (!activeResult || !activeResult.success) return;
    const pathStr = activeResult.path.map(id => nodeMap.get(id)?.label || id).join(' → ');
    const text = `Optimal Route (${activeResult.algorithm.toUpperCase()}):\nPath: ${pathStr}\nDistance: ${activeResult.distance} (${selectedWeightType})\nVisited: ${activeResult.totalVisitedCount} nodes\nExecution Time: ${activeResult.executionTimeMs} ms`;
    navigator.clipboard.writeText(text);
    notify('success', 'Copied to Clipboard', 'Route details copied.');
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!activeResult) return;
    const exportData = {
      timestamp: new Date().toISOString(),
      source: nodeMap.get(selectedSource)?.label || selectedSource,
      destination: nodeMap.get(selectedDestination)?.label || selectedDestination,
      algorithm: activeResult.algorithm,
      weightType: selectedWeightType,
      optimalPath: activeResult.path.map(id => nodeMap.get(id)?.label || id),
      totalDistance: activeResult.distance,
      nodesVisited: activeResult.totalVisitedCount,
      executionTimeMs: activeResult.executionTimeMs,
      stepBreakdown: stepBreakdown
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route_${selectedSource}_to_${selectedDestination}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('success', 'Exported JSON', 'Saved route calculation payload.');
  };

  const unitLabel = selectedWeightType === 'travelTime' ? 'mins' : selectedWeightType === 'customWeight' ? 'units ($)' : 'km';

  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'typescript'>('python');
  const [copiedCode, setCopiedCode] = useState(false);

  const pythonSnippet = `import heapq
import math

def a_star_shortest_path(graph, start, goal, heuristic_fn):
    """
    Computes optimal shortest path in G=(V, E, W) using A* search.
    Heuristic must be admissible: h(n) <= h*(n).
    """
    open_set = []
    heapq.heappush(open_set, (0 + heuristic_fn(start, goal), 0, start, [start]))
    visited = {}

    while open_set:
        f, g, current, path = heapq.heappop(open_set)
        
        if current in visited and visited[current] <= g:
            continue
        visited[current] = g

        if current == goal:
            return {"path": path, "cost": g, "nodes_visited": len(visited)}

        for neighbor, weight in graph.get(current, {}).items():
            tentative_g = g + weight
            h = heuristic_fn(neighbor, goal)
            heapq.heappush(open_set, (tentative_g + h, tentative_g, neighbor, path + [neighbor]))

    return {"path": [], "cost": float("inf"), "nodes_visited": len(visited)}`;

  const tsSnippet = `interface RouteResult {
  path: string[];
  distance: number;
  visitedCount: number;
}

export function dijkstra(graph: GraphData, start: string, target: string): RouteResult {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();

  graph.nodes.forEach(n => distances[n.id] = Infinity);
  distances[start] = 0;

  while (visited.size < graph.nodes.length) {
    // Extract minimum unvisited vertex
    const u = Object.keys(distances)
      .filter(id => !visited.has(id))
      .reduce((min, id) => distances[id] < distances[min] ? id : min, null);
    
    if (!u || distances[u] === Infinity || u === target) break;
    visited.add(u);

    // Relax all outgoing edges
    for (const edge of getOutgoingEdges(graph, u)) {
      const alt = distances[u] + edge.weight;
      if (alt < distances[edge.target]) {
        distances[edge.target] = alt;
        previous[edge.target] = u;
      }
    }
  }
  return { path: reconstructPath(previous, target), distance: distances[target], visitedCount: visited.size };
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCodeTab === 'python' ? pythonSnippet : tsSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Page Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
        <button
          id="btn-nav-top-prev-home"
          type="button"
          onClick={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer w-full sm:w-auto justify-center border border-slate-700 hover:border-cyan-500/50"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>⬅️ Page 1: Home Overview</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Route className="w-3.5 h-3.5 text-cyan-400" />
            <span>PAGE 2 OF 5: POONAMALLEE TO SAVEETHA MAP</span>
          </span>
        </div>

        <button
          id="btn-nav-top-next-models"
          type="button"
          onClick={() => {
            setActiveTab('matrix-relations');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white transition-colors cursor-pointer w-full sm:w-auto justify-center shadow-sm shadow-cyan-500/20"
        >
          <span>Page 3: Discrete Models ➡️</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Module 1 Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[11px] font-mono text-cyan-400 font-semibold">
          <Route className="w-3.5 h-3.5" /> MODULE 1: POONAMALLEE TO SAVEETHA UNIVERSITY THANDALAM & MEDICAL COLLEGE
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Poonamallee to Saveetha University Thandalam Highway & Campus Route
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Real-time transit network connecting Poonamallee town through the NH-48 Bengaluru Highway corridor, Chembarambakkam Lake, and Irungattukottai directly to Saveetha University Thandalam Campus & Saveetha Medical College Hospital. Supports Bike vs. Car routing, toll bypass, and live telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: ROUTE CONFIGURATION (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-cyan-400" />
                <h2 className="font-bold text-base text-slate-100">Route Configuration</h2>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                Poonamallee ➔ Thandalam
              </span>
            </div>

            {/* Quick Route Shortcuts */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Quick Highway & Campus Route Shortcuts:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  id="btn-quick-poonamallee-medical"
                  onClick={() => {
                    setSelectedSource('poonamallee');
                    setSelectedDestination('medical_hospital');
                    calculateRoute('poonamallee', 'medical_hospital', selectedAlgorithm, selectedWeightType);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between ${
                    selectedSource === 'poonamallee' && selectedDestination === 'medical_hospital'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow ring-1 ring-cyan-500/40'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>🛣️ Poonamallee</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-rose-400 font-bold">🏥 Medical College (Thandalam)</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 shrink-0">16.7 km</span>
                </button>

                <button
                  type="button"
                  id="btn-quick-poonamallee-thandalam"
                  onClick={() => {
                    setSelectedSource('poonamallee');
                    setSelectedDestination('saveetha_gate1');
                    calculateRoute('poonamallee', 'saveetha_gate1', selectedAlgorithm, selectedWeightType);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between ${
                    selectedSource === 'poonamallee' && selectedDestination === 'saveetha_gate1'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>🛣️ Poonamallee</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-amber-400 font-semibold">⛩️ Saveetha Univ Gate 1</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 shrink-0">16.0 km</span>
                </button>

                <button
                  type="button"
                  id="btn-quick-bike-service-route"
                  onClick={() => {
                    setSelectedVehicle('bike');
                    setSelectedSource('poonamallee');
                    setSelectedDestination('medical_hospital');
                    calculateRoute('poonamallee', 'medical_hospital', selectedAlgorithm, selectedWeightType);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between ${
                    selectedVehicle === 'bike' && selectedSource === 'poonamallee' && selectedDestination === 'medical_hospital'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>🏍️ Bike Bypass (Service Rd)</span>
                    <span className="text-slate-500">→</span>
                    <span>🏥 0 Toll</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 shrink-0">Free Toll</span>
                </button>
              </div>
            </div>

            {/* Vehicle Mode: Bike vs Car */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Vehicle Mode (Find Route For)</span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">
                  {selectedVehicle === 'bike' ? '🏍️ 2-WHEELER' : '🚗 4-WHEELER'}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-vehicle-mode-bike"
                  onClick={() => {
                    setSelectedVehicle('bike');
                    if (selectedSource && selectedDestination) {
                      calculateRoute(selectedSource, selectedDestination, selectedAlgorithm, selectedWeightType);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    selectedVehicle === 'bike'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedVehicle === 'bike' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-900 text-slate-400'}`}>
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Bike</div>
                    <div className="text-[10px] text-emerald-400/90 font-mono">Faster • No Tolls</div>
                  </div>
                </button>

                <button
                  type="button"
                  id="btn-vehicle-mode-car"
                  onClick={() => {
                    setSelectedVehicle('car');
                    if (selectedSource && selectedDestination) {
                      calculateRoute(selectedSource, selectedDestination, selectedAlgorithm, selectedWeightType);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    selectedVehicle === 'car'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedVehicle === 'car' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}>
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Car</div>
                    <div className="text-[10px] text-slate-400 font-mono">Arterial • Highway</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Source Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Source Location (Start Vertex)</span>
                <span className="text-[10px] text-emerald-400 font-mono">u ∈ V</span>
              </label>
              <select
                id="route-planner-source-select"
                value={selectedSource}
                onChange={e => {
                  setSelectedSource(e.target.value);
                  clearActiveRoute();
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="">-- Choose Origin --</option>
                {graph.nodes.map(n => (
                  <option key={n.id} value={n.id} disabled={n.id === selectedDestination}>
                    {n.label} {n.id === selectedDestination ? '(Selected as Destination)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                id="btn-route-planner-swap"
                onClick={handleSwap}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-colors shadow-sm"
                title="Swap Locations"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Destination Location (Target Vertex)</span>
                <span className="text-[10px] text-rose-400 font-mono">v ∈ V</span>
              </label>
              <select
                id="route-planner-destination-select"
                value={selectedDestination}
                onChange={e => {
                  setSelectedDestination(e.target.value);
                  clearActiveRoute();
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="">-- Choose Destination --</option>
                {graph.nodes.map(n => (
                  <option key={n.id} value={n.id} disabled={n.id === selectedSource}>
                    {n.label} {n.id === selectedSource ? '(Selected as Source)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Algorithm Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Routing Algorithm
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-select-algo-dijkstra"
                  onClick={() => {
                    setSelectedAlgorithm('dijkstra');
                    clearActiveRoute();
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex flex-col justify-between ${
                    selectedAlgorithm === 'dijkstra'
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold">Dijkstra</span>
                  <span className="text-[10px] opacity-75 font-mono">O(|E| + |V| log |V|)</span>
                </button>

                <button
                  type="button"
                  id="btn-select-algo-astar"
                  onClick={() => {
                    setSelectedAlgorithm('astar');
                    clearActiveRoute();
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex flex-col justify-between ${
                    selectedAlgorithm === 'astar'
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold">A* Heuristic</span>
                  <span className="text-[10px] opacity-75 font-mono">f(n) = g(n) + h(n)</span>
                </button>
              </div>
            </div>

            {/* Weight Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Edge Weight Cost Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'distance' as WeightType, label: 'Distance (km)', icon: Compass },
                  { id: 'travelTime' as WeightType, label: 'Travel Time', icon: Clock },
                  { id: 'customWeight' as WeightType, label: 'Toll Cost ($)', icon: DollarSign }
                ].map(wt => {
                  const Icon = wt.icon;
                  const isSelected = selectedWeightType === wt.id;
                  return (
                    <button
                      key={wt.id}
                      type="button"
                      onClick={() => {
                        setSelectedWeightType(wt.id);
                        clearActiveRoute();
                      }}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/40 font-semibold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate w-full text-[11px]">{wt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="btn-calculate-route-planner"
                onClick={handleCalculate}
                disabled={!selectedSource || !selectedDestination}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Calculate Route</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  id="btn-swap-route-planner"
                  onClick={handleSwap}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Swap Locations</span>
                </button>

                <button
                  type="button"
                  id="btn-clear-route-planner"
                  onClick={handleClear}
                  className="flex-1 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* REAL-TIME TRAFFIC & GPS DRIVE SIMULATOR WIDGET */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Radio className={`w-3.5 h-3.5 ${isLiveTrafficActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                  Live Traffic & GPS Drive
                </span>
                <button
                  onClick={() => setIsLiveTrafficActive(!isLiveTrafficActive)}
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border transition-colors ${
                    isLiveTrafficActive
                      ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {isLiveTrafficActive ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              {activeResult && activeResult.success && (
                <button
                  id="btn-route-planner-launch-drive"
                  type="button"
                  onClick={() => {
                    if (vehicleDriveState.isActive) {
                      stopDrivingSimulation();
                    } else {
                      startDrivingSimulation();
                    }
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all shadow flex items-center justify-center gap-2 ${
                    vehicleDriveState.isActive
                      ? 'bg-rose-950/70 border-rose-700 text-rose-300 hover:bg-rose-900/80'
                      : 'bg-cyan-950/60 border-cyan-700 text-cyan-300 hover:bg-cyan-900/80'
                  }`}
                >
                  {vehicleDriveState.isActive ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                      <span>Stop GPS Navigation Simulation</span>
                    </>
                  ) : (
                    <>
                      <Car className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Simulate Turn-by-Turn GPS Drive</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Active Incidents:</span>
                <span className={`font-mono font-bold ${liveIncidents.length > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {liveIncidents.length} active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: ROUTE VISUALIZATION & RESULT (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Interactive Graph Map */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between mb-3 px-1 gap-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-200">Saveetha University & Urban Transit Map</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                  {selectedVehicle === 'bike' ? '🏍️ Bike Mode' : '🚗 Car Mode'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Sound & Voice Announcements Toolbar */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    id="btn-toggle-sound-effects"
                    type="button"
                    onClick={() => {
                      const next = !isSoundEnabled;
                      setIsSoundEnabled(next);
                      notify('info', next ? 'Transit Sounds Enabled 🔊' : 'Transit Sounds Muted 🔇', next ? 'Audible chimes will play at every stop.' : 'Stop sound chimes have been muted.');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSoundEnabled
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Toggle synthesized audio chime for stops"
                  >
                    {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>Sound {isSoundEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    id="btn-toggle-voice-announcements"
                    type="button"
                    onClick={() => {
                      const next = !isVoiceEnabled;
                      setIsVoiceEnabled(next);
                      notify('info', next ? 'Voice Announcements Enabled 🗣️' : 'Voice Announcements Muted 🔇', next ? 'Arrival at stops will be announced via speech synthesis.' : 'Voice announcements disabled.');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isVoiceEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Toggle text-to-speech announcement for stops"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Voice {isVoiceEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    id="btn-test-stop-chime"
                    type="button"
                    onClick={() => {
                      handlePlayStopAudio('chembarambakkam');
                    }}
                    className="px-2 py-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Test sample stop audio chime & voice"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden md:inline">Test Chime</span>
                  </button>
                </div>

                {/* Map Height Selectors */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                  {[
                    { label: '560px', val: 560 },
                    { label: '700px', val: 700 },
                    { label: '860px', val: 860 }
                  ].map(h => (
                    <button
                      key={h.val}
                      onClick={() => setMapHeight(h.val)}
                      className={`px-2 py-0.5 rounded font-mono transition-colors ${
                        mapHeight === h.val
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>

                {/* Big Page / Fullscreen Map Button */}
                <button
                  id="btn-open-big-page-map"
                  type="button"
                  onClick={() => setIsBigPage(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  title="Expand Map to Big Page view for maximum node visibility"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Big Page Map</span>
                </button>

                {activeResult?.success && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyRoute}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                      title="Copy Route Summary"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copy</span>
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                      title="Export JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800">
              <GraphCanvas
                height={mapHeight}
                highlightPath={activeResult?.path || []}
                visitedNodes={activeResult?.nodesVisited || []}
                sourceId={selectedSource}
                destinationId={selectedDestination}
              />
            </div>
          </div>

          {/* FULL SCREEN BIG PAGE MODAL */}
          {isBigPage && (
            <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Big Page Top Bar */}
              <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                      <span>Saveetha University & Urban Corridor Map</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-700 text-cyan-300 font-mono">
                        Big Page Panoramic View
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Poonamallee Junction ↔ Bypass Flyover ↔ NH-48 Gates ↔ Saveetha Medical College & SIMATS Campus Network
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Vehicle switch in big page */}
                  <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedVehicle('bike');
                        if (selectedSource && selectedDestination) {
                          calculateRoute(selectedSource, selectedDestination, selectedAlgorithm, selectedWeightType);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        selectedVehicle === 'bike'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Bike</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVehicle('car');
                        if (selectedSource && selectedDestination) {
                          calculateRoute(selectedSource, selectedDestination, selectedAlgorithm, selectedWeightType);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        selectedVehicle === 'car'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Car</span>
                    </button>
                  </div>

                  {activeResult && activeResult.success && (
                    <button
                      id="btn-big-page-drive"
                      onClick={() => {
                        if (vehicleDriveState.isActive) stopDrivingSimulation();
                        else startDrivingSimulation();
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 shadow-sm ${
                        vehicleDriveState.isActive
                          ? 'bg-rose-950/70 border-rose-700 text-rose-300'
                          : 'bg-cyan-950/70 border-cyan-700 text-cyan-300'
                      }`}
                    >
                      {vehicleDriveState.isActive ? <Square className="w-3.5 h-3.5 fill-rose-400" /> : <Play className="w-3.5 h-3.5 fill-cyan-400" />}
                      <span>{vehicleDriveState.isActive ? 'Stop GPS' : `Simulate ${selectedVehicle === 'bike' ? 'Bike' : 'Car'}`}</span>
                    </button>
                  )}

                  <button
                    id="btn-close-big-page-map"
                    onClick={() => setIsBigPage(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Minimize2 className="w-4 h-4 text-cyan-400" />
                    <span>Exit Big Page</span>
                  </button>
                </div>
              </div>

              {/* Big Page Map Canvas Container */}
              <div className="flex-1 w-full relative min-h-0 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                <GraphCanvas
                  height="100%"
                  highlightPath={activeResult?.path || []}
                  visitedNodes={activeResult?.nodesVisited || []}
                  sourceId={selectedSource}
                  destinationId={selectedDestination}
                />
              </div>
            </div>
          )}

          {/* BELOW THE GRAPH: ROUTE RESULT CARD & STEP-BY-STEP EXPLANATION */}
          {activeResult && activeResult.success ? (
            <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-md space-y-6 animate-in fade-in duration-200">
              {/* Route Result Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Optimal Route Found ({selectedVehicle === 'bike' ? '🏍️ Two-Wheeler / Bike' : '🚗 Four-Wheeler / Car'})</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-100 flex flex-wrap items-center gap-2">
                    {activeResult.path.map((nodeId, idx) => (
                      <React.Fragment key={nodeId}>
                        <span className="text-cyan-400 font-mono">
                          {nodeMap.get(nodeId)?.label || nodeId}
                        </span>
                        {idx < activeResult.path.length - 1 && (
                          <span className="text-slate-500 font-mono">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeResult.algorithm === 'astar' ? 'A* Search Heuristic' : 'Dijkstra Priority Queue'}</span>
                  </div>
                </div>
              </div>

              {/* Exact Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">Total Distance</div>
                  <div className="text-xl font-bold text-slate-100 font-mono mt-1">
                    {activeResult.distance} <span className="text-xs text-cyan-400">km</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Shortest highway corridor</div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">Est. Travel Time</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                    ~{activeResult.estimatedTravelTimeMinutes || Math.round((activeResult.distance / (selectedVehicle === 'bike' ? 42 : 36)) * 60)} <span className="text-xs text-emerald-500">mins</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {selectedVehicle === 'bike' ? '🏍️ Traffic bypass advantage' : '🚗 Arterial traffic flow'}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">Estimated Transit Cost</div>
                  <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                    ₹{activeResult.estimatedCostINR || Math.round(activeResult.distance * (selectedVehicle === 'bike' ? 2.2 : 7.8))}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {selectedVehicle === 'bike' ? '₹0 Toll • Fuel ₹2.2/km' : `Toll: ₹${activeResult.tollCostINR || 45} • Fuel ₹7.8/km`}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-medium">Nodes Explored / Time</div>
                  <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
                    {activeResult.totalVisitedCount} <span className="text-xs text-slate-500">nodes</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Computed in {activeResult.executionTimeMs} ms
                  </div>
                </div>
              </div>

              {/* Step-by-Step Route Explanation */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Step-by-Step Route Explanation & Stop Sounds</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    {activeResult.path.length} stops along route
                  </span>
                </div>

                {/* Stop Audio Stepper Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">Interactive Stop Audio Navigator</div>
                      <div className="text-[11px] text-slate-400">
                        {activeAudioStopId
                          ? `Now Playing: ${nodeMap.get(activeAudioStopId)?.label || activeAudioStopId}`
                          : 'Click any stop button below or use Prev/Next to hear stop chimes & voice'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id="btn-nav-audio-prev-stop"
                      type="button"
                      onClick={handleStepPrevStop}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 hover:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Play Previous Stop Sound"
                    >
                      <Rewind className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Prev Stop</span>
                    </button>
                    <button
                      id="btn-nav-audio-next-stop"
                      type="button"
                      onClick={handleStepNextStop}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white flex items-center gap-1 transition-colors cursor-pointer shadow-sm shadow-cyan-600/30"
                      title="Play Next Stop Sound"
                    >
                      <span>Next Stop</span>
                      <FastForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden">
                  {activeResult.path.map((nodeId, idx) => {
                    const label = nodeMap.get(nodeId)?.label || nodeId;
                    const isStart = idx === 0;
                    const isEnd = idx === activeResult.path.length - 1;
                    const isPlayingThis = activeAudioStopId === nodeId;

                    let stepDesc = '';
                    if (isStart) stepDesc = `Start at origin vertex "${label}"`;
                    else if (isEnd) stepDesc = `Reach destination vertex "${label}" (Total: ${activeResult.distance} ${unitLabel})`;
                    else stepDesc = `Visit intermediate waypoint "${label}"`;

                    return (
                      <div
                        key={nodeId}
                        className={`p-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
                          isPlayingThis ? 'bg-cyan-950/40 border-l-4 border-cyan-400' : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                              isStart
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : isEnd
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-slate-200">{stepDesc}</span>
                              {nodeId === 'irungattukottai' && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 text-[10px] font-mono font-bold">
                                  💳 FASTag Toll Plaza (₹45)
                                </span>
                              )}
                              {nodeId === 'chembarambakkam' && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-600/60 text-blue-300 text-[10px] font-mono font-bold">
                                  🌊 Lake Highway Bypass
                                </span>
                              )}
                              {nodeId === 'medical_hospital' && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-600/60 text-rose-300 text-[10px] font-mono font-bold">
                                  🏥 Medical College Hospital Destination
                                </span>
                              )}
                              {nodeId === 'saveetha_main_gate' && (
                                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-600/60 text-cyan-300 text-[10px] font-mono font-bold">
                                  🎓 Saveetha University Campus Gate
                                </span>
                              )}
                            </div>

                            {idx > 0 && stepBreakdown[idx - 1] && (
                              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                +{stepBreakdown[idx - 1].segmentCost} {unitLabel} • Cumulative: {stepBreakdown[idx - 1].totalSoFar} {unitLabel}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Sound Trigger for Every Stop */}
                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-play-stop-${nodeId}`}
                            type="button"
                            onClick={() => handlePlayStopAudio(nodeId, isEnd)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                              isPlayingThis
                                ? 'bg-cyan-400 text-slate-950 scale-105 shadow-md shadow-cyan-400/40 ring-2 ring-cyan-300'
                                : isEnd
                                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50'
                                : nodeId === 'irungattukottai'
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50'
                                : 'bg-slate-900 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500'
                            }`}
                            title={`Play stop sound chime and voice announcement for ${label}`}
                          >
                            <Volume2 className={`w-3.5 h-3.5 ${isPlayingThis ? 'animate-bounce text-slate-950' : 'text-cyan-400'}`} />
                            <span>
                              {isPlayingThis
                                ? 'Playing...'
                                : isEnd
                                ? '🏥 Arrival Fanfare'
                                : nodeId === 'irungattukottai'
                                ? '💳 Toll Beep'
                                : '🔊 Stop Sound'}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeResult && !activeResult.success ? (
            <div className="bg-rose-950/20 border border-rose-800/40 p-5 rounded-2xl text-rose-300 text-sm flex items-center gap-3">
              <Info className="w-5 h-5 shrink-0 text-rose-400" />
              <div>
                <span className="font-bold block">No Path Available:</span>
                <span>{activeResult.errorMessage || 'No route connects the selected source and destination in the current graph.'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 p-8 rounded-2xl text-center text-slate-500 text-sm">
              <Route className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>Configure origin and destination on the left, then click <strong className="text-slate-300">Calculate Route</strong> to view optimal path diagnostics.</p>
            </div>
          )}
          {/* THEORY & CODE IMPLEMENTATION CONTAINER (Matching Video Frame 6!) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
                  &lt;/&gt;
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Algorithm Implementation & Source Syntax
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Python & TypeScript discrete optimization code for Dijkstra and A*
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveCodeTab('python')}
                    className={`px-2.5 py-1 rounded font-mono font-semibold transition-all ${
                      activeCodeTab === 'python' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('typescript')}
                    className={`px-2.5 py-1 rounded font-mono font-semibold transition-all ${
                      activeCodeTab === 'typescript' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    TypeScript
                  </button>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Code Highlight Box */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/90 font-mono text-xs">
              <div className="p-4 overflow-x-auto text-slate-300 leading-relaxed max-h-80">
                <pre>
                  <code>{activeCodeTab === 'python' ? pythonSnippet : tsSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Key Components Breakdown (As shown in video frame 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-cyan-400 font-mono">1. Priority Queue Min-Heap</div>
                <p className="text-slate-400 text-[11px] leading-tight">
                  Maintains unvisited vertices ordered by current tentative cost $g(u)$ or $f(u) = g(u) + h(u)$.
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-emerald-400 font-mono">2. Edge Relaxation Loop</div>
                <p className="text-slate-400 text-[11px] leading-tight">
                  If $d(u) + W(u, v) &lt; d(v)$, updates $d(v)$ and sets predecessor $\pi(v) = u$.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Page Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg mt-6">
        <button
          id="btn-nav-bottom-prev-home"
          type="button"
          onClick={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer w-full sm:w-auto justify-center border border-slate-700 hover:border-cyan-500/50 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>⬅️ Previous Page: Page 1 Home Overview</span>
        </button>

        <div className="text-center text-xs text-slate-400 font-mono">
          <span className="text-cyan-400 font-bold">Page 2 of 5</span> • Poonamallee ↔ Saveetha University Thandalam Campus Route Planner
        </div>

        <button
          id="btn-nav-bottom-next-models"
          type="button"
          onClick={() => {
            setActiveTab('matrix-relations');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white transition-colors cursor-pointer w-full sm:w-auto justify-center shadow-md shadow-cyan-500/30"
        >
          <span>Next Page: Page 3 Discrete Models ➡️</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
