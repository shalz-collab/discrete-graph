import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Download,
  Play,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  Navigation,
  Layers,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RouteHistoryItem } from '../types';

export const RouteHistoryView: React.FC = () => {
  const {
    history,
    deleteHistoryItem,
    clearHistory,
    setSelectedSource,
    setSelectedDestination,
    setSelectedAlgorithm,
    setSelectedWeightType,
    calculateRoute,
    setActiveTab,
    notify
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAlgorithm, setFilterAlgorithm] = useState<'all' | 'dijkstra' | 'astar'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'distance' | 'time'>('newest');

  // Filter and sort
  const filteredHistory = useMemo(() => {
    return history
      .filter(item => {
        // Algorithm filter
        if (filterAlgorithm !== 'all' && item.algorithm !== filterAlgorithm) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSource = item.sourceLabel.toLowerCase().includes(q);
          const matchDest = item.destinationLabel.toLowerCase().includes(q);
          const matchPath = item.pathLabels.some(l => l.toLowerCase().includes(q));
          const matchAlgo = item.algorithm.toLowerCase().includes(q);
          return matchSource || matchDest || matchPath || matchAlgo;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.timestamp - a.timestamp;
        if (sortBy === 'oldest') return a.timestamp - b.timestamp;
        if (sortBy === 'distance') return b.distance - a.distance;
        if (sortBy === 'time') return b.executionTimeMs - a.executionTimeMs;
        return 0;
      });
  }, [history, searchQuery, filterAlgorithm, sortBy]);

  // Export History as JSON
  const handleExportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `route_history_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('success', 'History Exported', 'Saved route history as JSON file.');
  };

  // Replay Route in Planner
  const handleReplayRoute = (item: RouteHistoryItem) => {
    setSelectedSource(item.source);
    setSelectedDestination(item.destination);
    setSelectedAlgorithm(item.algorithm);
    setSelectedWeightType(item.weightType);
    calculateRoute(item.source, item.destination, item.algorithm, item.weightType);
    setActiveTab('route-planner');
    notify('info', 'Route Loaded', `Loaded route from ${item.sourceLabel} to ${item.destinationLabel}.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <span>Route Optimization History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Archived computation logs, algorithm runtimes, and optimal paths stored locally.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportHistory}
              disabled={history.length === 0}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export History</span>
            </button>

            <button
              onClick={clearHistory}
              disabled={history.length === 0}
              className="px-3.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 disabled:opacity-50 text-rose-300 text-xs font-semibold border border-rose-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by location, path, or algorithm..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 transition-colors"
          />
        </div>

        {/* Algorithm Filter & Sort */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Algorithm:</span>
          </div>
          <select
            value={filterAlgorithm}
            onChange={e => setFilterAlgorithm(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="all">All Algorithms</option>
            <option value="dijkstra">Dijkstra Only</option>
            <option value="astar">A* Only</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-2">
            <span>Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="newest">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="distance">Highest Distance</option>
            <option value="time">Longest Runtime</option>
          </select>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Origin → Destination</th>
                  <th className="py-3.5 px-4">Algorithm</th>
                  <th className="py-3.5 px-4">Optimal Path</th>
                  <th className="py-3.5 px-4 text-center">Distance</th>
                  <th className="py-3.5 px-4 text-center">Visited</th>
                  <th className="py-3.5 px-4 text-center">Runtime</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHistory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                      {item.date}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-200 whitespace-nowrap">
                      <span className="text-emerald-400">{item.sourceLabel}</span>
                      <span className="text-slate-500 mx-1.5">→</span>
                      <span className="text-rose-400">{item.destinationLabel}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                          item.algorithm === 'astar'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {item.algorithm === 'astar' ? 'A* Search' : 'Dijkstra'}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono text-slate-300">
                        {item.pathLabels.map((lbl, idx) => (
                          <React.Fragment key={idx}>
                            <span>{lbl}</span>
                            {idx < item.pathLabels.length - 1 && (
                              <span className="text-slate-600">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-100 whitespace-nowrap">
                      {item.distance} {item.weightType === 'travelTime' ? 'mins' : item.weightType === 'customWeight' ? '$' : 'km'}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {item.nodesVisited}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-cyan-400">
                      {item.executionTimeMs} ms
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleReplayRoute(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                          title="Replay in Route Planner"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-600 mb-1" />
            <p className="text-sm font-semibold text-slate-400">No route calculation records found.</p>
            <p className="text-xs">
              {searchQuery
                ? 'Try adjusting your search query or algorithm filters.'
                : 'Calculate a route in the Route Planner to start recording history.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
