'use client';

import React, { useState } from 'react';
import { RoomAnalysisData } from '@/lib/ai/types';
import { Product, FurnitureCustomization } from '@/lib/types';

interface RoomAnalysisDashboardProps {
  data: RoomAnalysisData;
  product: Product;
  customization: FurnitureCustomization;
  onReanalyze?: () => void;
  isAnalyzing?: boolean;
}

export default function RoomAnalysisDashboard({
  data,
  product,
  customization,
  onReanalyze,
  isAnalyzing = false,
}: RoomAnalysisDashboardProps) {
  // Track open/collapsed state for each card
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    observations: true,
    lighting: true,
    compatibility: true,
    spatial: true,
    placement: true,
    constraints: true,
  });

  const allOpen = Object.values(openSections).every(Boolean);

  const toggleAll = () => {
    const nextState = !allOpen;
    setOpenSections({
      observations: nextState,
      lighting: nextState,
      compatibility: nextState,
      spatial: nextState,
      placement: nextState,
      constraints: nextState,
    });
  };

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const score = data.furnitureCompatibility.styleScore;
  const scoreColor =
    score >= 80
      ? 'text-[#047857] bg-[#ECFDF5] border-[#A7F3D0]'
      : score >= 60
      ? 'text-[#0369A1] bg-[#F0F9FF] border-[#BAE6FD]'
      : 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]';

  return (
    <div className="space-y-6 mt-8 animate-fadeIn" id="spatial-room-analysis-report">
      {/* Top Banner / Dashboard Header */}
      <div className="bg-gradient-to-r from-[#F0FDF4] via-white to-[#F8FAFC] border border-[#A7F3D0] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                Spatial Layout & Compatibility Report
              </h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Multimodal interior analysis for{' '}
              <span className="font-semibold text-[#111827]">{product.name}</span> (
              {customization.width}&times;{customization.height}&times;{customization.depth} cm)
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Compatibility Score Pill */}
            <div
              className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm ${scoreColor}`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>{score}% Compatibility Score</span>
            </div>

            {/* Room Type Tag */}
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#475569] shadow-sm">
              {data.roomObservations.roomType}
            </span>

            {/* Master Expand/Collapse Toggle */}
            <button
              onClick={toggleAll}
              className="px-3 py-1.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#475569] transition-colors flex items-center gap-1 shadow-sm"
              title={allOpen ? 'Collapse all sections' : 'Expand all sections'}
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${allOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>{allOpen ? 'Collapse All' : 'Expand All'}</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Callout */}
        <div className="mt-4 pt-1 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#047857] shadow-sm shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#047857] uppercase tracking-wider mb-0.5">
              Executive Evaluation
            </h4>
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-normal">
              {data.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid: 2 columns on desktop/tablet, 1 column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CARD 1: Room & Architectural Observations */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('observations')}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#F0FDF4] text-[#047857] border border-[#DCFCE7]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                  Room Architecture & Layout
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  Type: <span className="font-semibold text-[#334155]">{data.roomObservations.roomType}</span>
                </p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                openSections.observations ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openSections.observations && (
            <div className="px-4 pb-5 sm:px-5 border-t border-[#F1F5F9] pt-4 space-y-3.5">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Layout Perimeter
                </span>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {data.roomObservations.layoutDescription}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                  Visible Architectural Landmarks
                </span>
                <ul className="space-y-1.5">
                  {data.roomObservations.visibleFeatures.map((feature, idx) => (
                    <li key={idx} className="text-xs text-[#334155] flex items-start gap-2">
                      <span className="text-[#10B981] mt-0.5 shrink-0">&#10003;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* CARD 2: Lighting & Color Palette */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('lighting')}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                  Lighting & Color Palette
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  {data.lightingAndPalette.colorPalette.length} dominant tones identified
                </p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                openSections.lighting ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openSections.lighting && (
            <div className="px-4 pb-5 sm:px-5 border-t border-[#F1F5F9] pt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Natural Light
                  </span>
                  <p className="text-[#334155] leading-relaxed">
                    {data.lightingAndPalette.naturalLight}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                    Artificial Fixtures
                  </span>
                  <p className="text-[#334155] leading-relaxed">
                    {data.lightingAndPalette.artificialLight}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                  Observed Room Palette
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.lightingAndPalette.colorPalette.map((color, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-medium text-[#334155]"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]/60 inline-block border border-black/10"></span>
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs">
                <span className="text-[11px] font-bold text-[#047857] uppercase tracking-wider block mb-1">
                  Finish & Lighting Interaction ({customization.finish})
                </span>
                <p className="text-[#166534] leading-relaxed">
                  {data.lightingAndPalette.finishInteraction}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CARD 3: Furniture Compatibility & Style */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('compatibility')}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                  Furniture Style & Material Compatibility
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  {customization.color} &bull; {customization.material} &bull; {product.style}
                </p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                openSections.compatibility ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openSections.compatibility && (
            <div className="px-4 pb-5 sm:px-5 border-t border-[#F1F5F9] pt-4 space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#475569]">Overall Style Harmony</span>
                  <span className="text-[#047857] font-bold">{score}% Match</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
                    Aesthetic Match ({product.style})
                  </span>
                  <p className="text-[#334155] leading-relaxed">
                    {data.furnitureCompatibility.styleHarmony}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
                    Color Coordination ({customization.color})
                  </span>
                  <p className="text-[#334155] leading-relaxed">
                    {data.furnitureCompatibility.colorCoordination}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
                    Material Synergy ({customization.material})
                  </span>
                  <p className="text-[#334155] leading-relaxed">
                    {data.furnitureCompatibility.materialSynergy}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARD 4: Spatial Scale & Walkway Clearances */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('spatial')}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                  Spatial Proportions & Walkway Clearances
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  Scale: {customization.width}&times;{customization.height}&times;{customization.depth} cm
                </p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                openSections.spatial ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openSections.spatial && (
            <div className="px-4 pb-5 sm:px-5 border-t border-[#F1F5F9] pt-4 space-y-3.5">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Visual Scale Evaluation
                </span>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {data.spatialConsiderations.estimatedScaleFit}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Walkway Circulation
                </span>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {data.spatialConsiderations.clearanceNotes}
                </p>
              </div>

              {/* Distinction between visual estimate and physical measurement */}
              <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#B45309] mb-1.5 uppercase tracking-wider text-[11px]">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>Measurement Verification Advisory</span>
                </div>
                <ul className="space-y-1 text-[#92400E]">
                  {data.spatialConsiderations.measurementDisclaimers.map((disclaimer, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="mt-0.5 shrink-0">&bull;</span>
                      <span>{disclaimer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* CARD 5: Placement Recommendations & Ergonomics */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('placement')}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                  Suggested Placement & Practical Considerations
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  Ergonomics &bull; Access &bull; Clearances
                </p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                openSections.placement ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openSections.placement && (
            <div className="px-4 pb-5 sm:px-5 border-t border-[#F1F5F9] pt-4 space-y-3.5">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[11px] font-bold text-[#047857] uppercase tracking-wider block mb-1">
                  Recommended Location
                </span>
                <p className="text-xs font-semibold text-[#111827] mb-1">
                  {data.placementRecommendations.suggestedSpot}
                </p>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {data.placementRecommendations.reasoning}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                  Practical Placement Considerations
                </span>
                <ul className="space-y-1.5">
                  {data.placementRecommendations.practicalTips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-[#334155] flex items-start gap-2">
                      <span className="text-[#0284C7] mt-0.5 shrink-0">&#8594;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* CARD 6: Constraints & User Next Steps */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('constraints')}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                  Constraints & Next Steps Checklist
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  {data.userNextSteps.length} action items before ordering
                </p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                openSections.constraints ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openSections.constraints && (
            <div className="px-4 pb-5 sm:px-5 border-t border-[#F1F5F9] pt-4 space-y-3.5">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                  Blind Spots & Unverified Constraints
                </span>
                <ul className="space-y-1">
                  {data.constraintsAndUncertainties.map((item, idx) => (
                    <li key={idx} className="text-xs text-[#64748B] flex items-start gap-2">
                      <span className="text-[#94A3B8] mt-0.5 shrink-0">&ndash;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#047857] uppercase tracking-wider block mb-2">
                  Actionable Checklist for Customer
                </span>
                <div className="space-y-2">
                  {data.userNextSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5 text-xs text-[#1E293B]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Re-analyze Action footer */}
      {onReanalyze && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-[#64748B]">
          <p>
            Insights derived with Gemini 2.5 Flash from visible photo evidence. Not a substitute for tape measurement.
          </p>
          <button
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <svg
              className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isAnalyzing ? 'Re-analyzing...' : 'Refresh Analysis'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
