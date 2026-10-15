import React, { useState } from 'react';
import { User, Award, Globe, Mic, Building2, Camera } from 'lucide-react';
import { Speaker } from '../types';
import { useImageManager } from '../context/ImageContext';
import { useEventData } from '../context/EventDataContext';
import { resolveImageUrl } from '../utils/imagePath';

export const SpeakersSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);
  const { getImageUrl, getImageStyle, openEditor } = useImageManager();
  const { speakers, isPublishMode } = useEventData();

  const categories = ['All', 'Keynote', 'Leadership', 'Industry', 'Conferment'];

  const filteredSpeakers = selectedCategory === 'All'
    ? speakers
    : speakers.filter((s) => s.category === selectedCategory);

  return (
    <section id="speakers" className="py-16 lg:py-24 bg-[#071326] border-b border-[#e5b94c]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e5b94c] font-semibold">
            Visionary Leaders & Technical Authorities
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Distinguished Speakers & Conferees
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            Gathering government education commissioners, international engineering council chairs, IEEE leaders, conferees, and multi-national tech architects from Canada and Mexico.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] shadow-md font-bold'
                  : 'bg-[#0a1b35] text-slate-300 hover:text-slate-100 border border-[#e5b94c]/20'
              }`}
            >
              {cat === 'All'
                ? 'All Speakers & Conferees'
                : cat === 'Conferment'
                ? 'Conferees & Dignitaries'
                : `${cat} Speakers`}
            </button>
          ))}
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSpeakers.map((speaker) => {
            const slotId = speaker.id.replace(/-/g, '_');
            const speakerPhoto = resolveImageUrl(getImageUrl(slotId) || speaker.photoUrl);
            const speakerStyles = getImageStyle(slotId);

            return (
              <div
                key={speaker.id}
                className="group rounded-2xl bg-[#0a1b35]/85 border border-[#e5b94c]/25 hover:border-[#e5b94c]/70 transition-all p-5 flex flex-col justify-between shadow-lg hover:shadow-[0_8px_30px_rgba(229,185,76,0.15)]"
              >
                <div>
                  {/* Speaker Avatar & Category Badge */}
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="relative">
                      <div
                        onClick={() => setActiveSpeaker(speaker)}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#163363] to-[#0a1b35] border-2 border-[#e5b94c]/80 flex items-center justify-center text-[#fcedbe] shadow-[0_4px_20px_rgba(0,0,0,0.4)] ring-2 ring-[#e5b94c]/20 group-hover:ring-[#e5b94c]/60 overflow-hidden cursor-pointer transition-all duration-300"
                        title={`View ${speaker.name} profile`}
                      >
                        {speakerPhoto ? (
                          <img
                            src={speakerPhoto}
                            alt={speaker.name}
                            style={speakerStyles}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-10 h-10 text-[#e5b94c]/70" />
                        )}
                      </div>

                      {/* Edit Photo Overlay Button (Only shown in edit mode) */}
                      {!isPublishMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditor(slotId);
                          }}
                          className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-[#071326] hover:bg-[#163363] border border-[#e5b94c] rounded-full text-[#fcedbe] shadow-md opacity-90 hover:opacity-100 transition-all cursor-pointer"
                          title={`Change picture for ${speaker.name}`}
                          aria-label={`Change picture for ${speaker.name}`}
                        >
                          <Camera className="w-3.5 h-3.5 text-[#e5b94c]" />
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-[#fcedbe] bg-[#071326] px-2.5 py-1 rounded border border-[#e5b94c]/20 shrink-0">
                      {speaker.category}
                    </span>
                  </div>

                  <h3 className="font-cinzel text-base font-bold text-slate-100 group-hover:text-[#fcedbe] transition-colors leading-snug">
                    {speaker.name}
                  </h3>

                  <p className="text-xs text-[#e5b94c] font-medium mt-1">
                    {speaker.title}
                  </p>

                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{speaker.organization}</span>
                  </p>

                  {speaker.topic && (
                    <div className="mt-3 p-2.5 rounded bg-[#071326]/70 border border-[#e5b94c]/15 text-xs text-slate-200">
                      <div className="text-[10px] uppercase font-bold text-[#e5b94c] mb-0.5 flex items-center gap-1">
                        <Mic className="w-3 h-3 text-[#e5b94c]" />
                        <span>Key Topic / Presentation</span>
                      </div>
                      <span className="italic leading-relaxed">"{speaker.topic}"</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#e5b94c]/15 flex items-center justify-between">
                  <button
                    onClick={() => setActiveSpeaker(speaker)}
                    className="text-left text-xs text-[#fcedbe] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>Read Profile & Bio</span>
                    <span aria-hidden="true">→</span>
                  </button>

                  {!isPublishMode && (
                    <button
                      onClick={() => openEditor(slotId)}
                      className="text-[11px] text-[#e5b94c] hover:underline transition-colors cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Change Picture</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for Speaker Bio */}
        {activeSpeaker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040c1a]/85 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl bg-[#0a1b35] border-2 border-[#e5b94c] p-6 shadow-2xl space-y-4">
              <button
                onClick={() => setActiveSpeaker(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
                aria-label="Close bio"
              >
                ✕
              </button>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#0f2448] border-2 border-[#e5b94c] flex items-center justify-center text-[#fcedbe] overflow-hidden shrink-0 shadow-lg">
                  {(getImageUrl(activeSpeaker.id.replace(/-/g, '_')) || activeSpeaker.photoUrl) ? (
                    <img
                      src={resolveImageUrl(getImageUrl(activeSpeaker.id.replace(/-/g, '_')) || activeSpeaker.photoUrl)}
                      alt={activeSpeaker.name}
                      style={getImageStyle(activeSpeaker.id.replace(/-/g, '_'))}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-12 h-12 text-[#e5b94c]" />
                  )}
                </div>
                <div>
                  <h4 className="font-cinzel text-lg font-bold text-slate-100">
                    {activeSpeaker.name}
                  </h4>
                  <p className="text-xs text-[#e5b94c] font-medium mt-0.5">{activeSpeaker.title}</p>
                  <p className="text-xs text-slate-300">{activeSpeaker.organization}</p>
                  <span className="inline-block mt-2 text-[10px] font-mono text-[#071326] bg-[#e5b94c] px-2 py-0.5 rounded font-bold">
                    {activeSpeaker.category}
                  </span>
                </div>
              </div>

              {activeSpeaker.topic && (
                <div className="p-3 bg-[#071326] rounded-xl border border-[#e5b94c]/30 text-xs text-slate-200">
                  <span className="text-[#fcedbe] font-bold block mb-1">Featured Lecture / Workshop:</span>
                  "{activeSpeaker.topic}"
                </div>
              )}

              <p className="text-sm text-slate-300 leading-relaxed border-t border-[#e5b94c]/20 pt-3">
                {activeSpeaker.bio}
              </p>

              <div className="pt-2 flex justify-end gap-2">
                {!isPublishMode && (
                  <button
                    onClick={() => {
                      const id = activeSpeaker.id.replace(/-/g, '_');
                      setActiveSpeaker(null);
                      openEditor(id);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#fcedbe] bg-[#0f2448] border border-[#e5b94c]/40 rounded hover:bg-[#163363] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>Change Picture in Studio</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveSpeaker(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-[#071326] bg-[#e5b94c] rounded hover:brightness-110 cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

