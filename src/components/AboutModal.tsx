import React from 'react';
import { X, BookOpen, GitFork, Cpu, Binary, Layers, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutModal: React.FC = () => {
  const { isAboutModalOpen, setIsAboutModalOpen } = useApp();

  if (!isAboutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="about-capstone-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                SIMATS ENGINEERING • SAVEETHA UNIVERSITY
              </div>
              <h2 className="text-base font-bold text-slate-100">
                Discrete Mathematics & Graph Theoretical Portal
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsAboutModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Main Title & Purpose */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">
                Course: CS8351 / MAT201 Discrete Mathematics Capstone Project
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
                CSE DEPT
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mt-2">
              An institutional interactive platform integrating spectral graph theory (Adjacency, Degree, Laplacian, Kirchhoff Matrix-Tree Theorem), dynamic time-dependent real-time routing algorithms (Dijkstra, A*), and propositional Boolean logic analyzers for urban transit optimization.
            </p>
          </div>

          {/* Core Discrete Math Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
                <GitFork className="w-4 h-4" />
                <span>1. Graph Theory & Representations</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                Models road networks as weighted graphs $G = (V, E)$. Computes degrees, density, adjacency lists, and adjacency matrices automatically.
              </p>
              <div className="bg-slate-900 p-2 rounded text-[11px] font-mono text-cyan-300 border border-slate-800">
                |V| Nodes, |E| Edges, Handshaking: Σ deg(v) = 2|E|
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <Cpu className="w-4 h-4" />
                <span>2. Dijkstra’s Algorithm</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                Greedy search finding exact shortest paths in non-negative weighted graphs using priority queue relaxation.
              </p>
              <div className="bg-slate-900 p-2 rounded text-[11px] font-mono text-emerald-300 border border-slate-800">
                Relax: if dist[u] + w(u,v) &lt; dist[v] → dist[v] = dist[u] + w(u,v)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                <Layers className="w-4 h-4" />
                <span>3. A* Search Algorithm</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                Heuristic-driven shortest path search using admissible distance evaluation to focus the frontier search.
              </p>
              <div className="bg-slate-900 p-2 rounded text-[11px] font-mono text-blue-300 border border-slate-800">
                f(n) = g(n) + h(n) [Admissibility: h(n) ≤ h*(n)]
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
                <Binary className="w-4 h-4" />
                <span>4. Boolean Algebra & Truth Tables</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                Parses symbolic proposition logic, simplifies algebraic expressions via Boolean laws, and generates complete $2^n$ truth tables.
              </p>
              <div className="bg-slate-900 p-2 rounded text-[11px] font-mono text-purple-300 border border-slate-800">
                De Morgan: ¬(A ∧ B) = ¬A ∨ ¬B | Absorption: A ∨ (A ∧ B) = A
              </div>
            </div>
          </div>

          {/* Student Researchers */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Student Researchers & Assigned Discrete Models
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-100">Shalini M (192311434)</div>
                <div className="text-[11px] text-cyan-300">Models 1, 2 & 3: Dijkstra, A* Heuristic Admissibility & Dynamic Edge Matrix W(t)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-100">Infant Leoraj (192311373)</div>
                <div className="text-[11px] text-cyan-300">Models 4, 5 & 6: Spectral Graph Matrices, Kirchhoff Spanning Trees & Boolean K-Maps</div>
              </div>
            </div>
          </div>

          {/* Capstone Features Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Implemented Discrete Math Capabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {[
                'Interactive draggable vertex and edge graph builder',
                'Automatic Adjacency Matrix and Adjacency List extraction',
                'Step-by-step Dijkstra priority queue simulation',
                'Step-by-step A* Euclidean distance heuristic exploration',
                'Multi-metric comparison benchmark (Dijkstra vs A*)',
                'Lexical tokenizer & recursive descent Boolean AST parser',
                'Boolean law simplifier & prime implicant reduction',
                '2ⁿ combination Truth Table generator with CSV export',
                'Empirical route computation analytics and historical logs'
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={() => setIsAboutModalOpen(false)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
