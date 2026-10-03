/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  ShieldAlert, 
  ShieldCheck, 
  BookOpen, 
  Copy, 
  Check, 
  ExternalLink,
  Lock,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LEGAL_CHARTER, TermsSection } from '../data/terms';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  swahiliPreference: boolean;
  initialTab?: 'all' | 'reserved' | 'prohibited' | 'fairuse';
}

export default function LegalTermsModal({
  isOpen,
  onClose,
  swahiliPreference,
  initialTab = 'all'
}: LegalTermsModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'reserved' | 'prohibited' | 'fairuse'>(initialTab);
  const [copied, setCopied] = useState<boolean>(false);
  const [languageMode, setLanguageMode] = useState<'auto' | 'en' | 'sw'>('auto');

  if (!isOpen) return null;

  const isSwahili = languageMode === 'auto' ? swahiliPreference : languageMode === 'sw';

  const copyToClipboard = () => {
    let fullText = `${LEGAL_CHARTER.owner}\n${LEGAL_CHARTER.version} - ${LEGAL_CHARTER.lastUpdated}\n\n`;
    LEGAL_CHARTER.sections.forEach(sec => {
      fullText += `${isSwahili ? sec.titleSw : sec.titleEn}\n`;
      sec.items.forEach(item => {
        fullText += `• ${isSwahili ? item.headingSw : item.headingEn}: ${isSwahili ? item.contentSw : item.contentEn}\n`;
      });
      fullText += '\n';
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSections = activeTab === 'all' 
    ? LEGAL_CHARTER.sections 
    : LEGAL_CHARTER.sections.filter(s => s.id === activeTab);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-slate-900 border border-blue-950/90 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-blue-950/60 bg-slate-900/90 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-display font-medium text-white">
                    {isSwahili 
                      ? 'Mkataba wa Haki Zilizohifadhiwa na Vigezo Vilivyokatazwa' 
                      : 'Reserved Rights & Prohibited Terms Charter'}
                  </h3>
                  <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded-full">
                    {LEGAL_CHARTER.version}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isSwahili ? LEGAL_CHARTER.summarySw : LEGAL_CHARTER.summaryEn}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Controls Bar */}
          <div className="px-5 sm:px-6 py-3 border-b border-blue-950/40 bg-slate-950/50 flex items-center justify-between gap-3 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                {isSwahili ? 'Yote' : 'Full Charter'}
              </button>
              <button
                onClick={() => setActiveTab('reserved')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'reserved'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                <Lock className="w-3 h-3 text-blue-300" />
                {isSwahili ? 'Haki Zilizohifadhiwa' : 'Reserved Rights'}
              </button>
              <button
                onClick={() => setActiveTab('prohibited')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'prohibited'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-red-300" />
                {isSwahili ? 'Vigezo Vilivyokatazwa' : 'Prohibited Terms'}
              </button>
              <button
                onClick={() => setActiveTab('fairuse')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'fairuse'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                {isSwahili ? 'Ruhusa ya Mkulima' : 'Farmer Fair-Use'}
              </button>
            </div>

            {/* Quick Actions (Language & Copy) */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 border border-blue-950/80 rounded-lg p-0.5 text-[10px]">
                <button
                  onClick={() => setLanguageMode('en')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${!isSwahili ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguageMode('sw')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${isSwahili ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  SW
                </button>
              </div>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-blue-950 text-slate-300 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                title="Copy charter to clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="hidden sm:inline">{copied ? (isSwahili ? 'Imenakiliwa!' : 'Copied!') : (isSwahili ? 'Nakili' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow">
            {filteredSections.map(sec => (
              <div 
                key={sec.id}
                className={`p-5 rounded-2xl border transition-all ${
                  sec.id === 'prohibited'
                    ? 'bg-red-950/15 border-red-900/35'
                    : sec.id === 'reserved'
                    ? 'bg-blue-950/20 border-blue-900/40'
                    : 'bg-emerald-950/15 border-emerald-900/35'
                }`}
              >
                {/* Section Title */}
                <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5 flex-wrap">
                  <div className="flex items-center gap-2">
                    {sec.id === 'prohibited' && <ShieldAlert className="w-4 h-4 text-red-400" />}
                    {sec.id === 'reserved' && <Lock className="w-4 h-4 text-blue-400" />}
                    {sec.id === 'fairuse' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    <h4 className="text-sm font-semibold text-white">
                      {isSwahili ? sec.titleSw : sec.titleEn}
                    </h4>
                  </div>
                  {sec.badge && (
                    <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-semibold ${
                      sec.id === 'prohibited'
                        ? 'bg-red-900/40 text-red-300 border border-red-800/40'
                        : sec.id === 'reserved'
                        ? 'bg-blue-900/40 text-blue-300 border border-blue-800/40'
                        : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/40'
                    }`}>
                      {sec.badge}
                    </span>
                  )}
                </div>

                {/* Section Items */}
                <div className="space-y-4">
                  {sec.items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 space-y-1"
                    >
                      <h5 className={`text-xs font-semibold ${
                        item.prohibited ? 'text-red-300' : item.reserved ? 'text-blue-300' : 'text-emerald-300'
                      }`}>
                        {isSwahili ? item.headingSw : item.headingEn}
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {isSwahili ? item.contentSw : item.contentEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Official Legal Footer Citation */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-blue-950/60 text-center space-y-1">
              <p className="text-[11px] font-mono text-slate-400">
                &copy; {LEGAL_CHARTER.copyrightYear} {LEGAL_CHARTER.owner} &bull; All Rights Reserved.
              </p>
              <p className="text-[10px] text-slate-500">
                {isSwahili 
                  ? 'Ilisasishwa mwezi Oktoba 2026. Mfumo huu unazingatia miongozo ya kisayansi ya kilimo cha kisasa.' 
                  : 'Last modified October 2026. Governed under open agricultural integrity and fair data exchange.'}
              </p>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 sm:p-5 border-t border-blue-950/60 bg-slate-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isSwahili ? 'Utekelezaji wa Sera: Unaendelea Kikamilifu' : 'Policy Status: Actively Enforced'}</span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {isSwahili ? 'Funga Dirisha' : 'Close Charter'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
