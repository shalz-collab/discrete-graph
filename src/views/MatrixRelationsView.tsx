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
  Info,
  RefreshCw,
  Zap,
  Bookmark
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GraphNode } from '../types';

export const MatrixRelationsView: React.FC = () => {
  const { graph } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'graph-matrices' | 'set-relations' | 'warshall'>('graph-matrices');

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

    // Gaussian elimination determinant
    const size = n - 1;
    const mat = sub.map(row => [...row]);
    let det = 1;
    for (let i = 0; i < size; i++) {
      let pivot = i;
      while (pivot < size && Math.abs(mat[pivot][i]) < 1e-7) pivot++;
      if (pivot === size) return 0;
      if (pivot !== i) {
        [mat[i], mat[pivot]] = [mat[pivot], mat[i]];
        det = -det;
      }
      det *= mat[i][i];
      for (let j = i + 1; j < size; j++) {
        const factor = mat[j][i] / mat[i][i];
        for (let k = i; k < size; k++) {
          mat[j][k] -= factor * mat[i][k];
        }
      }
    }
    return Math.max(0, Math.round(Math.abs(det)));
  }, [laplacianMatrix, n]);

  // 4. Incidence Matrix M (|V| x |E|)
  const incidenceMatrix = useMemo(() => {
    const m = graph.edges.length;
    const M: number[][] = Array.from({ length: n }, () => Array(m).fill(0));

    graph.edges.forEach((e, edgeIdx) => {
      const u = nodeMap.get(e.source);
      const v = nodeMap.get(e.target);
      if (u !== undefined && v !== undefined) {
        if (graph.directed || e.directed) {
          M[u][edgeIdx] = 1; // Outgoing
          M[v][edgeIdx] = -1; // Incoming
        } else {
          M[u][edgeIdx] = 1;
          M[v][edgeIdx] = 1;
        }
      }
    });

    return M;
  }, [graph.edges, n, nodeMap, graph.directed]);

  // 5. Warshall Transitive Closure Matrix & Iterations
  const warshallSteps = useMemo(() => {
    if (n === 0 || n > 8) return [];
    const steps: { k: number; matrix: number[][] }[] = [];

    // W0 = A
    let current = adjMatrix.map((row, i) => row.map((val, j) => (i === j || val === 1 ? 1 : 0)));
    steps.push({ k: 0, matrix: current.map(r => [...r]) });

    for (let k = 0; k < n; k++) {
      const next = current.map(r => [...r]);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          next[i][j] = current[i][j] || (current[i][k] && current[k][j]) ? 1 : 0;
        }
      }
      current = next;
      steps.push({ k: k + 1, matrix: current.map(r => [...r]) });
    }

    return steps;
  }, [adjMatrix, n]);

  // --- SET RELATIONS SUITE STATE ---
  const [relationSet, setRelationSet] = useState<string[]>(['1', '2', '3', '4']);
  const [relationPairs, setRelationPairs] = useState<[string, string][]>([
    ['1', '1'],
    ['2', '2'],
    ['3', '3'],
    ['4', '4'],
    ['1', '2'],
    ['2', '1'],
    ['3', '4'],
    ['4', '3']
  ]);
  const [newPairA, setNewPairA] = useState<string>('1');
  const [newPairB, setNewPairB] = useState<string>('3');

  // Properties analysis for R on Set S
  const relationProperties = useMemo(() => {
    const pairSet = new Set(relationPairs.map(([a, b]) => `${a}->${b}`));

    // Reflexive: (x, x) in R for all x
    let isReflexive = true;
    const missingReflexive: string[] = [];
    relationSet.forEach(x => {
      if (!pairSet.has(`${x}->${x}`)) {
        isReflexive = false;
        missingReflexive.push(`(${x}, ${x})`);
      }
    });

    // Irreflexive: (x, x) not in R for all x
    let isIrreflexive = true;
    relationSet.forEach(x => {
      if (pairSet.has(`${x}->${x}`)) isIrreflexive = false;
    });

    // Symmetric: (a, b) in R implies (b, a) in R
    let isSymmetric = true;
    const missingSymmetric: string[] = [];
    relationPairs.forEach(([a, b]) => {
      if (!pairSet.has(`${b}->${a}`)) {
        isSymmetric = false;
        missingSymmetric.push(`(${b}, ${a})`);
      }
    });

    // Antisymmetric: (a, b) in R and (b, a) in R implies a == b
    let isAntisymmetric = true;
    const violatingAntisymmetric: string[] = [];
    relationPairs.forEach(([a, b]) => {
      if (a !== b && pairSet.has(`${b}->${a}`)) {
        isAntisymmetric = false;
        violatingAntisymmetric.push(`(${a}, ${b}) & (${b}, ${a})`);
      }
    });

    // Transitive: (a, b) in R and (b, c) in R implies (a, c) in R
    let isTransitive = true;
    const missingTransitive: string[] = [];
    relationPairs.forEach(([a, b]) => {
      relationPairs.forEach(([c, d]) => {
        if (b === c && !pairSet.has(`${a}->${d}`)) {
          isTransitive = false;
          missingTransitive.push(`(${a}, ${b}) & (${b}, ${d}) ⟹ missing (${a}, ${d})`);
        }
      });
    });

    const isEquivalence = isReflexive && isSymmetric && isTransitive;
    const isPartialOrder = isReflexive && isAntisymmetric && isTransitive;

    // Equivalence classes if equivalence relation
    const equivalenceClasses: { element: string; classElements: string[] }[] = [];
    if (isEquivalence) {
      const visited = new Set<string>();
      relationSet.forEach(x => {
        if (!visited.has(x)) {
          const cls = relationSet.filter(y => pairSet.has(`${x}->${y}`));
          cls.forEach(el => visited.add(el));
          equivalenceClasses.push({ element: x, classElements: cls });
        }
      });
    }

    return {
      isReflexive,
      missingReflexive,
      isIrreflexive,
      isSymmetric,
      missingSymmetric,
      isAntisymmetric,
      violatingAntisymmetric,
      isTransitive,
      missingTransitive,
      isEquivalence,
      isPartialOrder,
      equivalenceClasses
    };
  }, [relationSet, relationPairs]);

  const toggleRelationPair = (a: string, b: string) => {
    const exists = relationPairs.some(([x, y]) => x === a && y === b);
    if (exists) {
      setRelationPairs(relationPairs.filter(([x, y]) => !(x === a && y === b)));
    } else {
      setRelationPairs([...relationPairs, [a, b]]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              SIMATS ENGINEERING • DISCRETE MATH
            </span>
            <span className="text-xs font-mono text-slate-400">CS8351 / MAT201</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-2">
            Discrete Mathematics Matrix & Relations Laboratory
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time algebraic representations of road network graphs, algebraic path counting, Kirchhoff's Matrix-Tree Theorem, and binary relation property verification.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveSubTab('graph-matrices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'graph-matrices'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Graph Matrices & Walks
          </button>
          <button
            onClick={() => setActiveSubTab('set-relations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'set-relations'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Binary Relations & Equivalence
          </button>
          <button
            onClick={() => setActiveSubTab('warshall')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'warshall'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Warshall Reachability
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: GRAPH MATRICES & WALKS */}
      {activeSubTab === 'graph-matrices' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Vertices |V|</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{n} Nodes</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Order of Graph</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Edges |E|</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{graph.edges.length} Links</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Size of Graph</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Spanning Trees τ(G)</div>
              <div className="text-xl font-bold font-mono text-indigo-400 mt-1">{spanningTreesCount}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Kirchhoff's Theorem</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Handshaking Check</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {graph.edges.length * 2}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Σ deg(v) = 2|E|</div>
            </div>
          </div>

          {/* Adjacency Matrix & Laplacian Matrix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Adjacency Matrix A */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-sm text-slate-100">Adjacency Matrix A(G)</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">{n} × {n} Binary</span>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-center border-collapse text-xs font-mono">
                  <thead>
                    <tr>
                      <th className="p-1.5 text-slate-500 font-normal"></th>
                      {nodes.map(node => (
                        <th key={node.id} className="p-1.5 text-cyan-400 font-semibold truncate max-w-[60px]" title={node.label}>
                          {node.label.slice(0, 4)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((rowNode, i) => (
                      <tr key={rowNode.id} className="hover:bg-slate-800/40">
                        <td className="p-1.5 text-left text-cyan-400 font-semibold truncate max-w-[80px]" title={rowNode.label}>
                          {rowNode.label.slice(0, 6)}
                        </td>
                        {nodes.map((colNode, j) => (
                          <td
                            key={colNode.id}
                            className={`p-1.5 border border-slate-800/60 ${
                              adjMatrix[i][j] === 1 ? 'bg-cyan-950/60 text-cyan-300 font-bold' : 'text-slate-600'
                            }`}
                          >
                            {adjMatrix[i][j]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400">
                <strong className="text-slate-300">Definition:</strong> $A_{`{ij}`} = 1$ if an edge exists from $v_i$ to $v_j$, otherwise $0$.
              </p>
            </div>

            {/* 2. Laplacian Matrix L = D - A */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-slate-100">Laplacian Matrix L = D - A</h3>
                </div>
                <span className="text-xs font-mono text-emerald-400">Spectral Theory</span>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-center border-collapse text-xs font-mono">
                  <thead>
                    <tr>
                      <th className="p-1.5 text-slate-500 font-normal"></th>
                      {nodes.map(node => (
                        <th key={node.id} className="p-1.5 text-emerald-400 font-semibold truncate max-w-[60px]" title={node.label}>
                          {node.label.slice(0, 4)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((rowNode, i) => (
                      <tr key={rowNode.id} className="hover:bg-slate-800/40">
                        <td className="p-1.5 text-left text-emerald-400 font-semibold truncate max-w-[80px]" title={rowNode.label}>
                          {rowNode.label.slice(0, 6)}
                        </td>
                        {nodes.map((colNode, j) => (
                          <td
                            key={colNode.id}
                            className={`p-1.5 border border-slate-800/60 ${
                              i === j
                                ? 'bg-emerald-950/60 text-emerald-300 font-bold'
                                : laplacianMatrix[i][j] < 0
                                ? 'bg-slate-950 text-slate-400'
                                : 'text-slate-600'
                            }`}
                          >
                            {laplacianMatrix[i][j]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400">
                <strong className="text-slate-300">Kirchhoff's Matrix Tree Theorem:</strong> Any cofactor $\det(L_{`{ii}`})$ yields the exact number of spanning trees in $G$. Total spanning trees = <span className="font-mono font-bold text-emerald-400">{spanningTreesCount}</span>.
              </p>
            </div>
          </div>

          {/* Matrix Powers: Path Length Walks A^2 and A^3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-sm text-slate-100">A² (Walks of Length 2)</h3>
                </div>
                <span className="text-xs font-mono text-indigo-400">(A²)[i,j]</span>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-center border-collapse text-xs font-mono">
                  <thead>
                    <tr>
                      <th className="p-1.5 text-slate-500 font-normal"></th>
                      {nodes.slice(0, 7).map(node => (
                        <th key={node.id} className="p-1.5 text-indigo-400 font-semibold truncate max-w-[50px]">{node.label.slice(0, 3)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.slice(0, 7).map((rowNode, i) => (
                      <tr key={rowNode.id}>
                        <td className="p-1.5 text-left text-indigo-400 font-semibold">{rowNode.label.slice(0, 5)}</td>
                        {nodes.slice(0, 7).map((colNode, j) => (
                          <td key={colNode.id} className="p-1.5 border border-slate-800 text-slate-300">
                            {adjMatrixSq[i][j]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400">
                <strong className="text-slate-300">Theorem:</strong> $(A^k)_{`{ij}`}$ represents the total number of distinct walks of length $k$ between vertex $v_i$ and $v_j$.
              </p>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  <h3 className="font-bold text-sm text-slate-100">A³ (Walks of Length 3)</h3>
                </div>
                <span className="text-xs font-mono text-purple-400">(A³)[i,j]</span>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-center border-collapse text-xs font-mono">
                  <thead>
                    <tr>
                      <th className="p-1.5 text-slate-500 font-normal"></th>
                      {nodes.slice(0, 7).map(node => (
                        <th key={node.id} className="p-1.5 text-purple-400 font-semibold truncate max-w-[50px]">{node.label.slice(0, 3)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.slice(0, 7).map((rowNode, i) => (
                      <tr key={rowNode.id}>
                        <td className="p-1.5 text-left text-purple-400 font-semibold">{rowNode.label.slice(0, 5)}</td>
                        {nodes.slice(0, 7).map((colNode, j) => (
                          <td key={colNode.id} className="p-1.5 border border-slate-800 text-slate-300">
                            {adjMatrixCube[i][j]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400">
                Number of triangles in undirected G equals (1/6) trace(A³) = (1/6) Σ (A³)[i,i].
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BINARY RELATIONS & EQUIVALENCE */}
      {activeSubTab === 'set-relations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Relation Definition & Matrix Editor */}
            <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Set S and Binary Relation R ⊆ S × S</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click cells to toggle ordered pairs (a, b) ∈ R
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Reset to equivalence relation
                    setRelationPairs(relationSet.map(x => [x, x] as [string, string]));
                  }}
                  className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
                >
                  Set Identity Relation
                </button>
              </div>

              {/* Set Elements Display */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300">Set S:</span>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {relationSet.map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Relation Matrix */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-300">Relation Matrix M_R:</div>
                <div className="flex justify-center">
                  <table className="text-center border-collapse text-xs font-mono">
                    <thead>
                      <tr>
                        <th className="p-2 text-slate-500 font-normal">R</th>
                        {relationSet.map(col => (
                          <th key={col} className="p-2 text-cyan-400 font-bold w-12">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {relationSet.map(row => (
                        <tr key={row}>
                          <td className="p-2 text-cyan-400 font-bold">{row}</td>
                          {relationSet.map(col => {
                            const isPresent = relationPairs.some(([a, b]) => a === row && b === col);
                            return (
                              <td key={col} className="p-1">
                                <button
                                  type="button"
                                  onClick={() => toggleRelationPair(row, col)}
                                  className={`w-10 h-10 rounded-lg text-xs font-bold font-mono transition-colors border ${
                                    isPresent
                                      ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                                      : 'bg-slate-900 border-slate-800 text-slate-600 hover:bg-slate-800 hover:text-slate-400'
                                  }`}
                                  title={`Toggle (${row}, ${col})`}
                                >
                                  {isPresent ? '1' : '0'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* List of Ordered Pairs in R */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">
                  Current Ordered Pairs R ({relationPairs.length} pairs):
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  {relationPairs.length === 0 ? (
                    <span className="text-slate-600">Empty relation ∅</span>
                  ) : (
                    relationPairs.map(([a, b], idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                        ({a}, {b})
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right: Property Verdicts & Equivalence Classes */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-slate-100 pb-3 border-b border-slate-800">
                Mathematical Verdicts
              </h3>

              <div className="space-y-2.5 text-xs">
                {/* Reflexive */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-200">Reflexive</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">∀ x ∈ S, (x, x) ∈ R</div>
                    {!relationProperties.isReflexive && (
                      <div className="text-[10px] text-rose-400 mt-1">Missing: {relationProperties.missingReflexive.join(', ')}</div>
                    )}
                  </div>
                  {relationProperties.isReflexive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Symmetric */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-200">Symmetric</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">(a,b) ∈ R ⟹ (b,a) ∈ R</div>
                    {!relationProperties.isSymmetric && (
                      <div className="text-[10px] text-rose-400 mt-1">Missing: {relationProperties.missingSymmetric.slice(0, 3).join(', ')}</div>
                    )}
                  </div>
                  {relationProperties.isSymmetric ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Antisymmetric */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-200">Antisymmetric</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">(a,b) & (b,a) ∈ R ⟹ a=b</div>
                  </div>
                  {relationProperties.isAntisymmetric ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Transitive */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-200">Transitive</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">(a,b) & (b,c) ∈ R ⟹ (a,c) ∈ R</div>
                  </div>
                  {relationProperties.isTransitive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </div>
              </div>

              {/* Equivalence Relation Status */}
              <div className={`p-3.5 rounded-xl border ${
                relationProperties.isEquivalence
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : relationProperties.isPartialOrder
                  ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <div className="font-bold text-xs uppercase tracking-wider">
                  {relationProperties.isEquivalence
                    ? '✓ Equivalence Relation Confirmed'
                    : relationProperties.isPartialOrder
                    ? '✓ Partial Order (Poset) Confirmed'
                    : 'Standard Binary Relation'}
                </div>
                {relationProperties.isEquivalence && (
                  <div className="mt-2 space-y-1">
                    <div className="text-[11px] font-semibold text-emerald-200">Equivalence Classes [x]:</div>
                    <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                      {relationProperties.equivalenceClasses.map((cls, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700 text-white">
                          [{cls.element}] = {'{' + cls.classElements.join(', ') + '}'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WARSHALL REACHABILITY */}
      {activeSubTab === 'warshall' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-100">Warshall's Transitive Reachability Algorithm</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Computes the transitive closure matrix $W = \bigvee_{`{k=1}`}^n A^k$ with time complexity $O(n^3)$
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">O(|V|³)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warshallSteps.slice(0, 6).map(step => (
                <div key={step.k} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                    <span>{step.k === 0 ? 'W⁽⁰⁾ = A(G)' : `W⁽${step.k}⁾ (via vertex v_${step.k})`}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse text-[11px] font-mono">
                      <tbody>
                        {step.matrix.slice(0, 6).map((row, i) => (
                          <tr key={i}>
                            {row.slice(0, 6).map((val, j) => (
                              <td
                                key={j}
                                className={`p-1 border border-slate-800 ${
                                  val === 1 ? 'bg-cyan-950/70 text-cyan-300 font-bold' : 'text-slate-600'
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
              ))}
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
              <div className="text-slate-300 font-bold">Recurrence Relation:</div>
              <div>W^(k)[i, j] = W^(k-1)[i, j] ∨ (W^(k-1)[i, k] ∧ W^(k-1)[k, j])</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
