import React, { useState } from 'react';
import { X, ExternalLink, Link2, Check, Globe, AlertCircle, Sparkles, HelpCircle, ArrowRight, QrCode } from 'lucide-react';
import { useEventData } from '../context/EventDataContext';

interface RegistrationLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTierId?: string;
}

export const RegistrationLinksModal: React.FC<RegistrationLinksModalProps> = ({
  isOpen,
  onClose,
  initialTierId
}) => {
  const {
    eventDetails,
    updateEventDetails,
    registrationTiers,
    updateRegistrationTiers,
    shortCourses,
    updateShortCourses,
    isAdminLoggedIn
  } = useEventData();

  // Local state for Global Registration settings
  const [globalUrl, setGlobalUrl] = useState<string>(eventDetails.globalRegistrationUrl || '');
  const [useCustomGlobal, setUseCustomGlobal] = useState<boolean>(!!eventDetails.useCustomRegistrationRedirect);

  // Local state for per-tier redirect URLs
  const [tierUrls, setTierUrls] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    registrationTiers.forEach((t) => {
      map[t.id] = t.redirectUrl || '';
    });
    return map;
  });

  // Local state for active sub-tab
  const [activeTab, setActiveTab] = useState<'global' | 'tiers' | 'courses'>(
    initialTierId ? 'tiers' : 'global'
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !isAdminLoggedIn) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTestUrl = (url: string) => {
    if (!url || !url.trim()) {
      showToast('Please enter a URL first');
      return;
    }
    let formatted = url.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }
    window.open(formatted, '_blank', 'noopener,noreferrer');
  };

  const handleSave = () => {
    // 1. Update Global Event Details
    updateEventDetails({
      globalRegistrationUrl: globalUrl.trim(),
      useCustomRegistrationRedirect: useCustomGlobal && globalUrl.trim().length > 0
    });

    // 2. Update Registration Tiers
    const updatedTiers = registrationTiers.map((t) => ({
      ...t,
      redirectUrl: tierUrls[t.id]?.trim() || '',
      useRedirect: !!(tierUrls[t.id]?.trim())
    }));
    updateRegistrationTiers(updatedTiers);

    showToast('Registration redirect links saved successfully!');
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040c1a]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0a1b35] border-2 border-[#e5b94c] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-500 text-[#071326] font-bold text-xs rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0f2448] via-[#0a1b35] to-[#071326] border-b border-[#e5b94c]/30 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#071326] border border-[#e5b94c]/40 text-[#fcedbe] shadow-inner mt-0.5">
              <Link2 className="w-5 h-5 text-[#e5b94c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#e5b94c] font-bold bg-[#071326] px-2 py-0.5 rounded border border-[#e5b94c]/20">
                  Organizer Link Manager
                </span>
              </div>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                Edit Registration Redirect Links
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Paste custom enrollment links (Google Forms, Eventbrite, MS Forms, or Payment Portals) for delegates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0f2448] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 bg-[#071326] border-b border-[#e5b94c]/20 flex gap-2 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('global')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'global'
                ? 'border-[#e5b94c] text-[#fcedbe]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Global Registration Links</span>
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tiers'
                ? 'border-[#e5b94c] text-[#fcedbe]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Per-Tier Redirect Links ({registrationTiers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'courses'
                ? 'border-[#e5b94c] text-[#fcedbe]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Course Redirect Links ({shortCourses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-qr-edit'));
              }
            }}
            className="pb-2.5 px-3 font-semibold transition-all border-b-2 border-transparent text-[#e5b94c] hover:text-[#fcedbe] flex items-center gap-1.5 cursor-pointer ml-auto bg-[#0a1b35] rounded-t-lg"
            title="Edit or replace the event QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-[#e5b94c]" />
            <span>Edit QR Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-200 flex-1">
          {/* TAB 1: GLOBAL REGISTRATION */}
          {activeTab === 'global' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      <span>Header, Hero, CPD & Footer Registration Buttons</span>
                      {useCustomGlobal && globalUrl.trim() && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                          Active
                        </span>
                      )}
                    </h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Controls where delegates are redirected when clicking general "Register Now" buttons.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useCustomGlobal}
                      onChange={(e) => setUseCustomGlobal(e.target.checked)}
                      className="accent-[#e5b94c] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-200">Enable Redirect</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Global Redirect URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="e.g. https://forms.gle/xyz123 or https://eventbrite.com/e/..."
                      value={globalUrl}
                      onChange={(e) => {
                        setGlobalUrl(e.target.value);
                        if (e.target.value.trim().length > 0) {
                          setUseCustomGlobal(true);
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-[#0a1b35] border border-[#e5b94c]/40 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#e5b94c]"
                    />
                    <button
                      type="button"
                      onClick={() => handleTestUrl(globalUrl)}
                      className="px-3 py-2 bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/30 rounded-lg flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                      title="Test URL in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-start gap-1.5 pt-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#e5b94c] shrink-0 mt-0.5" />
                  <span>
                    When enabled, clicking <strong>"Register Now"</strong> in the top navigation, Hero banner, 10 CPD promo, or Footer will immediately open this link in a new tab. If blank or disabled, it opens the interactive digital badge registration form.
                  </span>
                </div>
              </div>

              {/* Behavior Preview Box */}
              <div className="p-3.5 rounded-lg bg-[#071326]/60 border border-[#e5b94c]/20 space-y-1.5">
                <span className="text-[11px] font-mono text-[#e5b94c] uppercase font-bold tracking-wider">
                  Current Global Behavior:
                </span>
                <p className="text-slate-300 text-xs">
                  {useCustomGlobal && globalUrl.trim() ? (
                    <>
                      Delegates will be redirected to: <code className="text-[#fcedbe] bg-[#0a1b35] px-1.5 py-0.5 rounded break-all">{globalUrl.trim()}</code>
                    </>
                  ) : (
                    <>
                      Delegates will open the built-in <strong>Delegate Badge & Registration Modal</strong> with offline check-in capability.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PER-TIER REDIRECT LINKS */}
          {activeTab === 'tiers' && (
            <div className="space-y-4">
              <div className="text-slate-300 text-xs">
                Provide different registration links for each conference pass tier. If a tier has its own link, clicking that tier's register button will open that specific portal.
              </div>

              <div className="space-y-4">
                {registrationTiers.map((tier) => {
                  const currentTierUrl = tierUrls[tier.id] || '';
                  const hasLink = currentTierUrl.trim().length > 0;

                  return (
                    <div
                      key={tier.id}
                      className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel text-sm font-bold text-[#fcedbe]">
                            {tier.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0a1b35] text-slate-300 border border-[#e5b94c]/20">
                            {tier.priceOman} · {tier.pricePhp}
                          </span>
                          {tier.recommended && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#e5b94c] text-[#071326] font-bold uppercase">
                              Popular
                            </span>
                          )}
                        </div>

                        {hasLink && (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Redirect Active</span>
                          </span>
                        )}
                      </div>

                      <p className="text-slate-400 text-xs">{tier.subtitle}</p>

                      <div className="space-y-1.5">
                        <label className="block text-slate-300 font-semibold">
                          Custom Redirect URL for this Pass:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder={`e.g. Google Form or Eventbrite URL for ${tier.name}...`}
                            value={currentTierUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTierUrls((prev) => ({
                                ...prev,
                                [tier.id]: val
                              }));
                            }}
                            className="flex-1 px-3 py-2 bg-[#0a1b35] border border-[#e5b94c]/40 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#e5b94c]"
                          />
                          <button
                            type="button"
                            onClick={() => handleTestUrl(currentTierUrl)}
                            className="px-3 py-2 bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/30 rounded-lg flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                            title="Test URL in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Test</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>
                          {hasLink ? (
                            <span className="text-slate-300">
                              Clicks on "Register as {tier.name}" will redirect to this link.
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              No tier link set (falls back to Global Link or built-in registration modal).
                            </span>
                          )}
                        </span>
                        {hasLink && (
                          <button
                            type="button"
                            onClick={() => {
                              setTierUrls((prev) => ({
                                ...prev,
                                [tier.id]: ''
                              }));
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer underline"
                          >
                            Clear link
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: COURSE REDIRECT LINKS */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div className="text-slate-300 text-xs">
                Manage enrollment redirect links for each of the 6 Remote Short Courses. Delegates clicking "Enroll with Registration" will be redirected to these course links.
              </div>

              <div className="grid grid-cols-1 gap-3">
                {shortCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-xl bg-[#071326] border border-[#e5b94c]/25 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#e5b94c] bg-[#0a1b35] px-2 py-0.5 rounded">
                          {course.code}
                        </span>
                        <span className="font-bold text-slate-100">{course.title}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">{course.partner}</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Paste course enrollment link (e.g. Cisco NetAcad or LMS)..."
                        value={course.enrollmentUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = shortCourses.map((c) =>
                            c.id === course.id ? { ...c, enrollmentUrl: val } : c
                          );
                          updateShortCourses(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100 placeholder:text-slate-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleTestUrl(course.enrollmentUrl || '')}
                        className="px-2.5 py-1.5 bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/30 rounded flex items-center gap-1 font-semibold text-xs cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Test</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#071326] border-t border-[#e5b94c]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Changes persist automatically across all website sections and devices.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#0f2448] text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] font-bold rounded-lg hover:brightness-110 shadow-lg shadow-[#c9982a]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save All Redirect Links</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
