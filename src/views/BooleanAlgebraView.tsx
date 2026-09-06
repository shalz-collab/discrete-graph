import React, { useState, useEffect } from 'react';
import {
  Binary,
  Sparkles,
  RotateCcw,
  Table,
  CheckCircle2,
  Copy,
  Layers,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeBooleanExpression } from '../utils/booleanEngine';
import { PRESET_BOOLEAN_EXPRESSIONS } from '../data/initialData';
import { BooleanAnalysisResult } from '../types';

export const BooleanAlgebraView: React.FC = () => {
  const { setActiveTab, incrementBooleanCount, notify } = useApp();

  const [inputExpression, setInputExpression] = useState<string>('(A AND B) OR (NOT C)');
  const [analysis, setAnalysis] = useState<BooleanAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initial analysis on load
  useEffect(() => {
    try {
      const res = analyzeBooleanExpression('(A AND B) OR (NOT C)');
      setAnalysis(res);
    } catch {
      // ignore
    }
  }, []);

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
      notify('success', 'Expression Analyzed', 'Generated Boolean simplification and discrete classification.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid Boolean syntax.');
      setAnalysis(null);
      notify('error', 'Syntax Error', err.message || 'Could not parse Boolean expression.');
    }
  };

  const handleClear = () => {
    setInputExpression('');
    setAnalysis(null);
    setErrorMsg(null);
  };

  const handleOperatorInsert = (op: string) => {
    setInputExpression(prev => (prev ? `${prev} ${op} ` : `${op} `));
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

  const handleCopySimplified = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.simplifiedExpression);
    notify('success', 'Copied to Clipboard', 'Copied simplified expression.');
  };

  const handleJumpToTruthTable = () => {
    // Switch to Truth Table tab
    setActiveTab('truth-table');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Binary className="w-5 h-5 text-cyan-400" />
              <span>Boolean Algebra Analyzer</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Symbolic propositional logic evaluator, algebraic simplifier, and canonical normal forms generator.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Presets:</span>
            <select
              onChange={e => handlePresetSelect(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-medium"
              defaultValue=""
            >
              <option value="" disabled>-- Load Discrete Math Example --</option>
              {PRESET_BOOLEAN_EXPRESSIONS.map((preset, idx) => (
                <option key={idx} value={preset.expr}>{preset.label}: {preset.expr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* INPUT & OPERATOR KEYPAD CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <form onSubmit={handleSimplify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Enter Boolean Expression</span>
              <span className="text-[11px] text-slate-500 font-mono">
                Supports: AND, OR, NOT, XOR, IMPLIES, IFF, ( )
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                id="input-boolean-expression"
                value={inputExpression}
                onChange={e => setInputExpression(e.target.value)}
                placeholder="e.g. (A AND B) OR (NOT C)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Quick Operator Insertion Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">Insert Operator:</span>
            {['AND', 'OR', 'NOT', 'XOR', 'IMPLIES', '(', ')'].map(op => (
              <button
                key={op}
                type="button"
                onClick={() => handleOperatorInsert(op)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 font-mono text-xs border border-slate-800 transition-colors"
              >
                {op}
              </button>
            ))}
            {['A', 'B', 'C', 'P', 'Q'].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => handleOperatorInsert(v)}
                className="px-2 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-400 font-mono text-xs border border-cyan-800/40 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              id="btn-simplify-expression"
              className="py-2.5 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simplify Expression</span>
            </button>

            <button
              type="button"
              id="btn-generate-truth-table-from-bool"
              onClick={handleJumpToTruthTable}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Table className="w-4 h-4" />
              <span>Generate Truth Table</span>
            </button>

            <button
              type="button"
              id="btn-clear-boolean"
              onClick={handleClear}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* ANALYSIS & SIMPLIFICATION RESULTS */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* SIMPLIFIED EXPRESSION DISPLAY CARD */}
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-slate-100">Simplified Expression</h3>
              </div>
              <button
                onClick={handleCopySimplified}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 text-xs border border-slate-700 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="font-mono text-base sm:text-lg font-bold text-cyan-300 tracking-wide">
                {analysis.simplifiedExpression}
              </div>
              <span className="text-xs font-mono text-slate-500 uppercase">Minimal Form</span>
            </div>

            {/* Laws Applied */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Discrete Math Laws Applied</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysis.lawsApplied.map((law, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{law}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LOGICAL ANALYSIS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Properties Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Logical Analysis Metrics</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Variables ({analysis.variables.length})</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono mt-1">
                    {analysis.variables.join(', ') || 'None'}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Operators</div>
                  <div className="text-sm font-bold text-slate-100 font-mono mt-1">
                    {analysis.totalOperators}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2">
                  <div className="text-[11px] text-slate-400">Proposition Classification</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {analysis.expressionType}
                  </div>
                </div>
              </div>

              {/* Operator breakdown chips */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Operator Count Spectrum:</div>
                <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    AND: {analysis.operatorsCount.AND}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    OR: {analysis.operatorsCount.OR}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    NOT: {analysis.operatorsCount.NOT}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    XOR: {analysis.operatorsCount.XOR}
                  </span>
                </div>
              </div>
            </div>

            {/* Canonical Normal Forms (DNF / CNF) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Binary className="w-4 h-4 text-cyan-400" />
                <span>Canonical Normal Forms</span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-[11px] font-sans text-slate-400 mb-1">
                    Disjunctive Normal Form (DNF / Sum of Minterms):
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto">
                    {analysis.dnf}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-sans text-slate-400 mb-1">
                    Conjunctive Normal Form (CNF / Product of Maxterms):
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-blue-300 overflow-x-auto">
                    {analysis.cnf}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-sans text-slate-400 mb-1">
                    Dual Propositional Expression (Principle of Duality):
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto">
                    {analysis.dualExpression}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
