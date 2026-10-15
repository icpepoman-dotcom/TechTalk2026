import React, { useState } from 'react';
import { Check, Award, Sparkles, MapPin, Globe, GraduationCap, ShieldCheck, ArrowRight, Edit, Link2, ExternalLink } from 'lucide-react';
import { useEventData } from '../context/EventDataContext';
import { RegistrationLinksModal } from './RegistrationLinksModal';

interface RegistrationSectionProps {
  onSelectTier: (tierId: string) => void;
  onOpenLinksModal?: (tierId?: string) => void;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({ onSelectTier, onOpenLinksModal }) => {
  const { registrationTiers, eventDetails, isPublishMode } = useEventData();
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
  const [selectedTierForEdit, setSelectedTierForEdit] = useState<string | undefined>(undefined);

  const handleOpenEditLinks = (tierId?: string) => {
    if (onOpenLinksModal) {
      onOpenLinksModal(tierId);
    } else {
      setSelectedTierForEdit(tierId);
      setIsLocalModalOpen(true);
    }
  };

  return (
    <section id="registration" className="py-16 lg:py-24 bg-[#071326] border-b border-[#e5b94c]/20 relative overflow-hidden">
      {/* Background subtle circuit glow */}
      <div className="absolute inset-0 bg-circuit-pattern opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#e5b94c] font-semibold">
              Registration & Ticketing
            </span>
          </div>

          <h2 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Choose Your Conference Pass
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            Select your preferred participation track. Limited capacity at Wyndham Hotel Muscat — reserve your in-person or virtual pass today.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 text-xs text-[#fcedbe] bg-[#0a1b35] px-3.5 py-1.5 rounded-full border border-[#e5b94c]/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Only <strong>{eventDetails.slotsRemaining} slots</strong> remaining for In-Person Gala Night</span>
            </div>

            {/* Edit All Registration Links Button (Visible only in draft/edit mode) */}
            {!isPublishMode && (
              <button
                onClick={() => handleOpenEditLinks()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0f2448] text-[#fcedbe] border border-[#e5b94c]/60 hover:bg-[#163363] hover:border-[#e5b94c] transition-all text-xs font-bold shadow-md cursor-pointer group"
                title="Edit redirect link for all registration buttons"
              >
                <Edit className="w-3.5 h-3.5 text-[#e5b94c] group-hover:scale-110 transition-transform" />
                <span>Edit All Registration Links & Redirects</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Side-By-Side Registration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {registrationTiers.map((tier) => {
            const isF2F = tier.type === 'in-person';
            const isStudent = tier.type === 'student';
            const hasCustomRedirect = tier.redirectUrl && tier.redirectUrl.trim().length > 0;

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl flex flex-col justify-between transition-all duration-300 p-6 sm:p-8 ${
                  tier.recommended
                    ? 'bg-gradient-to-b from-[#0f2448] via-[#0a1b35] to-[#071326] border-2 border-[#e5b94c] shadow-2xl shadow-[#e5b94c]/15 lg:-translate-y-2'
                    : 'bg-[#0a1b35]/80 border border-[#e5b94c]/25 hover:border-[#e5b94c]/60 shadow-lg'
                }`}
              >
                {/* Recommended Badge / Corner Flairs */}
                {tier.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Most Popular · Hybrid Eligible</span>
                  </div>
                )}

                {tier.badge && (
                  <div className="absolute top-4 right-4 bg-[#163363] text-[#fcedbe] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border border-[#e5b94c]/40">
                    {tier.badge}
                  </div>
                )}

                <div>
                  {/* Mode Indicator */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#e5b94c] mb-2 uppercase tracking-wider">
                    {isF2F ? (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-[#e5b94c]" />
                        <span>In-Person Conference & Gala</span>
                      </>
                    ) : isStudent ? (
                      <>
                        <GraduationCap className="w-3.5 h-3.5 text-[#e5b94c]" />
                        <span>Online Academic Track</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5 text-[#e5b94c]" />
                        <span>Online Professional Track</span>
                      </>
                    )}
                  </div>

                  {/* Tier Title & Subtitle */}
                  <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 min-h-[32px]">
                    {tier.subtitle}
                  </p>

                  {/* Price */}
                  <div className="mt-5 pb-5 border-b border-[#e5b94c]/20">
                    <div className="flex items-baseline gap-2">
                      <span className="font-cinzel text-3xl sm:text-4xl font-black text-[#fcedbe]">
                        {tier.priceOman}
                      </span>
                      <span className="text-xs text-slate-400">
                        / delegate ({tier.pricePhp})
                      </span>
                    </div>

                    {/* CPD Callout on Card */}
                    <div className="mt-3 p-2.5 rounded-lg bg-[#071326]/75 border border-[#e5b94c]/25 text-xs text-[#fcedbe] flex items-start gap-2">
                      <Award className="w-4 h-4 text-[#e5b94c] shrink-0 mt-0.5" />
                      <span className="leading-tight font-medium">
                        {tier.cpdValue}
                      </span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-6 space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Pass Inclusions:
                    </div>
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <Check className="w-4 h-4 text-[#e5b94c] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Register CTA & Edit Redirect Button */}
                <div className="mt-8 pt-6 border-t border-[#e5b94c]/20 space-y-2">
                  <button
                    onClick={() => onSelectTier(tier.id)}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      tier.recommended
                        ? 'bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] hover:brightness-110 shadow-lg shadow-[#c9982a]/20'
                        : 'bg-[#0f2448] text-slate-100 border border-[#e5b94c]/40 hover:bg-[#163363] hover:text-[#fcedbe]'
                    }`}
                  >
                    <span>Register as {tier.name}</span>
                    {hasCustomRedirect ? (
                      <ExternalLink className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>

                  <div className="text-center text-[10px] text-slate-400">
                    {hasCustomRedirect
                      ? 'Opens registration portal in new tab'
                      : 'Instant confirmation & digital delegate badge'}
                  </div>

                  {/* Inline Edit Link Button (Shown only in Edit Mode) */}
                  {!isPublishMode && (
                    <div className="pt-2 border-t border-[#e5b94c]/15 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenEditLinks(tier.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] text-[#e5b94c] hover:text-[#fcedbe] bg-[#071326] hover:bg-[#163363] px-2.5 py-1 rounded border border-[#e5b94c]/30 hover:border-[#e5b94c] transition-all cursor-pointer"
                        title={`Edit custom redirect link for ${tier.name}`}
                      >
                        <Edit className="w-3 h-3 text-[#e5b94c]" />
                        <span>Edit Redirect Link</span>
                      </button>

                      {hasCustomRedirect ? (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Redirect Set</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Standard Form
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mandatory Repeated CPD Callout below the three cards */}
        <div className="rounded-xl bg-gradient-to-r from-[#0a1b35] via-[#0f2448] to-[#0a1b35] border border-[#e5b94c]/50 p-5 sm:p-6 text-center shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#e5b94c] font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-[#e5b94c]" />
            <span>Hybrid Accreditation Reminder</span>
          </div>
          <p className="font-cinzel text-base sm:text-lg lg:text-xl font-bold text-slate-100 max-w-4xl mx-auto leading-relaxed">
            "Register for both the face-to-face track and an online track to attend the full hybrid event and earn <span className="text-gold-gradient underline decoration-[#e5b94c]/50">10 CPD units</span> in a single registration."
          </p>
        </div>
      </div>

      {/* Local Links Modal fallback */}
      <RegistrationLinksModal
        isOpen={isLocalModalOpen}
        onClose={() => setIsLocalModalOpen(false)}
        initialTierId={selectedTierForEdit}
      />
    </section>
  );
};
