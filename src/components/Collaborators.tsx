import React, { useState } from 'react';
import {
  Check,
  Shield,
  GraduationCap,
  Cpu,
  Network,
  Building2,
  Sliders,
  Edit,
  Plus,
  ExternalLink,
  Award,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight
} from 'lucide-react';
import { useImageManager } from '../context/ImageContext';
import { useEventData } from '../context/EventDataContext';
import { CollaboratorsTextModal } from './CollaboratorsTextModal';

export const Collaborators: React.FC = () => {
  const { getImageUrl, getImageStyle, openEditor } = useImageManager();
  const { collaboratingOrgs, updateCollaboratingOrgs, globalPartnerships, isPublishMode, saveToServer } = useEventData();
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [selectedOrgIdx, setSelectedOrgIdx] = useState(0);
  const [modalTab, setModalTab] = useState<'edit' | 'arrange'>('arrange');

  const partnerSlotMap: Record<number, string> = {
    0: 'partner_ptc',
    1: 'partner_utas',
    2: 'partner_ieee',
    3: 'partner_cisco'
  };

  type LogoSize = 'medium' | 'large' | 'xl';
  const [logoSize, setLogoSize] = useState<LogoSize>(() => {
    const saved = localStorage.getItem('icpep_collaborator_logo_size');
    if (saved === 'medium' || saved === 'large' || saved === 'xl') return saved;
    return 'large';
  });

  const handleSetLogoSize = (size: LogoSize) => {
    setLogoSize(size);
    localStorage.setItem('icpep_collaborator_logo_size', size);
  };

  const handleMoveOrg = (index: number, direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collaboratingOrgs.length) return;
    const updated = [...collaboratingOrgs];
    const [removed] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, removed);
    updateCollaboratingOrgs(updated);
    if (saveToServer) {
      saveToServer();
    }
  };

  const getContainerHeightClass = () => {
    switch (logoSize) {
      case 'medium':
        return 'h-24 sm:h-26';
      case 'xl':
        return 'h-36 sm:h-44';
      case 'large':
      default:
        return 'h-30 sm:h-34';
    }
  };

  const getIconSizeClass = () => {
    switch (logoSize) {
      case 'medium':
        return 'w-7 h-7';
      case 'xl':
        return 'w-12 h-12';
      case 'large':
      default:
        return 'w-9 h-9';
    }
  };

  return (
    <section className="py-14 bg-[#071326] border-b border-[#e5b94c]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* IN COLLABORATION WITH (Strip) */}
        <div>
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-[0.25em] text-[#e5b94c] font-semibold">
              Institutional Synergy
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100">
                In Collaboration With
              </h3>

              <span className="text-xs font-mono text-[#e5b94c] bg-[#0a1b35] px-2.5 py-0.5 rounded-full border border-[#e5b94c]/30">
                {collaboratingOrgs.length} Partners
              </span>

              {!isPublishMode && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalTab('arrange');
                      setIsTextModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#e5b94c]/20 hover:bg-[#e5b94c]/30 text-[#fcedbe] border border-[#e5b94c]/60 hover:border-[#e5b94c] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    title="Arrange and reorder the position of partner logos"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>Arrange Logo Positions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrgIdx(0);
                      setModalTab('edit');
                      setIsTextModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:border-[#e5b94c]/70 cursor-pointer"
                    title="Change text, accreditations, and information for all collaborators"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>Edit Collaborators Panels</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrgIdx(collaboratingOrgs.length);
                      setModalTab('edit');
                      setIsTextModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#e5b94c] text-[#071326] hover:brightness-110 font-bold text-xs flex items-center gap-1 transition-all shadow cursor-pointer"
                    title="Add a new collaborating institution panel"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Partner</span>
                  </button>
                </div>
              )}
            </div>

            {/* Logo Size Control & Subtitle */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-3">
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl text-center">
                Uniting premier engineering councils, academic institutions, and global technology innovators
              </p>

              {!isPublishMode && (
                <div className="inline-flex items-center gap-1 bg-[#0a1b35] border border-[#e5b94c]/30 rounded-lg p-1 text-xs shadow-sm shrink-0">
                  <span className="text-[11px] text-slate-400 px-1.5 flex items-center gap-1 font-medium">
                    <Sliders className="w-3 h-3 text-[#e5b94c]" />
                    <span>Logo Scale:</span>
                  </span>
                  {(['medium', 'large', 'xl'] as const).map((sizeKey) => {
                    const labels = { medium: 'Medium', large: 'Large (Default)', xl: 'Extra Large' };
                    const isSelected = logoSize === sizeKey;
                    return (
                      <button
                        key={sizeKey}
                        type="button"
                        onClick={() => handleSetLogoSize(sizeKey)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#e5b94c] text-[#071326] shadow font-bold'
                            : 'text-slate-300 hover:text-[#fcedbe] hover:bg-[#0f2448]'
                        }`}
                      >
                        {labels[sizeKey]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div
            className={`grid gap-5 ${
              collaboratingOrgs.length <= 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
                : collaboratingOrgs.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}
          >
            {collaboratingOrgs.map((org, idx) => {
              const slotId = org.id || partnerSlotMap[idx] || `partner_${idx}`;
              const customLogo = getImageUrl(slotId);
              const customStyle = getImageStyle(slotId);

              return (
                <div
                  key={org.id || idx}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#0c1f3d]/90 via-[#0a1b35]/85 to-[#071326] border border-[#e5b94c]/30 hover:border-[#e5b94c]/70 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-[0_8px_30px_rgba(229,185,76,0.12)] overflow-hidden"
                >
                  {/* Top metallic glow bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#e5b94c]/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Row: Position Badge, Short Code Badge, Quick Reorder & Edit Buttons */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-mono font-bold text-[#e5b94c] bg-[#071326] px-2 py-0.5 rounded border border-[#e5b94c]/30 shadow-inner"
                            title={`Position #${idx + 1} of ${collaboratingOrgs.length}`}
                          >
                            #{idx + 1}
                          </span>
                          <span className="text-[11px] font-mono text-[#fcedbe] font-bold bg-[#0f2448] px-2 py-0.5 rounded border border-[#e5b94c]/20 tracking-wide shadow-inner">
                            {org.shortName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isPublishMode && (
                            <div className="flex items-center bg-[#071326] p-0.5 rounded-lg border border-[#e5b94c]/25 shadow-inner">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveOrg(idx, 'prev');
                                }}
                                className="p-1 rounded text-slate-300 hover:text-[#fcedbe] hover:bg-[#0f2448] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                title={`Move ${org.shortName} left (earlier position)`}
                              >
                                <ArrowLeft className="w-3 h-3 text-[#e5b94c]" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === collaboratingOrgs.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveOrg(idx, 'next');
                                }}
                                className="p-1 rounded text-slate-300 hover:text-[#fcedbe] hover:bg-[#0f2448] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                title={`Move ${org.shortName} right (later position)`}
                              >
                                <ArrowRight className="w-3 h-3 text-[#e5b94c]" />
                              </button>
                            </div>
                          )}

                          {org.websiteUrl && (
                            <a
                              href={org.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-[#071326] text-[#e5b94c] hover:text-white border border-[#e5b94c]/25 hover:border-[#e5b94c]/60 transition-colors"
                              title={`Visit ${org.shortName} portal`}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {!isPublishMode && (
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrgIdx(idx);
                                  setModalTab('edit');
                                  setIsTextModalOpen(true);
                                }}
                                className="p-1 rounded bg-[#071326] text-slate-400 hover:text-[#fcedbe] border border-[#e5b94c]/20 hover:border-[#e5b94c]/50 cursor-pointer transition-colors"
                                title={`Edit details for ${org.shortName}`}
                              >
                                <Edit className="w-3 h-3 text-[#e5b94c]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditor(slotId)}
                                className="p-1 rounded bg-[#071326] text-slate-400 hover:text-[#fcedbe] border border-[#e5b94c]/20 hover:border-[#e5b94c]/50 cursor-pointer transition-colors"
                                title="Upload or customize partner logo"
                              >
                                <Sliders className="w-3 h-3 text-[#e5b94c]" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prominently Enlarged Partner Logo Box */}
                      <div
                        onClick={() => {
                          if (!isPublishMode) openEditor(slotId);
                        }}
                        className={`w-full ${getContainerHeightClass()} rounded-xl bg-gradient-to-b from-[#0f2448]/95 via-[#0c1f3d] to-[#071326] border border-[#e5b94c]/30 group-hover:border-[#e5b94c]/70 flex items-center justify-center p-3.5 mb-3.5 transition-all duration-300 relative overflow-hidden shadow-inner ${
                          !isPublishMode ? 'cursor-pointer' : ''
                        }`}
                        title={!isPublishMode ? `Click to customize or enlarge ${org.shortName} logo in Media Studio` : undefined}
                      >
                        {customLogo ? (
                          <img
                            src={customLogo}
                            alt={org.name}
                            style={customStyle}
                            className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1.5 text-center select-none">
                            <div className="p-2.5 rounded-full bg-[#0a1b35] border border-[#e5b94c]/30 text-[#e5b94c] group-hover:border-[#e5b94c]/70 group-hover:scale-105 transition-all shadow-md">
                              {idx === 0 && <Shield className={`${getIconSizeClass()} text-[#e5b94c]`} />}
                              {idx === 1 && <GraduationCap className={`${getIconSizeClass()} text-[#e5b94c]`} />}
                              {idx === 2 && <Cpu className={`${getIconSizeClass()} text-[#e5b94c]`} />}
                              {idx === 3 && <Network className={`${getIconSizeClass()} text-[#e5b94c]`} />}
                              {idx > 3 && <Building2 className={`${getIconSizeClass()} text-[#e5b94c]`} />}
                            </div>
                            <span className="text-[10px] font-mono tracking-wider text-[#e5b94c]/80 uppercase">
                              Official Partner
                            </span>
                          </div>
                        )}

                        {!isPublishMode && (
                          <div className="absolute inset-0 bg-[#071326]/75 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-[#fcedbe] font-semibold pointer-events-none">
                            <Sliders className="w-3.5 h-3.5 text-[#e5b94c]" />
                            <span>Change Logo</span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-[#fcedbe] transition-colors line-clamp-2 leading-snug">
                        {org.name}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                        {org.subtitle}
                      </p>

                      {/* Accreditations / Key Initiatives Badge Tags */}
                      {org.accreditations && org.accreditations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#e5b94c]/15">
                          {org.accreditations.map((acc, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f2448]/90 text-[#fcedbe] border border-[#e5b94c]/25 flex items-center gap-1 shadow-sm"
                            >
                              <Award className="w-2.5 h-2.5 text-[#e5b94c] shrink-0" />
                              <span className="truncate max-w-[190px]">{acc}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#e5b94c]/15 text-[11px] text-[#fcedbe] font-medium flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <Check className="w-3 h-3 text-[#e5b94c] shrink-0" />
                        <span className="truncate">{org.role}</span>
                      </div>
                      {org.websiteUrl && (
                        <a
                          href={org.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[10px] font-mono text-[#e5b94c] hover:underline flex items-center gap-0.5"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GLOBAL CERTIFICATIONS & PARTNERSHIPS (with Checkmarks) */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0a1b35] to-[#071326] border border-[#e5b94c]/30 p-6 sm:p-8 lg:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-xs uppercase tracking-[0.25em] text-[#e5b94c] font-semibold">
              International Engineering Mobility
            </span>
            <h3 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
              Global Certifications & Partnerships
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              Accelerating professional standing through international registries and cross-continental enterprise partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {globalPartnerships.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#071326]/75 border border-[#e5b94c]/20 flex items-start gap-4 hover:border-[#e5b94c]/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#0f2448] border border-[#e5b94c] flex items-center justify-center shrink-0 mt-0.5 text-[#e5b94c]">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-bold text-slate-100">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-[#e5b94c] font-medium bg-[#0f2448] px-2 py-0.5 rounded border border-[#e5b94c]/30">
                      {item.highlight}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* International Enterprise Trust Bar */}
          <div className="mt-8 pt-6 border-t border-[#e5b94c]/20 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#e5b94c]" />
              <span>Multi-continental speakers from ASMPT SMT Solutions (Mexico) & CDW (Canada)</span>
            </div>
            <div className="text-[#fcedbe] font-medium">
              Washington Accord & ASEAN Chartered Professional Engineer Standards
            </div>
          </div>
        </div>
      </div>

      <CollaboratorsTextModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        initialIndex={selectedOrgIdx}
        initialTab={modalTab}
      />
    </section>
  );
};

