'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getFirebaseConsoleTemplateConfig } from '@/lib/email/verificationEmail';

export default function EmailPreviewPage() {
  const [recipientName, setRecipientName] = useState('Alex Chen');
  const [recipientEmail, setRecipientEmail] = useState('alex.chen@example.com');
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedType, setCopiedType] = useState<'html' | 'text' | null>(null);

  const previewUrl = `/api/auth/email-template?format=html&name=${encodeURIComponent(recipientName)}&email=${encodeURIComponent(recipientEmail)}`;
  const consoleConfig = getFirebaseConsoleTemplateConfig();

  const copyToClipboard = (text: string, type: 'html' | 'text') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Email Design System
              </span>
              <span className="text-xs text-slate-400">Production Template Preview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Spatial Furniture AI &mdash; Verification Email
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Responsive HTML email with amber call-to-action button, dark luxury styling, and bulletproof client support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/verify-email"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              &larr; View Verification Page
            </Link>
            <a
              href="/api/auth/email-template?format=html"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all"
            >
              Open Raw HTML Email &rarr;
            </a>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#111827] border border-slate-800 p-4 rounded-2xl">
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="md:col-span-7 flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0">
            {/* Viewport Toggles */}
            <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Desktop (600px)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mobile (375px)
              </button>
            </div>

            {/* View Tabs */}
            <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-slate-800 text-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Visual Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('console')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'console'
                    ? 'bg-slate-800 text-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Firebase Console Setup
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Visual Preview */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Simulated rendering with prominent amber <strong>&quot;Verify Email Address&quot;</strong> button</span>
              <span className="font-mono text-amber-400">Target action: /auth/action</span>
            </div>

            <div className="flex justify-center bg-slate-950/60 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[700px] overflow-auto">
              <div 
                className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0B0F19] ${
                  viewMode === 'desktop' ? 'w-[640px]' : 'w-[375px]'
                }`}
              >
                {/* Browser/Device Bar */}
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                    Inbox &bull; Spatial Furniture AI
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">
                    {viewMode}
                  </span>
                </div>

                <iframe
                  title="Verification Email Preview"
                  src={previewUrl}
                  className="w-full h-[650px] border-none bg-[#0B0F19]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Firebase Console Instructions */}
        {activeTab === 'console' && (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Firebase Console Configuration Guide
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Spark Plan Compatible
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                How to configure Firebase Console to deliver this branded verification email
              </h2>
              <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-amber-400">Important Firebase Spark Plan Limitation Note:</p>
                <p className="leading-relaxed">
                  Firebase Authentication delivers verification emails from Google&apos;s mail infrastructure. Changing files in your Next.js Git repository will <strong>not</strong> automatically change the emails delivered by Firebase. You must update the template in the <strong>Firebase Console</strong>.
                </p>
                <p className="leading-relaxed text-slate-400">
                  On the free Firebase Spark plan, standard templates support inline HTML formatting or clean plain text. Follow the 3 configuration steps below to match the branded design:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 1 */}
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                  1
                </div>
                <h3 className="font-bold text-sm text-white">Customize Action URL</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go to <strong>Firebase Console &rarr; Authentication &rarr; Templates &rarr; Email address verification</strong>.
                  Click the <strong>edit icon (pencil)</strong>, then click <strong>&quot;Customize action URL&quot;</strong> at the bottom.
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-amber-300 break-all border border-slate-800">
                  https://your-domain.vercel.app/auth/action
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                  2
                </div>
                <h3 className="font-bold text-sm text-white">Add Authorized Domain</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go to <strong>Authentication &rarr; Settings &rarr; Authorized domains</strong>.
                  Add your production Vercel domain (e.g., <code className="text-amber-300 font-mono">spatial-furniture-ai.vercel.app</code>).
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg text-[11px] text-slate-300 border border-slate-800">
                  Allows Firebase to redirect and authorize action codes securely.
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                  3
                </div>
                <h3 className="font-bold text-sm text-white">Sender &amp; Subject</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In the template settings, set the <strong>Sender name</strong> to <strong className="text-white">Spatial Furniture AI</strong> and the <strong>Subject</strong> to:
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-amber-300 border border-slate-800">
                  {consoleConfig.subject}
                </div>
              </div>
            </div>

            {/* Template Option 1: Styled HTML Message Body */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                    Option A: Styled HTML Message Body (Recommended)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Paste directly into the Message body in Firebase Console for rich dark navy &amp; white card styling.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(consoleConfig.recommendedConsoleHtmlBody, 'html')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shrink-0"
                >
                  {copiedType === 'html' ? 'Copied HTML!' : 'Copy HTML Template'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-60">
                {consoleConfig.recommendedConsoleHtmlBody}
              </pre>
            </div>

            {/* Template Option 2: Clean Plain-Text Fallback */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                    Option B: Plain-Text Message Body (Standard Editor Fallback)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Use if your Firebase Console project strips HTML tags.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(consoleConfig.recommendedConsolePlainTextBody, 'text')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-amber-400 hover:bg-slate-700 border border-amber-500/30 transition-colors shrink-0"
                >
                  {copiedType === 'text' ? 'Copied Plain Text!' : 'Copy Plain Text'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto">
                {consoleConfig.recommendedConsolePlainTextBody}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
