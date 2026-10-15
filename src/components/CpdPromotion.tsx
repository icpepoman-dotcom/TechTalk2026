import React from 'react';
import { Award, CheckCircle2, ArrowRight, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import { useEventData } from '../context/EventDataContext';

interface CpdPromotionProps {
  onRegisterHybrid: () => void;
}

export const CpdPromotion: React.FC<CpdPromotionProps> = ({ onRegisterHybrid }) => {
  const { cpdData } = useEventData();

  return (
    <section id="cpd-units" className="relative py-12 lg:py-16 bg-[#040c1a] border-b border-[#e5b94c]/30 overflow-hidden">
      {/* Circuit overlay */}
      <div className="absolute inset-0 bg-circuit-pattern opacity-40 pointer-events-none" />

      {/* Radiant glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-64 bg-[#e5b94c]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-b from-[#0f2448] via-[#0a1b35] to-[#071326] border-2 border-[#e5b94c] shadow-2xl shadow-[#e5b94c]/10 p-6 sm:p-10 lg:p-12 overflow-hidden">
          {/* Decorative Corner Filigree Accents */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#fcedbe] pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#fcedbe] pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#fcedbe] pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#fcedbe] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Big Gold Seal & Accents */}
            <div className="lg:col-span-4 flex flex-col items-center text-center p-4 sm:p-6 bg-[#071326]/80 rounded-xl border border-[#e5b94c]/40">
              <div className="relative mb-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#fcedbe] via-[#e5b94c] to-[#9e731b] flex items-center justify-center p-1 shadow-lg shadow-[#e5b94c]/25">
                  <div className="w-full h-full rounded-full bg-[#071326] flex flex-col items-center justify-center border border-[#fcedbe]/40 text-center px-2">
                    <Award className="w-8 h-8 text-[#e5b94c] mb-1" />
                    <span className="font-cinzel text-xl sm:text-2xl font-black text-[#fcedbe] leading-none">
                      {cpdData.units}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#e5b94c]">
                      {cpdData.badgeLabel}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#163363] border border-[#e5b94c] p-1.5 rounded-full">
                  <Sparkles className="w-4 h-4 text-[#fcedbe]" />
                </div>
              </div>

              <h4 className="font-cinzel text-lg font-bold text-[#fcedbe] tracking-wide">
                Professional Regulation Commission
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Official Continuing Professional Development Credit Allocation
              </p>
              <div className="mt-4 pt-3 border-t border-[#e5b94c]/20 w-full flex items-center justify-around text-xs text-slate-300">
                <span>Single Registration</span>
                <span>·</span>
                <span>Full Hybrid Pass</span>
              </div>
            </div>

            {/* Right Column: Statement & Value Breakdown */}
            <div className="lg:col-span-8 space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-bold tracking-[0.2em] text-[#e5b94c] uppercase">
                  Hybrid Accreditation Spotlight
                </div>
                <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 leading-tight">
                  {cpdData.headlinePrefix} <br className="hidden sm:inline" />
                  <span className="text-gold-gradient">
                    {cpdData.headlineHighlight}
                  </span>
                  {cpdData.headlineSuffix}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-[#071326]/60 p-4 rounded-lg border border-[#e5b94c]/20">
                {cpdData.paragraphText}
              </p>

              {/* What makes up the units */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#071326]/50 border border-[#e5b94c]/25">
                  <CheckCircle2 className="w-4 h-4 text-[#e5b94c] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block">{cpdData.f2fBulletTitle}</strong>
                    {cpdData.f2fBulletText}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#071326]/50 border border-[#e5b94c]/25">
                  <CheckCircle2 className="w-4 h-4 text-[#e5b94c] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block">{cpdData.virtualBulletTitle}</strong>
                    {cpdData.virtualBulletText}
                  </div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#e5b94c]/20">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#e5b94c]" />
                    <span>PRC Credited</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#e5b94c]" />
                    <span>Certificate Included</span>
                  </span>
                </div>

                <button
                  onClick={onRegisterHybrid}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-[#071326] bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] rounded-lg hover:brightness-110 shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{cpdData.buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-[#071326]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

