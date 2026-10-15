import React, { useState } from 'react';
import { X, Check, Award, Shield, QrCode, Download, Printer, User, Mail, Phone, Briefcase, Sparkles } from 'lucide-react';
import { RegistrationSubmission } from '../types';
import { useEventData } from '../context/EventDataContext';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTierId?: string;
  initialCourse?: string;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  initialTierId = 'tier-f2f',
  initialCourse
}) => {
  const { registrationTiers, shortCourses, workshopTracks, addAttendee } = useEventData();
  const [tierId, setTierId] = useState<string>(initialTierId);
  const [isHybridBundle, setIsHybridBundle] = useState<boolean>(true);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [affiliation, setAffiliation] = useState<string>('');
  const [prcLicenseNo, setPrcLicenseNo] = useState<string>('');
  const [selectedWorkshopTrack, setSelectedWorkshopTrack] = useState<string>(workshopTracks[0]?.title || 'Artificial Intelligence');
  const [selectedShortCourse, setSelectedShortCourse] = useState<string>(initialCourse || shortCourses[0]?.title || 'Introduction to AI');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>('Standard Buffet');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [confirmedData, setConfirmedData] = useState<RegistrationSubmission | null>(null);

  if (!isOpen) return null;

  const activeTier = registrationTiers.find((t) => t.id === tierId) || registrationTiers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !affiliation.trim()) {
      alert("Please complete all required fields.");
      return;
    }

    const registrationId = `ICPEP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const submission: RegistrationSubmission = {
      id: registrationId,
      fullName,
      email,
      phone,
      affiliation,
      prcLicenseNo: prcLicenseNo.trim() || 'N/A (Student / Overseas Non-PRC)',
      tierId,
      isHybridBundle: activeTier.type === 'in-person' ? isHybridBundle : false,
      selectedWorkshopTrack,
      selectedShortCourse,
      dietaryRestrictions: activeTier.type === 'in-person' ? dietaryRestrictions : undefined,
      timestamp: new Date().toISOString()
    };

    addAttendee(submission);
    setConfirmedData(submission);
    setIsSubmitted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setConfirmedData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040c1a]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0a1b35] border-2 border-[#e5b94c] shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#0f2448] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#e5b94c] font-semibold">
                Official Delegate Registration
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                ICpEP-Oman TechTalk 2026 Registration
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Wyndham Hotel Muscat & Online Virtual Breakout Hub · October 30–31, 2026
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Registration Tier Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#fcedbe] uppercase tracking-wider mb-2">
                  Select Registration Track
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {registrationTiers.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setTierId(tier.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        tierId === tier.id
                          ? 'border-[#e5b94c] bg-[#163363]/80 shadow-md ring-1 ring-[#e5b94c]'
                          : 'border-[#e5b94c]/20 bg-[#071326]/70 hover:border-[#e5b94c]/50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-100">
                          {tier.name}
                        </div>
                        <div className="text-[11px] text-[#e5b94c] font-bold mt-1">
                          {tier.priceOman} <span className="text-slate-400 font-normal">({tier.pricePhp})</span>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-400">
                        {tier.type === 'in-person' ? 'Day 1 Wyndham Hotel' : 'Day 2 Online Sessions'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 10 CPD Units Hybrid Bundle Checkbox for In-Person Tier */}
              {activeTier.type === 'in-person' && (
                <div className="p-3.5 rounded-xl bg-[#0f2448]/80 border border-[#e5b94c]/40 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="hybridBundle"
                    checked={isHybridBundle}
                    onChange={(e) => setIsHybridBundle(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-600 text-[#e5b94c] focus:ring-[#e5b94c] accent-[#e5b94c] cursor-pointer"
                  />
                  <label htmlFor="hybridBundle" className="text-xs text-slate-200 cursor-pointer">
                    <span className="font-bold text-[#fcedbe] block">
                      Include Day 2 Online Access (Qualifies for Full 10 CPD Units)
                    </span>
                    One hybrid registration covering both Day 1 face-to-face in Muscat and Day 2 online breakout workshops qualifies attendees for 10 CPD units.
                  </label>
                </div>
              )}

              {/* Attendee Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engr. Juan Dela Cruz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. jdelacruz@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Phone (with Country Code) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+968 9123 4567 or +63 917 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Organization / Company / University <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Petroleum Development Oman / UTAS"
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    PRC License Number (Optional for CPD)
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. 0012345 (Leave blank if Student/Non-PRC)"
                      value={prcLicenseNo}
                      onChange={(e) => setPrcLicenseNo(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                    />
                  </div>
                </div>

                {activeTier.type === 'in-person' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Gala Dinner Dietary Preference
                    </label>
                    <select
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                      className="w-full px-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                    >
                      <option value="Standard Buffet">Standard International Buffet</option>
                      <option value="Halal">Strictly Halal Certified</option>
                      <option value="Vegetarian">Vegetarian Selection</option>
                      <option value="Seafood">Seafood / Pescatarian</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Day 2 Preferences */}
              <div className="p-4 rounded-xl bg-[#071326]/70 border border-[#e5b94c]/20 space-y-3">
                <div className="text-xs font-semibold text-[#fcedbe] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e5b94c]" />
                  <span>Workshop Track & Short Course Enrollment</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Primary Workshop Track Interest
                    </label>
                    <select
                      value={selectedWorkshopTrack}
                      onChange={(e) => setSelectedWorkshopTrack(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-xs text-slate-100 focus:outline-none"
                    >
                      {workshopTracks.map((t, idx) => (
                        <option key={idx} value={t.title}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Complimentary Cisco Remote Short Course
                    </label>
                    <select
                      value={selectedShortCourse}
                      onChange={(e) => setSelectedShortCourse(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-xs text-slate-100 focus:outline-none"
                    >
                      {shortCourses.map((c) => (
                        <option key={c.id} value={c.title}>
                          [{c.code}] {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  Total Payable: <strong className="text-[#fcedbe]">{activeTier.priceOman}</strong>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-[#071326] bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] rounded-lg hover:brightness-110 shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#071326]" />
                  <span>Confirm Registration</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Badge & Ticket Pass View */
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#fcedbe] to-[#c9982a] flex items-center justify-center mx-auto text-[#071326] shadow-lg shadow-[#e5b94c]/20">
              <Check className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#e5b94c] font-semibold">
                Registration Verified
              </span>
              <h3 className="font-cinzel text-2xl font-bold text-slate-100 mt-1">
                Welcome to ICpEP-Oman TechTalk 2026!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Your delegate pass is confirmed. A copy has been dispatched to <span className="text-[#fcedbe] font-medium">{confirmedData?.email}</span>.
              </p>
            </div>

            {/* Printable Digital Delegate Pass */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0f2448] to-[#071326] border-2 border-[#e5b94c] p-6 text-left shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-[#e5b94c]/25 pb-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#e5b94c]">
                    Official Delegate Pass
                  </div>
                  <h4 className="font-cinzel text-lg font-bold text-slate-100">
                    {confirmedData?.fullName}
                  </h4>
                  <p className="text-xs text-slate-300">{confirmedData?.affiliation}</p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">Pass Reference</div>
                  <div className="text-xs font-mono font-bold text-[#fcedbe]">
                    {confirmedData?.id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Track</div>
                  <div className="font-semibold text-[#fcedbe]">{activeTier.name}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">CPD Units</div>
                  <div className="font-semibold text-emerald-400">
                    {confirmedData?.isHybridBundle || activeTier.type === 'in-person' ? '10 Units Eligible' : 'Online Workshop Units'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">PRC License</div>
                  <div className="font-semibold text-slate-200">{confirmedData?.prcLicenseNo}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Dates</div>
                  <div className="font-semibold text-slate-200">Oct 30–31, 2026</div>
                </div>
              </div>

              {/* QR Verification Barcode */}
              <div className="p-3 bg-[#071326] rounded-xl border border-[#e5b94c]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <QrCode className="w-10 h-10 text-[#071326]" />
                  </div>
                  <div className="text-xs text-left">
                    <span className="font-bold text-slate-200 block">Fast-Track Entry QR Code</span>
                    <span className="text-[11px] text-slate-400">Present at Wyndham Hotel Reception & Virtual Check-In</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#e5b94c] font-semibold hidden sm:inline">
                  VALIDATED
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrint}
                className="px-5 py-2 text-xs font-semibold text-[#071326] bg-[#e5b94c] rounded-lg hover:brightness-110 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Pass</span>
              </button>

              <button
                onClick={resetAndClose}
                className="px-5 py-2 text-xs font-semibold text-slate-300 bg-[#0f2448] border border-[#e5b94c]/30 rounded-lg hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
