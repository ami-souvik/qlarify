"use client";

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Share2, Download, Asterisk, ArrowRight, Layout, Zap, Share, Star, X } from 'lucide-react';
import DiagramRenderer from '@/components/DiagramRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

const SAMPLE_INPUT = `User visits the landing page.
Frontend loads assets from CDN.
User submits email form.
API validates the email address.
Database saves the contact info.
System sends a welcome email via SMTP service.`;

export default function Home() {
  const toolRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [pendingAction, setPendingAction] = useState<'download' | 'share' | null>(null);

  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for shared URL params
    const searchParams = new URLSearchParams(window.location.search);
    const sharedDesc = searchParams.get('description');
    if (sharedDesc) {
      setInput(decodeURIComponent(sharedDesc));
      // Auto-generate if shared? Maybe just fill input
      // setGenerated(true); // Let them click to see it, encourages engagement
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/generate', {
        description: input
      });
      setData(res.data);
      setGenerated(true);
    } catch (err) {
      console.error(err);
      setError('Failed to generate diagram. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: 'download' | 'share') => {
    if (!feedbackSubmitted) {
      setPendingAction(action);
      setShowFeedbackModal(true);
      return;
    }

    if (action === 'download' && diagramRef.current) {
      // Find the inner element to capture (react-flow takes a moment to render)
      // We capture the whole container for simplicity
      try {
        const dataUrl = await toPng(diagramRef.current, { cacheBust: true, backgroundColor: '#f8fafc' });
        const link = document.createElement('a');
        link.download = 'qlarify-diagram.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Download failed', err);
      }
    }

    if (action === 'share') {
      const url = `${window.location.origin}?description=${encodeURIComponent(input)}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const submitFeedback = async () => {
    if (rating === 0) return; // Require rating at least

    try {
      await axios.post('/api/feedback', {
        rating,
        comment
      });
      setFeedbackSubmitted(true);
      setShowFeedbackModal(false);

      // Execute pending
      if (pendingAction) {
        executeAction(pendingAction);
        setPendingAction(null);
      }
    } catch (err) {
      console.error('Feedback failed', err);
      alert('Something went wrong submitting feedback, but thanks anyway!');
      setFeedbackSubmitted(true); // Let them proceed regardless of error to be nice
      setShowFeedbackModal(false);
      if (pendingAction) {
        executeAction(pendingAction);
        setPendingAction(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 relative">

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
            >
              <button onClick={() => setShowFeedbackModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star size={24} fill="currentColor" className="opacity-80" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">One quick question</h3>
                <p className="text-slate-500 text-sm mt-1">To {pendingAction === 'download' ? 'download' : 'share'} this diagram, please rate your experience. It helps me improve!</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 transition-transform hover:scale-110 focus:outline-none`}
                  >
                    <Star
                      size={32}
                      fill={rating >= star ? "#F59E0B" : "none"}
                      className={rating >= star ? "text-amber-500" : "text-slate-200"}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any suggestions? (Optional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none mb-6"
                rows={3}
              />

              <button
                onClick={submitFeedback}
                disabled={rating === 0}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Submit & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-0.5 rounded-lg text-white">
              <Asterisk size={28} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Qlarify</span>
          </div>
          {/* Removed Links as requested */}
          <div className="hidden md:flex items-center gap-8">
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v1.0 Public Beta
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1]">
            Turn text into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">system architectures.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop dragging rectangles. Just describe your system in plain English, and let our AI generate a clean, professional diagram instantly.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button onClick={() => toolRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
              Try it Free <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Main Tool Interface */}
      <section ref={toolRef} className="min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20" id="tool">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">

            {/* Input Panel */}
            <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50/50 flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Layout size={18} className="text-indigo-600" />
                  Input
                </h3>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">Plain Text</span>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  className="w-full h-full min-h-[300px] resize-none bg-transparent border-0 focus:ring-0 text-slate-600 text-base leading-relaxed p-0 placeholder:text-slate-300"
                  placeholder="e.g. User clicks login..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  spellCheck={false}
                />
              </div>
              <div className="p-4 border-t border-slate-200 bg-white">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Asterisk size={20} />}
                  {loading ? 'Generating...' : 'Generate System Flow'}
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="lg:col-span-8 bg-slate-100/50 relative flex flex-col">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={() => executeAction('download')}
                  className="bg-white p-2 text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                  title="Download"
                  disabled={!data}
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => executeAction('share')}
                  className="bg-white p-2 text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                  title="Share"
                  disabled={!data}
                >
                  <Share2 size={20} />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden bg-slate-50" ref={diagramRef}>
                {data ? (
                  <DiagramRenderer data={data} />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                    <div className="w-24 h-24 bg-slate-100 rounded-full mb-6 flex items-center justify-center animate-pulse">
                      <Asterisk size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Visualize</h3>
                    <p className="text-sm text-center max-w-xs">Describe your flow on the left and hit generate to see the magic happen.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white border-t border-slate-100" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Designed for Speed</h2>
            <p className="mt-4 text-slate-500">Everything you need to communicate architecture, faster.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Zap, title: 'Instant Generation', desc: 'No drag-and-drop. Just type and see results in milliseconds.' },
              { icon: Layout, title: 'Clean Defaults', desc: 'Opinionated, beautiful styles that look professional out of the box.' },
              { icon: Share, title: 'Easy Sharing', desc: 'Export to PNG/SVG or share a live URL with your team instantly.' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="bg-indigo-600 p-0.5 rounded-lg text-white">
              <Asterisk size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-lg text-slate-900">Qlarify</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 Qurtesy Labs. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
