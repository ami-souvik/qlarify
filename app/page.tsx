"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Box, Shield, Zap, MessageSquare, Layout, Layers, Database, Cpu, Share2, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import LoggedInBadge from '@/components/LoggedInBadge';
import QlarifyLogo from '@/components/QlarifyLogo';

function FeatureIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-orange-100 shadow-sm transition-all hover:shadow-md hover:border-orange-200 group">
      <div className="text-orange-600 transition-transform group-hover:scale-110">{icon}</div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{label}</span>
    </div>
  );
}

function FloatingCard({ icon, title, description, delay, className }: { icon: React.ReactNode, title: string, description: string, delay: number, className: string }) {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      whileHover={{ cursor: 'grab', scale: 1.02 }}
      whileDrag={{ cursor: 'grabbing', scale: 1.1, zIndex: 50 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`absolute hidden lg:flex flex-col gap-2 p-4 bg-white rounded-2xl border border-orange-100 shadow-xl z-20 w-48 ${className}`}
    >
      <div className="flex items-center gap-2 text-orange-600 pointer-events-none">
        {icon}
        <span className="font-bold text-xs uppercase tracking-tighter text-slate-800">{title}</span>
      </div>
      <p className="text-[10px] text-slate-500 leading-tight pointer-events-none">{description}</p>
    </motion.div>
  );
}

