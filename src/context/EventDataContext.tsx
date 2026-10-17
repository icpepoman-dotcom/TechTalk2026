import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  EVENT_DETAILS as INITIAL_EVENT_DETAILS,
  COLLABORATING_ORGS as INITIAL_COLLABORATING_ORGS,
  GLOBAL_PARTNERSHIPS as INITIAL_GLOBAL_PARTNERSHIPS,
  DAY_SCHEDULES as INITIAL_DAY_SCHEDULES,
  SHORT_COURSES as INITIAL_SHORT_COURSES,
  WORKSHOP_TRACKS as INITIAL_WORKSHOP_TRACKS,
  REGISTRATION_TIERS as INITIAL_REGISTRATION_TIERS,
  SPEAKERS as INITIAL_SPEAKERS,
  VENUE_INFO as INITIAL_VENUE_INFO
} from '../data/eventData';
import { DaySchedule, Speaker, ShortCourse, RegistrationTier, RegistrationSubmission, ScheduleItem, CollaboratingOrg } from '../types';
import { dbSetItem, dbGetItem, dbRemoveItem } from '../utils/storageDb';
import siteState from '../data/site_state.json';

const rawSite = (siteState as Record<string, any>) || {};

export interface CpdSectionData {
  units: number;
  badgeLabel: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  paragraphText: string;
  f2fBulletTitle: string;
  f2fBulletText: string;
  virtualBulletTitle: string;
  virtualBulletText: string;
  buttonText: string;
}

export const DEFAULT_CPD_DATA: CpdSectionData = {
  units: 10,
  badgeLabel: "10 CPD Units",
  headlinePrefix: "Attend the Full Hybrid Experience — ",
  headlineHighlight: "Earn 10 Continuing Professional Development (CPD) Units",
  headlineSuffix: " from a Single Event Registration.",
  paragraphText: "One hybrid registration covering both the Day 1 face-to-face Technology Talk & Gala Night and the Day 2 online breakout workshops qualifies attendees for 10 CPD units — the full value of multiple separate activities in one sign-up.",
  f2fBulletTitle: "Day 1 Face-to-Face Component:",
  f2fBulletText: "Keynotes, power grid technologies, smart factory automation, enterprise AI scale & ASEAN Engineer Registry conferment.",
  virtualBulletTitle: "Day 2 Virtual Breakout Component:",
  virtualBulletText: "Specialized workshops, 6 full remote short courses (AI, Cyber, IoT, Data Science), and intPE conferment stream.",
  buttonText: "Select Full Hybrid Registration"
};

export const INITIAL_CPD_DATA: CpdSectionData = (rawSite.cpdData && typeof rawSite.cpdData === 'object')
  ? { ...DEFAULT_CPD_DATA, ...rawSite.cpdData }
  : DEFAULT_CPD_DATA;

const STORAGE_KEY_EVENT_DATA = 'icpep_techtalk_2026_full_event_data';
const STORAGE_KEY_ATTENDEES = 'icpep_techtalk_2026_attendees';
const STORAGE_KEY_AUTH = 'icpep_techtalk_admin_auth';

export interface EventDataContextType {
  eventDetails: typeof INITIAL_EVENT_DETAILS;
  cpdData: CpdSectionData;
  collaboratingOrgs: CollaboratingOrg[];
  globalPartnerships: typeof INITIAL_GLOBAL_PARTNERSHIPS;
  daySchedules: DaySchedule[];
  shortCourses: ShortCourse[];
  workshopTracks: typeof INITIAL_WORKSHOP_TRACKS;
  registrationTiers: RegistrationTier[];
  speakers: Speaker[];
  venueInfo: typeof INITIAL_VENUE_INFO;
  attendees: RegistrationSubmission[];

