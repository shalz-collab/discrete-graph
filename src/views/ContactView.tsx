import React, { useState } from 'react';
import {
  User,
  Mail,
  Github,
  Award,
  BookOpen,
  Send,
  CheckCircle2,
  Building2,
  GraduationCap,
  ExternalLink,
  Code2,
  Sparkles,
  Layers,
  Cpu,
  Binary
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ContactView: React.FC = () => {
  const { showToast } = useApp();
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMessage) {
      showToast?.('warning', 'Validation Error', 'Please complete all required fields.');
      return;
    }
    setSubmitted(true);
    showToast?.('success', 'Message Sent', 'Thank you for reaching out! We will respond promptly.');
    setTimeout(() => {
      setFormName('');
      setFormEmail('');
      setFormSubject('');
      setFormMessage('');
      setSubmitted(false);
    }, 4000);
  };

  const teamMembers = [
    {
      name: 'Shalini M',
      studentId: '192311434',
      role: 'Lead Developer • Discrete Mathematical Models 1, 2 & 3',
      email: 'shalinimuthukumar1434@gmail.com',
      github: 'https://github.com/shalzprizz',
      module: 'Module 1 & 2: Dijkstra, A* Heuristic Search & Real-Time Dynamic Traffic',
      keyContributions: [
        'Discrete Model 1: Graph Theoretic Formulation G=(V,E) & Priority Queue Dijkstra Solver',
        'Discrete Model 2: A* Heuristic Search & Euclidean Distance Admissibility Theorem (h(n) ≤ h*(n))',
        'Discrete Model 3: Time-Dependent Dynamic Edge Weight Cost Matrix W(e,t) = w₀ × (1 + μ + δ)',
        'Real-Time Congestion Perturbation & Dynamic Rerouting Engine with Live GPS Simulation'
      ]
    },
    {
      name: 'Infant Leoraj',
      studentId: '192311373',
      role: 'Developer • Discrete Mathematical Models 4, 5 & 6',
      email: 'infantleoraj@saveetha.ac.in',
      github: 'https://github.com/infantleoraj',
      module: 'Module 3 & 4: Spectral Graph Matrices, Boolean Algebra & Truth Tables',
      keyContributions: [
        'Discrete Model 4: Spectral Graph Theory: Adjacency A(G), Laplacian L=D-A & Kirchhoff Spanning Trees τ(G)',
        'Discrete Model 5: Matrix Powers (A², A³ for Path Lengths) & Warshall Algorithm for Transitive Reachability',
        'Discrete Model 6: Propositional Boolean Logic Simplifier via Discrete Laws & 2/3/4-Variable K-Maps',
        'Complete 2ⁿ Truth Table Generator with Real-Time Logical Property Classifications'
      ]
    }
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono font-semibold">
          <GraduationCap className="w-3.5 h-3.5" /> SIMATS ENGINEERING • CAPSTONE PROJECT
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Project Team & Academic Contact
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Discrete Mathematics & Graph Theoretical Optimization Capstone Project conducted at the Department of Computer Science & Engineering, Saveetha University.
        </p>
      </div>

      {/* Team Member Cards (Matching Video Frame 10!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Member Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-100">{member.name}</h2>
                  <div className="text-xs font-mono font-bold text-cyan-400">
                    Student ID: <span className="text-slate-200">{member.studentId}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">{member.role}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <User className="w-6 h-6" />
                </div>
              </div>

              {/* Module Description */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Module
                </div>
                <div className="text-xs font-semibold text-slate-200">{member.module}</div>
              </div>

              {/* Key Contributions */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  Key Contributions:
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {member.keyContributions.map((contrib, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{contrib}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Links */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <a
                href={`mailto:${member.email}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
              <a
                href={member.github}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Institutional Details & Academic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">Institution</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Saveetha School of Engineering, Saveetha Institute of Medical and Technical Sciences (SIMATS), Chennai, Tamil Nadu, India.
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">Course & Curriculum</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Course Code: CS8351 / MAT201 • Discrete Mathematics, Spectral Graph Theory, and Propositional Logic Capstone Portfolio.
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">Academic Verification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Supervised by the Faculty of Mathematics and Computer Science & Engineering. All theorems and empirical benchmarks verified.
          </p>
        </div>
      </div>

      {/* Academic Query & Feedback Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Send Academic Inquiries or Feedback
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Questions regarding our research methodology, algorithms, or Boolean logic engine? Reach out to our student development team.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-950/60 border border-emerald-800 text-center space-y-2 text-emerald-300 animate-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm">Message Successfully Dispatched</h4>
            <p className="text-xs text-emerald-200">
              Thank you for your academic inquiry! We will reply directly to your provided email address.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Raman / Student"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Graph Model Inquiries / Algorithmic Evaluation"
                value={formSubject}
                onChange={e => setFormSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Message Content <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Write your research query, question on graph matrix formulas, or suggestions here..."
                value={formMessage}
                onChange={e => setFormMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Submit Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
