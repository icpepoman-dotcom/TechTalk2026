import React, { useState } from 'react';
import { BookOpen, Cpu, Shield, Network, Terminal, FileCode, CheckCircle, ExternalLink, Sparkles, Edit, Check } from 'lucide-react';
import { ShortCourse } from '../types';
import { useEventData } from '../context/EventDataContext';

interface WorkshopsAndCoursesProps {
  onEnrollClick: (courseTitle?: string) => void;
  onOpenEditCourseLink?: (courseId: string) => void;
}

export const WorkshopsAndCourses: React.FC<WorkshopsAndCoursesProps> = ({ onEnrollClick, onOpenEditCourseLink }) => {
  const { shortCourses, workshopTracks, isPublishMode, updateShortCourse } = useEventData();
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseUrlInput, setCourseUrlInput] = useState<string>('');

  const getCourseIcon = (code: string) => {
    switch (code) {
      case 'AI-101':
        return <Sparkles className="w-5 h-5 text-[#e5b94c]" />;
      case 'SEC-101':
        return <Shield className="w-5 h-5 text-[#e5b94c]" />;
      case 'IOT-101':
        return <Cpu className="w-5 h-5 text-[#e5b94c]" />;
      case 'DS-101':
        return <Network className="w-5 h-5 text-[#e5b94c]" />;
      case 'LNX-101':
        return <Terminal className="w-5 h-5 text-[#e5b94c]" />;
      default:
        return <FileCode className="w-5 h-5 text-[#e5b94c]" />;
    }
  };

  return (
    <section id="workshops" className="py-16 lg:py-24 bg-[#040c1a] border-b border-[#e5b94c]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e5b94c] font-semibold">
            Day 2 Skills Mastery & Global Badging
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Virtual Workshops & Remote Short Courses
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            Gain in-demand engineering competencies, learn live from international specialists in Mexico and Canada, and earn globally verified Cisco Networking Academy badges.
          </p>
        </div>

        {/* 3 Live Interactive Workshop Showcases */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#fcedbe]">
              Live Masterclass Breakout Sessions (Day 2)
            </h3>
            <span className="text-xs text-[#e5b94c] font-medium hidden sm:inline">
              Interactive Q&A · Real-World Case Studies
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Workshop 1 */}
            <div className="rounded-xl bg-[#0a1b35] border border-[#e5b94c]/30 p-6 flex flex-col justify-between hover:border-[#e5b94c]/60 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#e5b94c] bg-[#071326] px-2.5 py-1 rounded border border-[#e5b94c]/20">
                    Workshop 1 · 09:10–10:30 GST
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-100 leading-snug">
                  Enabling the Intelligent Factory
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  How integrated hardware, software, and predictive service solutions empower electronics manufacturers to transition to smart Industry 4.0 factories.
                </p>
                <div className="pt-2 text-xs text-[#fcedbe] font-medium">
                  Engr. Raymond Careon
                  <span className="text-slate-400 block text-[11px]">
                    Project Engineer, ASMPT SMT Solutions – Mexico
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-[#e5b94c]/15 text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#e5b94c]" />
                <span>Smart SMT · Industrial Telemetry · Automation</span>
              </div>
            </div>

            {/* Workshop 2 */}
            <div className="rounded-xl bg-[#0a1b35] border border-[#e5b94c]/30 p-6 flex flex-col justify-between hover:border-[#e5b94c]/60 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#e5b94c] bg-[#071326] px-2.5 py-1 rounded border border-[#e5b94c]/20">
                    Workshop 2 · 10:30–12:00 GST
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-100 leading-snug">
                  From Network Strategy to AI at Scale
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Designing secure, enterprise-ready infrastructure to support large-scale machine learning workloads, inference pipelines, and zero-trust networks.
                </p>
                <div className="pt-2 text-xs text-[#fcedbe] font-medium">
                  Engr. Reginald Norris Hernandez
                  <span className="text-slate-400 block text-[11px]">
                    AI Enthusiast Manager – Network Solution, CDW – Canada
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-[#e5b94c]/15 text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#e5b94c]" />
                <span>Enterprise AI Fabrics · Cloud Security · Scalability</span>
              </div>
            </div>

            {/* Workshop 3 */}
            <div className="rounded-xl bg-[#0a1b35] border border-[#e5b94c]/30 p-6 flex flex-col justify-between hover:border-[#e5b94c]/60 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#e5b94c] bg-[#071326] px-2.5 py-1 rounded border border-[#e5b94c]/20">
                    Workshop 3 · 12:00–13:00 GST
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-100 leading-snug">
                  PTC Global MENA Oman Write-Shop
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "Attend Now, Pay Later" practical portfolio writing clinic for engineers seeking ASEAN Engineer Registry (AER) and intPE registration.
                </p>
                <div className="pt-2 text-xs text-[#fcedbe] font-medium">
                  Engr. Trese Bustamante
                  <span className="text-slate-400 block text-[11px]">
                    Vice Chair, PTC-ERB & PTC-MENA International Affairs
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-[#e5b94c]/15 text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#e5b94c]" />
                <span>AER Portfolio · Peer Assessment · Global Mobility</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Full Remote Short Courses */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#e5b94c] font-semibold">
                Cisco Networking Academy & ICpEP Classroom
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100">
                6 Full Remote Short Courses Included
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Included in every registration tier · Learn anytime at your own pace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {shortCourses.map((course) => (
              <div
                key={course.id}
                className="group p-5 rounded-xl bg-[#071326] border border-[#e5b94c]/25 hover:border-[#e5b94c]/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-[#0f2448] border border-[#e5b94c]/30 flex items-center justify-center">
                      {getCourseIcon(course.code)}
                    </div>
                    <span className="text-xs font-mono text-[#e5b94c] font-semibold bg-[#0a1b35] px-2 py-0.5 rounded border border-[#e5b94c]/20">
                      {course.code}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-[#fcedbe] transition-colors leading-snug">
                    {course.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e5b94c]/15 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{course.duration}</span>
                    <span className="text-[#fcedbe] font-medium">{course.partner}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (course.enrollmentUrl && course.enrollmentUrl.trim()) {
                        window.open(course.enrollmentUrl.trim(), '_blank', 'noopener,noreferrer');
                      } else {
                        onEnrollClick(course.title);
                      }
                    }}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-[#fcedbe] bg-[#0f2448] hover:bg-[#163363] border border-[#e5b94c]/30 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{course.enrollmentUrl && course.enrollmentUrl.trim() ? 'Enroll at Portal' : 'Enroll with Registration'}</span>
                    <ExternalLink className="w-3 h-3 text-[#e5b94c]" />
                  </button>

                  {/* Inline Edit Link Button (Hidden in publish mode) */}
                  {!isPublishMode && (
                    <div className="pt-1.5 border-t border-[#e5b94c]/10 flex items-center justify-between text-[11px]">
                      {editingCourseId === course.id ? (
                        <div className="w-full space-y-1.5 bg-[#0a1b35] p-2 rounded border border-[#e5b94c]/30">
                          <input
                            type="url"
                            placeholder="Paste redirect URL..."
                            value={courseUrlInput}
                            onChange={(e) => setCourseUrlInput(e.target.value)}
                            className="w-full px-2 py-1 bg-[#071326] border border-[#e5b94c]/40 rounded text-[11px] text-slate-100 placeholder:text-slate-500"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingCourseId(null)}
                              className="px-2 py-0.5 rounded text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateShortCourse(course.id, { enrollmentUrl: courseUrlInput.trim() });
                                setEditingCourseId(null);
                              }}
                              className="px-2.5 py-0.5 rounded bg-[#e5b94c] text-[#071326] font-bold text-[10px]"
                            >
                              Save Link
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCourseId(course.id);
                              setCourseUrlInput(course.enrollmentUrl || '');
                            }}
                            className="text-[#e5b94c] hover:text-[#fcedbe] flex items-center gap-1 text-[11px] cursor-pointer"
                            title="Edit enrollment redirect link"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit Redirect</span>
                          </button>
                          {course.enrollmentUrl && course.enrollmentUrl.trim() ? (
                            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                              <Check className="w-3 h-3" />
                              <span>Redirect Active</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">
                              No Link Set
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Core Workshop Tracks Matrix */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0a1b35] border border-[#e5b94c]/30">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs uppercase tracking-widest text-[#e5b94c] font-semibold">
              Curriculum Architecture
            </span>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              5 Core Professional Workshop Tracks
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Focused learning paths addressing current technological transformation and global registry readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {workshopTracks.map((track, tIdx) => (
              <div
                key={tIdx}
                className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/20 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-mono text-[#e5b94c] uppercase tracking-wider mb-1">
                    Track 0{tIdx + 1}
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mb-2">
                    {track.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {track.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e5b94c]/15 space-y-1">
                  {track.topics.map((top: string, sIdx: number) => (
                    <div key={sIdx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#e5b94c]" />
                      <span>{top}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
