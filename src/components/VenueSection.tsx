import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Car, Sparkles, Building, Shirt, Sliders } from 'lucide-react';
import { useImageManager } from '../context/ImageContext';
import { useEventData } from '../context/EventDataContext';

export const VenueSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'venue' | 'dresscode' | 'travel'>('venue');
  const { getImageUrl, getImageStyle, openEditor } = useImageManager();
  const { venueInfo, isPublishMode } = useEventData();

  const venueImageSrc = getImageUrl('venue');
  const venueImageStyles = getImageStyle('venue');

  return (
    <section id="venue" className="py-16 lg:py-24 bg-[#040c1a] border-b border-[#e5b94c]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e5b94c] font-semibold">
            Day 1 Face-to-Face Destination
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Wyndham Hotel Muscat, Sultanate of Oman
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            A world-class hospitality venue in the heart of Muscat, hosting the Morning Technology Talks, the ASEAN Engineer Registry Conferment, and the Anniversary Gala Night.
          </p>
        </div>

        {/* Venue Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Venue Image & Fast Facts */}
          <div className="lg:col-span-6 space-y-4">
            <div className="group relative rounded-2xl overflow-hidden border-2 border-[#e5b94c]/40 shadow-2xl bg-[#0a1b35] aspect-[16/10]">
              {/* Quick Edit Overlay Button: Only visible when admin is logged in and not in publish mode */}
              {!isPublishMode && (
                <button
                  onClick={() => openEditor('venue')}
                  className="absolute top-3 left-3 z-20 px-2.5 py-1 text-xs font-semibold text-[#071326] bg-[#fcedbe] hover:bg-[#e5b94c] rounded shadow-md opacity-90 hover:opacity-100 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Edit Venue Photo"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#071326]" />
                  <span>Edit Photo</span>
                </button>
              )}

              <img
                src={venueImageSrc}
                alt="Wyndham Hotel Muscat Exterior at Dusk"
                style={venueImageStyles}
                className="w-full h-full transform hover:scale-105 transition-transform duration-700"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-transparent to-transparent opacity-80 pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 bg-[#071326]/90 backdrop-blur-md p-3 rounded-xl border border-[#e5b94c]/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#fcedbe]">Wyndham Hotel Muscat</h4>
                  <p className="text-[11px] text-slate-300">Al Khuwair, Muscat Governorate, Oman</p>
                </div>
                <span className="text-[10px] font-mono text-[#e5b94c] bg-[#0a1b35] px-2 py-0.5 rounded border border-[#e5b94c]/20">
                  Day 1 Host Venue
                </span>
              </div>
            </div>

            {/* Quick Venue Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0a1b35] border border-[#e5b94c]/20 flex items-start gap-2.5">
                <Building className="w-4 h-4 text-[#e5b94c] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100 block">Grand Ballroom</strong>
                  <span className="text-slate-400 text-[11px]">Equipped with 4K multi-displays & live hybrid feeds</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0a1b35] border border-[#e5b94c]/20 flex items-start gap-2.5">
                <Car className="w-4 h-4 text-[#e5b94c] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100 block">Complimentary Valet</strong>
                  <span className="text-slate-400 text-[11px]">Free valet & on-site parking for all registered attendees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Venue Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex border-b border-[#e5b94c]/20">
              <button
                onClick={() => setActiveTab('venue')}
                className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'venue'
                    ? 'border-[#e5b94c] text-[#fcedbe]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Venue Information
              </button>
              <button
                onClick={() => setActiveTab('dresscode')}
                className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'dresscode'
                    ? 'border-[#e5b94c] text-[#fcedbe]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Dress Code & Etiquette
              </button>
              <button
                onClick={() => setActiveTab('travel')}
                className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'travel'
                    ? 'border-[#e5b94c] text-[#fcedbe]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Travel & Airport Access
              </button>
            </div>

            {/* Tab 1: Venue Information */}
            {activeTab === 'venue' && (
              <div className="space-y-4 text-xs sm:text-sm text-slate-300 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-[#0a1b35] border border-[#e5b94c]/25 space-y-2">
                  <div className="flex items-center gap-2 text-[#fcedbe] font-bold">
                    <MapPin className="w-4 h-4 text-[#e5b94c]" />
                    <span>Exact Location & Contact</span>
                  </div>
                  <p className="text-slate-200">
                    Al Khuwair, Sultan Qaboos Street, Muscat, Sultanate of Oman
                  </p>
                  <p className="text-slate-400 text-xs">
                    Located 15 minutes from Muscat International Airport (MCT) with direct access to Sultan Qaboos Grand Mosque, Ministries District, and the Muttrah Corniche.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-100 text-xs uppercase tracking-wider text-[#e5b94c]">
                    Key Facilities for ICpEP Delegates:
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {venueInfo.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e5b94c] shrink-0 mt-1.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <a
                    href="https://maps.google.com/?q=Wyndham+Hotel+Muscat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f2448] text-xs font-semibold text-[#fcedbe] rounded-lg border border-[#e5b94c]/30 hover:bg-[#163363] transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              </div>
            )}

            {/* Tab 2: Dress Code */}
            {activeTab === 'dresscode' && (
              <div className="space-y-4 text-xs sm:text-sm text-slate-300 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-[#0a1b35] border border-[#e5b94c]/25 space-y-3">
                  <div className="flex items-center gap-2 text-[#fcedbe] font-bold">
                    <Shirt className="w-4 h-4 text-[#e5b94c]" />
                    <span>Day 1 Morning & Afternoon (08:00 – 17:00)</span>
                  </div>
                  <p className="text-slate-200">
                    <strong>Business Formal / Corporate / Barong Tagalog / National Dress:</strong>
                  </p>
                  <p className="text-slate-400 text-xs">
                    Collar attire, suits, traditional Filipino barong, or formal national dress. For conferees participating in the ASEAN Engineer Registry ceremony, conferment stoles and medallions will be provided during check-in.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0a1b35] border border-[#e5b94c]/25 space-y-3">
                  <div className="flex items-center gap-2 text-[#fcedbe] font-bold">
                    <Sparkles className="w-4 h-4 text-[#e5b94c]" />
                    <span>Day 1 Evening Gala Night (18:00 – 20:30)</span>
                  </div>
                  <p className="text-slate-200">
                    <strong>Anniversary Gala Attire / Black Tie / Formal Evening Wear:</strong>
                  </p>
                  <p className="text-slate-400 text-xs">
                    Formal long gown, barong tagalog, dark suit, or ceremonial Omani formal attire for the celebratory gala banquet and awards ceremony.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Travel */}
            {activeTab === 'travel' && (
              <div className="space-y-4 text-xs sm:text-sm text-slate-300 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-[#0a1b35] border border-[#e5b94c]/25 space-y-2">
                  <div className="flex items-center gap-2 text-[#fcedbe] font-bold">
                    <Compass className="w-4 h-4 text-[#e5b94c]" />
                    <span>Delegates Traveling to Muscat</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Delegates arriving via Muscat International Airport (MCT) can take official airport metered taxis or pre-booked Otaxi rides directly to Wyndham Hotel in Al Khuwair (~15 minutes drive).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/20 space-y-2">
                  <h5 className="font-bold text-[#fcedbe] text-xs">Visa on Arrival & GCC Resident Facilities:</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    GCC residents and citizens of over 100 countries are eligible for visa-free or visa-on-arrival entry into the Sultanate of Oman. Please verify your passport validity (minimum 6 months).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