  // Update actions
  updateEventDetails: (details: Partial<typeof INITIAL_EVENT_DETAILS>) => void;
  updateCpdData: (data: Partial<CpdSectionData>) => void;
  updateCollaboratingOrgs: (orgs: CollaboratingOrg[]) => void;
  updateGlobalPartnerships: (partners: typeof INITIAL_GLOBAL_PARTNERSHIPS) => void;
  updateDaySchedules: (schedules: DaySchedule[]) => void;
  updateShortCourses: (courses: ShortCourse[]) => void;
  updateWorkshopTracks: (tracks: typeof INITIAL_WORKSHOP_TRACKS) => void;
  updateRegistrationTiers: (tiers: RegistrationTier[]) => void;
  updateSpeakers: (speakers: Speaker[]) => void;
  updateVenueInfo: (venue: Partial<typeof INITIAL_VENUE_INFO>) => void;

  // Specific helpers
  addAttendee: (submission: RegistrationSubmission) => void;
  toggleAttendeeCheckIn: (attendeeId: string) => void;
  deleteAttendee: (attendeeId: string) => void;

  // Schedule granular helpers
  addScheduleItem: (dayNum: number, periodTitle: string, item: ScheduleItem) => void;
  updateScheduleItem: (dayNum: number, periodTitle: string, itemId: string, item: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (dayNum: number, periodTitle: string, itemId: string) => void;

  // Speaker granular helpers
  addSpeaker: (speaker: Speaker) => void;
  updateSpeaker: (speakerId: string, speaker: Partial<Speaker>) => void;
  deleteSpeaker: (speakerId: string) => void;

  // Course granular helpers
  addShortCourse: (course: ShortCourse) => void;
  updateShortCourse: (courseId: string, course: Partial<ShortCourse>) => void;
  deleteShortCourse: (courseId: string) => void;

  // Admin controls
  isAdminLoggedIn: boolean;
  isAdminPanelOpen: boolean;
  openAdminPanel: () => void;
  closeAdminPanel: () => void;
  loginAdmin: (pass: string) => boolean;
  logoutAdmin: () => void;

  // Publish / Visitor Mode (toggle between editing tools visible and public preview)
  isPublishMode: boolean;
  togglePublishMode: () => void;
  setPublishMode: (val: boolean) => void;

  // Server persistence (syncs updates across all visitors & published instances)
  saveToServer: (customImages?: Record<string, any>) => Promise<{ success: boolean; message: string }>;
  isServerSaving: boolean;
  lastServerSavedTime: string | null;

  // Full backup & restore
  resetAllToDefaults: () => void;
  exportFullSiteData: (customImages?: Record<string, any>) => string;
  importFullSiteData: (jsonStr: string, onCustomImages?: (images: Record<string, any>) => void) => boolean;
}

const EventDataContext = createContext<EventDataContextType | undefined>(undefined);

// Initial mock attendees for realistic demonstration
const SEED_ATTENDEES: RegistrationSubmission[] = [
  {
    id: "ICPEP-2026-881923",
    fullName: "Engr. Marco Villanueva",
    email: "mvillanueva@gmail.com",
    phone: "+968 9452 1198",
    affiliation: "Petroleum Development Oman (PDO)",
    prcLicenseNo: "0084729",
    tierId: "tier-f2f",
    isHybridBundle: true,
    selectedWorkshopTrack: "Artificial Intelligence & Generative AI",
    selectedShortCourse: "Introduction to Modern Artificial Intelligence",
    dietaryRestrictions: "Standard Buffet",
    timestamp: "2026-09-28T10:15:00.000Z"
  },
  {
    id: "ICPEP-2026-442819",
    fullName: "Maria Santos",
    email: "msantos@student.utas.edu.om",
    phone: "+968 9123 7741",
    affiliation: "University of Technology and Applied Sciences",
    prcLicenseNo: "N/A (Student)",
    tierId: "tier-online-student",
    isHybridBundle: false,
    selectedWorkshopTrack: "Cybersecurity Essentials",
    selectedShortCourse: "Introduction to Cybersecurity",
    timestamp: "2026-09-29T14:30:00.000Z"
  }
];

export const EventDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [eventDetails, setEventDetails] = useState<typeof INITIAL_EVENT_DETAILS>(INITIAL_EVENT_DETAILS);
  const [cpdData, setCpdData] = useState<CpdSectionData>(INITIAL_CPD_DATA);
  const [collaboratingOrgs, setCollaboratingOrgs] = useState<CollaboratingOrg[]>(INITIAL_COLLABORATING_ORGS);
  const [globalPartnerships, setGlobalPartnerships] = useState(INITIAL_GLOBAL_PARTNERSHIPS);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>(INITIAL_DAY_SCHEDULES);
  const [shortCourses, setShortCourses] = useState<ShortCourse[]>(INITIAL_SHORT_COURSES);
  const [workshopTracks, setWorkshopTracks] = useState(INITIAL_WORKSHOP_TRACKS);
  const [registrationTiers, setRegistrationTiers] = useState<RegistrationTier[]>(INITIAL_REGISTRATION_TIERS);
  const [speakers, setSpeakers] = useState<Speaker[]>(INITIAL_SPEAKERS);
  const [venueInfo, setVenueInfo] = useState<typeof INITIAL_VENUE_INFO>(INITIAL_VENUE_INFO);
  const [attendees, setAttendees] = useState<RegistrationSubmission[]>(SEED_ATTENDEES);

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
  });
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);

  // Publish / Visitor mode state
  // When Admin is logged out, strictly maintain Visitor Preview mode (true)
  const STORAGE_KEY_PUBLISH_MODE = 'icpep_techtalk_publish_mode';
  const [isPublishMode, setIsPublishMode] = useState<boolean>(() => {
    const isAuth = localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    if (!isAuth) return true; // Maintain visitor preview when logged out
    return localStorage.getItem(STORAGE_KEY_PUBLISH_MODE) === 'true';
  });

  const [isServerSaving, setIsServerSaving] = useState<boolean>(false);
  const [lastServerSavedTime, setLastServerSavedTime] = useState<string | null>(null);

  // Effective publish mode: If admin is logged out, ALWAYS strictly force Visitor Preview mode (true)
  const effectivePublishMode = !isAdminLoggedIn ? true : isPublishMode;

  const togglePublishMode = () => {
    if (!isAdminLoggedIn) return; // Only logged in admin can toggle
    setIsPublishMode((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_PUBLISH_MODE, String(next));
      return next;
    });
  };

  const setPublishMode = (val: boolean) => {
    if (!isAdminLoggedIn) return; // Only logged in admin can change
    setIsPublishMode(val);
    localStorage.setItem(STORAGE_KEY_PUBLISH_MODE, String(val));
  };

  // Keyboard shortcut listener (Ctrl+Shift+A or Alt+Shift+A) to open admin panel even in publish mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminPanelOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Also check URL hash or query for #admin or ?admin=true
    if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      setIsAdminPanelOpen(true);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const applyParsedData = (parsed: any) => {
    if (!parsed || typeof parsed !== 'object') return;
    if (parsed.eventDetails) {
      setEventDetails((prev) => ({
        ...INITIAL_EVENT_DETAILS,
        ...prev,
        ...parsed.eventDetails
      }));
    }
    if (parsed.cpdData) setCpdData(parsed.cpdData);
    if (parsed.collaboratingOrgs) setCollaboratingOrgs(parsed.collaboratingOrgs);
    if (parsed.globalPartnerships) setGlobalPartnerships(parsed.globalPartnerships);
    if (parsed.daySchedules) {
      // Ensure panel talk d1-13 has Dr. Ferdi Canlas as moderator
      const patchedSchedules = parsed.daySchedules.map((ds: DaySchedule) => {
        if (ds.day === 1) {
          return {
            ...ds,
            sessions: ds.sessions.map((sess) => ({
              ...sess,
              items: sess.items.map((it) => {
                if (it.id === 'd1-13' && (!it.speakers || it.speakers.length === 0)) {
                  return {
                    ...it,
                    speakers: [
                      {
                        name: "Dr. Ferdi Canlas",
                        role: "Panel Moderator",
                        organization: "ICpEP-Oman TechTalk 2026"
                      }
                    ]
                  };
                }
                return it;
              })
            }))
          };
        }
        return ds;
      });
      setDaySchedules(patchedSchedules);
    }
    if (parsed.shortCourses) {
      const mergedCourses = INITIAL_SHORT_COURSES.map((initCourse) => {
        const found = parsed.shortCourses.find((c: ShortCourse) => c.id === initCourse.id);
        return found ? { ...initCourse, ...found } : initCourse;
      });
      setShortCourses(mergedCourses);
    }
    if (parsed.workshopTracks) setWorkshopTracks(parsed.workshopTracks);
    if (parsed.registrationTiers) {
      const mergedTiers = INITIAL_REGISTRATION_TIERS.map((initTier) => {
        const found = parsed.registrationTiers.find((t: RegistrationTier) => t.id === initTier.id);
        return found ? { ...initTier, ...found } : initTier;
      });
      setRegistrationTiers(mergedTiers);
    }
    if (parsed.speakers) {
      const mergedSpeakers = INITIAL_SPEAKERS.map((initSpk) => {
        const saved = parsed.speakers.find((s: Speaker) => s.id === initSpk.id);
        if (!saved) return initSpk;
        return {
          ...initSpk,
          ...saved,
          photoUrl: saved.photoUrl || initSpk.photoUrl
        };
      });
      const customSpeakers = parsed.speakers.filter(
        (s: Speaker) => !INITIAL_SPEAKERS.some((init) => init.id === s.id)
      );
      setSpeakers([...mergedSpeakers, ...customSpeakers]);
    }
    if (parsed.venueInfo) setVenueInfo(parsed.venueInfo);
  };

  // Load persisted data on mount (localStorage for instant paint, IndexedDB for guaranteed retention)
  useEffect(() => {
    let active = true;

    // 1. Synchronous localStorage check
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EVENT_DATA);
      if (stored) {
        applyParsedData(JSON.parse(stored));
      }
      const storedAttendees = localStorage.getItem(STORAGE_KEY_ATTENDEES);
      if (storedAttendees) {
        setAttendees(JSON.parse(storedAttendees));
      }
    } catch (err) {
      console.warn('Failed to parse stored localStorage event data:', err);
    }

    // 2. Asynchronous IndexedDB check (primary persistent database)
    dbGetItem<Record<string, any>>(STORAGE_KEY_EVENT_DATA).then((dbData) => {
      if (!active || !dbData) return;
      applyParsedData(dbData);
    }).catch(() => {});

    dbGetItem<RegistrationSubmission[]>(STORAGE_KEY_ATTENDEES).then((dbAtt) => {
      if (!active || !dbAtt) return;
      if (Array.isArray(dbAtt) && dbAtt.length > 0) {
        setAttendees(dbAtt);
      }
    }).catch(() => {});

    // 3. Server Check: Load live updates saved to server if running with server backend
    fetch('/api/site-data')
      .then((res) => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then((serverRes) => {
        if (!active || !serverRes || !serverRes.saved || !serverRes.data) return;
        applyParsedData(serverRes.data);
      })
      .catch((err) => {
        console.info('Server sync check:', err?.message || 'client cached');
      });

    return () => {
      active = false;
    };
  }, []);

  // Dual-Persist to IndexedDB and LocalStorage
  const saveStateToStorage = (data: Record<string, unknown>) => {
    // 1. Save to high-capacity IndexedDB
    dbSetItem(STORAGE_KEY_EVENT_DATA, data).catch((err) => {
      console.warn('Failed to save to IndexedDB:', err);
    });

    // 2. Save to localStorage safely
    try {
      localStorage.setItem(STORAGE_KEY_EVENT_DATA, JSON.stringify(data));
    } catch (err: any) {
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        // Quota safely handled by IndexedDB
      } else {
        console.warn('Notice saving to localStorage:', err);
      }
    }
  };

  const isLoadedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      isLoadedRef.current = true;
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Debounced auto-save to server disk so ANY edit made anywhere on the page
  // automatically updates site_state.json on disk without needing manual clicks.
  useEffect(() => {
    saveStateToStorage({
      eventDetails,
      cpdData,
      collaboratingOrgs,
      globalPartnerships,
      daySchedules,
      shortCourses,
      workshopTracks,
      registrationTiers,
      speakers,
      venueInfo
    });

    if (!isLoadedRef.current) return;

    const timeout = setTimeout(() => {
      fetch('/api/site-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: 'icpep-techtalk-2026-v2',
          savedAt: new Date().toISOString(),
          eventDetails,
          cpdData,
          collaboratingOrgs,
          globalPartnerships,
          daySchedules,
          shortCourses,
          workshopTracks,
          registrationTiers,
          speakers,
          venueInfo
        })
      }).catch(() => {});
    }, 1200);

    return () => clearTimeout(timeout);
  }, [
    eventDetails,
    cpdData,
    collaboratingOrgs,
    globalPartnerships,
    daySchedules,
    shortCourses,
    workshopTracks,
    registrationTiers,
    speakers,
    venueInfo
  ]);

  useEffect(() => {
    dbSetItem(STORAGE_KEY_ATTENDEES, attendees).catch(() => {});
    try {
      localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(attendees));
    } catch (err: any) {
      if (err?.name === 'QuotaExceededError') {
        // Handled
      } else {
        console.warn('Failed to save attendees:', err);
      }
    }
  }, [attendees]);

  // Update Methods
  const updateEventDetails = (details: Partial<typeof INITIAL_EVENT_DETAILS>) => {
    setEventDetails((prev) => ({ ...prev, ...details }));
  };

  const updateCpdData = (data: Partial<CpdSectionData>) => {
    setCpdData((prev) => ({ ...prev, ...data }));
  };

  const updateCollaboratingOrgs = (orgs: CollaboratingOrg[]) => {
    setCollaboratingOrgs(orgs);
  };

  const updateGlobalPartnerships = (partners: typeof INITIAL_GLOBAL_PARTNERSHIPS) => {
    setGlobalPartnerships(partners);
  };

  const updateDaySchedules = (schedules: DaySchedule[]) => {
    setDaySchedules(schedules);
  };

  const updateShortCourses = (courses: ShortCourse[]) => {
    setShortCourses(courses);
  };

  const updateWorkshopTracks = (tracks: typeof INITIAL_WORKSHOP_TRACKS) => {
    setWorkshopTracks(tracks);
  };

  const updateRegistrationTiers = (tiers: RegistrationTier[]) => {
    setRegistrationTiers(tiers);
  };

  const updateSpeakers = (newSpeakers: Speaker[]) => {
    setSpeakers(newSpeakers);
  };

  const updateVenueInfo = (venue: Partial<typeof INITIAL_VENUE_INFO>) => {
    setVenueInfo((prev: typeof INITIAL_VENUE_INFO) => ({ ...prev, ...venue }));
  };

  const addAttendee = (submission: RegistrationSubmission) => {
    setAttendees((prev) => [submission, ...prev]);
    // Also decrement remaining slots if in-person
    if (submission.tierId === 'tier-f2f') {
      setEventDetails((prev) => ({
        ...prev,
        slotsRemaining: Math.max(0, prev.slotsRemaining - 1)
      }));
    }
  };

  const toggleAttendeeCheckIn = (attendeeId: string) => {
    setAttendees((prev) =>
      prev.map((att) => {
        if (att.id === attendeeId) {
          return {
            ...att,
            checkedIn: !(att as { checkedIn?: boolean }).checkedIn
          };
        }
        return att;
      })
    );
  };

  const deleteAttendee = (attendeeId: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== attendeeId));
  };

  // Schedule Helpers
  const addScheduleItem = (dayNum: number, periodTitle: string, item: ScheduleItem) => {
    setDaySchedules((prev) =>
      prev.map((day) => {
        if (day.day !== dayNum) return day;
        return {
          ...day,
          sessions: day.sessions.map((sess) => {
            if (sess.period !== periodTitle && sess.title !== periodTitle) return sess;
            return {
              ...sess,
              items: [...sess.items, item]
            };
          })
        };
      })
    );
  };

  const updateScheduleItem = (dayNum: number, periodTitle: string, itemId: string, updated: Partial<ScheduleItem>) => {
    setDaySchedules((prev) =>
      prev.map((day) => {
        if (day.day !== dayNum) return day;
        return {
          ...day,
          sessions: day.sessions.map((sess) => {
            return {
              ...sess,
              items: sess.items.map((it) => (it.id === itemId ? { ...it, ...updated } : it))
            };
          })
        };
      })
    );
  };

  const deleteScheduleItem = (dayNum: number, periodTitle: string, itemId: string) => {
    setDaySchedules((prev) =>
      prev.map((day) => {
        if (day.day !== dayNum) return day;
        return {
          ...day,
          sessions: day.sessions.map((sess) => ({
            ...sess,
            items: sess.items.filter((it) => it.id !== itemId)
          }))
        };
      })
    );
  };

  // Speaker Helpers
  const addSpeaker = (newSpeaker: Speaker) => {
    setSpeakers((prev) => [...prev, newSpeaker]);
  };

  const updateSpeaker = (speakerId: string, updated: Partial<Speaker>) => {
    setSpeakers((prev) =>
      prev.map((spk) => (spk.id === speakerId ? { ...spk, ...updated } : spk))
    );
  };

  const deleteSpeaker = (speakerId: string) => {
    setSpeakers((prev) => prev.filter((spk) => spk.id !== speakerId));
  };

  // Short Course Helpers
  const addShortCourse = (course: ShortCourse) => {
    setShortCourses((prev) => [...prev, course]);
  };

  const updateShortCourse = (courseId: string, updated: Partial<ShortCourse>) => {
    setShortCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updated } : c))
    );
  };

  const deleteShortCourse = (courseId: string) => {
    setShortCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  // Admin Auth
  const loginAdmin = (password: string): boolean => {
    // Standard conference admin pass
    if (password === 'admin' || password === 'icpep2026' || password === 'oman2026' || password === 'techtalk') {
      setIsAdminLoggedIn(true);
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      setIsPublishMode(false); // Enable editing tools when admin logs in
      localStorage.setItem(STORAGE_KEY_PUBLISH_MODE, 'false');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setIsAdminPanelOpen(false);
    setIsPublishMode(true); // Maintain on Visitor Preview when logged out
    localStorage.setItem(STORAGE_KEY_PUBLISH_MODE, 'true');
  };

  const openAdminPanel = () => {
    setIsAdminPanelOpen(true);
  };

  const closeAdminPanel = () => {
    setIsAdminPanelOpen(false);
  };

  // Reset & Backup
  const resetAllToDefaults = () => {
    setEventDetails(INITIAL_EVENT_DETAILS);
    setCpdData(INITIAL_CPD_DATA);
    setCollaboratingOrgs(INITIAL_COLLABORATING_ORGS);
    setGlobalPartnerships(INITIAL_GLOBAL_PARTNERSHIPS);
    setDaySchedules(INITIAL_DAY_SCHEDULES);
    setShortCourses(INITIAL_SHORT_COURSES);
    setWorkshopTracks(INITIAL_WORKSHOP_TRACKS);
    setRegistrationTiers(INITIAL_REGISTRATION_TIERS);
    setSpeakers(INITIAL_SPEAKERS);
    setVenueInfo(INITIAL_VENUE_INFO);
    setAttendees(SEED_ATTENDEES);
    try {
      localStorage.removeItem(STORAGE_KEY_EVENT_DATA);
      localStorage.removeItem(STORAGE_KEY_ATTENDEES);
    } catch {}
    dbRemoveItem(STORAGE_KEY_EVENT_DATA).catch(() => {});
    dbRemoveItem(STORAGE_KEY_ATTENDEES).catch(() => {});
  };

  const exportFullSiteData = (customImages?: Record<string, any>): string => {
    const fullBundle = {
      version: 'icpep-techtalk-2026-v2',
      eventDetails,
      cpdData,
      collaboratingOrgs,
      globalPartnerships,
      daySchedules,
      shortCourses,
      workshopTracks,
      registrationTiers,
      speakers,
      venueInfo,
      attendees,
      customImages: customImages || undefined,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullBundle, null, 2);
  };

  const importFullSiteData = (jsonStr: string, onCustomImages?: (images: Record<string, any>) => void): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.eventDetails) setEventDetails(parsed.eventDetails);
      if (parsed.cpdData) setCpdData(parsed.cpdData);
      if (parsed.collaboratingOrgs) setCollaboratingOrgs(parsed.collaboratingOrgs);
      if (parsed.globalPartnerships) setGlobalPartnerships(parsed.globalPartnerships);
      if (parsed.daySchedules) setDaySchedules(parsed.daySchedules);
      if (parsed.shortCourses) setShortCourses(parsed.shortCourses);
      if (parsed.workshopTracks) setWorkshopTracks(parsed.workshopTracks);
      if (parsed.registrationTiers) setRegistrationTiers(parsed.registrationTiers);
      if (parsed.speakers) setSpeakers(parsed.speakers);
      if (parsed.venueInfo) setVenueInfo(parsed.venueInfo);
      if (parsed.attendees) setAttendees(parsed.attendees);

      if (parsed.customImages && onCustomImages) {
        onCustomImages(parsed.customImages);
      }
      return true;
    } catch (err) {
      console.error('Failed to import site data:', err);
      return false;
    }
  };

  const saveToServer = async (customImages?: Record<string, any>): Promise<{ success: boolean; message: string }> => {
    setIsServerSaving(true);
    try {
      const fullData = {
        version: 'icpep-techtalk-2026-v2',
        savedAt: new Date().toISOString(),
        eventDetails,
        cpdData,
        collaboratingOrgs,
        globalPartnerships,
        daySchedules,
        shortCourses,
        workshopTracks,
        registrationTiers,
        speakers,
        venueInfo,
        attendees,
        customImages: customImages || {}
      };

      const res = await fetch('/api/site-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });

      if (!res.ok) {
        throw new Error(`Server HTTP error ${res.status}`);
      }

      const json = await res.json();
      setLastServerSavedTime(new Date().toLocaleTimeString());
      return { success: true, message: json.message || 'Saved to server successfully!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Save to server note:', msg);
      return { success: false, message: msg || 'Failed to save to server' };
    } finally {
      setIsServerSaving(false);
    }
  };

  return (
    <EventDataContext.Provider
      value={{
        eventDetails,
        cpdData,
        collaboratingOrgs,
        globalPartnerships,
        daySchedules,
        shortCourses,
        workshopTracks,
        registrationTiers,
        speakers,
        venueInfo,
        attendees,

        updateEventDetails,
        updateCpdData,
        updateCollaboratingOrgs,
        updateGlobalPartnerships,
        updateDaySchedules,
        updateShortCourses,
        updateWorkshopTracks,
        updateRegistrationTiers,
        updateSpeakers,
        updateVenueInfo,

        addAttendee,
        toggleAttendeeCheckIn,
        deleteAttendee,

        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,

        addSpeaker,
        updateSpeaker,
        deleteSpeaker,

        addShortCourse,
        updateShortCourse,
        deleteShortCourse,

        isAdminLoggedIn,
        isAdminPanelOpen,
        openAdminPanel,
        closeAdminPanel,
        loginAdmin,
        logoutAdmin,

        isPublishMode: effectivePublishMode,
        togglePublishMode,
        setPublishMode,

        saveToServer,
        isServerSaving,
        lastServerSavedTime,

        resetAllToDefaults,
        exportFullSiteData,
        importFullSiteData
      }}
    >
      {children}
    </EventDataContext.Provider>
  );
};

export const useEventData = (): EventDataContextType => {
  const context = useContext(EventDataContext);
  if (!context) {
    throw new Error('useEventData must be used within an EventDataProvider');
  }
  return context;
};
