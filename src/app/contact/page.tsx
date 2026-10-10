'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'customer',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-5 sm:px-8 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#047857] border border-[#A7F3D0] mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
            Contact &amp; Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">
            Get in touch with <span className="text-[#10B981]">SpatialAI</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#475569]">
            Have inquiries about our AI room reasoning platform, 3D catalog integrations, or retail partnership opportunities? We are here to assist.
          </p>
        </div>

        {/* 2-Column Contact Info + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] card-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2.5 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">Customer Support</h2>
                  <p className="text-xs text-[#64748B]">General questions &amp; room visualizer help</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#047857]">support@spatialfurniture.ai</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] card-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2.5 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">Retail Partnerships</h2>
                  <p className="text-xs text-[#64748B]">Catalog onboarding &amp; spatial API access</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#047857]">retail@spatialfurniture.ai</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] card-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2.5 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">Operating Hours</h2>
                  <p className="text-xs text-[#64748B]">Support desk response window</p>
                </div>
              </div>
              <p className="text-xs text-[#475569]">Monday &ndash; Friday &bull; 9:00 AM &ndash; 6:00 PM EST</p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-[#E2E8F0] card-shadow">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#111827]">Message Received</h2>
                <p className="text-sm text-[#475569] max-w-md mx-auto">
                  Thank you for reaching out, <span className="font-semibold text-[#111827]">{formData.name}</span>. Our team will review your message and reply via email within 24 hours.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', inquiryType: 'customer', message: '' });
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-colors"
                  >
                    Send another message
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#10B981] text-white hover:bg-[#059669] transition-colors shadow-sm"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">Send Us a Message</h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Fill out the form below and we will route your inquiry to the appropriate specialist.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                      Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#111827] text-xs placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#111827] text-xs placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="inquiryType" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                    Inquiry Category
                  </label>
                  <select
                    id="inquiryType"
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#111827] text-xs focus:bg-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                  >
                    <option value="customer">Customer Furniture Visualization &amp; Account</option>
                    <option value="retailer">Retailer Catalog &amp; Storefront Integration</option>
                    <option value="3d-ai">Gemini AI &amp; Spatial Computing Inquiry</option>
                    <option value="other">General Question</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    placeholder="How can we help your spatial furniture journey?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="block w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#111827] text-xs placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-[#10B981] hover:bg-[#059669] px-5 py-3 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
