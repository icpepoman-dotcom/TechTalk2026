import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Globe, Sparkles, ChevronRight, QrCode, Sliders, Edit, Link2 } from 'lucide-react';
import { OmanSkylineSvg } from './OmanSkylineSvg';
import { useImageManager } from '../context/ImageContext';
import { useEventData } from '../context/EventDataContext';

interface HeroProps {
  onRegisterClick: () => void;
  onOpenQr: () => void;
  onOpenEditLinks?: () => void;
  onOpenQrEdit?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRegisterClick, onOpenQr, onOpenEditLinks, onOpenQrEdit }) => {
  const { getImageUrl, getImageStyle, openEditor } = useImageManager();
  const { eventDetails, isPublishMode } = useEventData();
  const heroImageSrc = getImageUrl('hero');
  const heroImageStyles = getImageStyle('hero');

  // Countdown to October 30, 2026 08:00 AM Gulf Standard Time (UTC+4)
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-10-30T08:00:00+04:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="overview" className="relative w-full overflow-hidden bg-[#071326] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#e5b94c]/20">
      {/* Background Circuit Grid & Ambient Radial Lighting */}
      <div className="absolute inset-0 bg-circuit-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#163363]/40 via-[#e5b94c]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Prominent Urgency Banner */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0a1b35] border border-[#e5b94c]/40 text-xs sm:text-sm text-[#fcedbe] shadow-lg shadow-[#071326]/60">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e5b94c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e5b94c]"></span>
            </span>
            <span className="font-semibold tracking-wide">
              {eventDetails.bannerNotice}
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <button
              onClick={onOpenQr}
              className="text-[#e5b94c] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>
            {!isPublishMode && onOpenQrEdit && (
              <button
                onClick={onOpenQrEdit}
                className="text-[11px] px-2 py-0.5 rounded bg-[#0a1b35] text-[#fcedbe] border border-[#e5b94c]/40 hover:bg-[#163363] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-sm ml-1"
                title="Edit or replace QR Code"
              >
                <Edit className="w-3 h-3 text-[#e5b94c]" />
                <span>Edit QR</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Headline & Value Proposition on Left, Futuristic Hero Visual on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline */}
            <div className="text-xs sm:text-sm tracking-[0.25em] text-[#e5b94c] uppercase font-semibold">
              {eventDetails.tagline}
            </div>

            {/* Event Name & Hero Typography */}
            <div className="space-y-2">
              <div className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
                {eventDetails.chapter}
              </div>
              <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.12]">
                ICpEP-Oman <br />
                <span className="text-gold-gradient drop-shadow-md">TechTalk 2026</span>
              </h1>
            </div>

            {/* Theme & Subheading */}
            <div className="p-4 rounded-lg bg-[#0a1b35]/80 border-l-4 border-[#e5b94c] border-y border-r border-[#e5b94c]/20">
              <p className="text-xs uppercase tracking-wider text-[#e5b94c] font-semibold mb-1">
                Annual Conference & Anniversary Theme
              </p>
              <p className="text-base sm:text-lg font-medium text-slate-100 italic">
                "{eventDetails.theme}"
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {eventDetails.subheading}
            </p>

            {/* Dates & Format At A Glance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-[#0a1b35]/90 border border-[#e5b94c]/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#fcedbe] mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>Day 1 — In-Person Conference & Gala</span>
                  </div>
                  <p className="text-sm font-bold text-slate-100">October 30, 2026</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Wyndham Hotel, Muscat, Oman (08:00 – 20:30 GST)
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  Tech Talks · AER Conferment · Anniversary Gala
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0a1b35]/90 border border-[#e5b94c]/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#fcedbe] mb-1">
                    <Globe className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>Day 2 — Virtual Workshops & intPE</span>
                  </div>
                  <p className="text-sm font-bold text-slate-100">October 31, 2026</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Interactive Virtual Conference & Cisco NetAcad Hub
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  Breakout Workshops · 6 Short Courses · intPE Conferment
                </div>
              </div>
            </div>

            {/* Primary Action Controls */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={onRegisterClick}
                  className="px-6 py-3.5 text-sm sm:text-base font-bold text-[#071326] bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] rounded-lg hover:brightness-110 shadow-lg shadow-[#c9982a]/20 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <span>Register Now</span>
                  <ChevronRight className="w-4 h-4 text-[#071326]" />
                </button>

                {/* Edit Buttons for Registration Redirect Links & QR Code (Visible only in edit mode) */}
                {!isPublishMode && (
                  <div className="flex items-center gap-1.5">
                    {onOpenEditLinks && (
                      <button
                        onClick={onOpenEditLinks}
                        className="p-3 bg-[#0a1b35] hover:bg-[#163363] text-[#e5b94c] hover:text-[#fcedbe] border border-[#e5b94c]/40 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-md"
                        title="Edit Registration Button Redirect Links"
                      >
                        <Edit className="w-4 h-4 text-[#e5b94c]" />
                        <span className="hidden sm:inline">Edit Link</span>
                      </button>
                    )}
                    {onOpenQrEdit && (
                      <button
                        onClick={onOpenQrEdit}
                        className="p-3 bg-[#0a1b35] hover:bg-[#163363] text-[#e5b94c] hover:text-[#fcedbe] border border-[#e5b94c]/40 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-md"
                        title="Edit or Replace QR Code"
                      >
                        <QrCode className="w-4 h-4 text-[#e5b94c]" />
                        <span className="hidden sm:inline">Edit QR</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <a
                href="#schedule"
                className="px-5 py-3.5 text-sm font-semibold text-slate-200 bg-[#0f2448] border border-[#e5b94c]/30 rounded-lg hover:bg-[#163363] hover:text-[#fcedbe] transition-colors whitespace-nowrap"
              >
                View Full Schedule
              </a>

              <a
                href="#cpd-units"
                className="px-4 py-3.5 text-sm font-semibold text-[#e5b94c] hover:text-[#fcedbe] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-[#e5b94c]" />
                <span>Earn 10 CPD Units</span>
              </a>
            </div>

            {/* Event Countdown Timer */}
            <div className="pt-4 border-t border-[#e5b94c]/20">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                Event Countdown — October 30, 2026 (Muscat Time GST)
              </div>
              <div className="grid grid-cols-4 max-w-sm gap-2">
                <div className="bg-[#0a1b35] border border-[#e5b94c]/25 rounded p-2 text-center">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#fcedbe] tabular-nums">
                    {timeLeft.days}
                  </div>
                  <div className="text-[10px] uppercase text-slate-400">Days</div>
                </div>
                <div className="bg-[#0a1b35] border border-[#e5b94c]/25 rounded p-2 text-center">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#fcedbe] tabular-nums">
                    {timeLeft.hours}
                  </div>
                  <div className="text-[10px] uppercase text-slate-400">Hours</div>
                </div>
                <div className="bg-[#0a1b35] border border-[#e5b94c]/25 rounded p-2 text-center">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#fcedbe] tabular-nums">
                    {timeLeft.minutes}
                  </div>
                  <div className="text-[10px] uppercase text-slate-400">Mins</div>
                </div>
                <div className="bg-[#0a1b35] border border-[#e5b94c]/25 rounded p-2 text-center">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#fcedbe] tabular-nums">
                    {timeLeft.seconds}
                  </div>
                  <div className="text-[10px] uppercase text-slate-400">Secs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual: Golden Cybernetic Hero Graphic & Framed Poster Art */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="group relative w-full max-w-md rounded-2xl overflow-hidden border border-[#e5b94c]/40 shadow-2xl shadow-[#040c1a]/80 bg-[#0a1b35]/90">
              {/* Quick Edit Overlay Button (Only shown in edit mode) */}
              {!isPublishMode && (
                <button
                  onClick={() => openEditor('hero')}
                  className="absolute top-3 left-3 z-20 px-2.5 py-1 text-xs font-semibold text-[#071326] bg-[#fcedbe] hover:bg-[#e5b94c] rounded shadow-md opacity-90 hover:opacity-100 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Edit Hero Image"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#071326]" />
                  <span>Edit Image</span>
                </button>
              )}

              {/* Image Frame with Golden Scrim */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-[#071326]">
                <img
                  src={heroImageSrc}
                  alt="ICpEP-Oman TechTalk 2026 Cybernetic Engineer and Muscat Skyline Motif"
                  style={heroImageStyles}
                  className="w-full h-full transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1b35] via-transparent to-transparent opacity-80 pointer-events-none" />
                
                {/* Overlay Badge */}
                <div className="absolute top-3 right-3 bg-[#071326]/90 border border-[#e5b94c]/50 px-2.5 py-1 rounded text-xs font-semibold text-[#fcedbe] backdrop-blur-md">
                  10 CPD Accredited
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-xs text-[#fcedbe] bg-[#071326]/85 p-2 rounded border border-[#e5b94c]/30 backdrop-blur-md flex items-center justify-between">
                  <span className="font-medium">Oman Chapter Milestone</span>
                  <span className="text-slate-400">Muscat & Virtual</span>
                </div>
              </div>

              {/* Graphic Highlights Bar */}
              <div className="p-4 grid grid-cols-3 divide-x divide-[#e5b94c]/20 text-center bg-[#0a1b35]">
                <div className="px-2">
                  <div className="text-lg font-bold font-cinzel text-[#fcedbe]">10</div>
                  <div className="text-[11px] text-slate-300">CPD Units</div>
                </div>
                <div className="px-2">
                  <div className="text-lg font-bold font-cinzel text-[#fcedbe]">2 Days</div>
                  <div className="text-[11px] text-slate-300">Hybrid Event</div>
                </div>
                <div className="px-2">
                  <div className="text-lg font-bold font-cinzel text-[#fcedbe]">2 Registries</div>
                  <div className="text-[11px] text-slate-300">AER & intPE</div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-400 text-center flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#e5b94c]" />
              <span>Oct 30: Wyndham Hotel Muscat · Oct 31: Online Workshop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Oman Skyline Line Art Base Silhouette */}
      <div className="mt-12 sm:mt-16 w-full opacity-90">
        <OmanSkylineSvg glow={true} />
      </div>
    </section>
  );
};

