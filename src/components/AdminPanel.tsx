import React, { useState } from 'react';
import {
  X,
  Lock,
  Unlock,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Check,
  Calendar,
  User,
  Award,
  DollarSign,
  MapPin,
  Building,
  Users,
  Search,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  Sliders,
  ArrowUp,
  ArrowDown,
  Camera,
  QrCode,
  GitBranch,
  GitPullRequest,
  RefreshCw,
  Eye,
  EyeOff,
  Terminal,
  Image as ImageIcon
} from 'lucide-react';
import { useEventData } from '../context/EventDataContext';
import { useImageManager } from '../context/ImageContext';
import { ScheduleItem, Speaker, ShortCourse, RegistrationTier, CollaboratingOrg } from '../types';
import { COLLABORATING_ORGS as DEFAULT_ORGS } from '../data/eventData';
import { compressImage } from '../utils/imageCompressor';
import { getPartnerSlotId, resolvePartnerLogo } from '../utils/collaboratorUtils';
import {
  getGitHubConfig,
  saveGitHubConfig,
  testGitHubConnection,
  deliverToGitHub,
  GitHubConfig
} from '../utils/githubSync';
import { downloadFile } from '../utils/imagePath';

export const AdminPanel: React.FC = () => {
  const {
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
    updateRegistrationTiers,
    updateSpeakers,
    updateVenueInfo,

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
    closeAdminPanel,
    loginAdmin,
    logoutAdmin,

    isPublishMode,
    togglePublishMode,
    setPublishMode,

    saveToServer,
    isServerSaving,
    lastServerSavedTime,

    resetAllToDefaults,
    exportFullSiteData,
    importFullSiteData
  } = useEventData();

  const { openEditor, closeEditor, getImageUrl, updateSlotUrl, getExportableImagesData, importConfiguration } = useImageManager();

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'general'
    | 'cpd'
    | 'schedule'
    | 'speakers'
    | 'courses'
    | 'pricing'
    | 'venue'
    | 'partners'
    | 'attendees'
    | 'github'
    | 'backup'
  >('dashboard');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // GitHub Cloud Sync & Delivery states
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => getGitHubConfig());
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isGitHubSyncing, setIsGitHubSyncing] = useState(false);
  const [isTestingGitHub, setIsTestingGitHub] = useState(false);
  const [githubTestResult, setGithubTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTokenPassword, setShowTokenPassword] = useState(false);
  const [lastDeliveredInfo, setLastDeliveredInfo] = useState<{ time: string; sha?: string; url?: string } | null>(null);

  const handleDeliverToGitHub = async (showSuccessToast = true): Promise<{ success: boolean; message: string; sha?: string; commitUrl?: string }> => {
    setIsGitHubSyncing(true);
    try {
      const fullBundle = JSON.parse(exportFullSiteData(getExportableImagesData?.()));
      const res = await deliverToGitHub({
        siteState: fullBundle,
        customImages: getExportableImagesData?.()
      });
      if (res.success) {
        setGithubConfig(getGitHubConfig());
        setLastDeliveredInfo({
          time: new Date().toLocaleTimeString(),
          sha: res.sha,
          url: res.commitUrl
        });
        if (showSuccessToast) {
          showToast(`⚡ Delivered to GitHub! Commit ${res.sha ? res.sha.slice(0, 7) : ''} deployed.`);
        }
      } else {
        if (showSuccessToast) {
          showToast(`GitHub sync note: ${res.message}`);
        }
      }
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (showSuccessToast) {
        showToast(`GitHub delivery error: ${msg}`);
      }
      return { success: false, message: msg };
    } finally {
      setIsGitHubSyncing(false);
    }
  };

  const handleTestGitHubConnection = async () => {
    setIsTestingGitHub(true);
    setGithubTestResult(null);
    try {
      const res = await testGitHubConnection(githubConfig);
      setGithubTestResult(res);
      if (res.success) {
        saveGitHubConfig(githubConfig);
        showToast('✅ GitHub repository connection verified!');
      } else {
        showToast(`Connection failed: ${res.message}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setGithubTestResult({ success: false, message: msg });
      showToast(`Connection error: ${msg}`);
    } finally {
      setIsTestingGitHub(false);
    }
  };

  const updateConfigField = <K extends keyof GitHubConfig>(key: K, val: GitHubConfig[K]) => {
    const updated = { ...githubConfig, [key]: val };
    setGithubConfig(updated);
    saveGitHubConfig(updated);
  };

  // Editing state for schedules
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [editingSessionItem, setEditingSessionItem] = useState<{
    dayNum: number;
    periodTitle: string;
    item: ScheduleItem;
    isNew?: boolean;
  } | null>(null);

  // Editing state for speakers
  const [editingSpeaker, setEditingSpeaker] = useState<{
    speaker: Speaker;
    isNew?: boolean;
  } | null>(null);

  // Editing state for short courses
  const [editingCourse, setEditingCourse] = useState<{
    course: ShortCourse;
    isNew?: boolean;
  } | null>(null);

  // Attendee search query
  const [attendeeSearch, setAttendeeSearch] = useState('');

  if (!isAdminPanelOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(passwordInput.trim());
    if (success) {
      setAuthError(false);
      setPasswordInput('');
      showToast('Welcome, Administrator!');
    } else {
      setAuthError(true);
    }
  };

  const handleExportCsvAttendees = () => {
    if (attendees.length === 0) {
      showToast('No attendee records to export.');
      return;
    }
    const headers = ['Registration ID', 'Full Name', 'Email', 'Phone', 'Affiliation', 'PRC License', 'Track', 'Hybrid 10 CPD', 'Selected Workshop', 'Dietary Preference', 'Registered At'];
    const rows = attendees.map((a) => [
      a.id,
      `"${a.fullName}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.affiliation}"`,
      `"${a.prcLicenseNo || 'N/A'}"`,
      `"${a.tierId}"`,
      a.isHybridBundle ? 'YES' : 'NO',
      `"${a.selectedWorkshopTrack || 'N/A'}"`,
      `"${a.dietaryRestrictions || 'N/A'}"`,
      a.timestamp
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `icpep_techtalk_attendees_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Attendee list exported as CSV!');
  };

  // If not logged in, show Password Prompt Modal
  if (!isAdminLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040c1a]/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-2xl bg-[#0a1b35] border-2 border-[#e5b94c] shadow-2xl p-6 sm:p-8 text-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <button
            onClick={closeAdminPanel}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#0f2448] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-[#0f2448] border-2 border-[#e5b94c] flex items-center justify-center mx-auto text-[#fcedbe] shadow-inner">
            <Lock className="w-8 h-8 text-[#e5b94c]" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#e5b94c] font-bold">
              Restricted Access
            </span>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              Organizer Admin Portal
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Enter authorized administrator password to manage conference schedules, attendees, pricing, and all website content.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                className="w-full px-3.5 py-2.5 bg-[#071326] border border-[#e5b94c]/40 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-[#e5b94c]"
              />
              {authError && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Invalid password. Please enter the correct organizer credentials.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-[#071326] bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] rounded-lg hover:brightness-110 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered attendees for the Attendee Registry tab
  const filteredAttendees = attendees.filter((a) => {
    if (!attendeeSearch.trim()) return true;
    const q = attendeeSearch.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.affiliation.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      (a.prcLicenseNo && a.prcLicenseNo.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#040c1a]/90 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0a1b35] border-l-2 border-[#e5b94c] shadow-2xl flex flex-col h-full text-slate-100">
        {/* Top Bar of the Admin Panel */}
        <div className="p-4 sm:p-5 border-b border-[#e5b94c]/25 bg-[#071326] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0f2448] border border-[#e5b94c]/50 flex items-center justify-center text-[#fcedbe]">
              <Sparkles className="w-5 h-5 text-[#e5b94c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-slate-100">
                  TechTalk 2026 Admin Panel
                </h3>
                <span className="text-[10px] font-mono text-[#071326] bg-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                  Authenticated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live editor for conference agenda, keynote bios, pricing, CPD specs & attendees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2448] hover:bg-[#163363] text-xs font-semibold text-[#fcedbe] rounded-lg border border-[#e5b94c]/40 cursor-pointer shadow-sm transition-all"
              title="Deliver changes to GitHub repository or configure auto-sync"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#e5b94c]" />
              <span className="hidden sm:inline">GitHub:</span>
              <span className="font-mono text-emerald-400 text-[11px]">
                {githubConfig.owner ? `${githubConfig.owner}/${githubConfig.repo}` : 'Connect'}
              </span>
            </button>

            <button
              onClick={async () => {
                const images = getExportableImagesData?.();
                const res = await saveToServer(images);
                let ghMsg = '';
                if (githubConfig.autoSync && githubConfig.token && githubConfig.owner) {
                  const ghRes = await handleDeliverToGitHub(false);
                  if (ghRes.success) {
                    ghMsg = ` & delivered to GitHub (${ghRes.sha ? ghRes.sha.slice(0, 7) : ''})!`;
                  }
                }
                if (res.success) {
                  showToast(`✅ Saved & Published to Server${ghMsg}`);
                } else {
                  showToast(`Saved locally: ${res.message}${ghMsg}`);
                }
              }}
              disabled={isServerSaving || isGitHubSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-xs font-bold text-white rounded-lg shadow-md cursor-pointer disabled:opacity-50 transition-all"
              title="Publish updates to server and deliver to GitHub"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isServerSaving || isGitHubSyncing ? 'Publishing...' : 'Save & Publish Live'}</span>
            </button>

            <button
              onClick={() => {
                showToast('Website changes saved in real time!');
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2448] text-xs font-semibold text-[#fcedbe] rounded border border-[#e5b94c]/40 hover:bg-[#163363]"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Saved</span>
            </button>

            <button
              onClick={() => {
                logoutAdmin();
                closeEditor();
              }}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#0f2448] rounded border border-[#e5b94c]/20 hover:bg-red-950/40 hover:border-red-500/40 transition-colors"
              title="Logout from admin session"
            >
              Logout
            </button>

            <button
              onClick={closeAdminPanel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0f2448] transition-colors"
              aria-label="Close admin panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Publish Mode Toggle Banner */}
        <div className={`px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b transition-colors ${
          isPublishMode
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-100'
            : 'bg-amber-950/40 border-[#e5b94c]/40 text-amber-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full shrink-0 ${isPublishMode ? 'bg-emerald-400 ring-4 ring-emerald-400/20 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>{isPublishMode ? '🌐 PUBLISHED VISITOR MODE (Active)' : '🛠️ EDITING MODE (Active)'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-[#071326] text-[#fcedbe] border border-[#e5b94c]/30">
                  Shortcut: Ctrl+Shift+A
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isPublishMode
                  ? 'Admin buttons, "Pictures" studio, and all inline edit icons are HIDDEN from visitors on the live site.'
                  : 'Organizer controls, Admin Panel header button, Pictures studio, and inline edit tools are VISIBLE.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              togglePublishMode();
              showToast(isPublishMode ? 'Switched to Editing Mode (Tools Visible)' : 'Switched to Published Mode (Tools Hidden)');
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap ${
              isPublishMode
                ? 'bg-gradient-to-r from-amber-400 to-[#e5b94c] text-[#071326] hover:brightness-110'
                : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-[#071326] hover:brightness-110'
            }`}
          >
            {isPublishMode ? 'Turn Off Publish Mode' : 'Hide All Tools for Publishing'}
          </button>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="px-4 bg-[#071326]/80 border-b border-[#e5b94c]/20 flex gap-1 overflow-x-auto scrollbar-none py-2 text-xs">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <Building className="w-3.5 h-3.5" /> },
            { id: 'general', label: 'General & Copy', icon: <Edit className="w-3.5 h-3.5" /> },
            { id: 'cpd', label: '10 CPD Promo', icon: <Award className="w-3.5 h-3.5" /> },
            { id: 'schedule', label: 'Schedules', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'speakers', label: 'Speakers', icon: <User className="w-3.5 h-3.5" /> },
            { id: 'courses', label: 'Courses & Tracks', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'pricing', label: 'Tiers & Pricing', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'venue', label: 'Venue & Hotel', icon: <MapPin className="w-3.5 h-3.5" /> },
            { id: 'partners', label: 'Collaborators', icon: <Building className="w-3.5 h-3.5" /> },
            { id: 'attendees', label: `Attendees (${attendees.length})`, icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'github', label: 'GitHub Cloud Sync', icon: <GitBranch className="w-3.5 h-3.5 text-[#e5b94c]" /> },
            { id: 'backup', label: 'Backup & Reset', icon: <Download className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#0f2448]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Panel Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/30">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Attendees</div>
                  <div className="font-cinzel text-2xl sm:text-3xl font-bold text-[#fcedbe] mt-1">
                    {attendees.length}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">
                    {attendees.filter((a) => a.isHybridBundle || a.tierId === 'tier-f2f').length} Hybrid / In-Person
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/30">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Slots Remaining</div>
                  <div className="font-cinzel text-2xl sm:text-3xl font-bold text-[#e5b94c] mt-1">
                    {eventDetails.slotsRemaining}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Capacity: {eventDetails.totalCapacity}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/30">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Speakers & Leaders</div>
                  <div className="font-cinzel text-2xl sm:text-3xl font-bold text-[#fcedbe] mt-1">
                    {speakers.length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">International & Regional</div>
                </div>

                <div className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/30">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Remote Short Courses</div>
                  <div className="font-cinzel text-2xl sm:text-3xl font-bold text-[#fcedbe] mt-1">
                    {shortCourses.length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Cisco & ICpEP Badged</div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-5 rounded-2xl bg-[#0f2448]/80 border border-[#e5b94c]/30 space-y-4">
                <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                  Quick Management Actions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab('attendees')}
                    className="p-3 rounded-lg bg-[#071326] border border-[#e5b94c]/20 hover:border-[#e5b94c] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#e5b94c]" />
                      <span>Review Attendee List</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Check-in delegates and download CSV roster
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="p-3 rounded-lg bg-[#071326] border border-[#e5b94c]/20 hover:border-[#e5b94c] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#e5b94c]" />
                      <span>Update Schedule & Sessions</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Add, adjust times, or edit talks for Day 1 & Day 2
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="p-3 rounded-lg bg-[#071326] border border-[#e5b94c]/20 hover:border-[#e5b94c] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#e5b94c]" />
                      <span>Adjust Registration Pricing</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Modify OMR & PHP rates and tier inclusions
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. GENERAL & BRANDING TAB */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="border-b border-[#e5b94c]/20 pb-2">
                <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                  Conference Name & Branding Content
                </h4>
                <p className="text-xs text-slate-400">
                  Update primary headers, slogans, theme, and urgency notices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Event Name</label>
                  <input
                    type="text"
                    value={eventDetails.name}
                    onChange={(e) => updateEventDetails({ name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Chapter Full Name</label>
                  <input
                    type="text"
                    value={eventDetails.chapter}
                    onChange={(e) => updateEventDetails({ chapter: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Annual Conference Theme</label>
                  <textarea
                    rows={2}
                    value={eventDetails.theme}
                    onChange={(e) => updateEventDetails({ theme: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official Tagline</label>
                  <input
                    type="text"
                    value={eventDetails.tagline}
                    onChange={(e) => updateEventDetails({ tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urgency Notice Banner</label>
                  <input
                    type="text"
                    value={eventDetails.bannerNotice}
                    onChange={(e) => updateEventDetails({ bannerNotice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Subheading / Value Proposition</label>
                  <textarea
                    rows={2}
                    value={eventDetails.subheading}
                    onChange={(e) => updateEventDetails({ subheading: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slots Remaining Count</label>
                  <input
                    type="number"
                    value={eventDetails.slotsRemaining}
                    onChange={(e) => updateEventDetails({ slotsRemaining: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Email Address</label>
                  <input
                    type="email"
                    value={eventDetails.contactEmail}
                    onChange={(e) => updateEventDetails({ contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. CPD PROMOTION TAB */}
          {activeTab === 'cpd' && (
            <div className="space-y-4">
              <div className="border-b border-[#e5b94c]/20 pb-2">
                <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                  10 CPD Units Hybrid Promotion Section
                </h4>
                <p className="text-xs text-slate-400">
                  Configure the standalone gold-embossed accreditation callout.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CPD Units Count</label>
                  <input
                    type="number"
                    value={cpdData.units}
                    onChange={(e) => updateCpdData({ units: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Seal Badge Label</label>
                  <input
                    type="text"
                    value={cpdData.badgeLabel}
                    onChange={(e) => updateCpdData({ badgeLabel: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Headline Text (Full)</label>
                  <input
                    type="text"
                    value={cpdData.headlineHighlight}
                    onChange={(e) => updateCpdData({ headlineHighlight: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Detailed Explanation Paragraph</label>
                  <textarea
                    rows={3}
                    value={cpdData.paragraphText}
                    onChange={(e) => updateCpdData({ paragraphText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Day 1 Bullet Explanation</label>
                  <textarea
                    rows={2}
                    value={cpdData.f2fBulletText}
                    onChange={(e) => updateCpdData({ f2fBulletText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Day 2 Bullet Explanation</label>
                  <textarea
                    rows={2}
                    value={cpdData.virtualBulletText}
                    onChange={(e) => updateCpdData({ virtualBulletText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. SCHEDULE MANAGER TAB */}
          {activeTab === 'schedule' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5b94c]/20 pb-3">
                <div>
                  <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                    Event Agenda & Session Program
                  </h4>
                  <p className="text-xs text-slate-400">
                    Add, edit, or delete items from Day 1 (Muscat) and Day 2 (Online).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg bg-[#071326] p-1 border border-[#e5b94c]/30 text-xs">
                    <button
                      onClick={() => setSelectedDayNum(1)}
                      className={`px-3 py-1 rounded font-bold cursor-pointer ${
                        selectedDayNum === 1 ? 'bg-[#e5b94c] text-[#071326]' : 'text-slate-300'
                      }`}
                    >
                      Day 1 (Muscat)
                    </button>
                    <button
                      onClick={() => setSelectedDayNum(2)}
                      className={`px-3 py-1 rounded font-bold cursor-pointer ${
                        selectedDayNum === 2 ? 'bg-[#e5b94c] text-[#071326]' : 'text-slate-300'
                      }`}
                    >
                      Day 2 (Online)
                    </button>
                  </div>
                </div>
              </div>

              {/* Day Schedules List */}
              {daySchedules
                .filter((d) => d.day === selectedDayNum)
                .map((day) => (
                  <div key={day.day} className="space-y-6">
                    {day.sessions.map((period, pIdx) => (
                      <div
                        key={pIdx}
                        className="rounded-xl bg-[#071326]/75 border border-[#e5b94c]/25 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-[#e5b94c]/15 pb-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#e5b94c]">
                              {period.period} · {period.timeRange}
                            </span>
                            <h5 className="font-cinzel text-sm font-bold text-slate-100">
                              {period.title}
                            </h5>
                          </div>

                          <button
                            onClick={() => {
                              const newItem: ScheduleItem = {
                                id: `custom-${Date.now()}`,
                                time: '10:00 – 10:30',
                                title: 'New Program Activity',
                                description: 'Description of the session activity...',
                                category: 'industry-talk'
                              };
                              setEditingSessionItem({
                                dayNum: day.day,
                                periodTitle: period.period,
                                item: newItem,
                                isNew: true
                              });
                            }}
                            className="px-2.5 py-1 text-xs bg-[#0f2448] text-[#fcedbe] rounded border border-[#e5b94c]/30 hover:bg-[#163363] flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-[#e5b94c]" />
                            <span>Add Activity</span>
                          </button>
                        </div>

                        {/* Items in this period */}
                        <div className="space-y-2">
                          {period.items.map((item) => (
                            <div
                              key={item.id}
                              className="p-2.5 rounded-lg bg-[#0a1b35] border border-[#e5b94c]/15 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-[#fcedbe]">{item.time}</span>
                                  <span className="text-slate-400 capitalize">· [{item.category}]</span>
                                </div>
                                <div className="font-semibold text-slate-100">{item.title}</div>
                                {item.description && (
                                  <p className="text-slate-400 line-clamp-1">{item.description}</p>
                                )}
                                {item.speakers && item.speakers.length > 0 && (
                                  <div className="text-[11px] text-[#e5b94c]">
                                    Speaker: {item.speakers.map((s) => s.name).join(', ')}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() =>
                                    setEditingSessionItem({
                                      dayNum: day.day,
                                      periodTitle: period.period,
                                      item: { ...item }
                                    })
                                  }
                                  className="p-1.5 rounded bg-[#0f2448] text-slate-300 hover:text-white hover:bg-[#163363] cursor-pointer"
                                  title="Edit activity"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    deleteScheduleItem(day.day, period.period, item.id);
                                    showToast(`Session "${item.title}" deleted`);
                                  }}
                                  className="p-1.5 rounded bg-red-950/40 text-red-300 hover:text-red-100 hover:bg-red-900/60 border border-red-500/20 cursor-pointer"
                                  title="Delete activity"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

              {/* Modal to Edit or Add Schedule Item */}
              {editingSessionItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040c1a]/85 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="relative w-full max-w-lg rounded-2xl bg-[#0a1b35] border-2 border-[#e5b94c] p-6 shadow-2xl space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-[#e5b94c]/20 pb-2">
                      <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                        {editingSessionItem.isNew ? 'Add New Agenda Session' : 'Edit Agenda Session'}
                      </h4>
                      <button
                        onClick={() => setEditingSessionItem(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Time Range</label>
                        <input
                          type="text"
                          value={editingSessionItem.item.time}
                          onChange={(e) =>
                            setEditingSessionItem({
                              ...editingSessionItem,
                              item: { ...editingSessionItem.item, time: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Activity Title</label>
                        <input
                          type="text"
                          value={editingSessionItem.item.title}
                          onChange={(e) =>
                            setEditingSessionItem({
                              ...editingSessionItem,
                              item: { ...editingSessionItem.item, title: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Category</label>
                        <select
                          value={editingSessionItem.item.category}
                          onChange={(e) =>
                            setEditingSessionItem({
                              ...editingSessionItem,
                              item: {
                                ...editingSessionItem.item,
                                category: e.target.value as ScheduleItem['category']
                              }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                        >
                          <option value="keynote">Keynote Address</option>
                          <option value="org-talk">Professional Org Talk</option>
                          <option value="industry-talk">Industry Talk</option>
                          <option value="conferment">Conferment Exercise</option>
                          <option value="gala">Anniversary Gala Night</option>
                          <option value="workshop">Virtual Workshop</option>
                          <option value="ceremony">Ceremony / Protocols</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={editingSessionItem.item.description || ''}
                          onChange={(e) =>
                            setEditingSessionItem({
                              ...editingSessionItem,
                              item: { ...editingSessionItem.item, description: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      {/* Speakers / Moderator in Session */}
                      <div className="pt-2 border-t border-[#e5b94c]/20">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-slate-300 font-semibold">
                            Speakers & Moderators
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const currentSpeakers = editingSessionItem.item.speakers || [];
                              setEditingSessionItem({
                                ...editingSessionItem,
                                item: {
                                  ...editingSessionItem.item,
                                  speakers: [
                                    ...currentSpeakers,
                                    { name: '', role: 'Speaker', organization: '' }
                                  ]
                                }
                              });
                            }}
                            className="px-2 py-0.5 text-[11px] font-semibold text-[#fcedbe] bg-[#0f2448] hover:bg-[#163363] border border-[#e5b94c]/30 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-[#e5b94c]" />
                            <span>Add Speaker</span>
                          </button>
                        </div>

                        {(!editingSessionItem.item.speakers || editingSessionItem.item.speakers.length === 0) ? (
                          <p className="text-[11px] text-slate-400 italic">No speakers or moderators assigned to this activity.</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {editingSessionItem.item.speakers.map((spk, spkIdx) => (
                              <div
                                key={spkIdx}
                                className="p-2.5 rounded bg-[#071326] border border-[#e5b94c]/20 space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] uppercase font-mono font-bold text-[#e5b94c]">
                                    Speaker / Moderator #{spkIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedSpeakers = editingSessionItem.item.speakers!.filter((_, i) => i !== spkIdx);
                                      setEditingSessionItem({
                                        ...editingSessionItem,
                                        item: {
                                          ...editingSessionItem.item,
                                          speakers: updatedSpeakers
                                        }
                                      });
                                    }}
                                    className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40 cursor-pointer"
                                    title="Remove speaker"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-[10px] text-slate-400 mb-0.5">Name</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Dr. Ferdi Canlas"
                                      value={spk.name}
                                      onChange={(e) => {
                                        const nextSpeakers = [...editingSessionItem.item.speakers!];
                                        nextSpeakers[spkIdx] = { ...nextSpeakers[spkIdx], name: e.target.value };
                                        setEditingSessionItem({
                                          ...editingSessionItem,
                                          item: { ...editingSessionItem.item, speakers: nextSpeakers }
                                        });
                                      }}
                                      className="w-full px-2 py-1 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-xs text-slate-100"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-400 mb-0.5">Role / Title</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Panel Moderator / Speaker"
                                      value={spk.role}
                                      onChange={(e) => {
                                        const nextSpeakers = [...editingSessionItem.item.speakers!];
                                        nextSpeakers[spkIdx] = { ...nextSpeakers[spkIdx], role: e.target.value };
                                        setEditingSessionItem({
                                          ...editingSessionItem,
                                          item: { ...editingSessionItem.item, speakers: nextSpeakers }
                                        });
                                      }}
                                      className="w-full px-2 py-1 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-xs text-slate-100"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-400 mb-0.5">Organization</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. ICpEP-Oman Chapter"
                                      value={spk.organization || ''}
                                      onChange={(e) => {
                                        const nextSpeakers = [...editingSessionItem.item.speakers!];
                                        nextSpeakers[spkIdx] = { ...nextSpeakers[spkIdx], organization: e.target.value };
                                        setEditingSessionItem({
                                          ...editingSessionItem,
                                          item: { ...editingSessionItem.item, speakers: nextSpeakers }
                                        });
                                      }}
                                      className="w-full px-2 py-1 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-xs text-slate-100"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#e5b94c]/20 flex justify-end gap-2">
                      <button
                        onClick={() => setEditingSessionItem(null)}
                        className="px-3 py-1.5 bg-[#0f2448] text-slate-300 rounded hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (editingSessionItem.isNew) {
                            addScheduleItem(
                              editingSessionItem.dayNum,
                              editingSessionItem.periodTitle,
                              editingSessionItem.item
                            );
                            showToast('New activity added to schedule!');
                          } else {
                            updateScheduleItem(
                              editingSessionItem.dayNum,
                              editingSessionItem.periodTitle,
                              editingSessionItem.item.id,
                              editingSessionItem.item
                            );
                            showToast('Activity updated successfully!');
                          }
                          setEditingSessionItem(null);
                        }}
                        className="px-4 py-1.5 bg-[#e5b94c] text-[#071326] font-bold rounded hover:brightness-110"
                      >
                        Save Activity
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. SPEAKERS & DIGNITARIES TAB */}
          {activeTab === 'speakers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5b94c]/20 pb-2">
                <div>
                  <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                    Distinguished Speakers & Conferees
                  </h4>
                  <p className="text-xs text-slate-400">
                    Manage keynotes, chairs, international tech speakers, and profiles.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newSpk: Speaker = {
                      id: `spk-${Date.now()}`,
                      name: 'New Speaker Name',
                      title: 'Position / Designation',
                      organization: 'Organization / Company',
                      topic: 'Keynote Topic Title',
                      category: 'Industry',
                      bio: 'Speaker biography and career highlights...'
                    };
                    setEditingSpeaker({ speaker: newSpk, isNew: true });
                  }}
                  className="px-3 py-1.5 text-xs bg-[#e5b94c] text-[#071326] font-bold rounded hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Speaker</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {speakers.map((spk) => {
                  const slotId = spk.id.replace(/-/g, '_');
                  const spkPhoto = getImageUrl(slotId) || spk.photoUrl;

                  return (
                    <div
                      key={spk.id}
                      className="p-3.5 rounded-xl bg-[#071326] border border-[#e5b94c]/25 flex flex-col justify-between space-y-2.5 hover:border-[#e5b94c]/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          onClick={() => openEditor(slotId)}
                          className="w-12 h-12 rounded-xl bg-[#0a1b35] border border-[#e5b94c]/40 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#e5b94c] transition-colors"
                          title="Click to edit picture in Media Studio"
                        >
                          {spkPhoto ? (
                            <img
                              src={spkPhoto}
                              alt={spk.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <User className="w-6 h-6 text-[#e5b94c]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-cinzel text-sm font-bold text-slate-100 truncate">{spk.name}</span>
                            <span className="text-[10px] font-mono text-[#e5b94c] bg-[#0a1b35] px-2 py-0.5 rounded border border-[#e5b94c]/20 shrink-0">
                              {spk.category}
                            </span>
                          </div>
                          <div className="text-slate-300 font-medium truncate mt-0.5">{spk.title}</div>
                          <div className="text-slate-400 truncate">{spk.organization}</div>
                        </div>
                      </div>

                      {spk.topic && (
                        <div className="text-[11px] text-[#fcedbe] italic bg-[#040c1a]/60 p-2 rounded border border-[#e5b94c]/10">
                          "{spk.topic}"
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#e5b94c]/15 flex items-center justify-between gap-2">
                        <button
                          onClick={() => openEditor(slotId)}
                          className="px-2 py-1 bg-[#163363] text-[#fcedbe] hover:text-white rounded border border-[#e5b94c]/30 flex items-center gap-1 cursor-pointer font-medium"
                          title="Change picture in Media Studio"
                        >
                          <Camera className="w-3 h-3 text-[#e5b94c]" />
                          <span>Photo Studio</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingSpeaker({ speaker: { ...spk } })}
                            className="px-2 py-1 bg-[#0f2448] text-slate-200 hover:text-white rounded border border-[#e5b94c]/20 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3 h-3 text-[#e5b94c]" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              deleteSpeaker(spk.id);
                              showToast(`Speaker "${spk.name}" removed`);
                            }}
                            className="px-2 py-1 bg-red-950/40 text-red-300 hover:text-red-100 rounded border border-red-500/30 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Speaker Edit / Add Modal */}
              {editingSpeaker && (() => {
                const modalSlotId = editingSpeaker.speaker.id.replace(/-/g, '_');
                const modalPhoto = editingSpeaker.speaker.photoUrl || getImageUrl(modalSlotId);

                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040c1a]/85 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg rounded-2xl bg-[#0a1b35] border-2 border-[#e5b94c] p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-[#e5b94c]/20 pb-2">
                        <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                          {editingSpeaker.isNew ? 'Add New Speaker' : 'Edit Speaker Profile'}
                        </h4>
                        <button onClick={() => setEditingSpeaker(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
                      </div>

                      {/* Speaker Photo / Upload Section */}
                      <div className="p-3.5 rounded-xl bg-[#071326] border border-[#e5b94c]/25 space-y-2">
                        <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px] text-[#e5b94c]">
                          Speaker Picture / Uploaded Photo
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl bg-[#040c1a] border-2 border-[#e5b94c]/60 shrink-0 overflow-hidden flex items-center justify-center shadow-md">
                            {modalPhoto ? (
                              <img
                                src={modalPhoto}
                                alt={editingSpeaker.speaker.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <User className="w-8 h-8 text-[#e5b94c]/60" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1.5 min-w-0">
                            <input
                              type="text"
                              placeholder="Direct Image URL or upload from device..."
                              value={editingSpeaker.speaker.photoUrl || ''}
                              onChange={(e) =>
                                setEditingSpeaker({
                                  ...editingSpeaker,
                                  speaker: { ...editingSpeaker.speaker, photoUrl: e.target.value }
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100 text-xs focus:outline-none focus:border-[#e5b94c]"
                            />
                            <div className="flex items-center gap-2 flex-wrap">
                              <label className="px-2.5 py-1 bg-[#163363] hover:bg-[#1e4687] text-[#fcedbe] rounded border border-[#e5b94c]/30 cursor-pointer flex items-center gap-1.5 font-medium text-[11px] transition-colors">
                                <Upload className="w-3 h-3 text-[#e5b94c]" />
                                <span>Upload File (JPG/PNG)</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85 })
                                        .then((dataUrl) => {
                                          setEditingSpeaker({
                                            ...editingSpeaker,
                                            speaker: { ...editingSpeaker.speaker, photoUrl: dataUrl }
                                          });
                                          updateSlotUrl(modalSlotId, dataUrl);
                                          showToast('Image uploaded & compressed!');
                                        })
                                        .catch(() => {
                                          const reader = new FileReader();
                                          reader.onload = (ev) => {
                                            const dataUrl = ev.target?.result as string;
                                            if (dataUrl) {
                                              setEditingSpeaker({
                                                ...editingSpeaker,
                                                speaker: { ...editingSpeaker.speaker, photoUrl: dataUrl }
                                              });
                                              updateSlotUrl(modalSlotId, dataUrl);
                                              showToast('Image uploaded!');
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        });
                                    }
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => {
                                  openEditor(modalSlotId);
                                }}
                                className="px-2.5 py-1 bg-[#0f2448] hover:bg-[#163363] text-slate-200 rounded border border-[#e5b94c]/20 flex items-center gap-1.5 text-[11px] cursor-pointer"
                              >
                                <Camera className="w-3 h-3 text-[#e5b94c]" />
                                <span>Fine-tune in Media Studio</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                          <input
                            type="text"
                            value={editingSpeaker.speaker.name}
                            onChange={(e) =>
                              setEditingSpeaker({
                                ...editingSpeaker,
                                speaker: { ...editingSpeaker.speaker, name: e.target.value }
                              })
                            }
                            className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Title / Designation</label>
                          <input
                            type="text"
                            value={editingSpeaker.speaker.title}
                            onChange={(e) =>
                              setEditingSpeaker({
                                ...editingSpeaker,
                                speaker: { ...editingSpeaker.speaker, title: e.target.value }
                              })
                            }
                            className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Category</label>
                          <select
                            value={editingSpeaker.speaker.category}
                            onChange={(e) =>
                              setEditingSpeaker({
                                ...editingSpeaker,
                                speaker: { ...editingSpeaker.speaker, category: e.target.value as Speaker['category'] }
                              })
                            }
                            className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                          >
                            <option value="Keynote">Keynote</option>
                            <option value="Leadership">Leadership</option>
                            <option value="Industry">Industry</option>
                            <option value="Conferment">Conferment</option>
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-slate-300 font-semibold mb-1">Organization / Affiliation</label>
                          <input
                            type="text"
                            value={editingSpeaker.speaker.organization}
                            onChange={(e) =>
                              setEditingSpeaker({
                                ...editingSpeaker,
                                speaker: { ...editingSpeaker.speaker, organization: e.target.value }
                              })
                            }
                            className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-slate-300 font-semibold mb-1">Topic / Lecture Title</label>
                          <input
                            type="text"
                            value={editingSpeaker.speaker.topic || ''}
                            onChange={(e) =>
                              setEditingSpeaker({
                                ...editingSpeaker,
                                speaker: { ...editingSpeaker.speaker, topic: e.target.value }
                              })
                            }
                            className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-slate-300 font-semibold mb-1">Biography</label>
                          <textarea
                            rows={4}
                            value={editingSpeaker.speaker.bio}
                            onChange={(e) =>
                              setEditingSpeaker({
                                ...editingSpeaker,
                                speaker: { ...editingSpeaker.speaker, bio: e.target.value }
                              })
                            }
                            className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#e5b94c]/20 flex justify-end gap-2">
                        <button
                          onClick={() => setEditingSpeaker(null)}
                          className="px-3 py-1.5 bg-[#0f2448] text-slate-300 rounded hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (editingSpeaker.speaker.photoUrl) {
                              updateSlotUrl(modalSlotId, editingSpeaker.speaker.photoUrl);
                            }
                            if (editingSpeaker.isNew) {
                              addSpeaker(editingSpeaker.speaker);
                              showToast('New speaker added!');
                            } else {
                              updateSpeaker(editingSpeaker.speaker.id, editingSpeaker.speaker);
                              showToast('Speaker profile updated!');
                            }
                            setEditingSpeaker(null);
                          }}
                          className="px-4 py-1.5 bg-[#e5b94c] text-[#071326] font-bold rounded hover:brightness-110 cursor-pointer"
                        >
                          Save Speaker
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 6. WORKSHOPS & SHORT COURSES TAB */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="border-b border-[#e5b94c]/20 pb-2 flex items-center justify-between">
                <div>
                  <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                    Remote Short Courses & Workshop Tracks
                  </h4>
                  <p className="text-xs text-slate-400">
                    Manage the 6 Cisco NetAcad & ICpEP remote certification courses.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newCourse: ShortCourse = {
                      id: `sc-${Date.now()}`,
                      title: 'New Remote Short Course',
                      code: 'NEW-101',
                      description: 'Overview of learning competencies...',
                      duration: 'Self-Paced (approx. 5 hrs)',
                      competency: 'Applied Computing',
                      partner: 'Cisco Networking Academy'
                    };
                    setEditingCourse({ course: newCourse, isNew: true });
                  }}
                  className="px-3 py-1.5 text-xs bg-[#e5b94c] text-[#071326] font-bold rounded hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Course</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {shortCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-[#071326] border border-[#e5b94c]/20 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#e5b94c] bg-[#0a1b35] px-2 py-0.5 rounded">
                          {c.code}
                        </span>
                        <span className="text-slate-400 text-[11px]">{c.duration}</span>
                      </div>
                      <h5 className="font-bold text-slate-100 text-sm mt-1">{c.title}</h5>
                      <p className="text-slate-300 text-xs mt-1 line-clamp-2">{c.description}</p>
                      <div className="mt-2 text-[11px] text-[#fcedbe] flex items-center justify-between">
                        <span>Partner: {c.partner}</span>
                        {c.enrollmentUrl && (
                          <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            <span>Redirect Active</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#e5b94c]/15 flex justify-end gap-2">
                      <button
                        onClick={() => setEditingCourse({ course: { ...c } })}
                        className="px-2 py-1 bg-[#0f2448] text-slate-200 rounded border border-[#e5b94c]/20 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3 h-3 text-[#e5b94c]" />
                        <span>Edit Course & Redirect Link</span>
                      </button>
                      <button
                        onClick={() => {
                          deleteShortCourse(c.id);
                          showToast(`Course "${c.title}" removed`);
                        }}
                        className="px-2 py-1 bg-red-950/40 text-red-300 rounded border border-red-500/20 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Course Modal */}
              {editingCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040c1a]/85 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="relative w-full max-w-lg rounded-2xl bg-[#0a1b35] border-2 border-[#e5b94c] p-6 shadow-2xl space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-[#e5b94c]/20 pb-2">
                      <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                        {editingCourse.isNew ? 'Add Remote Course' : 'Edit Short Course'}
                      </h4>
                      <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Course Code</label>
                        <input
                          type="text"
                          value={editingCourse.course.code}
                          onChange={(e) =>
                            setEditingCourse({
                              ...editingCourse,
                              course: { ...editingCourse.course, code: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Course Title</label>
                        <input
                          type="text"
                          value={editingCourse.course.title}
                          onChange={(e) =>
                            setEditingCourse({
                              ...editingCourse,
                              course: { ...editingCourse.course, title: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Partner Accreditation</label>
                        <input
                          type="text"
                          value={editingCourse.course.partner}
                          onChange={(e) =>
                            setEditingCourse({
                              ...editingCourse,
                              course: { ...editingCourse.course, partner: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={editingCourse.course.description}
                          onChange={(e) =>
                            setEditingCourse({
                              ...editingCourse,
                              course: { ...editingCourse.course, description: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5 text-[#e5b94c]" />
                            <span>Enrollment Redirect Link (URL)</span>
                          </span>
                          {editingCourse.course.enrollmentUrl && (
                            <span className="text-[10px] text-emerald-400 font-mono">Link Configured</span>
                          )}
                        </label>
                        <input
                          type="url"
                          placeholder="e.g. https://www.netacad.com/... or Google Form link"
                          value={editingCourse.course.enrollmentUrl || ''}
                          onChange={(e) =>
                            setEditingCourse({
                              ...editingCourse,
                              course: { ...editingCourse.course, enrollmentUrl: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#071326] border border-[#e5b94c]/40 rounded text-slate-100 placeholder:text-slate-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Paste a redirect link for enrollment (e.g. Cisco NetAcad portal, Google Form, or ICpEP Virtual Classroom). When clicked, delegates will open this portal.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#e5b94c]/20 flex justify-end gap-2">
                      <button
                        onClick={() => setEditingCourse(null)}
                        className="px-3 py-1.5 bg-[#0f2448] text-slate-300 rounded hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (editingCourse.isNew) {
                            addShortCourse(editingCourse.course);
                            showToast('Course added!');
                          } else {
                            updateShortCourse(editingCourse.course.id, editingCourse.course);
                            showToast('Course updated!');
                          }
                          setEditingCourse(null);
                        }}
                        className="px-4 py-1.5 bg-[#e5b94c] text-[#071326] font-bold rounded hover:brightness-110"
                      >
                        Save Course
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. PRICING & REGISTRATION TIERS TAB */}
          {activeTab === 'pricing' && (
            <div className="space-y-5">
              <div className="border-b border-[#e5b94c]/20 pb-2">
                <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                  Registration Tiers & Ticket Pricing
                </h4>
                <p className="text-xs text-slate-400">
                  Configure external redirection links, ticket prices in OMR/PHP, features, and recommendations.
                </p>
              </div>

              {/* GLOBAL REGISTRATION REDIRECT CARD */}
              <div className="p-4 rounded-xl bg-[#071326] border-2 border-[#e5b94c]/50 space-y-3 text-xs shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5b94c]/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#0f2448] text-[#e5b94c]">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-cinzel text-sm font-bold text-[#fcedbe]">
                        Global Registration Redirect Link
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Applies to general "Register Now" buttons (Header, Hero, CPD Promo & Footer).
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200 select-none bg-[#0a1b35] px-3 py-1.5 rounded-lg border border-[#e5b94c]/30">
                    <input
                      type="checkbox"
                      checked={!!eventDetails.useCustomRegistrationRedirect}
                      onChange={(e) => {
                        updateEventDetails({
                          useCustomRegistrationRedirect: e.target.checked
                        });
                        showToast(e.target.checked ? 'Global redirect enabled!' : 'Global redirect disabled (using built-in form)');
                      }}
                      className="accent-[#e5b94c] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="font-semibold text-xs">Enable Redirect</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Global Redirect URL (Google Form, Eventbrite, MS Forms, or ticketing link):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="e.g. https://forms.gle/xyz... or https://eventbrite.com/..."
                      value={eventDetails.globalRegistrationUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateEventDetails({
                          globalRegistrationUrl: val,
                          ...(val.trim().length > 0 ? { useCustomRegistrationRedirect: true } : {})
                        });
                      }}
                      className="flex-1 px-3 py-2 bg-[#0a1b35] border border-[#e5b94c]/40 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#e5b94c]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const u = eventDetails.globalRegistrationUrl;
                        if (!u || !u.trim()) {
                          showToast('Please enter a global URL first');
                          return;
                        }
                        let formatted = u.trim();
                        if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
                          formatted = 'https://' + formatted;
                        }
                        window.open(formatted, '_blank', 'noopener,noreferrer');
                      }}
                      className="px-3 py-2 bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/30 rounded-lg flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                      title="Test URL in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    When active, delegates clicking "Register Now" across the site will be redirected directly to this URL in a new window.
                  </p>
                </div>

                {/* QR CODE MANAGEMENT SECTION */}
                <div className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#e5b94c]" />
                      <span className="font-bold text-slate-100 text-xs sm:text-sm">
                        Registration QR Code (Scan to Register)
                      </span>
                    </div>
                    <span className="text-[10px] text-[#fcedbe] bg-[#0a1b35] px-2 py-0.5 rounded border border-[#e5b94c]/20 font-mono">
                      {eventDetails.qrCodeType === 'custom_image' && eventDetails.qrCodeCustomUrl ? 'Custom Image Active' : 'Dynamic Scannable Active'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    The registration QR code is prominently featured in the header, hero banner, and footer for fast mobile check-in and registration. You can replace it with an uploaded QR image or generate a dynamic QR code for any custom link.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-qr-edit'));
                        }
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] font-bold text-xs rounded-lg hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#071326]" />
                      <span>Edit or Replace QR Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-qr'));
                        }
                      }}
                      className="px-3 py-2 bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#e5b94c]" />
                      <span>Preview QR Code</span>
                    </button>

                    {eventDetails.qrCodeCustomUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          updateEventDetails({
                            qrCodeCustomUrl: '',
                            qrCodeType: 'auto'
                          });
                          showToast('Reverted QR Code to default dynamic generator');
                        }}
                        className="px-3 py-2 bg-rose-950/60 text-rose-300 border border-rose-600/40 rounded-lg text-xs font-semibold hover:bg-rose-900/60 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Default QR</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* INDIVIDUAL PASS TIERS */}
              <div className="space-y-4">
                <div className="text-xs text-slate-300 font-medium">
                  Per-Tier Settings & Redirect Links:
                </div>

                {registrationTiers.map((tier, idx) => (
                  <div
                    key={tier.id}
                    className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/30 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel text-sm font-bold text-[#fcedbe]">
                          {tier.name}
                        </span>
                        {tier.redirectUrl && tier.redirectUrl.trim().length > 0 && (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-[#0a1b35] px-2 py-0.5 rounded border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            <span>Tier Redirect Active</span>
                          </span>
                        )}
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={!!tier.recommended}
                          onChange={(e) => {
                            const updated = [...registrationTiers];
                            updated[idx].recommended = e.target.checked;
                            updateRegistrationTiers(updated);
                          }}
                          className="accent-[#e5b94c]"
                        />
                        <span>Featured / Popular Badge</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">OMR Price Label</label>
                        <input
                          type="text"
                          value={tier.priceOman}
                          onChange={(e) => {
                            const updated = [...registrationTiers];
                            updated[idx].priceOman = e.target.value;
                            updateRegistrationTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">PHP Price Label</label>
                        <input
                          type="text"
                          value={tier.pricePhp}
                          onChange={(e) => {
                            const updated = [...registrationTiers];
                            updated[idx].pricePhp = e.target.value;
                            updateRegistrationTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">CPD Eligibility Text</label>
                        <input
                          type="text"
                          value={tier.cpdValue}
                          onChange={(e) => {
                            const updated = [...registrationTiers];
                            updated[idx].cpdValue = e.target.value;
                            updateRegistrationTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-slate-300 font-semibold mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={tier.subtitle}
                          onChange={(e) => {
                            const updated = [...registrationTiers];
                            updated[idx].subtitle = e.target.value;
                            updateRegistrationTiers(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>

                      {/* Tier Specific Redirect Link Input */}
                      <div className="sm:col-span-3 pt-2 border-t border-[#e5b94c]/15">
                        <label className="block text-slate-300 font-semibold mb-1">
                          Custom Redirect URL for this Pass (Optional):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder={`e.g. Paste specific enrollment URL for ${tier.name}...`}
                            value={tier.redirectUrl || ''}
                            onChange={(e) => {
                              const updated = [...registrationTiers];
                              updated[idx].redirectUrl = e.target.value;
                              updateRegistrationTiers(updated);
                            }}
                            className="flex-1 px-3 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100 placeholder:text-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const u = tier.redirectUrl;
                              if (!u || !u.trim()) {
                                showToast('Please enter a URL first');
                                return;
                              }
                              let formatted = u.trim();
                              if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
                                formatted = 'https://' + formatted;
                              }
                              window.open(formatted, '_blank', 'noopener,noreferrer');
                            }}
                            className="px-2.5 py-1.5 bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/30 rounded flex items-center gap-1 font-semibold cursor-pointer"
                            title="Test URL in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Test</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          If set, delegates clicking "Register as {tier.name}" on the cards will open this custom URL. If left empty, it uses the Global Link or built-in registration form.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. VENUE & HOTEL TAB */}
          {activeTab === 'venue' && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-[#e5b94c]/20 pb-2">
                <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                  Venue & Muscat Travel Guide Details
                </h4>
                <p className="text-slate-400">
                  Configure Wyndham Hotel Muscat address, ballroom specifications, and dress codes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hotel / Venue Name</label>
                  <input
                    type="text"
                    value={venueInfo.name}
                    onChange={(e) => updateVenueInfo({ name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City & Governorate</label>
                  <input
                    type="text"
                    value={venueInfo.city}
                    onChange={(e) => updateVenueInfo({ city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Full Physical Address</label>
                  <input
                    type="text"
                    value={venueInfo.address}
                    onChange={(e) => updateVenueInfo({ address: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Daytime Dress Code</label>
                  <input
                    type="text"
                    value={venueInfo.dressCode.day}
                    onChange={(e) =>
                      updateVenueInfo({
                        dressCode: { ...venueInfo.dressCode, day: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Anniversary Gala Dress Code</label>
                  <input
                    type="text"
                    value={venueInfo.dressCode.gala}
                    onChange={(e) =>
                      updateVenueInfo({
                        dressCode: { ...venueInfo.dressCode, gala: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 9. PARTNERS & COLLABORATORS TAB */}
          {activeTab === 'partners' && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-[#e5b94c]/20 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                    Institutional Synergy & Collaborators
                  </h4>
                  <p className="text-slate-400">
                    Modify names, subtitles, badges, and roles for all collaborating organizations in the &quot;In Collaboration With&quot; section.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reset all collaborating institutions to original conference defaults?')) {
                        updateCollaboratingOrgs(JSON.parse(JSON.stringify(DEFAULT_ORGS)));
                        showToast('Collaborating institutions reset to defaults');
                      }
                    }}
                    className="px-2.5 py-1.5 rounded bg-[#0f2448] text-slate-300 hover:text-white border border-[#e5b94c]/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>Reset Defaults</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditor('partner_ptc')}
                    className="px-2.5 py-1.5 rounded bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/40 flex items-center gap-1.5 cursor-pointer"
                    title="Open Image Media Studio to edit partner logos"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>Partner Logos Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newId = `partner_${Date.now()}`;
                      const newOrg: CollaboratingOrg = {
                        id: newId,
                        name: 'New Collaborating Institution',
                        subtitle: 'Higher education, professional body, or technology industry leader',
                        shortName: 'PARTNER',
                        role: 'Strategic Partner',
                        accreditations: ['Collaborative Initiative'],
                        websiteUrl: ''
                      };
                      updateCollaboratingOrgs([...collaboratingOrgs, newOrg]);
                      showToast('Added new collaborating institution with logo slot');
                    }}
                    className="px-3 py-1.5 rounded bg-[#e5b94c] text-[#071326] font-bold hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Institution</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {collaboratingOrgs.map((org, oIdx) => {
                  const slotId = getPartnerSlotId(org, oIdx);
                  const partnerLogo = resolvePartnerLogo(org, slotId, getImageUrl);

                  return (
                    <div
                      key={org.id || slotId || oIdx}
                      className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/25 space-y-3.5 shadow-md"
                    >
                      {/* Hidden file input for fast 1-click logo upload */}
                      <input
                        type="file"
                        id={`admin-collab-file-${slotId}`}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85 })
                            .then((compressed) => {
                              const updated = [...collaboratingOrgs];
                              updated[oIdx] = { ...updated[oIdx], logo: compressed };
                              updateCollaboratingOrgs(updated);
                              updateSlotUrl(slotId, compressed);
                              showToast(`Uploaded & updated logo for ${org.shortName || org.name}`);
                            })
                            .catch(() => {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const dataUrl = evt.target?.result as string;
                                if (dataUrl) {
                                  const updated = [...collaboratingOrgs];
                                  updated[oIdx] = { ...updated[oIdx], logo: dataUrl };
                                  updateCollaboratingOrgs(updated);
                                  updateSlotUrl(slotId, dataUrl);
                                  showToast(`Uploaded logo for ${org.shortName || org.name}`);
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                          e.target.value = '';
                        }}
                      />

                      <div className="flex items-center justify-between border-b border-[#e5b94c]/15 pb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[#e5b94c] bg-[#0a1b35] px-2 py-0.5 rounded border border-[#e5b94c]/20">
                            #{oIdx + 1}
                          </span>
                          {partnerLogo ? (
                            <div className="w-7 h-7 rounded bg-[#0a1b35] border border-[#e5b94c]/30 overflow-hidden flex items-center justify-center p-0.5">
                              <img src={partnerLogo} alt="" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <Building className="w-5 h-5 text-[#e5b94c]/60" />
                          )}
                          <span className="font-bold text-slate-200">
                            {org.name || 'Untitled Organization'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Reorder Buttons */}
                          <button
                            type="button"
                            disabled={oIdx === 0}
                            onClick={() => {
                              const updated = [...collaboratingOrgs];
                              const [moved] = updated.splice(oIdx, 1);
                              updated.splice(oIdx - 1, 0, moved);
                              updateCollaboratingOrgs(updated);
                              showToast(`Moved ${org.shortName} earlier`);
                            }}
                            className="p-1 rounded bg-[#0a1b35] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-[#e5b94c]/20 cursor-pointer"
                            title="Move earlier in display order"
                          >
                            <ArrowUp className="w-3.5 h-3.5 text-[#e5b94c]" />
                          </button>

                          <button
                            type="button"
                            disabled={oIdx === collaboratingOrgs.length - 1}
                            onClick={() => {
                              const updated = [...collaboratingOrgs];
                              const [moved] = updated.splice(oIdx, 1);
                              updated.splice(oIdx + 1, 0, moved);
                              updateCollaboratingOrgs(updated);
                              showToast(`Moved ${org.shortName} later`);
                            }}
                            className="p-1 rounded bg-[#0a1b35] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-[#e5b94c]/20 cursor-pointer"
                            title="Move later in display order"
                          >
                            <ArrowDown className="w-3.5 h-3.5 text-[#e5b94c]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => document.getElementById(`admin-collab-file-${slotId}`)?.click()}
                            className="px-2.5 py-1 text-[11px] bg-[#e5b94c] text-[#071326] font-bold rounded flex items-center gap-1 cursor-pointer hover:brightness-110 shadow-sm"
                            title="Quick upload picture from device"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditor(slotId)}
                            className="px-2 py-1 text-[11px] text-[#fcedbe] hover:text-white bg-[#0f2448] hover:bg-[#163363] border border-[#e5b94c]/40 rounded flex items-center gap-1 cursor-pointer transition-colors"
                            title="Upload or change logo in Media Studio"
                          >
                            <Sliders className="w-3 h-3 text-[#e5b94c]" />
                            <span>Media Studio</span>
                          </button>

                          {collaboratingOrgs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = collaboratingOrgs.filter((_, idx) => idx !== oIdx);
                                updateCollaboratingOrgs(updated);
                                showToast(`Removed collaborator #${oIdx + 1}`);
                              }}
                              className="px-2 py-1 text-[11px] text-red-300 hover:text-red-200 bg-red-950/40 border border-red-500/20 rounded flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Direct Logo & Media Controls Box */}
                      <div className="p-3 rounded-lg bg-[#040c1a] border border-[#e5b94c]/25 space-y-2.5 shadow-inner">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-[#e5b94c] uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Collaborator Logo & Insignia</span>
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">Slot: {slotId}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="w-16 h-14 rounded-lg bg-[#0a1b35] border border-[#e5b94c]/40 shrink-0 overflow-hidden flex items-center justify-center p-1 shadow-inner">
                            {partnerLogo ? (
                              <img src={partnerLogo} alt="" className="max-w-full max-h-full object-contain filter drop-shadow" />
                            ) : (
                              <Building className="w-6 h-6 text-[#e5b94c]/50" />
                            )}
                          </div>

                          <div className="flex-1 space-y-2 w-full min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => document.getElementById(`admin-collab-file-${slotId}`)?.click()}
                                className="px-3 py-1.5 bg-[#e5b94c] text-[#071326] font-bold text-xs rounded flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow-sm transition-transform"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Logo Picture</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditor(slotId)}
                                className="px-2.5 py-1.5 bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/40 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer"
                                title="Fine-tune zoom and color in Media Studio"
                              >
                                <Sliders className="w-3.5 h-3.5 text-[#e5b94c]" />
                                <span>Media Studio</span>
                              </button>

                              {(org.logo || partnerLogo) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...collaboratingOrgs];
                                    updated[oIdx] = { ...updated[oIdx], logo: '' };
                                    updateCollaboratingOrgs(updated);
                                    updateSlotUrl(slotId, '');
                                    showToast(`Cleared logo for ${org.shortName || org.name}`);
                                  }}
                                  className="px-2 py-1 bg-red-950/40 text-red-300 hover:text-white border border-red-500/30 text-xs rounded cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              value={org.logo || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = [...collaboratingOrgs];
                                updated[oIdx] = { ...updated[oIdx], logo: val };
                                updateCollaboratingOrgs(updated);
                                updateSlotUrl(slotId, val);
                              }}
                              placeholder="Or paste Direct Image URL/Path (e.g. ./images/logo.png)..."
                              className="w-full px-2.5 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100 text-xs font-mono focus:outline-none focus:border-[#e5b94c]"
                            />
                          </div>
                        </div>
                      </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Short Name / Badge</label>
                        <input
                          type="text"
                          value={org.shortName}
                          onChange={(e) => {
                            const updated = [...collaboratingOrgs];
                            updated[oIdx].shortName = e.target.value;
                            updateCollaboratingOrgs(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Organization Name</label>
                        <input
                          type="text"
                          value={org.name}
                          onChange={(e) => {
                            const updated = [...collaboratingOrgs];
                            updated[oIdx].name = e.target.value;
                            updateCollaboratingOrgs(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Role / Affiliation</label>
                        <input
                          type="text"
                          value={org.role}
                          onChange={(e) => {
                            const updated = [...collaboratingOrgs];
                            updated[oIdx].role = e.target.value;
                            updateCollaboratingOrgs(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Subtitle / Mission Text</label>
                      <textarea
                        rows={2}
                        value={org.subtitle || ''}
                        onChange={(e) => {
                          const updated = [...collaboratingOrgs];
                          updated[oIdx].subtitle = e.target.value;
                          updateCollaboratingOrgs(updated);
                        }}
                        placeholder="Description shown on the conference homepage card..."
                        className="w-full px-2.5 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Accreditations / Initiatives (Comma-separated)</label>
                        <input
                          type="text"
                          value={(org.accreditations || []).join(', ')}
                          onChange={(e) => {
                            const updated = [...collaboratingOrgs];
                            updated[oIdx].accreditations = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                            updateCollaboratingOrgs(updated);
                          }}
                          placeholder="e.g. AER, intPE, MOHERI"
                          className="w-full px-2.5 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100 text-xs"
                        />
                        {org.accreditations && org.accreditations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {org.accreditations.map((acc, aIdx) => (
                              <span key={aIdx} className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0f2448] text-[#fcedbe] rounded border border-[#e5b94c]/20">
                                {acc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Official Website / Portal URL</label>
                        <input
                          type="url"
                          value={org.websiteUrl || ''}
                          onChange={(e) => {
                            const updated = [...collaboratingOrgs];
                            updated[oIdx].websiteUrl = e.target.value;
                            updateCollaboratingOrgs(updated);
                          }}
                          placeholder="https://example.org"
                          className="w-full px-2.5 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* 10. ATTENDEES & REGISTRATIONS REGISTRY */}
          {activeTab === 'attendees' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5b94c]/20 pb-3">
                <div>
                  <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                    Registered Delegates & Ticket Roster
                  </h4>
                  <p className="text-xs text-slate-400">
                    {attendees.length} total registrations recorded in database.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCsvAttendees}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#0f2448] text-[#fcedbe] rounded border border-[#e5b94c]/40 hover:bg-[#163363] flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search delegates by name, email, PRC license, organization, or ID..."
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                />
              </div>

              {/* Attendees Table */}
              <div className="rounded-xl border border-[#e5b94c]/20 bg-[#071326] overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 divide-y divide-[#e5b94c]/15">
                  <thead className="bg-[#0f2448]/80 text-[#fcedbe] font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Delegate Name</th>
                      <th className="p-3">Organization</th>
                      <th className="p-3">Track / CPD</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5b94c]/10">
                    {filteredAttendees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-500">
                          No matching attendee records found.
                        </td>
                      </tr>
                    ) : (
                      filteredAttendees.map((att) => (
                        <tr key={att.id} className="hover:bg-[#0a1b35]/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-[#e5b94c] whitespace-nowrap">
                            {att.id}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-100">{att.fullName}</div>
                            <div className="text-[11px] text-slate-400">PRC: {att.prcLicenseNo || 'N/A'}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-slate-200">{att.affiliation}</div>
                            {att.dietaryRestrictions && (
                              <span className="text-[10px] text-slate-400 block">Diet: {att.dietaryRestrictions}</span>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="capitalize font-medium text-slate-200 block">
                              {att.tierId.replace('tier-', '')}
                            </span>
                            {att.isHybridBundle && (
                              <span className="text-[10px] text-emerald-400 font-bold block">
                                ★ 10 CPD Units
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="text-slate-300">{att.email}</div>
                            <div className="text-[11px] text-slate-400">{att.phone}</div>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                deleteAttendee(att.id);
                                showToast(`Attendee "${att.fullName}" removed`);
                              }}
                              className="p-1.5 rounded bg-red-950/40 text-red-300 hover:text-red-100 hover:bg-red-900/60 border border-red-500/20 cursor-pointer"
                              title="Delete registration"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 11. BACKUP & RESTORE TAB */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="border-b border-[#e5b94c]/20 pb-2">
                <h4 className="font-cinzel text-base font-bold text-[#fcedbe]">
                  Website Publication, Server Sync & Backup
                </h4>
                <p className="text-xs text-slate-400">
                  Save all live updates to the server so all visitors see them, manage public visibility, and export/import complete website bundles.
                </p>
              </div>

              {/* 1. PERSISTENT SERVER SYNC CARD (Answers "What happens when published") */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a1e3f] via-[#071326] to-[#0f2448] border-2 border-emerald-500/50 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/40 text-emerald-300">
                      <Save className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-400 text-[#071326]">
                          Multi-Device Server Sync
                        </span>
                        <span className="text-xs text-emerald-300/80 font-medium">
                          {lastServerSavedTime ? `Last saved at ${lastServerSavedTime}` : 'Ready to sync'}
                        </span>
                      </div>
                      <h5 className="font-cinzel text-base font-bold text-slate-100 mt-0.5">
                        Publish & Sync All Changes to Server
                      </h5>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={async () => {
                        const images = getExportableImagesData ? getExportableImagesData() : undefined;
                        const res = await saveToServer(images);
                        let ghMsg = '';
                        if (githubConfig.autoSync && githubConfig.token && githubConfig.owner) {
                          const ghRes = await handleDeliverToGitHub(false);
                          if (ghRes.success) {
                            ghMsg = ` & delivered to GitHub (${ghRes.sha ? ghRes.sha.slice(0, 7) : ''})!`;
                          }
                        }
                        if (res.success) {
                          showToast(`✅ Website successfully published to server${ghMsg}! All visitors will now see your updates.`);
                        } else {
                          showToast(`Server sync notice: ${res.message}${ghMsg}`);
                        }
                      }}
                      disabled={isServerSaving || isGitHubSyncing}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-400 to-teal-400 text-[#071326] hover:brightness-110 shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-[#071326]" />
                      <span>{isServerSaving || isGitHubSyncing ? 'Publishing...' : '💾 Save & Publish to All Visitors'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeliverToGitHub(true)}
                      disabled={isGitHubSyncing || !githubConfig.owner.trim() || !githubConfig.token.trim()}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/40 shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50"
                      title="Deliver immediately to GitHub repository"
                    >
                      <GitBranch className={`w-3.5 h-3.5 text-[#e5b94c] ${isGitHubSyncing ? 'animate-spin' : ''}`} />
                      <span>{isGitHubSyncing ? 'Syncing...' : 'Deliver to GitHub'}</span>
                    </button>
                  </div>
                </div>

                {/* Clear explanation of why published updates require server save */}
                <div className="p-4 rounded-xl bg-[#071326]/90 border border-[#e5b94c]/20 text-xs text-slate-300 space-y-2">
                  <span className="font-bold text-[#fcedbe] flex items-center gap-1.5 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Why weren't updates seen previously on the published link?</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[12px]">
                    When you edit in the browser, changes are initially stored inside your local browser memory. Web browsers enforce a security policy (Same-Origin) where the <strong>development preview</strong> and the <strong>shared published URL</strong> cannot directly read each other's local memory.
                  </p>
                  <p className="text-[#fcedbe] leading-relaxed text-[12px] font-medium">
                    👉 Clicking <span className="underline font-bold">"Save & Publish to All Visitors"</span> stores your updated speakers, uploaded photos, schedule timelines, and pricing directly on the server database. Once saved, anyone opening the website on any phone, computer, or the published link will immediately see the updated content!
                  </p>
                </div>
              </div>

              {/* 2. WEBSITE PUBLISH & VISITOR MODE CARD */}
              <div className={`p-5 rounded-2xl border-2 space-y-4 transition-colors ${
                isPublishMode
                  ? 'bg-gradient-to-br from-emerald-950/40 via-[#071326] to-[#0a1b35] border-emerald-500/50 shadow-xl shadow-emerald-950/20'
                  : 'bg-gradient-to-br from-amber-950/40 via-[#071326] to-[#0a1b35] border-[#e5b94c]/50 shadow-xl'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5b94c]/20 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      isPublishMode
                        ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#0f2448] border-[#e5b94c]/40 text-[#fcedbe]'
                    }`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                          isPublishMode
                            ? 'bg-emerald-400 text-[#071326]'
                            : 'bg-amber-400 text-[#071326]'
                        }`}>
                          {isPublishMode ? 'LIVE / PUBLISHED' : 'EDITING / DRAFT'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Website Public Visibility</span>
                      </div>
                      <h5 className="font-cinzel text-base font-bold text-slate-100 mt-0.5">
                        {isPublishMode ? 'Visitor Preview Mode (Edit pencils hidden from view)' : 'Editing Mode (All Edit Tools Active & Visible)'}
                      </h5>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      togglePublishMode();
                      showToast(isPublishMode ? 'Switched to Editing Mode (Tools Visible)' : 'Visitor Preview Mode Enabled. Tools are always accessible via top bar or floating pill.');
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap ${
                      isPublishMode
                        ? 'bg-gradient-to-r from-amber-400 to-[#e5b94c] text-[#071326] hover:brightness-110'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-[#071326] hover:brightness-110'
                    }`}
                  >
                    {isPublishMode ? 'Switch to Editing Mode' : '👁️ Preview Clean Visitor View'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-[#071326]/80 border border-[#e5b94c]/20 space-y-1">
                    <span className="font-bold text-[#fcedbe] block">1. Clean Visitor View</span>
                    <p className="text-[11px] text-slate-400">
                      Hides all inline camera icons and edit buttons so you can inspect the pristine attendee experience.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#071326]/80 border border-[#e5b94c]/20 space-y-1">
                    <span className="font-bold text-[#fcedbe] block">2. Edit Tools Always Accessible</span>
                    <p className="text-[11px] text-slate-400">
                      The "Admin" and "Pictures" buttons remain conveniently available in the header and floating action pill anytime you need them.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#071326]/80 border border-[#e5b94c]/20 space-y-1">
                    <span className="font-bold text-[#fcedbe] block">3. Shortcut: Alt+Shift+A</span>
                    <p className="text-[11px] text-slate-400">
                      Press <code className="text-[#fcedbe] font-mono bg-[#0a1b35] px-1 py-0.5 rounded">Alt+Shift+A</code> on any screen to instantly open this Admin Panel.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. EXPORT / IMPORT JSON PACKAGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#071326] border border-[#e5b94c]/30 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#fcedbe]">
                    <Download className="w-4 h-4 text-[#e5b94c]" />
                    <span>Export Full Website Package (.json)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Downloads an all-in-one JSON backup file containing all customized speakers, uploaded photos, schedule timelines, CPD data, and registrations.
                  </p>
                  <button
                    onClick={() => {
                      const images = getExportableImagesData ? getExportableImagesData() : undefined;
                      const json = exportFullSiteData(images);
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `icpep_techtalk_2026_complete_package_${new Date().toISOString().slice(0, 10)}.json`;
                      link.click();
                      showToast('Full website package downloaded!');
                    }}
                    className="w-full py-2.5 px-4 bg-[#0f2448] text-xs font-bold text-[#fcedbe] rounded-lg border border-[#e5b94c]/40 hover:bg-[#163363] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>Download JSON Package</span>
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-[#071326] border border-[#e5b94c]/30 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#fcedbe]">
                    <Upload className="w-4 h-4 text-[#e5b94c]" />
                    <span>Import JSON Backup</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Restore previously exported conference configurations and photos from a JSON package on any computer.
                  </p>
                  <label className="w-full py-2.5 px-4 bg-[#0f2448] text-xs font-bold text-[#fcedbe] rounded-lg border border-[#e5b94c]/40 hover:bg-[#163363] text-center block cursor-pointer">
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-[#e5b94c]" />
                      <span>Upload & Restore Backup (.json)</span>
                    </span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const str = event.target?.result as string;
                          const ok = importFullSiteData(str, (images) => {
                            if (importConfiguration) {
                              importConfiguration(JSON.stringify(images));
                            }
                          });
                          if (ok) {
                            try {
                              const parsed = JSON.parse(str);
                              if (parsed.customImages && importConfiguration) {
                                importConfiguration(JSON.stringify(parsed.customImages));
                              }
                            } catch {
                              // ignore
                            }
                            showToast('Website restored successfully from JSON backup!');
                          } else {
                            showToast('Invalid configuration file. Please check JSON format.');
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone: Factory Reset */}
              <div className="p-5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Factory Reset to Poster Defaults</span>
                </div>
                <p className="text-xs text-slate-300">
                  Resets all content, keynote speaker lists, schedule periods, and pricing back to the exact initial ICpEP-Oman TechTalk 2026 poster specifications.
                </p>
                <div className="flex items-center gap-3">
                  {!confirmReset ? (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="px-4 py-2 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/40 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      Reset Everything to Defaults
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          resetAllToDefaults();
                          setConfirmReset(false);
                          showToast('Website restored to original poster defaults!');
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-lg animate-pulse"
                      >
                        Yes, Confirm Full Reset
                      </button>
                      <button
                        onClick={() => setConfirmReset(false)}
                        className="px-3 py-2 bg-[#0f2448] text-slate-300 hover:text-white rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 12. GITHUB CLOUD SYNC & AUTOMATED CI/CD TAB */}
          {activeTab === 'github' && (
            <div className="space-y-6">
              <div className="border-b border-[#e5b94c]/20 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-cinzel text-base font-bold text-[#fcedbe] flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-[#e5b94c]" />
                    <span>GitHub Cloud Sync & Automated CI/CD Delivery</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Directly deliver Admin Panel updates to your GitHub repository (<code>TechTalk2026</code>) to automatically trigger GitHub Actions deployment to live GitHub Pages.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={githubConfig.owner ? `https://github.com/${githubConfig.owner}/${githubConfig.repo}/actions` : 'https://github.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/30 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>View GitHub Actions</span>
                  </a>
                </div>
              </div>

              {/* CARD 1: DELIVER TO GITHUB / DEPLOY TO LIVE SITE */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c2349] via-[#081830] to-[#040d1a] border-2 border-[#e5b94c]/50 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5b94c]/20 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#e5b94c] text-[#071326]">
                        Automated Live Deploy
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold bg-[#071326] px-2 py-0.5 rounded border border-emerald-500/30">
                        {githubConfig.owner ? `${githubConfig.owner}/${githubConfig.repo} : ${githubConfig.branch || 'main'}` : 'Not connected'}
                      </span>
                    </div>
                    <h5 className="font-cinzel text-base font-bold text-slate-100 mt-1">
                      Deliver Website State to GitHub Repository
                    </h5>
                    <p className="text-xs text-slate-300">
                      Commits <code>src/data/site_state.json</code> and all customized images directly to GitHub. This triggers GitHub Pages automated deployment in <code>deploy.yml</code>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeliverToGitHub(true)}
                    disabled={isGitHubSyncing || !githubConfig.owner.trim() || !githubConfig.token.trim()}
                    className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] hover:brightness-110 shadow-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!githubConfig.token.trim() ? 'Please provide a GitHub Personal Access Token below' : 'Commit & push changes to GitHub'}
                  >
                    <RefreshCw className={`w-4 h-4 text-[#071326] ${isGitHubSyncing ? 'animate-spin' : ''}`} />
                    <span>{isGitHubSyncing ? 'Delivering to GitHub...' : '⚡ Deliver to GitHub Now'}</span>
                  </button>
                </div>

                {/* Auto-Sync Toggle & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-xl bg-[#071326]/90 border border-[#e5b94c]/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#fcedbe] flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#e5b94c]" />
                        <span>Auto-Deliver on Every Save</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => updateConfigField('autoSync', !githubConfig.autoSync)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          githubConfig.autoSync ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                        title="Toggle automatic GitHub push on every Save & Publish click"
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                            githubConfig.autoSync ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      When enabled, clicking <strong>"Save & Publish Live"</strong> automatically commits and pushes all changes to GitHub without any extra steps!
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#071326]/90 border border-[#e5b94c]/25 space-y-1.5 text-xs">
                    <span className="font-bold text-[#fcedbe] block">Latest GitHub Delivery Status:</span>
                    {lastDeliveredInfo || githubConfig.lastSyncTime ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Last synced: {lastDeliveredInfo?.time || githubConfig.lastSyncTime}</span>
                        </div>
                        {(lastDeliveredInfo?.sha || githubConfig.lastCommitSha) && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <span>Commit:</span>
                            <a
                              href={
                                lastDeliveredInfo?.url ||
                                `https://github.com/${githubConfig.owner}/${githubConfig.repo}/commit/${lastDeliveredInfo?.sha || githubConfig.lastCommitSha}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[#e5b94c] hover:underline flex items-center gap-1"
                            >
                              <code>{(lastDeliveredInfo?.sha || githubConfig.lastCommitSha)?.slice(0, 7)}</code>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-[11px]">
                        No commits delivered yet in this session. Configure token below and click "Deliver to GitHub Now".
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD 2: GITHUB REPOSITORY & ACCESS TOKEN SETTINGS */}
              <div className="p-5 rounded-2xl bg-[#071326] border border-[#e5b94c]/30 space-y-4">
                <div className="flex items-center justify-between border-b border-[#e5b94c]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#e5b94c]" />
                    <h5 className="font-bold text-sm text-[#fcedbe]">
                      GitHub Repository Credentials & Token
                    </h5>
                  </div>

                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=TechTalk2026-Admin-Panel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-[#0f2448] text-xs font-semibold text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/30 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Generate a new GitHub Personal Access Token in your browser"
                  >
                    <ExternalLink className="w-3 h-3 text-[#e5b94c]" />
                    <span>Generate GitHub Token (1-Click)</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-xs">
                      GitHub Username / Org
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. your-github-user"
                      value={githubConfig.owner}
                      onChange={(e) => updateConfigField('owner', e.target.value)}
                      className="w-full px-3 py-2 bg-[#040d1a] border border-[#e5b94c]/30 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-[#e5b94c]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-xs">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      placeholder="TechTalk2026"
                      value={githubConfig.repo}
                      onChange={(e) => updateConfigField('repo', e.target.value)}
                      className="w-full px-3 py-2 bg-[#040d1a] border border-[#e5b94c]/30 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-[#e5b94c]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-xs">
                      Target Branch
                    </label>
                    <input
                      type="text"
                      placeholder="main"
                      value={githubConfig.branch}
                      onChange={(e) => updateConfigField('branch', e.target.value)}
                      className="w-full px-3 py-2 bg-[#040d1a] border border-[#e5b94c]/30 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-[#e5b94c]"
                    />
                  </div>
                </div>

                {/* Personal Access Token Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                      <span>Personal Access Token (PAT)</span>
                      <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                        Requires 'repo' scope
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTokenPassword(!showTokenPassword)}
                      className="text-[11px] text-[#e5b94c] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showTokenPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hide Token</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Show Token</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showTokenPassword ? 'text' : 'password'}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={githubConfig.token}
                      onChange={(e) => updateConfigField('token', e.target.value)}
                      className="w-full px-3 py-2 bg-[#040d1a] border border-[#e5b94c]/30 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-[#e5b94c]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your token is stored safely in your browser's private local storage. It is used exclusively to commit site data directly to your GitHub repository.
                  </p>
                </div>

                {/* Test Connection Button & Result */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestGitHubConnection}
                    disabled={isTestingGitHub || !githubConfig.owner.trim() || !githubConfig.token.trim()}
                    className="px-4 py-2 rounded-lg bg-[#0f2448] text-xs font-bold text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/40 flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#e5b94c] ${isTestingGitHub ? 'animate-spin' : ''}`} />
                    <span>{isTestingGitHub ? 'Testing Connection...' : 'Test Connection & Verify Token'}</span>
                  </button>

                  {githubTestResult && (
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                        githubTestResult.success
                          ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                          : 'bg-red-950/80 border border-red-500/40 text-red-200'
                      }`}
                    >
                      {githubTestResult.success ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{githubTestResult.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 3: HOW GITHUB ACTIONS AUTOMATION WORKS */}
              <div className="p-5 rounded-2xl bg-[#071326] border border-[#e5b94c]/20 space-y-3 text-xs text-slate-300">
                <h5 className="font-bold text-sm text-[#fcedbe] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>How Automated GitHub Delivery & Deployment Works</span>
                </h5>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
                  <li>
                    <strong>Edit Anywhere:</strong> Make changes to speakers, titles, partner logos, or schedule in this Admin Control Panel.
                  </li>
                  <li>
                    <strong>Push to Repository:</strong> Click <em>"Deliver to GitHub Now"</em> (or leave <em>"Auto-Deliver"</em> on). Your update is committed to <code>src/data/site_state.json</code> in your GitHub repository.
                  </li>
                  <li>
                    <strong>GitHub Actions Builds Automatically:</strong> Your repository workflow (<code>.github/workflows/deploy.yml</code>) triggers on push, builds the Vite production app, and publishes to GitHub Pages.
                  </li>
                  <li>
                    <strong>Zero Terminal Required:</strong> Your website is now permanently synchronized with GitHub!
                  </li>
                </ol>
              </div>

              {/* CARD 4: TERMINAL COMMANDS FALLBACK */}
              <div className="p-5 rounded-2xl bg-[#040d1a] border border-[#e5b94c]/25 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-[#fcedbe]">
                    <Terminal className="w-4 h-4 text-[#e5b94c]" />
                    <span>Optional: Manual Terminal Git Commands</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('git add src/data/site_state.json public/images/\ngit commit -m "Update conference site data from Admin Panel"\ngit push origin main');
                      showToast('Copied git commands to clipboard!');
                    }}
                    className="px-2.5 py-1 rounded bg-[#0f2448] text-[11px] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/30 cursor-pointer"
                  >
                    Copy Commands
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  If you are working on a local cloned repository in VS Code or Terminal, you can also push changes manually:
                </p>
                <pre className="p-3 rounded-lg bg-[#071326] border border-[#e5b94c]/20 text-[#fcedbe] font-mono text-[11px] overflow-x-auto select-all">
                  git add src/data/site_state.json public/images/&#10;git commit -m &quot;Update conference site data from Admin Panel&quot;&#10;git push origin main
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t border-[#e5b94c]/20 bg-[#071326] flex items-center justify-between text-xs text-slate-400">
          <div>
            All changes are synchronized and saved in local storage.
          </div>
          <button
            onClick={closeAdminPanel}
            className="px-5 py-2 bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] font-bold rounded-lg hover:brightness-110 shadow-md cursor-pointer"
          >
            Close & View Website
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 z-50">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
        {/* GitHub Quick Sync Floating Modal */}
        {isGitHubModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-[#071326] border-2 border-[#e5b94c]/60 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-4 bg-gradient-to-r from-[#0c2349] to-[#071326] border-b border-[#e5b94c]/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#071326] border border-[#e5b94c]/30 text-[#e5b94c]">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-[#fcedbe]">
                      GitHub Cloud Delivery & Deployment
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Sync site data directly to GitHub to trigger GitHub Pages live deployment
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGitHubModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Immediate Delivery Action */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c2349]/90 to-[#071326] border border-[#e5b94c]/40 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-[#fcedbe]">Immediate Action</span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-[#071326] px-2 py-0.5 rounded border border-emerald-500/30">
                      {githubConfig.owner ? `${githubConfig.owner}/${githubConfig.repo}` : 'Not Connected'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeliverToGitHub(true)}
                    disabled={isGitHubSyncing || !githubConfig.owner.trim() || !githubConfig.token.trim()}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] hover:brightness-110 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGitHubSyncing ? 'animate-spin' : ''}`} />
                    <span>{isGitHubSyncing ? 'Delivering to GitHub...' : '⚡ Deliver Changes to GitHub Now'}</span>
                  </button>

                  <div className="flex items-center justify-between pt-1 border-t border-[#e5b94c]/15">
                    <span className="text-slate-300 text-[11px]">Auto-deliver on every "Save & Publish"</span>
                    <button
                      type="button"
                      onClick={() => updateConfigField('autoSync', !githubConfig.autoSync)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        githubConfig.autoSync ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${
                          githubConfig.autoSync ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Configuration Inputs */}
                <div className="space-y-3 p-4 rounded-xl bg-[#040d1a] border border-[#e5b94c]/20">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#fcedbe]">Repository Configuration</span>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=TechTalk2026-Admin-Panel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#e5b94c] hover:underline flex items-center gap-1"
                    >
                      <span>Get GitHub Token</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">Owner / Username</label>
                      <input
                        type="text"
                        placeholder="your-github-username"
                        value={githubConfig.owner}
                        onChange={(e) => updateConfigField('owner', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-[#e5b94c]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">Repository Name</label>
                      <input
                        type="text"
                        placeholder="TechTalk2026"
                        value={githubConfig.repo}
                        onChange={(e) => updateConfigField('repo', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-[#e5b94c]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-slate-300 font-semibold">Personal Access Token (PAT)</label>
                      <button
                        type="button"
                        onClick={() => setShowTokenPassword(!showTokenPassword)}
                        className="text-[10px] text-[#e5b94c] hover:underline"
                      >
                        {showTokenPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showTokenPassword ? 'text' : 'password'}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={githubConfig.token}
                      onChange={(e) => updateConfigField('token', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-[#e5b94c]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleTestGitHubConnection}
                      disabled={isTestingGitHub || !githubConfig.owner.trim() || !githubConfig.token.trim()}
                      className="px-3 py-1.5 rounded bg-[#0f2448] text-[11px] font-bold text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTestingGitHub ? 'animate-spin' : ''}`} />
                      <span>{isTestingGitHub ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('github');
                        setIsGitHubModalOpen(false);
                      }}
                      className="text-[11px] text-[#e5b94c] hover:underline cursor-pointer"
                    >
                      Open Full GitHub Tab →
                    </button>
                  </div>

                  {githubTestResult && (
                    <div
                      className={`p-2 rounded text-[11px] flex items-center gap-1.5 ${
                        githubTestResult.success
                          ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-200'
                          : 'bg-red-950/80 border border-red-500/30 text-red-200'
                      }`}
                    >
                      {githubTestResult.success ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span>{githubTestResult.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-[#071326] border-t border-[#e5b94c]/20 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {githubConfig.lastSyncTime ? `Last sync: ${githubConfig.lastSyncTime}` : 'Token stored locally in browser'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsGitHubModalOpen(false)}
                  className="px-4 py-1.5 bg-[#0f2448] hover:bg-[#163363] text-slate-200 text-xs rounded-lg border border-[#e5b94c]/30 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
