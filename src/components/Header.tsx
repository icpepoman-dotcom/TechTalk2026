import React, { useState } from 'react';
import { Menu, X, QrCode, Sliders, Shield, Lock } from 'lucide-react';
import { useEventData } from '../context/EventDataContext';

interface HeaderProps {
  onOpenRegister: (tierId?: string) => void;
  onOpenQr: () => void;
  onOpenImageEditor: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegister,
  onOpenQr,
  onOpenImageEditor,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { eventDetails, isAdminLoggedIn, isPublishMode } = useEventData();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#071326]/90 backdrop-blur-md border-b border-[#e5b94c]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark in display face */}
        <a 
          href="#" 
          className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-slate-100 hover:text-[#fcedbe] transition-colors whitespace-nowrap"
        >
          {eventDetails.name}
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#overview" className="hover:text-[#fcedbe] transition-colors whitespace-nowrap">
            Overview
          </a>
          <a href="#cpd-units" className="hover:text-[#fcedbe] transition-colors whitespace-nowrap">
            10 CPD Units
          </a>
          <a href="#schedule" className="hover:text-[#fcedbe] transition-colors whitespace-nowrap">
            Schedule
          </a>
          <a href="#workshops" className="hover:text-[#fcedbe] transition-colors whitespace-nowrap">
            Workshops & Courses
          </a>
          <a href="#speakers" className="hover:text-[#fcedbe] transition-colors whitespace-nowrap">
            Speakers
          </a>
          <a href="#registration" className="hover:text-[#fcedbe] transition-colors whitespace-nowrap">
            Registration
          </a>
          <a href="#venue" className="hover:text-[#fcedbe] transition-colors whitespace-nowrap">
            Venue
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Admin Access: Full active badge when logged in; discreet access when logged out */}
          {isAdminLoggedIn ? (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border transition-all whitespace-nowrap cursor-pointer bg-amber-950/40 text-[#fcedbe] border-[#e5b94c]/60 hover:bg-amber-900/60"
              title="Open Organizer Admin Panel (Admin Active)"
            >
              <Shield className="w-3.5 h-3.5 text-[#e5b94c]" />
              <span className="hidden sm:inline">Admin (Active)</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-[#fcedbe] hover:bg-[#0f2448]/80 rounded transition-all whitespace-nowrap cursor-pointer border border-transparent hover:border-[#e5b94c]/30"
              title="Organizer Admin Portal Login"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Admin</span>
            </button>
          )}

          {/* Pictures Media Studio Button - ONLY visible when admin is logged in */}
          {isAdminLoggedIn && (
            <button
              onClick={onOpenImageEditor}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#fcedbe] bg-[#0f2448] border border-[#e5b94c]/40 rounded-md hover:bg-[#163363] hover:border-[#e5b94c] transition-all whitespace-nowrap cursor-pointer"
              title="Open Image & Media Editor Panel"
            >
              <Sliders className="w-3.5 h-3.5 text-[#e5b94c]" />
              <span>Pictures</span>
            </button>
          )}

          <button
            onClick={onOpenQr}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#fcedbe] bg-[#0f2448] border border-[#e5b94c]/30 rounded-md hover:bg-[#163363] hover:border-[#e5b94c]/60 transition-all whitespace-nowrap"
            title="Scan QR Code to register"
          >
            <QrCode className="w-4 h-4 text-[#e5b94c]" />
            <span>QR</span>
          </button>

          <button
            onClick={() => onOpenRegister()}
            className="px-4 py-2 text-xs font-bold text-[#071326] bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] rounded-md hover:brightness-110 shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            Register Now
          </button>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-[#fcedbe] focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#e5b94c]/20 bg-[#071326]/95 backdrop-blur-xl px-4 py-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-medium text-slate-200">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#fcedbe] hover:bg-[#0f2448]/50 rounded transition-colors"
            >
              Overview
            </a>
            <a
              href="#cpd-units"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#fcedbe] hover:bg-[#0f2448]/50 rounded transition-colors"
            >
              10 CPD Units
            </a>
            <a
              href="#schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#fcedbe] hover:bg-[#0f2448]/50 rounded transition-colors"
            >
              Schedule (Day 1 & Day 2)
            </a>
            <a
              href="#workshops"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#fcedbe] hover:bg-[#0f2448]/50 rounded transition-colors"
            >
              Workshops & Short Courses
            </a>
            <a
              href="#speakers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#fcedbe] hover:bg-[#0f2448]/50 rounded transition-colors"
            >
              Distinguished Speakers
            </a>
            <a
              href="#registration"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#fcedbe] hover:bg-[#0f2448]/50 rounded transition-colors"
            >
              Registration Tiers
            </a>
            <a
              href="#venue"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-[#fcedbe] hover:bg-[#0f2448]/50 rounded transition-colors"
            >
              Venue & Muscat Guide
            </a>
          </div>

          <div className="pt-3 border-t border-[#e5b94c]/15 flex flex-col gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenImageEditor();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#fcedbe] bg-[#0f2448] border border-[#e5b94c]/40 rounded cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-[#e5b94c]" />
                <span>Edit Pictures & Media</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 bg-[#071326] border border-[#e5b94c]/30 rounded hover:text-[#fcedbe] cursor-pointer"
            >
              {isAdminLoggedIn ? (
                <>
                  <Shield className="w-4 h-4 text-[#e5b94c]" />
                  <span>Admin Panel (Active)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Admin Login</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQr();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#fcedbe] bg-[#0f2448] border border-[#e5b94c]/30 rounded"
              >
                <QrCode className="w-4 h-4 text-[#e5b94c]" />
                <span>Scan QR</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="flex-1 py-2 text-xs font-bold text-[#071326] bg-[#e5b94c] rounded text-center"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


