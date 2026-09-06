import React, { useMemo } from 'react';
import {
  MapPin,
  GitFork,
  Route,
  Clock,
  Zap,
  Binary,
  ArrowRight,
  ArrowUpDown,
  Navigation,
  CheckCircle2,
  Share2,
  ExternalLink,
  Cpu,
  Layers,
  Table,
  Radio,
  Grid,
  BarChart3,
  User,
  Mail,
  Github,
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/GraphCanvas';
import { AlgorithmType, WeightType } from '../types';

export const DashboardView: React.FC = () => {
  const {
    graph,
    history,
    selectedSource,
    setSelectedSource,
    selectedDestination,
    setSelectedDestination,
    selectedAlgorithm,
    setSelectedAlgorithm,
    selectedWeightType,
    setSelectedWeightType,
    activeResult,
    calculateRoute,
    clearActiveRoute,
    setActiveTab
  } = useApp();

  const handleSwap = () => {
    const temp = selectedSource;
    setSelectedSource(selectedDestination);
    setSelectedDestination(temp);
    clearActiveRoute();
  };

  const handleQuickRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateRoute();
  };

  const nodeMap = useMemo(() => new Map(graph.nodes.map(n => [n.id, n])), [graph.nodes]);

  const modules = [
    {
      id: 'route-planner',
      title: 'Module 1: Shortest Path & Traffic Optimization',
      subtitle: 'Dijkstra, A* Heuristic & Dynamic Edge Matrix W(t)',
      description:
        'Explore discrete shortest-path computation with Dijkstra and A* algorithms, priority queue exploration, dynamic congestion matrices, and full Python/TypeScript code.',
      icon: Route,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40 border-cyan-800/60'
    },
    {
      id: 'matrix-relations',
      title: 'Module 2: Discrete Mathematics & Boolean Logic',
      subtitle: 'Spectral Matrices, Kirchhoff Theorem & K-Maps',
      description:
        'Compute Adjacency A(G), Laplacian L=D-A, Kirchhoff spanning trees τ(G), Warshall reachability closures, and propositional Boolean logic simplification.',
      icon: Grid,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/40 border-indigo-800/60'
    },
    {
      id: 'analytics',
      title: 'Results & Performance Analysis',
      subtitle: 'Complexity Benchmarks & Heuristic Admissibility',
      description:
        'Compare asymptotic running times O((|V|+|E|)log|V|), node expansion ratios, dynamic congestion operation metrics, and Euclidean precision verification tables.',
      icon: BarChart3,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/60'
    }
  ];

  const teamMembers = [
    {
      name: 'Shalini M',
      studentId: '192311434',
      role: 'Lead Developer • Discrete Models 1, 2 & 3',
      email: 'shalinimuthukumar1434@gmail.com',
      github: 'https://github.com/shalzprizz',
      focus: 'Shortest Path Optimization, A* Admissibility & Dynamic Edge Matrix W(t)',
      discreteModels: [
        'Model 1: Graph Formulation G=(V,E) & Dijkstra Priority Queue Min-Heap Solver',
        'Model 2: A* Heuristic Search & Euclidean Distance Admissibility Theorem (h(n) ≤ h*(n))',
        'Model 3: Time-Dependent Dynamic Weight Formulation W(e,t) = w₀ × (1 + μ(t) + δ(t))'
      ]
    },
    {
      name: 'Infant Leoraj',
      studentId: '192311373',
      role: 'Developer • Discrete Models 4, 5 & 6',
      email: 'infantleoraj@saveetha.ac.in',
      github: 'https://github.com/infantleoraj',
      focus: 'Spectral Graph Matrices, Kirchhoff Theorem & Boolean Logic K-Maps',
      discreteModels: [
        'Model 4: Spectral Graph Theory: Adjacency A(G), Laplacian L=D-A & Kirchhoff Spanning Trees τ(G)',
        'Model 5: Algebraic Walk Powers (A², A³) & Binary Relations Closure (Warshall Algorithm)',
        'Model 6: Propositional Boolean Algebra Minimizer & 2/3/4-Variable Karnaugh Maps (K-Maps)'
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-200 pb-12">
      {/* 1. Hero Banner (Identical to Video Frame 0 & Frame 3-4!) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0f172a] p-8 sm:p-14 text-white shadow-2xl border border-cyan-500/20">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-semibold tracking-wider uppercase text-cyan-200">
            <Sparkles className="w-3.5 h-3.5" /> SIMATS ENGINEERING • DISCRETE MATHEMATICS CAPSTONE
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight sm:leading-none">
            Design and Implementation of Graph-Theoretic Smart Route Optimization & Discrete Mathematics Analysis
          </h1>

          <p className="text-sm sm:text-base text-cyan-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Using Dijkstra Algorithm, A* Heuristic Search, Spectral Graph Matrices, and Propositional Boolean Logic for Enhanced Urban Transit Navigation
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              id="btn-hero-start-exploring"
              onClick={() => {
                setActiveTab('route-planner');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Next Page: Campus & Highway Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTab('matrix-relations');
                document.getElementById('section-discrete-models')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-white font-semibold text-sm border border-white/20 transition-all backdrop-blur-sm flex items-center gap-2"
            >
              <Grid className="w-4 h-4 text-cyan-300" />
              <span>Discrete Models</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      </div>

      {/* 2. Project Overview Section (Video Frame 0-1) */}
      <section className="text-center space-y-4 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Project Overview
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          This research project demonstrates the mathematical implementation of graph-theoretic optimization for secure, intelligent urban navigation, focusing on Dijkstra, A* Heuristic search, dynamic time-dependent edge matrices, and Boolean algebraic safety synthesis.
        </p>
      </section>

      {/* 3. Data Flow Architecture / Pipeline Diagram (Video Frame 0-1) */}
      <section className="space-y-6">
        <div className="text-center">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            SYSTEM PIPELINE
          </div>
          <h3 className="text-xl font-bold text-slate-100 mt-1">Data Flow Architecture</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center relative flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-xs text-slate-200">1. Spatial Graph G=(V,E)</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Metropolitan road vertices and intersection coordinates
              </p>
            </div>
            <div className="text-[10px] font-mono text-cyan-400 pt-2 border-t border-slate-800">
              |V| Nodes & |E| Links
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center relative flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
              <Radio className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-xs text-slate-200">2. Weight Matrix W(t)</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Time-dependent congestion multiplier & incident friction
              </p>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 pt-2 border-t border-slate-800">
              W(e,t) = w₀ × (1+μ+δ)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center relative flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center mx-auto">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-xs text-slate-200">3. A* & Dijkstra Solver</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Admissible heuristic evaluation function f(n) = g(n) + h(n)
              </p>
            </div>
            <div className="text-[10px] font-mono text-indigo-400 pt-2 border-t border-slate-800">
              O((|V|+|E|) log |V|)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center relative flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center mx-auto">
              <Binary className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-xs text-slate-200">4. Boolean Logic Gates</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Karnaugh Map simplified road accessibility constraints
              </p>
            </div>
            <div className="text-[10px] font-mono text-purple-400 pt-2 border-t border-slate-800">
              Pass(e) ∈ {'{0, 1}'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center relative flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center mx-auto">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-xs text-slate-200">5. Navigation Telemetry</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Optimal shortest path with live GPS simulated drive
              </p>
            </div>
            <div className="text-[10px] font-mono text-amber-400 pt-2 border-t border-slate-800">
              Real-Time Turn by Turn
            </div>
          </div>
        </div>
      </section>

      {/* 4. Explore Modules Grid (Video Frame 1) */}
      <section className="space-y-6">
        <div className="text-center">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            CORE RESEARCH MODULES
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">Explore Project Modules</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map(mod => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5 shadow-lg group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mod.bg} ${mod.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                        {mod.title}
                      </h4>
                      <span className="text-xs font-mono text-slate-400 font-semibold">{mod.subtitle}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <button
                  id={`btn-explore-${mod.id}`}
                  onClick={() => {
                    setActiveTab(mod.id as any);
                    const targetId =
                      mod.id === 'route-planner'
                        ? 'section-campus-map'
                        : mod.id === 'matrix-relations'
                        ? 'section-discrete-models'
                        : 'section-analytics';
                    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2 group-hover:text-white"
                >
                  <span>Explore Module</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Direct Jump to Real-Time Campus Map & Route Planner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/40 space-y-4 shadow-xl text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-xs font-mono text-cyan-300 font-bold">
            <Route className="w-3.5 h-3.5" /> SAVEETHA UNIVERSITY (SIMATS) REAL-TIME CAMPUS MAP
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100">
            Interactive Campus Navigation & Routing
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Explore shortest paths between all 12 SIMATS landmarks, dynamic traffic congestion telemetry, turn-by-turn walking steps, and live EV shuttle GPS simulation.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => {
              setActiveTab('route-planner');
              document.getElementById('section-campus-map')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-sm shadow-lg shadow-cyan-900/30 inline-flex items-center gap-2 transition-all hover:gap-3"
          >
            <span>Launch Campus Route Planner ↓</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6. Project Team Section (Identical to Video Frame 2 & 10!) */}
      <section className="space-y-6">
        <div className="text-center">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            ACADEMIC CONTRIBUTORS
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">Project Team</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-slate-100">{member.name}</h4>
                    <div className="text-xs font-mono font-bold text-cyan-400 mt-0.5">
                      Student ID: <span className="text-slate-200">{member.studentId}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                    <User className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-xs font-medium text-slate-300">{member.role}</div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Core Focus</div>
                  <div className="text-slate-200 font-semibold">{member.focus}</div>
                </div>

                {/* Assigned Discrete Mathematical Models */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3" /> Assigned Discrete Models:
                  </div>
                  <div className="space-y-1">
                    {member.discreteModels.map((model, mIdx) => (
                      <div key={mIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{model}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-3 text-xs">
                <a
                  href={`mailto:${member.email}`}
                  className="flex-1 py-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proceed to Next Page: Poonamallee to Saveetha Map */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border border-cyan-800/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
            <Route className="w-3.5 h-3.5" /> NEXT PAGE IN TRANSIT CAPSTONE
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Page 2: Poonamallee to Saveetha Highway & Campus Live Map
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Experience the interactive shortest path planner from Poonamallee to Saveetha University Thandalam Campus & Medical College with synthesized stop chimes and turn-by-turn announcements.
          </p>
        </div>

        <button
          id="btn-dashboard-next-page-map"
          type="button"
          onClick={() => {
            setActiveTab('route-planner');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-sm transition-all shadow-xl hover:shadow-cyan-500/40 flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <span>Open Next Page (Live Map)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
