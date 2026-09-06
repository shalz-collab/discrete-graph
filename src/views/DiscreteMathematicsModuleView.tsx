import React, { useState, useMemo } from 'react';
import {
  Grid,
  Share2,
  Table,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  ArrowRight,
  ArrowLeft,
  Info,
  RefreshCw,
  Zap,
  Bookmark,
  Binary,
  Sparkles,
  BookOpen,
  Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeBooleanExpression } from '../utils/booleanEngine';
import { PRESET_BOOLEAN_EXPRESSIONS } from '../data/initialData';
import { BooleanAnalysisResult } from '../types';

export const DiscreteMathematicsModuleView: React.FC = () => {
  const { graph, incrementBooleanCount, notify, setActiveTab } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'graph-matrices' | 'set-relations' | 'boolean-kmaps'>('graph-matrices');

  // Node indexing
  const nodes = graph.nodes;
  const n = nodes.length;
  const nodeMap = useMemo(() => new Map(nodes.map((n, i) => [n.id, i])), [nodes]);

  // 1. Adjacency Matrix A (0/1) and Weighted A
  const { adjMatrix, weightedAdjMatrix } = useMemo(() => {
    const A: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    const W: (number | string)[][] = Array.from({ length: n }, () => Array(n).fill('∞'));

    for (let i = 0; i < n; i++) W[i][i] = 0;

    graph.edges.forEach(e => {
      const u = nodeMap.get(e.source);
      const v = nodeMap.get(e.target);
      if (u !== undefined && v !== undefined) {
        A[u][v] = 1;
        W[u][v] = e.weight;
        if (!graph.directed && !e.directed) {
          A[v][u] = 1;
          W[v][u] = e.weight;
        }
      }
    });

    return { adjMatrix: A, weightedAdjMatrix: W };
  }, [nodes, graph.edges, graph.directed, nodeMap, n]);

  // Matrix multiplication helper
  const multiplyMatrices = (M1: number[][], M2: number[][]): number[][] => {
    const size = M1.length;
    const res: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let sum = 0;
        for (let k = 0; k < size; k++) {
          sum += M1[i][k] * M2[k][j];
        }
        res[i][j] = sum;
      }
    }
    return res;
  };

  // A^2 and A^3
  const adjMatrixSq = useMemo(() => multiplyMatrices(adjMatrix, adjMatrix), [adjMatrix]);
  const adjMatrixCube = useMemo(() => multiplyMatrices(adjMatrixSq, adjMatrix), [adjMatrixSq, adjMatrix]);

  // 2. Degree Matrix D
  const degreeMatrix = useMemo(() => {
    const D: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      const deg = adjMatrix[i].reduce((acc, val) => acc + val, 0);
      D[i][i] = deg;
    }
    return D;
  }, [adjMatrix, n]);

  // 3. Laplacian Matrix L = D - A
  const laplacianMatrix = useMemo(() => {
    const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        L[i][j] = degreeMatrix[i][j] - adjMatrix[i][j];
      }
    }
    return L;
  }, [degreeMatrix, adjMatrix, n]);

  // Spanning Trees Count estimation via Kirchhoff Matrix Tree Theorem (Cofactor determinant)
  const spanningTreesCount = useMemo(() => {
    if (n < 2 || n > 8) return n <= 1 ? 1 : 'Computed for |V| ≤ 8';
    
    // Compute determinant of (n-1)x(n-1) submatrix of L
    const sub: number[][] = [];
    for (let i = 0; i < n - 1; i++) {
      sub.push(laplacianMatrix[i].slice(0, n - 1));
    }

    const det = (m: number[][]): number => {
      const len = m.length;
      if (len === 1) return m[0][0];
      if (len === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
      let d = 0;
      for (let c = 0; c < len; c++) {
        const subM = m.slice(1).map(row => row.filter((_, idx) => idx !== c));
        d += (c % 2 === 0 ? 1 : -1) * m[0][c] * det(subM);
      }
      return d;
    };

    try {
      const total = Math.round(Math.abs(det(sub)));
      return total;
    } catch {
      return 'N/A';
    }
  }, [laplacianMatrix, n]);

  // 4. Binary Relations Analysis on Graph Reachability
  const relationProperties = useMemo(() => {
    let reflexive = true;
    let irreflexive = true;
    let symmetric = true;
    let antisymmetric = true;

    for (let i = 0; i < n; i++) {
      if (adjMatrix[i][i] !== 1) reflexive = false;
      if (adjMatrix[i][i] === 1) irreflexive = false;

      for (let j = 0; j < n; j++) {
        if (i !== j) {
          if (adjMatrix[i][j] !== adjMatrix[j][i]) symmetric = false;
          if (adjMatrix[i][j] === 1 && adjMatrix[j][i] === 1) antisymmetric = false;
        }
      }
    }

    // Transitivity via Warshall
    let transitive = true;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (adjMatrix[i][j] === 1) {
          for (let k = 0; k < n; k++) {
            if (adjMatrix[j][k] === 1 && adjMatrix[i][k] !== 1) {
              transitive = false;
            }
          }
        }
      }
    }

    const isEquivalence = reflexive && symmetric && transitive;
    const isPartialOrder = reflexive && antisymmetric && transitive;

    return {
      reflexive,
      irreflexive,
      symmetric,
      antisymmetric,
      transitive,
      isEquivalence,
      isPartialOrder
    };
  }, [adjMatrix, n]);

  // Warshall Transitive Closure Matrix R*
  const transitiveClosure = useMemo(() => {
    const R = adjMatrix.map(row => [...row]);
    for (let i = 0; i < n; i++) R[i][i] = 1; // Reflexive closure
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          R[i][j] = R[i][j] || (R[i][k] && R[k][j] ? 1 : 0);
        }
      }
    }
    return R;
  }, [adjMatrix, n]);

  // Boolean Algebra Engine State
  const [inputExpression, setInputExpression] = useState<string>('(A AND B) OR (NOT C)');
  const [analysis, setAnalysis] = useState<BooleanAnalysisResult | null>(() => {
    try {
      return analyzeBooleanExpression('(A AND B) OR (NOT C)');
    } catch {
      return null;
    }
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSimplify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputExpression.trim()) {
      setErrorMsg('Please enter a Boolean expression.');
      setAnalysis(null);
      return;
    }

    try {
      const res = analyzeBooleanExpression(inputExpression);
      setAnalysis(res);
      setErrorMsg(null);
      incrementBooleanCount();
      notify('success', 'Expression Analyzed', 'Generated Boolean simplification and truth table.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid Boolean syntax.');
      setAnalysis(null);
    }
  };

  const handlePresetSelect = (expr: string) => {
    setInputExpression(expr);
    try {
      const res = analyzeBooleanExpression(expr);
      setAnalysis(res);
      setErrorMsg(null);
      incrementBooleanCount();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Page Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
        <button
          id="btn-nav-prev-map"
          type="button"
          onClick={() => {
            setActiveTab('route-planner');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer w-full sm:w-auto justify-center border border-slate-700 hover:border-cyan-500/50"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>⬅️ Page 2: Campus Map & Route Planner</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Grid className="w-3.5 h-3.5 text-indigo-400" />
            <span>PAGE 3 OF 5: DISCRETE MATHEMATICAL MODELS</span>
          </span>
        </div>

        <button
          id="btn-nav-next-analytics"
          type="button"
          onClick={() => {
            setActiveTab('analytics');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-bold text-white transition-colors cursor-pointer w-full sm:w-auto justify-center shadow-sm shadow-indigo-500/20"
        >
          <span>Page 4: Results & Analysis ➡️</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Module 2 Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-[11px] font-mono text-indigo-400 font-semibold">
          <Grid className="w-3.5 h-3.5" /> MODULE 2: DISCRETE MATHEMATICS & BOOLEAN LOGIC
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Spectral Graph Matrices, Relations & Karnaugh Maps
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Investigate discrete structures: Adjacency $A(G)$, Laplacian $L(G) = D - A$, Kirchhoff Spanning Tree Theorem $\tau(G)$, Warshall reachability closures, and Boolean algebra reduction.
        </p>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('graph-matrices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'graph-matrices'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>1. Spectral Matrices & Kirchhoff Theorem</span>
        </button>

        <button
          onClick={() => setActiveSubTab('set-relations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'set-relations'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>2. Binary Relations & Warshall Transitive Closure</span>
        </button>

        <button
          onClick={() => setActiveSubTab('boolean-kmaps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'boolean-kmaps'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Binary className="w-4 h-4" />
          <span>3. Boolean Algebra & 2/3/4-Variable K-Maps</span>
        </button>
      </div>

      {/* SUB-TAB 1: GRAPH MATRICES & KIRCHHOFF */}
      {activeSubTab === 'graph-matrices' && (
        <div className="space-y-6">
          {/* Key Theorems Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Spectral Theorem</div>
              <div className="text-sm font-bold text-slate-100 font-mono">Laplacian L = D - A</div>
              <p className="text-[11px] text-slate-400">Diagonal Degree Matrix minus 0/1 Adjacency Matrix</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Kirchhoff Matrix-Tree Theorem</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">τ(G) = {spanningTreesCount} Spanning Trees</div>
              <p className="text-[11px] text-slate-400">Total spanning trees computed via cofactor determinant det(L_ii)</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Algebraic Path Counting</div>
              <div className="text-sm font-bold text-cyan-400 font-mono">A², A³ Walk Powers</div>
              <p className="text-[11px] text-slate-400">(A^k)_ij = exact count of distinct walks of length k from i to j</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Adjacency Matrix A */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Table className="w-4 h-4 text-cyan-400" />
                  <span>Adjacency Matrix A(G) — ({n} × {n})</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {graph.directed ? 'Directed' : 'Undirected'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border border-slate-800 bg-slate-950 text-slate-500 font-mono">V</th>
                      {nodes.map(node => (
                        <th key={node.id} className="p-2 border border-slate-800 bg-slate-950 font-bold text-cyan-400 font-mono">
                          {node.label.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adjMatrix.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-2 border border-slate-800 bg-slate-950 font-bold text-cyan-400 font-mono">
                          {nodes[i]?.label.slice(0, 3)}
                        </td>
                        {row.map((val, j) => (
                          <td
                            key={j}
                            className={`p-2 border border-slate-800 font-mono ${
                              val > 0 ? 'bg-cyan-950/40 text-cyan-300 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Laplacian Matrix L */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Laplacian Matrix L(G) = D - A</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                  Spectral
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border border-slate-800 bg-slate-950 text-slate-500 font-mono">V</th>
                      {nodes.map(node => (
                        <th key={node.id} className="p-2 border border-slate-800 bg-slate-950 font-bold text-indigo-400 font-mono">
                          {node.label.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {laplacianMatrix.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-2 border border-slate-800 bg-slate-950 font-bold text-indigo-400 font-mono">
                          {nodes[i]?.label.slice(0, 3)}
                        </td>
                        {row.map((val, j) => (
                          <td
                            key={j}
                            className={`p-2 border border-slate-800 font-mono ${
                              i === j
                                ? 'bg-indigo-950/40 text-indigo-300 font-bold'
                                : val < 0
                                ? 'text-rose-400 font-semibold'
                                : 'text-slate-500'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BINARY RELATIONS & WARSHALL */}
      {activeSubTab === 'set-relations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Reflexive', val: relationProperties.reflexive, def: '∀x: (x,x) ∈ R' },
              { name: 'Symmetric', val: relationProperties.symmetric, def: '∀x,y: (x,y)∈R ⇒ (y,x)∈R' },
              { name: 'Antisymmetric', val: relationProperties.antisymmetric, def: '∀x,y: (x,y)∈R ∧ (y,x)∈R ⇒ x=y' },
              { name: 'Transitive', val: relationProperties.transitive, def: '∀x,y,z: (x,y)∈R ∧ (y,z)∈R ⇒ (x,z)∈R' },
              { name: 'Equivalence Relation', val: relationProperties.isEquivalence, def: 'Reflexive + Symmetric + Transitive' },
              { name: 'Partial Order (Poset)', val: relationProperties.isPartialOrder, def: 'Reflexive + Antisymmetric + Transitive' }
            ].map((prop, idx) => (
              <div key={idx} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{prop.name}</span>
                  {prop.val ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-500">{prop.def}</div>
              </div>
            ))}
          </div>

          {/* Warshall Transitive Closure Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Warshall Algorithm Reachability Matrix R* = Transitive Closure</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Bitwise connectivity: R*[i,j] = 1 if there exists ANY directed path from node i to node j.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                O(|V|³)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border border-slate-800 bg-slate-950 text-slate-500 font-mono">Origin \ Dest</th>
                    {nodes.map(node => (
                      <th key={node.id} className="p-2 border border-slate-800 bg-slate-950 font-bold text-emerald-400 font-mono">
                        {node.label.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transitiveClosure.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2 border border-slate-800 bg-slate-950 font-bold text-emerald-400 font-mono">
                        {nodes[i]?.label.slice(0, 3)}
                      </td>
                      {row.map((val, j) => (
                        <td
                          key={j}
                          className={`p-2 border border-slate-800 font-mono ${
                            val === 1 ? 'bg-emerald-950/40 text-emerald-300 font-bold' : 'text-slate-600'
                          }`}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BOOLEAN ALGEBRA & K-MAPS */}
      {activeSubTab === 'boolean-kmaps' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input & Presets */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Propositional Logic Expression</span>
                </h3>

                <form onSubmit={handleSimplify} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Input Expression</label>
                    <input
                      type="text"
                      value={inputExpression}
                      onChange={e => setInputExpression(e.target.value)}
                      placeholder="e.g. (A AND B) OR (NOT C)"
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {errorMsg && <div className="text-xs text-rose-400">{errorMsg}</div>}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Simplify & Generate Truth Table</span>
                  </button>
                </form>

                {/* Presets */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Academic Presets</div>
                  <div className="space-y-1">
                    {PRESET_BOOLEAN_EXPRESSIONS.slice(0, 4).map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePresetSelect(p.expr)}
                        className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">{p.label}</span>
                        <ArrowRight className="w-3 h-3 text-purple-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Results, Normal Forms & Truth Table */}
            <div className="lg:col-span-7 space-y-4">
              {analysis ? (
                <div className="space-y-4">
                  {/* Simplification & Classification */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-purple-400">DISCRETE CLASSIFICATION</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {analysis.expressionType}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Simplified Expression</div>
                      <div className="text-sm font-mono font-bold text-emerald-400">{analysis.simplifiedExpression}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-[10px] font-mono text-slate-500">Disjunctive Normal Form (DNF)</div>
                        <div className="font-mono text-slate-200 text-[11px] truncate">{analysis.dnf || 'N/A'}</div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-[10px] font-mono text-slate-500">Conjunctive Normal Form (CNF)</div>
                        <div className="font-mono text-slate-200 text-[11px] truncate">{analysis.cnf || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Truth Table Summary */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Table className="w-3.5 h-3.5 text-purple-400" />
                      <span>Truth Table Combinations ({analysis.truthTableSummary.totalCombinations} States)</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-500">Total Rows 2ⁿ</div>
                        <div className="font-mono font-bold text-slate-200">{analysis.truthTableSummary.totalCombinations}</div>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-emerald-400">True Outputs (1)</div>
                        <div className="font-mono font-bold text-emerald-400">{analysis.truthTableSummary.trueCount}</div>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-rose-400">False Outputs (0)</div>
                        <div className="font-mono font-bold text-rose-400">{analysis.truthTableSummary.falseCount}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                  Enter a Boolean expression to generate laws, DNF/CNF and truth table.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Page Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg mt-8">
        <button
          id="btn-nav-bottom-prev-map"
          type="button"
          onClick={() => {
            setActiveTab('route-planner');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer w-full sm:w-auto justify-center border border-slate-700 hover:border-cyan-500/50"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>⬅️ Back to Page 2: Campus Map & Route Planner</span>
        </button>

        <div className="text-center">
          <div className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
            DISCRETE MATHEMATICS ARCHITECTURE
          </div>
          <div className="text-xs text-slate-400">
            Page 3 of 5 • SIMATS CSE Capstone
          </div>
        </div>

        <button
          id="btn-nav-bottom-next-analytics"
          type="button"
          onClick={() => {
            setActiveTab('analytics');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-bold text-white transition-colors cursor-pointer w-full sm:w-auto justify-center shadow-md shadow-indigo-500/20"
        >
          <span>Proceed to Page 4: Results & Analysis ➡️</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
