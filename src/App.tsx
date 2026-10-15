import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CpdPromotion } from './components/CpdPromotion';
import { Collaborators } from './components/Collaborators';
import { ScheduleSection } from './components/ScheduleSection';
import { WorkshopsAndCourses } from './components/WorkshopsAndCourses';
import { SpeakersSection } from './components/SpeakersSection';
import { RegistrationSection } from './components/RegistrationSection';
import { VenueSection } from './components/VenueSection';
import { Footer } from './components/Footer';
import { RegistrationModal } from './components/RegistrationModal';
import { ScanToRegisterModal } from './components/ScanToRegisterModal';
import { RegistrationLinksModal } from './components/RegistrationLinksModal';
import { ImageProvider, useImageManager } from './context/ImageContext';
import { ImageEditorPanel } from './components/ImageEditorPanel';
import { EventDataProvider, useEventData } from './context/EventDataContext';
import { AdminPanel } from './components/AdminPanel';
import { Sliders, Shield, Globe, Edit3 } from 'lucide-react';

function AppContent() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('tier-f2f');
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(undefined);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isQrEditOpen, setIsQrEditOpen] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [tierForLinksModal, setTierForLinksModal] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleOpenQrEdit = () => {
      setIsQrEditOpen(true);
      setIsQrOpen(true);
    };
    const handleOpenQr = () => {
      setIsQrEditOpen(false);
      setIsQrOpen(true);
    };
    window.addEventListener('open-qr-edit', handleOpenQrEdit);
    window.addEventListener('open-qr', handleOpenQr);
    return () => {
      window.removeEventListener('open-qr-edit', handleOpenQrEdit);
      window.removeEventListener('open-qr', handleOpenQr);
    };
  }, []);

  const { openEditor } = useImageManager();
  const {
    openAdminPanel,
    isPublishMode,
    togglePublishMode,
    isAdminLoggedIn,
    registrationTiers,
    eventDetails,
    shortCourses
  } = useEventData();

  const handleOpenRegister = (tierId: string = 'tier-f2f', courseTitle?: string) => {
    // 1. Check if the specific selected tier has its own custom redirect URL
    const currentTier = registrationTiers.find((t) => t.id === tierId);
    if (currentTier?.redirectUrl && currentTier.redirectUrl.trim()) {
      let target = currentTier.redirectUrl.trim();
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }

    // 2. Check if global custom registration redirect is active
    if (
      eventDetails.useCustomRegistrationRedirect &&
      eventDetails.globalRegistrationUrl &&
      eventDetails.globalRegistrationUrl.trim()
    ) {
      let target = eventDetails.globalRegistrationUrl.trim();
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }

    // 3. Fallback: Open internal interactive delegate badge registration form
    setSelectedTier(tierId);
    setSelectedCourse(courseTitle);
    setIsRegisterOpen(true);
  };

  const handleEnrollCourse = (courseTitle?: string) => {
    const course = shortCourses.find((c) => c.title === courseTitle);
    if (course?.enrollmentUrl && course.enrollmentUrl.trim()) {
      let target = course.enrollmentUrl.trim();
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }
    handleOpenRegister('tier-online-pro', courseTitle);
  };

  const handleOpenLinksModal = (tierId?: string) => {
    setTierForLinksModal(tierId);
    setIsLinksModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#071326] text-slate-100 flex flex-col font-sans selection:bg-[#e5b94c]/30 selection:text-[#fcedbe]">
      {/* 3-Zone Top Navigation Bar */}
      <Header
        onOpenRegister={() => handleOpenRegister('tier-f2f')}
        onOpenQr={() => setIsQrOpen(true)}
        onOpenImageEditor={() => openEditor()}
        onOpenAdmin={() => openAdminPanel()}
      />

      <main className="flex-1">
        {/* Hero Section with Dark Navy / Gold Circuits & Muscat Silhouette */}
        <Hero
          onRegisterClick={() => handleOpenRegister('tier-f2f')}
          onOpenQr={() => {
            setIsQrEditOpen(false);
            setIsQrOpen(true);
          }}
          onOpenEditLinks={() => handleOpenLinksModal()}
          onOpenQrEdit={() => {
            setIsQrEditOpen(true);
            setIsQrOpen(true);
          }}
        />

        {/* Prominent Standalone 10 CPD Units Promotion */}
        <CpdPromotion
          onRegisterHybrid={() => handleOpenRegister('tier-f2f')}
        />

        {/* Collaborating Organizations Strip & Global Certifications / Partnerships */}
        <Collaborators />

        {/* Event Schedule (Day 1 Muscat & Day 2 Online Tabs) */}
        <ScheduleSection />

        {/* Day 2 Breakout Workshops & 6 Cisco/ICpEP Remote Short Courses */}
        <WorkshopsAndCourses
          onEnrollClick={handleEnrollCourse}
        />

        {/* Distinguished Speakers & Dignitaries Showcase */}
        <SpeakersSection />

        {/* 3 Side-By-Side Registration Tiers + Repeated CPD Callout */}
        <RegistrationSection
          onSelectTier={(tierId) => handleOpenRegister(tierId)}
          onOpenLinksModal={(tierId) => handleOpenLinksModal(tierId)}
        />

        {/* Venue & Muscat Travel Guide (Wyndham Hotel Muscat) */}
        <VenueSection />
      </main>

      {/* Floating Controls: ONLY visible when admin is logged in */}
      {isAdminLoggedIn && (
        !isPublishMode ? (
          <aside aria-label="Organizer & Media Controls" className="fixed bottom-6 right-6 z-40 flex flex-col sm:flex-row items-end sm:items-center gap-2.5">
            <button
              onClick={() => openAdminPanel()}
              className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[#0a1b35] to-[#0f2448] text-[#fcedbe] border border-[#e5b94c]/60 shadow-2xl hover:border-[#e5b94c] hover:brightness-110 transition-all flex items-center gap-2 text-xs font-bold group cursor-pointer"
              title="Open Website Admin & Content Editor Panel"
            >
              <div className="p-1 rounded-full bg-[#071326] text-[#e5b94c] group-hover:scale-110 transition-transform">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span>Edit Website (Admin)</span>
            </button>

            <button
              onClick={() => openEditor()}
              className="px-3.5 py-2 rounded-full bg-[#0a1b35] text-slate-200 border border-[#e5b94c]/40 shadow-2xl hover:bg-[#163363] hover:text-[#fcedbe] hover:border-[#e5b94c] transition-all flex items-center gap-2 text-xs font-bold group cursor-pointer"
              title="Open Media & Image Editor Studio"
            >
              <div className="p-1 rounded-full bg-[#0f2448] text-[#e5b94c] group-hover:rotate-45 transition-transform">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <span>Pictures</span>
            </button>

            <button
              onClick={togglePublishMode}
              className="px-3 py-1.5 rounded-full bg-[#071326]/90 text-slate-300 hover:text-white border border-slate-700/60 shadow-lg text-[11px] font-medium flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
              title="Preview the site without edit buttons"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Preview Visitor View</span>
            </button>
          </aside>
        ) : (
          /* Floating pill when in Visitor Preview Mode so logged-in organizer can easily return to Editing */
          <aside aria-label="Admin Status" className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 bg-[#071326]/95 border border-[#e5b94c]/50 shadow-2xl px-3.5 py-2 rounded-full text-xs backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-slate-300">Visitor Preview</span>
            </div>
            <span className="text-slate-600">·</span>
            <button
              onClick={togglePublishMode}
              className="text-[#e5b94c] hover:underline font-bold text-xs cursor-pointer flex items-center gap-1"
              title="Return to Editing Mode"
            >
              <Sliders className="w-3 h-3" />
              <span>Enable Edit Tools</span>
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => openAdminPanel()}
              className="text-slate-300 hover:text-[#fcedbe] cursor-pointer text-xs font-medium flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-[#e5b94c]" />
              <span>Admin</span>
            </button>
          </aside>
        )
      )}

      {/* Closing Section & Footer with 4 Core Pillar Tags */}
      <Footer
        onRegisterClick={() => handleOpenRegister('tier-f2f')}
        onOpenQr={() => setIsQrOpen(true)}
        onOpenAdmin={() => openAdminPanel()}
      />

      {/* Interactive Registration Checkout & Digital Ticket Badge Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        initialTierId={selectedTier}
        initialCourse={selectedCourse}
      />

      {/* Scan to Register QR Code Modal */}
      <ScanToRegisterModal
        isOpen={isQrOpen}
        onClose={() => {
          setIsQrOpen(false);
          setIsQrEditOpen(false);
        }}
        onProceedToForm={() => handleOpenRegister('tier-f2f')}
        initialEditMode={isQrEditOpen}
      />

      {/* Global & Per-Tier Registration Links Modal */}
      <RegistrationLinksModal
        isOpen={isLinksModalOpen}
        onClose={() => setIsLinksModalOpen(false)}
        initialTierId={tierForLinksModal}
      />

      {/* Real-Time Live Image & Media Editor Panel */}
      <ImageEditorPanel />

      {/* Full-Website Organizer Admin & Content Editor Panel */}
      <AdminPanel />
    </div>
  );
}

export default function App() {
  return (
    <EventDataProvider>
      <ImageProvider>
        <AppContent />
      </ImageProvider>
    </EventDataProvider>
  );
}

