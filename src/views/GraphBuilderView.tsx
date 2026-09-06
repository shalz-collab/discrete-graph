import React, { useState, useMemo } from 'react';
import {
  GitFork,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Download,
  Upload,
  Layers,
  Table,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/GraphCanvas';
import { generateAdjacencyList, generateAdjacencyMatrix, getGraphProperties } from '../utils/graphAlgorithms';
import { GraphEdge, GraphNode, WeightType } from '../types';

export const GraphBuilderView: React.FC = () => {
  const {
    graph,
    addNode,
    deleteNode,
    addEdge,
    updateEdge,
    deleteEdge,
    toggleGraphDirected,
    resetDemoGraph,
    clearGraph,
    setGraph,
    selectedWeightType,
    notify
  } = useApp();

  // New Location Form State
  const [nodeName, setNodeName] = useState('');
  const [nodeId, setNodeId] = useState('');

  // New Connection Form State
  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeWeight, setEdgeWeight] = useState<string>('5');
  const [edgeTravelTime, setEdgeTravelTime] = useState<string>('12');
  const [edgeCustomWeight, setEdgeCustomWeight] = useState<string>('8');

  // Editing Edge Inline
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editWeightVal, setEditWeightVal] = useState<string>('5');

  // Active View Tab for Discrete Math Representation (Visual vs List vs Matrix)
  const [activeRepTab, setActiveRepTab] = useState<'visual' | 'adj-list' | 'adj-matrix' | 'properties'>('visual');

  // Compute adjacency list and matrix dynamically
  const adjList = useMemo(() => generateAdjacencyList(graph, selectedWeightType), [graph, selectedWeightType]);
  const adjMatrix = useMemo(() => generateAdjacencyMatrix(graph, selectedWeightType), [graph, selectedWeightType]);
  const graphProps = useMemo(() => getGraphProperties(graph), [graph]);

  const nodeMap = useMemo(() => new Map(graph.nodes.map(n => [n.id, n])), [graph.nodes]);

  // Handle Location Submit
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim()) {
      notify('error', 'Validation Error', 'Please enter a location name.');
      return;
    }

    const calculatedId = nodeId.trim()
      ? nodeId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      : nodeName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    const addedId = addNode({
      id: calculatedId,
      label: nodeName.trim(),
      x: Math.floor(Math.random() * 350 + 150),
      y: Math.floor(Math.random() * 350 + 150),
      heuristic: 10
    });

    if (addedId) {
      setNodeName('');
      setNodeId('');
    }
  };

  // Handle Connection Submit
  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edgeSource || !edgeTarget) {
      notify('error', 'Validation Error', 'Please select both source and destination locations.');
      return;
    }
    if (edgeSource === edgeTarget) {
      notify('warning', 'Invalid Connection', 'Self-loops are not allowed in this network.');
      return;
    }

    const w = parseFloat(edgeWeight);
    if (isNaN(w) || w < 0) {
      notify('error', 'Invalid Weight', 'Edge weight must be greater than or equal to 0.');
      return;
    }

    const time = parseFloat(edgeTravelTime) || Math.round(w * 2.2);
    const custom = parseFloat(edgeCustomWeight) || Math.round(w * 1.5);

    const added = addEdge({
      source: edgeSource,
      target: edgeTarget,
      weight: w,
      travelTime: time,
      customWeight: custom
    });

    if (added) {
      setEdgeWeight('5');
      setEdgeTravelTime('12');
      setEdgeCustomWeight('8');
    }
  };

  // Edit Edge Weight Save
  const handleSaveEdgeEdit = (id: string) => {
    const val = parseFloat(editWeightVal);
    if (isNaN(val) || val < 0) {
      notify('error', 'Invalid Weight', 'Weight must be non-negative.');
      return;
    }
    updateEdge(id, { weight: val });
    setEditingEdgeId(null);
    notify('success', 'Weight Updated', `Edge weight updated to ${val}.`);
  };

  // Export Graph JSON
  const handleExportGraph = () => {
    const dataStr = JSON.stringify(graph, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `graph_network_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('success', 'Graph Exported', 'Downloaded graph topology as JSON.');
  };

  // Import Graph JSON
  const handleImportGraph = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          setGraph(parsed);
          notify('success', 'Graph Loaded', `Loaded graph with ${parsed.nodes.length} nodes and ${parsed.edges.length} edges.`);
        } else {
          notify('error', 'Import Failed', 'Invalid graph JSON schema.');
        }
      } catch (err) {
        notify('error', 'Import Failed', 'Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <span>Interactive Graph Builder</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct custom discrete graph structures $G=(V,E)$, manipulate weighted edges, and inspect representations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Directed / Undirected Toggle */}
          <button
            type="button"
            id="btn-toggle-directed-graph"
            onClick={toggleGraphDirected}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              graph.directed
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            Mode: {graph.directed ? 'Directed Graph' : 'Undirected Graph'}
          </button>

          {/* Export JSON */}
          <button
            type="button"
            id="btn-export-graph-json"
            onClick={handleExportGraph}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          {/* Import JSON */}
          <label className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportGraph} className="hidden" />
          </label>

          {/* Reset / Clear */}
          <button
            type="button"
            id="btn-builder-reset-graph"
            onClick={resetDemoGraph}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
            title="Reset to Demo Graph"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            id="btn-builder-clear-all"
            onClick={clearGraph}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 flex items-center gap-1 transition-colors"
            title="Clear Entire Graph"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Graph</span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: FORMS ON LEFT (4 cols), VISUALIZATION & MATRIX ON RIGHT (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ADD LOCATION & ADD CONNECTION FORMS */}
        <div className="lg:col-span-4 space-y-5">
          {/* ADD LOCATION FORM */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Add Location (Vertex)</span>
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">v ∈ V</span>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location Name</label>
                <input
                  type="text"
                  id="input-node-name"
                  placeholder="e.g. Marina Beach, Airport, Campus"
                  value={nodeName}
                  onChange={e => setNodeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location ID <span className="text-slate-500 font-normal">(Optional alphanumeric)</span>
                </label>
                <input
                  type="text"
                  id="input-node-id"
                  placeholder="Auto-generated if blank (e.g. marina)"
                  value={nodeId}
                  onChange={e => setNodeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 font-mono transition-colors"
                />
              </div>

              <button
                type="submit"
                id="btn-add-location-submit"
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Location</span>
              </button>
            </form>
          </div>

          {/* ADD CONNECTION FORM */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Add Connection (Edge)</span>
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">e = (u, v) ∈ E</span>
            </div>

            <form onSubmit={handleAddConnection} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Source (u)</label>
                  <select
                    id="input-edge-source"
                    value={edgeSource}
                    onChange={e => setEdgeSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Origin --</option>
                    {graph.nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target (v)</label>
                  <select
                    id="input-edge-target"
                    value={edgeTarget}
                    onChange={e => setEdgeTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Target --</option>
                    {graph.nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Weight (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    id="input-edge-weight"
                    value={edgeWeight}
                    onChange={e => setEdgeWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Time (mins)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    id="input-edge-time"
                    value={edgeTravelTime}
                    onChange={e => setEdgeTravelTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    id="input-edge-cost"
                    value={edgeCustomWeight}
                    onChange={e => setEdgeCustomWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-add-connection-submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Connection</span>
              </button>
            </form>
          </div>

          {/* EXISTING LOCATIONS & EDGES LIST ACCORDION / MANAGER */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
              Manage Graph Elements ({graph.nodes.length} Vertices, {graph.edges.length} Edges)
            </h3>

            {/* Edge Items */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {graph.edges.map(edge => {
                const uLabel = nodeMap.get(edge.source)?.label || edge.source;
                const vLabel = nodeMap.get(edge.target)?.label || edge.target;
                const isEditing = editingEdgeId === edge.id;

                return (
                  <div
                    key={edge.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                      <span className="font-medium text-slate-200">{uLabel}</span>
                      <span className="text-cyan-400">{graph.directed ? '→' : '—'}</span>
                      <span className="font-medium text-slate-200">{vLabel}</span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editWeightVal}
                          onChange={e => setEditWeightVal(e.target.value)}
                          className="w-14 bg-slate-900 border border-cyan-500 rounded px-1 py-0.5 text-xs text-cyan-300 font-mono"
                        />
                        <button
                          onClick={() => handleSaveEdgeEdit(edge.id)}
                          className="p-1 rounded text-emerald-400 hover:bg-emerald-950/50"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingEdgeId(null)}
                          className="p-1 rounded text-slate-400 hover:bg-slate-800"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-semibold">{edge.weight} km</span>
                        <button
                          onClick={() => {
                            setEditingEdgeId(edge.id);
                            setEditWeightVal(edge.weight.toString());
                          }}
                          className="text-slate-400 hover:text-cyan-300 p-1"
                          title="Edit Edge Weight"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteEdge(edge.id)}
                          className="text-slate-400 hover:text-rose-400 p-1"
                          title="Delete Edge"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: VISUAL CANVAS, ADJACENCY LIST, ADJACENCY MATRIX */}
        <div className="lg:col-span-8 space-y-4">
          {/* Representation Selector Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex gap-1.5">
              {[
                { id: 'visual', label: 'Interactive Canvas' },
                { id: 'adj-list', label: 'Adjacency List' },
                { id: 'adj-matrix', label: 'Adjacency Matrix' },
                { id: 'properties', label: 'Discrete Properties' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRepTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeRepTab === tab.id
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Auto-syncs on edit
            </span>
          </div>

          {/* TAB 1: VISUAL CANVAS */}
          {activeRepTab === 'visual' && (
            <div className="space-y-2">
              <GraphCanvas height={500} interactive={true} />
              <p className="text-[11px] text-slate-500 text-center">
                Drag vertices freely to reorganize topology. Coordinates and matrices automatically update.
              </p>
            </div>
          )}

          {/* TAB 2: ADJACENCY LIST */}
          {activeRepTab === 'adj-list' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Graph Adjacency List Representation (Adj[v])</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">Memory: O(|V| + |E|)</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs max-h-96 overflow-y-auto">
                {adjList.map(item => (
                  <div key={item.nodeId} className="flex items-start gap-3 py-1 border-b border-slate-900 last:border-0">
                    <span className="text-cyan-400 font-bold min-w-[120px] shrink-0">
                      {item.nodeLabel}
                    </span>
                    <span className="text-slate-500 font-bold">→</span>
                    <div className="flex flex-wrap gap-2">
                      {item.neighbors.length > 0 ? (
                        item.neighbors.map((nb, i) => (
                          <span
                            key={i}
                            className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300"
                          >
                            {nb.targetLabel} <span className="text-cyan-400 font-bold">({nb.weight})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 italic">∅ (No outgoing edges)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADJACENCY MATRIX */}
          {activeRepTab === 'adj-matrix' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Table className="w-4 h-4 text-cyan-400" />
                  <span>Adjacency Matrix Representation (A[i][j])</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">Size: {graph.nodes.length} × {graph.nodes.length}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-2">
                <table className="w-full text-xs font-mono text-center">
                  <thead>
                    <tr className="border-b border-slate-800 text-cyan-400 font-bold">
                      <th className="p-2 text-left bg-slate-900">Vertex</th>
                      {adjMatrix.headers.map((h, i) => (
                        <th key={i} className="p-2 min-w-[50px]">{h.substring(0, 4)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adjMatrix.matrix.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-slate-900 hover:bg-slate-900/40">
                        <td className="p-2 font-bold text-left text-slate-300 bg-slate-900/80">
                          {adjMatrix.headers[rowIdx]}
                        </td>
                        {row.map((val, colIdx) => (
                          <td
                            key={colIdx}
                            className={`p-2 ${
                              rowIdx === colIdx
                                ? 'text-slate-600 bg-slate-950 font-bold'
                                : val !== null
                                ? 'text-cyan-300 font-bold bg-cyan-950/20'
                                : 'text-slate-700'
                            }`}
                          >
                            {val !== null ? val : '∞'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DISCRETE MATHEMATICS GRAPH PROPERTIES */}
          {activeRepTab === 'properties' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Discrete Graph Theoretical Properties</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Vertex Count |V|</div>
                  <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">{graphProps.nodeCount}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Edge Count |E|</div>
                  <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">{graphProps.edgeCount}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Graph Density (D)</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">{graphProps.density}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Avg Vertex Degree</div>
                  <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">{graphProps.avgDegree}</div>
                </div>
              </div>

              {/* Degrees breakdown table */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-300 mb-2">Vertex Degree Spectrum (Handshaking Theorem Verification)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {graphProps.degrees.map(d => (
                    <div key={d.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-300 truncate">{d.label}:</span>
                      <span className="text-cyan-400 font-bold">deg = {d.totalDegree}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
