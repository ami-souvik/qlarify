"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { ArrowRight, Box, Shield, Zap, Share2, Star, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import LoggedInBadge from '@/components/LoggedInBadge';
import QlarifyLogo from '@/components/QlarifyLogo';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/app');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 relative overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <QlarifyLogo />
          <div className="flex items-center gap-6">
            <Link href="#features" className="hidden md:block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Features
            </Link>
            <Link href="/blog" className="hidden md:block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Blog
            </Link>
            <LoggedInBadge />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              BETA
            </div>

            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
              Modeling for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Principal Architects.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
              Discard drawing tools. Start reasoning with AI. Qlarify is the structured canonical model for your entire system architecture.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link
                href="/login"
                className="bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <Link
                href="https://github.com"
                className="bg-white text-slate-700 border border-slate-200 px-10 py-4 rounded-full text-lg font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Github size={20} /> Enterprise
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Box className="text-indigo-600" />}
              title="Canonical Modeling"
              description="Define hierarchical entities from Systems down to Components with strict structural validation."
            />
            <FeatureCard
              icon={<Zap className="text-purple-600" />}
              title="AI Ghost Layer"
              description="AI acts as a reasoning assistant, suggesting improvements without direct mutation of state."
            />
            <FeatureCard
              icon={<Shield className="text-blue-600" />}
              title="Verifiable Design"
              description="Automatically detect circular dependencies and service boundary violations in real-time."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by leading engineering teams</p>
          <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-40">
            <div className="text-2xl font-bold">MONZO</div>
            <div className="text-2xl font-bold">STRIPE</div>
            <div className="text-2xl font-bold">VERCEL</div>
            <div className="text-2xl font-bold">DATADOG</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-white">
            <Box size={24} className="text-indigo-500" />
            <span className="font-bold text-xl tracking-tight">Qlarify</span>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          </div>
          <div className="text-sm">
            © 2026 Qlarify AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl transition-all group">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
