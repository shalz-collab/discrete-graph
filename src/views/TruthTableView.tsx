import React, { useState, useEffect } from 'react';
import {
  Table,
  Play,
  RotateCcw,
  Download,
  Copy,
  Binary,
  CheckCircle2,
  XCircle,
  Filter,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateTruthTable, exportTruthTableToCSV } from '../utils/booleanEngine';
import { TruthTableData } from '../types';
import { PRESET_BOOLEAN_EXPRESSIONS } from '../data/initialData';

export const TruthTableView: React.FC = () => {
  const { incrementBooleanCount, notify } = useApp();

  const [expression, setExpression] = useState<string>('A AND (B OR C)');
  const [tableData, setTableData] = useState<TruthTableData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'true' | 'false'>('all');

  // Initial table generate
  useEffect(() => {
    try {
      const data = generateTruthTable('A AND (B OR C)');
      setTableData(data);
    } catch {
      // ignore
    }
  }, []);

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!expression.trim()) {
      setErrorMsg('Please enter a Boolean expression.');
      setTableData(null);
      return;
    }

    try {
      const data = generateTruthTable(expression);
      setTableData(data);
      setErrorMsg(null);
      incrementBooleanCount();
      notify('success', 'Truth Table Generated', `Evaluated all ${data.rows.length} truth assignments.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid Boolean expression.');
      setTableData(null);
      notify('error', 'Evaluation Error', err.message || 'Failed to generate truth table.');
    }
  };

  const handleReset = () => {
    setExpression('A AND (B OR C)');
    try {
      const data = generateTruthTable('A AND (B OR C)');
      setTableData(data);
      setErrorMsg(null);
    } catch {
      // ignore
    }
  };

  const handleExportCSV = () => {
    if (!tableData) return;
    const csvContent = exportTruthTableToCSV(tableData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `truth_table_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify('success', 'CSV Exported', 'Downloaded truth table as CSV.');
  };

  const handleCopyMarkdown = () => {
    if (!tableData) return;
    const headers = [...tableData.variables, 'Result (F)'];
    const separator = headers.map(() => '---');
    const rows = tableData.rows.map(r => {
      const vals = tableData.variables.map(v => (r.assignments[v] ? 'T' : 'F'));
      vals.push(r.result ? 'T' : 'F');
      return `| ${vals.join(' | ')} |`;
    });

    const markdown = `| ${headers.join(' | ')} |\n| ${separator.join(' | ')} |\n${rows.join('\n')}`;
    navigator.clipboard.writeText(markdown);
    notify('success', 'Copied to Clipboard', 'Copied Markdown truth table.');
  };

  const handleInsert = (token: string) => {
    setExpression(prev => (prev ? `${prev} ${token} ` : `${token} `));
  };

  // Filtered rows
  const filteredRows = tableData
    ? tableData.rows.filter(r => {
        if (filterMode === 'true') return r.result === true;
        if (filterMode === 'false') return r.result === false;
        return true;
      })
    : [];

  const trueCount = tableData ? tableData.rows.filter(r => r.result).length : 0;
  const falseCount = tableData ? tableData.rows.length - trueCount : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Table className="w-5 h-5 text-cyan-400" />
              <span>Discrete Truth Table Generator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Automatic generation of exhaustive $2^n$ state matrix for proposition logic.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Presets:</span>
            <select
              onChange={e => {
                setExpression(e.target.value);
                try {
                  const data = generateTruthTable(e.target.value);
                  setTableData(data);
                  setErrorMsg(null);
                  incrementBooleanCount();
                } catch {}
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-medium"
              value={expression}
            >
              {PRESET_BOOLEAN_EXPRESSIONS.map((p, idx) => (
                <option key={idx} value={p.expr}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* INPUT & GENERATE CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Boolean Proposition Logic</span>
              <span className="text-[11px] text-slate-500 font-mono">Auto-detects variables</span>
            </label>
            <input
              type="text"
              id="input-truth-table-expression"
              value={expression}
              onChange={e => setExpression(e.target.value)}
              placeholder="e.g. A AND (B OR C)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 transition-colors shadow-inner"
            />
          </div>

          {/* Quick Operators */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">Quick Add:</span>
            {['AND', 'OR', 'NOT', 'XOR', 'IMPLIES', 'IFF', '(', ')'].map(op => (
              <button
                key={op}
                type="button"
                onClick={() => handleInsert(op)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 font-mono text-xs border border-slate-800 transition-colors"
              >
                {op}
              </button>
            ))}
            {['A', 'B', 'C', 'D'].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => handleInsert(v)}
                className="px-2 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-400 font-mono text-xs border border-cyan-800/40 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="submit"
              id="btn-generate-truth-table"
              className="py-2.5 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Generate Table</span>
            </button>

            <button
              type="button"
              id="btn-reset-truth-table"
              onClick={handleReset}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {tableData && (
              <>
                <button
                  type="button"
                  id="btn-export-truth-table-csv"
                  onClick={handleExportCSV}
                  className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  id="btn-copy-truth-table-markdown"
                  onClick={handleCopyMarkdown}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </button>
              </>
            )}
          </div>
        </form>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* GENERATED TRUTH TABLE */}
      {tableData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <span>Exhaustive Truth Table: <span className="text-cyan-300 font-mono">{tableData.expression}</span></span>
              </h3>
            </div>

            {/* Filter by outcome */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                    filterMode === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  All ({tableData.rows.length})
                </button>
                <button
                  onClick={() => setFilterMode('true')}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                    filterMode === 'true' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  True ({trueCount})
                </button>
                <button
                  onClick={() => setFilterMode('false')}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                    filterMode === 'false' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  False ({falseCount})
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-xs font-mono text-center">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300 font-bold">
                  <th className="py-3 px-3 w-12 text-slate-500">#</th>
                  {tableData.variables.map(v => (
                    <th key={v} className="py-3 px-4 text-cyan-400">
                      {v}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-slate-100 bg-slate-900 font-bold">
                    Result: {tableData.expression}
                  </th>
                  <th className="py-3 px-3 text-slate-400">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRows.map(row => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      row.result ? 'bg-emerald-950/10' : 'bg-rose-950/10'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-500">{row.id + 1}</td>
                    {tableData.variables.map(v => (
                      <td key={v} className="py-2.5 px-4 font-bold text-slate-200">
                        {row.assignments[v] ? (
                          <span className="text-emerald-400">1 (T)</span>
                        ) : (
                          <span className="text-slate-500">0 (F)</span>
                        )}
                      </td>
                    ))}
                    <td className="py-2.5 px-4 font-bold text-sm bg-slate-900/40">
                      {row.result ? (
                        <span className="text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                          1 (TRUE)
                        </span>
                      ) : (
                        <span className="text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/30">
                          0 (FALSE)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.result ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Truth Table Statistics Footer */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 px-1">
            <div>
              Total Combinations $2^{tableData.variables.length} = {tableData.rows.length}$ rows
            </div>
            <div className="flex items-center gap-4">
              <span className="text-emerald-400 font-semibold">True outputs: {trueCount}</span>
              <span className="text-rose-400 font-semibold">False outputs: {falseCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
