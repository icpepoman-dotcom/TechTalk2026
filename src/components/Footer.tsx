import React from 'react';
import { QrCode, Mail, MapPin, Globe, Sparkles, Cpu, Users, Award, Heart, Shield, Lock } from 'lucide-react';
import { useEventData } from '../context/EventDataContext';

interface FooterProps {
  onRegisterClick: () => void;
  onOpenQr: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onRegisterClick, onOpenQr, onOpenAdmin }) => {
  const { eventDetails, isPublishMode } = useEventData();

  return (
    <footer className="relative bg-[#040c1a] border-t-2 border-[#e5b94c]/40 text-slate-300 overflow-hidden">
      {/* Background Circuit Overlay */}
      <div className="absolute inset-0 bg-circuit-pattern opacity-30 pointer-events-none" />

      {/* CLOSING SECTION CALLOUT */}
      <div className="relative border-b border-[#e5b94c]/20 py-16 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-[#071326] to-[#040c1a]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-[#e5b94c] bg-[#0a1b35] px-3.5 py-1 rounded-full border border-[#e5b94c]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#e5b94c]" />
            <span>Annual Conference & Anniversary Milestone</span>
          </div>

          <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight">
            Be part of this <span className="text-gold-gradient">milestone event!</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join engineering leaders, educators, computing innovators, and ASEAN registry conferees at Wyndham Hotel Muscat and live virtual breakout rooms.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-bold text-[#071326] bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] rounded-xl hover:brightness-110 shadow-lg shadow-[#c9982a]/20 transition-all cursor-pointer"
            >
              Register Now — Limited Slots Available
            </button>

            <button
              onClick={onOpenQr}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#fcedbe] bg-[#0f2448] border border-[#e5b94c]/40 rounded-xl hover:bg-[#163363] hover:border-[#e5b94c] transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#e5b94c]" />
              <span>Scan to Register</span>
            </button>
          </div>

          <div className="text-xs text-[#e5b94c] font-medium tracking-wide">
            SCAN TO REGISTER — LIMITED SLOTS AVAILABLE
          </div>
        </div>
      </div>

      {/* FOOTER FOUR CORE PILLARS (Poster Footer Tags Banner) */}
      <div className="relative py-6 bg-[#071326] border-b border-[#e5b94c]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-[#e5b94c]/20">
            <div className="pt-2 md:pt-0 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-200">
              <Cpu className="w-4 h-4 text-[#e5b94c] shrink-0" />
              <span>Technology</span>
            </div>

            <div className="pt-2 md:pt-0 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-200">
              <Award className="w-4 h-4 text-[#e5b94c] shrink-0" />
              <span>Professional Growth</span>
            </div>

            <div className="pt-2 md:pt-0 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-200">
              <Users className="w-4 h-4 text-[#e5b94c] shrink-0" />
              <span>Industry Connections</span>
            </div>

            <div className="pt-2 md:pt-0 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-200">
              <Heart className="w-4 h-4 text-[#e5b94c] shrink-0" />
              <span>Community Impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ORGANIZATIONAL LINKS & BRANDING */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-3">
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-slate-100">
              {eventDetails.name}
            </h3>
            <p className="text-xs text-[#fcedbe] font-medium">
              {eventDetails.chapter}
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Empowering Filipino computer engineers and computing professionals in the Sultanate of Oman through global credentialing, continuous professional development, and technological innovation.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
              <a
                href={`mailto:${eventDetails.contactEmail}`}
                className="hover:text-[#fcedbe] transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#e5b94c]" />
                <span>{eventDetails.contactEmail}</span>
              </a>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#e5b94c]" />
                <span>Muscat, Sultanate of Oman</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#e5b94c] font-bold">
              Conference Highlights
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><a href="#cpd-units" className="hover:text-slate-200">10 CPD Units Hybrid Track</a></li>
              <li><a href="#schedule" className="hover:text-slate-200">Day 1 Wyndham Hotel Muscat</a></li>
              <li><a href="#schedule" className="hover:text-slate-200">Day 2 Virtual Breakouts</a></li>
              <li><a href="#workshops" className="hover:text-slate-200">6 Cisco Remote Courses</a></li>
              <li><a href="#speakers" className="hover:text-slate-200">Keynote & Industry Speakers</a></li>
            </ul>
          </div>

          {/* Certifications & Registries */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#e5b94c] font-bold">
              Accredited Registries
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><span>ASEAN Engineering Registry (AER)</span></li>
              <li><span>International Professional Engineer (intPE)</span></li>
              <li><span>Philippine Technological Council (PTC)</span></li>
              <li><span>Cisco Networking Academy Program</span></li>
              <li><span>IEEE Oman Section Collaboration</span></li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="mt-12 pt-6 border-t border-[#e5b94c]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>© 2026 ICpEP-Oman Chapter. All Rights Reserved.</span>
            {isPublishMode && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-slate-600 hover:text-slate-400 p-1 rounded transition-colors opacity-40 hover:opacity-100 cursor-pointer"
                title="Organizer Access"
                aria-label="Organizer Access"
              >
                <Lock className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!isPublishMode && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-slate-400 hover:text-[#fcedbe] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Shield className="w-3 h-3 text-[#e5b94c]" />
                <span>Admin Login</span>
              </button>
            )}
            <span className="text-[#fcedbe]">Connect. Learn. Innovate. Celebrate.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

