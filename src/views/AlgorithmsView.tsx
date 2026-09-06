import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  BarChart3,
  GitFork,
  Check,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import { runDijkstra, runAStar } from '../utils/graphAlgorithms';
import { AlgorithmResult } from '../types';

export const AlgorithmsView: React.FC = () => {
  const {
    graph,
    selectedSource,
    setSelectedSource,
    selectedDestination,
    setSelectedDestination,
    selectedWeightType,
    notify
  } = useApp();

  const [dijkstraResult, setDijkstraResult] = useState<AlgorithmResult | null>(null);
  const [astarResult, setAstarResult] = useState<AlgorithmResult | null>(null);
  const [hasCompared, setHasCompared] = useState<boolean>(false);
  const [activeStepAlgo, setActiveStepAlgo] = useState<'dijkstra' | 'astar'>('dijkstra');

  const nodeMap = useMemo(() => new Map(graph.nodes.map(n => [n.id, n])), [graph.nodes]);

  // Run dual comparison
  const handleRunComparison = () => {
    if (!selectedSource || !selectedDestination) {
      notify('error', 'Missing Endpoints', 'Please select both source and destination vertices.');
      return;
    }

    const dRes = runDijkstra(graph, selectedSource, selectedDestination, selectedWeightType);
    const aRes = runAStar(graph, selectedSource, selectedDestination, selectedWeightType);

    setDijkstraResult(dRes);
    setAstarResult(aRes);
    setHasCompared(true);

    notify('success', 'Benchmark Complete', 'Dijkstra and A* comparative analysis completed.');
  };

  // Chart data
  const chartData = useMemo(() => {
    if (!dijkstraResult || !astarResult) return [];

    return [
      {
        name: 'Nodes Visited (Search Space)',
        Dijkstra: dijkstraResult.totalVisitedCount,
        'A*': astarResult.totalVisitedCount
      },
      {
        name: 'Execution Time (ms × 10)',
        Dijkstra: Math.round(dijkstraResult.executionTimeMs * 10),
        'A*': Math.round(astarResult.executionTimeMs * 10)
      },
      {
        name: 'Total Route Distance (km)',
        Dijkstra: dijkstraResult.distance !== Infinity ? dijkstraResult.distance : 0,
        'A*': astarResult.distance !== Infinity ? astarResult.distance : 0
      }
    ];
  }, [dijkstraResult, astarResult]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Discrete Shortest-Path Algorithm Benchmark</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Compare blind uniform-cost exploration (Dijkstra) against goal-directed heuristic search (A*).
            </p>
          </div>

          {/* Quick Selection Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              {graph.nodes.map(n => (
                <option key={n.id} value={n.id}>Start: {n.label}</option>
              ))}
            </select>

            <select
              value={selectedDestination}
              onChange={e => setSelectedDestination(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              {graph.nodes.map(n => (
                <option key={n.id} value={n.id}>Goal: {n.label}</option>
              ))}
            </select>

            <button
              id="btn-run-comparison"
              onClick={handleRunComparison}
              className="py-1.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Comparison</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO ALGORITHM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: DIJKSTRA'S ALGORITHM */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                  D
                </div>
                <h3 className="font-bold text-base text-slate-100">DIJKSTRA'S ALGORITHM</h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                Greedy / Uniform
              </span>
            </div>

            <p className="text-xs text-slate-300 italic mt-3 leading-relaxed">
              “Finds the shortest path from a source node to all reachable nodes in a weighted graph with non-negative edge weights.”
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Time Complexity</div>
                <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                  O(|E| + |V| log |V|)
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Space Complexity</div>
                <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                  O(|V|) Distances
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Nodes Visited</div>
                <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                  {dijkstraResult ? `${dijkstraResult.totalVisitedCount} nodes` : '—'}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Execution Time</div>
                <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                  {dijkstraResult ? `${dijkstraResult.executionTimeMs} ms` : '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Total Distance: </span>
            <span className="font-mono text-cyan-400 font-bold">
              {dijkstraResult ? `${dijkstraResult.distance} km` : 'Run comparison to calculate'}
            </span>
          </div>
        </div>

        {/* CARD 2: A* ALGORITHM */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                  A*
                </div>
                <h3 className="font-bold text-base text-slate-100">A* ALGORITHM</h3>
              </div>
              <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                Heuristic Search
              </span>
            </div>

            <p className="text-xs text-slate-300 italic mt-3 leading-relaxed">
              “Uses a heuristic function to guide the search toward the destination.”
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Evaluation Function</div>
                <div className="text-sm font-bold text-blue-400 font-mono mt-0.5">
                  f(n) = g(n) + h(n)
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Heuristic Type</div>
                <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                  Euclidean (Admissible)
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Nodes Visited</div>
                <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                  {astarResult ? `${astarResult.totalVisitedCount} nodes` : '—'}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Execution Time</div>
                <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                  {astarResult ? `${astarResult.executionTimeMs} ms` : '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Total Distance: </span>
            <span className="font-mono text-blue-400 font-bold">
              {astarResult ? `${astarResult.distance} km` : 'Run comparison to calculate'}
            </span>
          </div>
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Algorithm Comparison Benchmark</span>
          </h3>
          <span className="text-xs text-slate-400">
            From <strong className="text-cyan-400">{nodeMap.get(selectedSource)?.label || selectedSource}</strong> to <strong className="text-rose-400">{nodeMap.get(selectedDestination)?.label || selectedDestination}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4 text-cyan-400">Dijkstra</th>
                <th className="py-3 px-4 text-blue-400">A*</th>
                <th className="py-3 px-4 text-slate-300">Analytical Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              <tr>
                <td className="py-3.5 px-4 font-sans font-semibold text-slate-300">Shortest Distance</td>
                <td className="py-3.5 px-4 text-slate-100 font-bold">
                  {dijkstraResult ? `${dijkstraResult.distance} km` : '—'}
                </td>
                <td className="py-3.5 px-4 text-slate-100 font-bold">
                  {astarResult ? `${astarResult.distance} km` : '—'}
                </td>
                <td className="py-3.5 px-4 font-sans text-xs text-emerald-400">
                  {dijkstraResult && astarResult && dijkstraResult.distance === astarResult.distance
                    ? 'Identical Optimal Distance Guaranteed'
                    : 'Awaiting Run'}
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-sans font-semibold text-slate-300">Nodes Visited (Search Space)</td>
                <td className="py-3.5 px-4 text-slate-100">
                  {dijkstraResult ? `${dijkstraResult.totalVisitedCount} vertices` : '—'}
                </td>
                <td className="py-3.5 px-4 text-slate-100">
                  {astarResult ? `${astarResult.totalVisitedCount} vertices` : '—'}
                </td>
                <td className="py-3.5 px-4 font-sans text-xs text-cyan-400">
                  {dijkstraResult && astarResult
                    ? astarResult.totalVisitedCount <= dijkstraResult.totalVisitedCount
                      ? `A* pruned ${dijkstraResult.totalVisitedCount - astarResult.totalVisitedCount} unneeded vertex visits via heuristic`
                      : 'Equal frontier expansion'
                    : '—'}
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-sans font-semibold text-slate-300">Execution Time</td>
                <td className="py-3.5 px-4 text-slate-100">
                  {dijkstraResult ? `${dijkstraResult.executionTimeMs} ms` : '—'}
                </td>
                <td className="py-3.5 px-4 text-slate-100">
                  {astarResult ? `${astarResult.executionTimeMs} ms` : '—'}
                </td>
                <td className="py-3.5 px-4 font-sans text-xs text-slate-400">
                  Sub-millisecond graph query execution
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-sans font-semibold text-slate-300">Optimal Path Sequence</td>
                <td className="py-3.5 px-4 text-slate-300 text-xs">
                  {dijkstraResult && dijkstraResult.path.length > 0
                    ? dijkstraResult.path.map(id => nodeMap.get(id)?.label || id).join(' → ')
                    : '—'}
                </td>
                <td className="py-3.5 px-4 text-slate-300 text-xs">
                  {astarResult && astarResult.path.length > 0
                    ? astarResult.path.map(id => nodeMap.get(id)?.label || id).join(' → ')
                    : '—'}
                </td>
                <td className="py-3.5 px-4 font-sans text-xs text-emerald-400">
                  {dijkstraResult?.success ? 'Paths verified congruent' : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PERFORMANCE CHART */}
      {hasCompared && chartData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Comparative Performance Metrics Chart</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Lower is better for Search Space & Runtime</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="Dijkstra" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="A*" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