export default function Home() {
  const [projectIdea, setProjectIdea] = useState('')

  const handleSignIn = () => { }

  return (
    <div className="min-h-screen bg-ivory text-charcoal font-sans relative overflow-x-hidden">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]"
        style={{ backgroundImage: 'radial-gradient(#D9775762 1.5px, transparent 0.5px)', backgroundSize: '28px 28px' }}>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-ivory/80 backdrop-blur-md border-b border-[#EEE9E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <QlarifyLogo />
          <div className="flex items-center gap-8">
            <Link href="#features" className="hidden md:block text-sm font-semibold text-slate-600 hover:text-[#D97757] transition-colors">
              Features
            </Link>
            <Link href="/blog" className="hidden md:block text-sm font-semibold text-slate-600 hover:text-[#D97757] transition-colors">
              Blog
            </Link>
            <LoggedInBadge />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative flex min-h-screen items-center justify-center pt-20 px-4 pb-32">
        <div className="max-w-4xl w-full z-10 text-center relative">

          {/* Floating Elements for Context */}
          <FloatingCard
            icon={<Cpu size={16} />}
            title="System Map"
            description="AI analyzes your prompt to generate hierarchical service maps."
            delay={0.2}
            className="-left-32 top-10"
          />
          <FloatingCard
            icon={<Shield size={16} />}
            title="Boundary Check"
            description="Automatic detection of circular dependencies and domain violations."
            delay={0.4}
            className="-right-24 top-24"
          />
          <FloatingCard
            icon={<Code size={16} />}
            title="API Specs"
            description="Instant generation of OpenAPI and Proto definitions from diagrams."
            delay={0.6}
            className="-left-20 bottom-10"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100/50 text-[#D97757] text-[10px] font-bold tracking-widest uppercase mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              The Future of Architecture
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-[#1A1A1A] tracking-tighter mb-8 leading-[0.9]">
              Architect your vision, <br />
              <span className="text-[#D97757]">effortlessly.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mx-auto mb-12">
              Turn complex system ideas into verifiable, production-grade architectures in seconds. Stop drawing, start building.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-[2.5rem] p-3 shadow-2xl shadow-orange-900/5 border border-orange-100 max-w-3xl mx-auto"
          >
            <div className="flex flex-wrap gap-3 mb-4 px-2 pt-2">
              <FeatureIcon icon={<Layout size={14} />} label="DDD Domains" />
              <FeatureIcon icon={<Layers size={14} />} label="Service Map" />
              <FeatureIcon icon={<Database size={14} />} label="Canonical Model" />
            </div>

            <div className="relative group">
              <textarea
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                placeholder="Describe your system (e.g., 'A fintech platform with real-time fraud detection and multi-currency support'...)"
                className="w-full h-64 rounded-3xl border-none bg-slate-50/70 p-8 text-lg focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all resize-none shadow-inner"
              />
              <button
                onClick={handleSignIn}
                disabled={!projectIdea.trim()}
                className="absolute bottom-6 right-6 bg-[#1A1A1A] hover:bg-[#D97757] text-white rounded-2xl px-8 py-4 font-bold flex items-center gap-3 transition-all transform active:scale-95 hover:shadow-2xl disabled:opacity-30 group"
              >
                Qlarify System <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How it Works */}
      <section className="py-12 pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <Step
              number="01"
              title="Describe your vision"
              description="Input your system requirements in plain English. Our AI understands high-level intent."
            />
            <Step
              number="02"
              title="AI Reasoning"
              description="The AI co-pilot suggests domains, services, and data models based on best practices."
            />
            <Step
              number="03"
              title="Architect & Export"
              description="Verify your design and export it as production-ready diagrams or specifications."
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#1A1A1A] mb-4">
              Infrastructure as <span className="text-[#D97757]">Intuition</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
              Everything you need to design, verify, and document complex systems with AI-guided precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Box size={24} className="text-[#D97757]" />}
              title="Canonical Modeling"
              description="Define hierarchical entities from Systems down to Components with built-in structural validation."
            />
            <FeatureCard
              icon={<Zap size={24} className="text-orange-500" />}
              title="AI Reasoning Layer"
              description="An intelligent co-pilot that suggests architectural patterns without forcing magic changes."
            />
            <FeatureCard
              icon={<Shield size={24} className="text-orange-400" />}
              title="Verifiable Design"
              description="Real-time detection of anti-patterns, circular dependencies, and service boundary leaks."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-[#FAF9F6] border-y border-[#EEE9E2]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-black text-[#D97757] uppercase tracking-[0.3em] mb-12">Architecture powering the elite</p>
          <div className="flex flex-wrap justify-center items-center gap-16 grayscale opacity-60 contrast-125">
            <div className="text-3xl font-black italic tracking-tighter">MONZO</div>
            <div className="text-3xl font-black italic tracking-tighter">STRIPE</div>
            <div className="text-3xl font-black italic tracking-tighter">VERCEL</div>
            <div className="text-3xl font-black italic tracking-tighter">DATADOG</div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-32 bg-[#1A1A1A] relative overflow-hidden">
        {/* Abstract background effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#D97757 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-orange-600 text-white mb-4 shadow-2xl shadow-orange-600/20 transform -rotate-3">
              <MessageSquare size={48} />
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              Build the future <br /> with us.
            </h2>
            <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Join 5,000+ architects and engineers shaping the next generation of system modeling tools.
            </p>
            <div className="pt-6">
              <Link
                href="https://discord.gg/852AQe22"
                target="_blank"
                className="inline-flex items-center gap-3 bg-white text-[#1A1A1A] px-12 py-5 rounded-3xl text-xl font-black hover:bg-orange-50 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-1 group"
              >
                Join our Discord <Share2 size={24} className="group-hover:rotate-12 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-20 text-slate-500 border-t border-[#EEE9E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <Box size={32} className="text-[#D97757]" />
              <span className="font-black text-3xl tracking-tighter">Qlarify</span>
            </div>
            <p className="text-sm font-medium">The architectural co-pilot for high-scale teams.</p>
          </div>

          <div className="flex gap-12 text-sm font-black uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-[#D97757] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#D97757] transition-colors">Terms</Link>
            <Link href="/blog" className="hover:text-[#D97757] transition-colors">Blog</Link>
            <Link href="https://discord.gg/852AQe22" target="_blank" className="hover:text-[#D97757] transition-colors inline-flex items-center gap-2">Discord</Link>
          </div>

          <div className="text-xs font-bold text-slate-400">
            © 2026 Qlarify AI. <br className="md:hidden" /> Crafted for clarity.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 bg-[#FAF9F6] rounded-[2.5rem] border border-transparent hover:border-orange-100 hover:bg-white hover:shadow-2xl hover:shadow-orange-900/5 transition-all group relative overflow-hidden">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-orange-50 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-[#1A1A1A] mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{description}</p>

      {/* Subtle indicator */}
      <div className="absolute right-8 top-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight size={20} className="text-orange-200" />
      </div>
    </div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="group">
      <div className="text-6xl font-black text-[#D97757]/10 group-hover:text-[#D97757]/20 transition-colors mb-4">{number}</div>
      <h3 className="text-xl font-black text-[#1A1A1A] mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
