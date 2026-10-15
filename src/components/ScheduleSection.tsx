import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Globe, User, Award, ChevronDown, ChevronUp, Download, Sparkles, Filter, Mic, Edit, Plus, Trash2, X, Check } from 'lucide-react';
import { ScheduleItem } from '../types';
import { useEventData } from '../context/EventDataContext';

export const ScheduleSection: React.FC = () => {
  const { daySchedules, updateScheduleItem, isPublishMode } = useEventData();
  const [activeDay, setActiveDay] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>({
    'Morning Session': true,
    'Afternoon Session': true,
    'Evening Session': true
  });

  // State for editing speaker directly in schedule
  const [editingSpeakerState, setEditingSpeakerState] = useState<{
    dayNum: number;
    periodTitle: string;
    item: ScheduleItem;
    speakerIndex: number;
    isNew?: boolean;
    speaker: {
      name: string;
      role: string;
      organization?: string;
    };
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleOpenSpeakerEdit = (
    dayNum: number,
    periodTitle: string,
    item: ScheduleItem,
    speakerIndex: number = 0,
    isNew: boolean = false
  ) => {
    if (isNew || !item.speakers || item.speakers.length === 0) {
      setEditingSpeakerState({
        dayNum,
        periodTitle,
        item,
        speakerIndex: item.speakers ? item.speakers.length : 0,
        isNew: true,
        speaker: {
          name: '',
          role: item.category === 'industry-talk' && item.title.toLowerCase().includes('panel') ? 'Panel Moderator' : 'Speaker',
          organization: 'ICpEP-Oman TechTalk 2026'
        }
      });
    } else {
      const idx = Math.min(speakerIndex, item.speakers.length - 1);
      setEditingSpeakerState({
        dayNum,
        periodTitle,
        item,
        speakerIndex: idx,
        isNew: false,
        speaker: { ...item.speakers[idx] }
      });
    }
  };

  const handleSaveSpeaker = () => {
    if (!editingSpeakerState) return;
    const { dayNum, periodTitle, item, speakerIndex, isNew, speaker } = editingSpeakerState;
    if (!speaker.name.trim()) {
      showToast('Please enter a speaker name');
      return;
    }

    const currentSpeakers = item.speakers ? [...item.speakers] : [];
    if (isNew) {
      currentSpeakers.push(speaker);
    } else {
      currentSpeakers[speakerIndex] = speaker;
    }

    updateScheduleItem(dayNum, periodTitle, item.id, {
      speakers: currentSpeakers
    });

    showToast(`Speaker updated to "${speaker.name}"!`);
    setEditingSpeakerState(null);
  };

  const handleDeleteSpeaker = () => {
    if (!editingSpeakerState) return;
    const { dayNum, periodTitle, item, speakerIndex, isNew } = editingSpeakerState;
    if (isNew) {
      setEditingSpeakerState(null);
      return;
    }

    const currentSpeakers = item.speakers ? [...item.speakers] : [];
    const updated = currentSpeakers.filter((_, i) => i !== speakerIndex);

    updateScheduleItem(dayNum, periodTitle, item.id, {
      speakers: updated
    });

    showToast('Speaker removed from activity');
    setEditingSpeakerState(null);
  };

  const togglePeriod = (periodTitle: string) => {
    setExpandedPeriods((prev) => ({
      ...prev,
      [periodTitle]: !prev[periodTitle]
    }));
  };

  const currentSchedule = daySchedules.find((d) => d.day === activeDay) || daySchedules[0];

  // Helper to generate simple .ics calendar file for the selected day
  const downloadIcs = (dayNum: number) => {
    const isDay1 = dayNum === 1;
    const startStr = isDay1 ? "20261030T040000Z" : "20261031T033000Z";
    const endStr = isDay1 ? "20261030T163000Z" : "20261031T123000Z";
    const title = isDay1 
      ? "ICpEP-Oman TechTalk 2026 - Day 1 (Muscat Conference & Gala)"
      : "ICpEP-Oman TechTalk 2026 - Day 2 (Virtual Workshops & intPE Conferment)";
    const location = isDay1 
      ? "Wyndham Hotel, Muscat, Sultanate of Oman"
      : "Virtual Conference Hub & Cisco Webex";
    const desc = "ICpEP-Oman TechTalk 2026: Engineering the Digital Future. 10 CPD Units Hybrid Event.";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ICpEP-Oman//TechTalk 2026//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${location}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ICpEP_TechTalk_2026_Day_${dayNum}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterMatches = (item: ScheduleItem) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'talks') {
      return item.category === 'keynote' || item.category === 'org-talk' || item.category === 'industry-talk';
    }
    if (selectedCategory === 'conferment') {
      return item.category === 'conferment';
    }
    if (selectedCategory === 'workshops') {
      return item.category === 'workshop' || item.category === 'short-course';
    }
    if (selectedCategory === 'gala') {
      return item.category === 'gala';
    }
    return true;
  };

  return (
    <section id="schedule" className="py-16 lg:py-24 bg-[#071326] border-b border-[#e5b94c]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e5b94c] font-semibold">
            Two-Day Comprehensive Program
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Event Schedule & Program of Activities
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            Delivering high-impact technology lectures, international registry investitures, and hands-on masterclasses across Muscat and virtual streams.
          </p>
        </div>

        {/* Day Switcher Segmented Control */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <div className="inline-flex p-1.5 rounded-xl bg-[#0a1b35] border border-[#e5b94c]/30 shadow-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveDay(1)}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeDay === 1
                  ? 'bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] shadow-md'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-[#0f2448]/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Day 1 — Muscat, Oman (Oct 30, 2026)</span>
            </button>

            <button
              onClick={() => setActiveDay(2)}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeDay === 2
                  ? 'bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] shadow-md'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-[#0f2448]/60'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Day 2 — Online (Oct 31, 2026)</span>
            </button>
          </div>

          {/* Add to Calendar Button */}
          <button
            onClick={() => downloadIcs(activeDay)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#0f2448] border border-[#e5b94c]/30 text-xs sm:text-sm font-medium text-[#fcedbe] hover:bg-[#163363] hover:border-[#e5b94c]/60 transition-colors"
            title="Download iCal (.ics) calendar event"
          >
            <Download className="w-4 h-4 text-[#e5b94c]" />
            <span>Add Day {activeDay} to Calendar</span>
          </button>
        </div>

        {/* Category Filter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5 text-[#e5b94c]" />
            <span>Filter Session:</span>
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#e5b94c] text-[#071326] font-bold'
                : 'bg-[#0a1b35] text-slate-300 hover:text-slate-100 border border-[#e5b94c]/20'
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setSelectedCategory('talks')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedCategory === 'talks'
                ? 'bg-[#e5b94c] text-[#071326] font-bold'
                : 'bg-[#0a1b35] text-slate-300 hover:text-slate-100 border border-[#e5b94c]/20'
            }`}
          >
            Keynotes & Tech Talks
          </button>
          <button
            onClick={() => setSelectedCategory('conferment')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedCategory === 'conferment'
                ? 'bg-[#e5b94c] text-[#071326] font-bold'
                : 'bg-[#0a1b35] text-slate-300 hover:text-slate-100 border border-[#e5b94c]/20'
            }`}
          >
            AER / intPE Conferment
          </button>
          {activeDay === 1 && (
            <button
              onClick={() => setSelectedCategory('gala')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedCategory === 'gala'
                  ? 'bg-[#e5b94c] text-[#071326] font-bold'
                  : 'bg-[#0a1b35] text-slate-300 hover:text-slate-100 border border-[#e5b94c]/20'
              }`}
            >
              Anniversary Gala Night
            </button>
          )}
          {activeDay === 2 && (
            <button
              onClick={() => setSelectedCategory('workshops')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedCategory === 'workshops'
                  ? 'bg-[#e5b94c] text-[#071326] font-bold'
                  : 'bg-[#0a1b35] text-slate-300 hover:text-slate-100 border border-[#e5b94c]/20'
              }`}
            >
              Workshops & Short Courses
            </button>
          )}
        </div>

        {/* Active Day Header Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0f2448] via-[#0a1b35] to-[#071326] border border-[#e5b94c]/40 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#e5b94c] uppercase tracking-wider">
              {currentSchedule.mode === 'Face-to-Face' ? (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Face-to-Face Conference & Gala</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Virtual Interactive Sessions</span>
                </>
              )}
              <span>·</span>
              <span>{currentSchedule.date}</span>
            </div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              {currentSchedule.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {currentSchedule.subtitle}
            </p>
          </div>

          <div className="text-right shrink-0 bg-[#071326]/60 p-3 rounded-lg border border-[#e5b94c]/20">
            <div className="text-xs text-slate-400">Venue Location</div>
            <div className="text-sm font-semibold text-[#fcedbe]">
              {currentSchedule.venue}
            </div>
          </div>
        </div>

        {/* Sessions Timeline & Accordions */}
        <div className="space-y-6">
          {currentSchedule.sessions.map((period, pIdx) => {
            const visibleItems = period.items.filter(filterMatches);
            const isExpanded = expandedPeriods[period.period] ?? true;

            if (visibleItems.length === 0) return null;

            return (
              <div
                key={pIdx}
                className="rounded-2xl bg-[#0a1b35]/70 border border-[#e5b94c]/30 overflow-hidden shadow-lg transition-all"
              >
                {/* Period Header / Collapsible Bar */}
                <button
                  onClick={() => togglePeriod(period.period)}
                  className="w-full px-6 py-4 bg-[#0f2448]/90 hover:bg-[#163363]/80 border-b border-[#e5b94c]/20 flex items-center justify-between transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e5b94c]" />
                    <div>
                      <h4 className="font-cinzel text-base sm:text-lg font-bold text-slate-100">
                        {period.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {period.period} · {period.timeRange}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#fcedbe] hidden sm:inline">
                      {visibleItems.length} {visibleItems.length === 1 ? 'activity' : 'activities'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#e5b94c]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#e5b94c]" />
                    )}
                  </div>
                </button>

                {/* Period Items Container */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 divide-y divide-[#e5b94c]/15">
                    {visibleItems.map((item) => (
                      <div
                        key={item.id}
                        className="py-4 first:pt-1 last:pb-1 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-start"
                      >
                        {/* Time & Category Badge */}
                        <div className="md:col-span-3 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#fcedbe] bg-[#071326] px-2.5 py-1 rounded border border-[#e5b94c]/25">
                            <Clock className="w-3.5 h-3.5 text-[#e5b94c]" />
                            <span>{item.time}</span>
                          </span>

                          <span className="text-[11px] font-medium text-slate-400 capitalize">
                            {item.category.replace('-', ' ')}
                          </span>
                        </div>

                        {/* Title, Details, Speakers */}
                        <div className="md:col-span-9 space-y-2">
                          <h5 className="text-sm sm:text-base font-bold text-slate-100">
                            {item.title}
                          </h5>

                          {item.description && (
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {/* Speakers & Moderator Section with Inline Edit Capability */}
                          <div className="pt-2 flex flex-wrap items-center gap-2">
                            {item.speakers && item.speakers.map((spk, sIdx) => {
                              const isModerator = spk.role?.toLowerCase().includes('moderator');
                              return (
                                <div
                                  key={sIdx}
                                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border group/speaker transition-all ${
                                    isModerator
                                      ? 'bg-[#0f2448] text-slate-100 border-[#e5b94c]/60 ring-1 ring-[#e5b94c]/30 shadow-sm'
                                      : 'bg-[#071326] text-slate-200 border border-[#e5b94c]/20 hover:border-[#e5b94c]/40'
                                  }`}
                                >
                                  {isModerator ? (
                                    <Mic className="w-3.5 h-3.5 text-[#e5b94c]" />
                                  ) : (
                                    <User className="w-3.5 h-3.5 text-[#e5b94c]" />
                                  )}
                                  <span className="font-semibold text-[#fcedbe]">{spk.name}</span>
                                  {spk.role && (
                                    <span className={isModerator ? 'text-[#e5b94c] font-medium' : 'text-slate-400'}>
                                      · {spk.role}
                                    </span>
                                  )}
                                  {spk.organization && (
                                    <span className="text-slate-400 hidden sm:inline">
                                      ({spk.organization})
                                    </span>
                                  )}
                                  {!isPublishMode && (
                                    <button
                                      onClick={() => handleOpenSpeakerEdit(activeDay, period.period, item, sIdx, false)}
                                      className="ml-1 p-0.5 rounded text-slate-400 hover:text-[#fcedbe] hover:bg-[#e5b94c]/20 transition-all cursor-pointer"
                                      title={`Edit ${spk.name}`}
                                    >
                                      <Edit className="w-3 h-3 text-[#e5b94c]" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}

                            {/* Button to edit or assign speaker (Hidden in publish mode) */}
                            {!isPublishMode && (
                              <button
                                onClick={() => handleOpenSpeakerEdit(activeDay, period.period, item, item.speakers?.length || 0, true)}
                                className="inline-flex items-center gap-1 text-[11px] text-[#e5b94c]/80 hover:text-[#fcedbe] bg-[#071326]/80 hover:bg-[#0f2448] px-2 py-1 rounded border border-dashed border-[#e5b94c]/30 hover:border-[#e5b94c] transition-all cursor-pointer"
                                title="Assign or edit speaker for this session"
                              >
                                <Plus className="w-3 h-3 text-[#e5b94c]" />
                                <span>{item.speakers && item.speakers.length > 0 ? 'Add Speaker' : '+ Assign Speaker'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Modal for Editing Speaker Directly in Schedule */}
        {editingSpeakerState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040c1a]/85 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-[#0a1b35] border-2 border-[#e5b94c] p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#e5b94c]/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#0f2448] text-[#e5b94c]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                      {editingSpeakerState.isNew ? 'Assign Speaker / Moderator' : 'Edit Speaker in Schedule'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Day {editingSpeakerState.dayNum} · {editingSpeakerState.item.time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSpeakerState(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#0f2448]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2.5 rounded bg-[#071326]/70 border border-[#e5b94c]/20 text-slate-300">
                <div className="text-[10px] uppercase font-mono text-[#e5b94c] font-semibold">Activity</div>
                <div className="font-bold text-xs text-slate-100 line-clamp-2 mt-0.5">
                  {editingSpeakerState.item.title}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Speaker / Moderator Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ferdi Canlas"
                    value={editingSpeakerState.speaker.name}
                    onChange={(e) =>
                      setEditingSpeakerState({
                        ...editingSpeakerState,
                        speaker: { ...editingSpeakerState.speaker, name: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/40 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Panel Moderator, Keynote Speaker, Industry Speaker"
                    value={editingSpeakerState.speaker.role}
                    onChange={(e) =>
                      setEditingSpeakerState({
                        ...editingSpeakerState,
                        speaker: { ...editingSpeakerState.speaker, role: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Organization / Affiliation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ICpEP-Oman TechTalk 2026"
                    value={editingSpeakerState.speaker.organization || ''}
                    onChange={(e) =>
                      setEditingSpeakerState({
                        ...editingSpeakerState,
                        speaker: { ...editingSpeakerState.speaker, organization: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#e5b94c]/20 flex items-center justify-between gap-2">
                {!editingSpeakerState.isNew ? (
                  <button
                    type="button"
                    onClick={handleDeleteSpeaker}
                    className="px-3 py-1.5 bg-red-950/40 text-red-300 hover:text-red-100 hover:bg-red-900/60 rounded border border-red-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSpeakerState(null)}
                    className="px-3 py-1.5 bg-[#0f2448] text-slate-300 hover:text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSpeaker}
                    className="px-4 py-1.5 bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] font-bold rounded-lg hover:brightness-110 shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Speaker</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Feedback */}
        {toastMsg && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>
    </section>
  );
};
