import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Shield,
  GraduationCap,
  Cpu,
  Network,
  Sparkles,
  AlertCircle,
  Sliders,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  ExternalLink,
  Award,
  Upload,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { useEventData } from '../context/EventDataContext';
import { useImageManager } from '../context/ImageContext';
import { CollaboratingOrg } from '../types';
import { COLLABORATING_ORGS as DEFAULT_ORGS } from '../data/eventData';
import { getPartnerSlotId, resolvePartnerLogo } from '../utils/collaboratorUtils';
import { compressImage } from '../utils/imageCompressor';

interface CollaboratorsTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  initialTab?: 'edit' | 'arrange';
}

export const CollaboratorsTextModal: React.FC<CollaboratorsTextModalProps> = ({
  isOpen,
  onClose,
  initialIndex = 0,
  initialTab = 'arrange'
}) => {
  const { collaboratingOrgs, updateCollaboratingOrgs, saveToServer } = useEventData();
  const { openEditor, getImageUrl, updateSlotUrl } = useImageManager();
  const [orgs, setOrgs] = useState<CollaboratingOrg[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'arrange' | 'edit'>('arrange');
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOrgs(JSON.parse(JSON.stringify(collaboratingOrgs)));
      setActiveIdx(Math.min(initialIndex, Math.max(0, collaboratingOrgs.length - 1)));
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setShowSavedToast(false);
    }
  }, [isOpen, collaboratingOrgs, initialIndex, initialTab]);

  if (!isOpen) return null;

  const currentOrg = orgs[activeIdx] || orgs[0];

  const handleUpdateCurrentField = (field: keyof CollaboratingOrg, value: unknown) => {
    if (!orgs[activeIdx]) return;
    const updated = [...orgs];
    updated[activeIdx] = {
      ...updated[activeIdx],
      [field]: value
    };
    setOrgs(updated);
  };

  const handleAddOrg = () => {
    const newOrg: CollaboratingOrg = {
      id: `partner_${Date.now()}`,
      name: 'New Collaborating Institution',
      subtitle: 'Higher education, professional body, or technology industry leader',
      shortName: 'PARTNER',
      role: 'Strategic Partner',
      accreditations: ['Collaborative Initiative'],
      websiteUrl: ''
    };
    const updated = [...orgs, newOrg];
    setOrgs(updated);
    setActiveIdx(updated.length - 1);
  };

  const handleDuplicateOrg = (idx: number) => {
    const source = orgs[idx];
    if (!source) return;
    const clone: CollaboratingOrg = {
      ...JSON.parse(JSON.stringify(source)),
      id: `partner_${Date.now()}`,
      name: `${source.name} (Copy)`,
      shortName: `${source.shortName}2`
    };
    const updated = [...orgs];
    updated.splice(idx + 1, 0, clone);
    setOrgs(updated);
    setActiveIdx(idx + 1);
  };

  const handleMoveOrg = (index: number, direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orgs.length) return;
    const updated = [...orgs];
    const [removed] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, removed);
    setOrgs(updated);
    setActiveIdx(targetIndex);
  };

  const handleSetPosition = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orgs.length || fromIndex === toIndex) return;
    const updated = [...orgs];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setOrgs(updated);
    setActiveIdx(toIndex);
  };

  const handleDeleteOrg = (idx: number) => {
    if (orgs.length <= 1) {
      alert('You must keep at least one collaborating organization.');
      return;
    }
    const updated = orgs.filter((_, i) => i !== idx);
    setOrgs(updated);
    setActiveIdx(Math.max(0, idx - 1));
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all collaborating organizations and logos back to original conference defaults?')) {
      const reset = JSON.parse(JSON.stringify(DEFAULT_ORGS));
      setOrgs(reset);
      setActiveIdx(0);
    }
  };

  const handleSave = () => {
    updateCollaboratingOrgs(orgs);
    if (saveToServer) {
      saveToServer();
    }
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 900);
  };

  const defaultPartnerSlotIds = ['partner_ptc', 'partner_utas', 'partner_ieee', 'partner_cisco'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="collaborators-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040c1a]/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#0a1b35] to-[#071326] border-2 border-[#e5b94c]/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#071326] border-b border-[#e5b94c]/25 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#163363] to-[#0a1b35] border border-[#e5b94c]/40 flex items-center justify-center text-[#e5b94c] shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[#e5b94c] font-semibold bg-[#0f2448] px-2 py-0.5 rounded border border-[#e5b94c]/20">
                  Institutional Synergy
                </span>
                <span className="text-xs text-slate-400">Position & Content Manager</span>
              </div>
              <h2 id="collaborators-modal-title" className="font-cinzel text-lg sm:text-xl font-bold text-[#fcedbe] mt-0.5">
                Collaborators & Logo Positions
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefaults}
              className="px-2.5 py-1.5 rounded-lg bg-[#0f2448] text-slate-300 hover:text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset all to original defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#e5b94c]" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0f2448] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher Header */}
        <div className="px-6 py-2.5 bg-[#051022] border-b border-[#e5b94c]/20 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#0a1b35] p-1 rounded-xl border border-[#e5b94c]/30">
            <button
              type="button"
              onClick={() => setActiveTab('arrange')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'arrange'
                  ? 'bg-gradient-to-r from-[#e5b94c] to-[#c9982a] text-[#071326] shadow font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0f2448]'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Arrange Logo Positions</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'arrange' ? 'bg-[#071326]/40 text-[#071326]' : 'bg-[#071326] text-[#e5b94c]'}`}>
                {orgs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-gradient-to-r from-[#e5b94c] to-[#c9982a] text-[#071326] shadow font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0f2448]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Partner Details</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddOrg}
            className="px-2.5 py-1 text-xs font-semibold bg-[#e5b94c]/15 hover:bg-[#e5b94c]/25 text-[#fcedbe] border border-[#e5b94c]/40 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#e5b94c]" />
            <span>Add Another Partner</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: ARRANGE LOGO POSITIONS */}
          {activeTab === 'arrange' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-[#0f2448]/60 border border-[#e5b94c]/20 flex items-start gap-3 text-xs text-slate-300">
                <Sparkles className="w-4 h-4 text-[#e5b94c] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#fcedbe]">
                    Arrange the sequential display order of all institutional collaborator logos.
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    Use the Position selectors, arrow buttons (← / →), or quick jump controls to arrange exactly where each logo appears on the conference homepage strip.
                  </p>
                </div>
              </div>

              {/* Order List */}
              <div className="space-y-3">
                {orgs.map((o, idx) => {
                  const slotId = getPartnerSlotId(o, idx);
                  const logoImg = resolvePartnerLogo(o, slotId, getImageUrl);

                  return (
                    <div
                      key={o.id || idx}
                      className="p-3.5 sm:p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/25 hover:border-[#e5b94c]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md group"
                    >
                      {/* Left: Position Number, Logo Thumbnail, Info */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Position Pill */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#163363] to-[#0a1b35] border border-[#e5b94c]/50 text-[#fcedbe] shadow-inner">
                          <span className="text-[10px] font-mono uppercase text-[#e5b94c]/80 font-bold leading-none">Pos</span>
                          <span className="text-sm font-mono font-extrabold text-[#fcedbe] leading-none mt-0.5">#{idx + 1}</span>
                        </div>

                        {/* Logo Thumbnail Showcase */}
                        <div
                          onClick={() => {
                            onClose();
                            openEditor(slotId);
                          }}
                          className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl bg-[#040c1a] border border-[#e5b94c]/30 group-hover:border-[#e5b94c]/70 flex items-center justify-center p-1.5 shrink-0 relative overflow-hidden cursor-pointer shadow-inner"
                          title="Click to edit logo in Media Studio"
                        >
                          {logoImg ? (
                            <img
                              src={logoImg}
                              alt={o.name}
                              className="max-h-full max-w-full object-contain filter drop-shadow"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-[#e5b94c]">
                              {idx === 0 && <Shield className="w-5 h-5" />}
                              {idx === 1 && <GraduationCap className="w-5 h-5" />}
                              {idx === 2 && <Cpu className="w-5 h-5" />}
                              {idx === 3 && <Network className="w-5 h-5" />}
                              {idx > 3 && <Building2 className="w-5 h-5" />}
                              <span className="text-[8px] font-mono text-[#e5b94c]/80 mt-0.5 uppercase">No Logo</span>
                            </div>
                          )}
                        </div>

                        {/* Org Description */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold bg-[#0f2448] px-2 py-0.5 rounded text-[#fcedbe] border border-[#e5b94c]/20">
                              {o.shortName || 'CODE'}
                            </span>
                            <span className="text-xs font-bold text-slate-100 truncate max-w-sm">
                              {o.name || 'Untitled Organization'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-1">
                            {o.subtitle || o.role || 'Collaborating entity'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Position Arranging Controls */}
                      <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#e5b94c]/10">
                        {/* Direct Position Picker */}
                        <div className="flex items-center gap-1.5 bg-[#0a1b35] px-2 py-1 rounded-lg border border-[#e5b94c]/30">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Jump to:</label>
                          <select
                            value={idx}
                            onChange={(e) => handleSetPosition(idx, Number(e.target.value))}
                            className="bg-[#071326] text-[#fcedbe] text-xs font-mono font-bold px-2 py-0.5 rounded border border-[#e5b94c]/30 focus:outline-none focus:border-[#e5b94c] cursor-pointer"
                          >
                            {orgs.map((_, pIdx) => (
                              <option key={pIdx} value={pIdx}>
                                #{pIdx + 1} {pIdx === 0 ? '(1st)' : pIdx === orgs.length - 1 ? '(Last)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Arrow Controls */}
                        <div className="flex items-center gap-1 bg-[#0a1b35] p-1 rounded-lg border border-[#e5b94c]/30">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleSetPosition(idx, 0)}
                            className="p-1 rounded text-slate-300 hover:text-[#fcedbe] hover:bg-[#071326] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            title="Move to First Position"
                          >
                            <ChevronsLeft className="w-3.5 h-3.5 text-[#e5b94c]" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveOrg(idx, 'prev')}
                            className="px-2 py-1 rounded text-xs font-semibold text-slate-300 hover:text-[#fcedbe] hover:bg-[#071326] disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                            title="Move one position earlier"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 text-[#e5b94c]" />
                            <span className="hidden sm:inline">Earlier</span>
                          </button>

                          <button
                            type="button"
                            disabled={idx === orgs.length - 1}
                            onClick={() => handleMoveOrg(idx, 'next')}
                            className="px-2 py-1 rounded text-xs font-semibold text-slate-300 hover:text-[#fcedbe] hover:bg-[#071326] disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                            title="Move one position later"
                          >
                            <span className="hidden sm:inline">Later</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#e5b94c]" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === orgs.length - 1}
                            onClick={() => handleSetPosition(idx, orgs.length - 1)}
                            className="p-1 rounded text-slate-300 hover:text-[#fcedbe] hover:bg-[#071326] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            title="Move to Last Position"
                          >
                            <ChevronsRight className="w-3.5 h-3.5 text-[#e5b94c]" />
                          </button>
                        </div>

                        {/* Quick Action Buttons */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveIdx(idx);
                            setActiveTab('edit');
                          }}
                          className="p-1.5 px-2 rounded-lg bg-[#0f2448] text-slate-300 hover:text-white border border-[#e5b94c]/20 text-xs flex items-center gap-1 cursor-pointer"
                          title="Edit text and accreditations"
                        >
                          <Sliders className="w-3 h-3 text-[#e5b94c]" />
                          <span className="hidden sm:inline">Edit Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Real-Time Header Strip Preview */}
              <div className="p-4 rounded-xl bg-[#051022] border border-[#e5b94c]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#e5b94c] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Real-Time Strip Sequence Preview:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Left-to-right display as seen on website
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto p-2 bg-[#071326] rounded-lg border border-[#e5b94c]/15">
                  {orgs.map((o, idx) => {
                    const slotId = o.id || defaultPartnerSlotIds[idx] || `partner_${idx}`;
                    const logoImg = getImageUrl(slotId);

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a1b35] border border-[#e5b94c]/30 shrink-0"
                      >
                        <span className="text-[10px] font-mono text-[#e5b94c] font-extrabold">#{idx + 1}</span>
                        {logoImg ? (
                          <div className="w-5 h-5 rounded bg-[#071326] flex items-center justify-center p-0.5 border border-[#e5b94c]/20">
                            <img src={logoImg} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                        ) : (
                          <Building2 className="w-4 h-4 text-[#e5b94c]" />
                        )}
                        <span className="text-xs font-mono font-bold text-slate-100">{o.shortName || 'ORG'}</span>
                        {idx < orgs.length - 1 && (
                          <span className="text-slate-600 text-xs font-bold pl-1">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT PARTNER DETAILS */}
          {activeTab === 'edit' && (
            <div className="space-y-6">
              {/* Partner Select Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#e5b94c]">
                    Select Collaborating Institution to Edit ({orgs.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOrg}
                    className="px-2.5 py-1 text-xs font-semibold bg-[#e5b94c]/15 hover:bg-[#e5b94c]/25 text-[#fcedbe] border border-[#e5b94c]/40 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#e5b94c]" />
                    <span>Add Another Institution</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {orgs.map((o, idx) => {
                    const isActive = activeIdx === idx;
                    const slotId = o.id || defaultPartnerSlotIds[idx] || `partner_${idx}`;
                    const tabLogo = getImageUrl(slotId);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          isActive
                            ? 'bg-gradient-to-r from-[#163363] to-[#0f2448] border-[#e5b94c] shadow-[0_0_15px_rgba(229,185,76,0.15)] ring-1 ring-[#e5b94c]'
                            : 'bg-[#071326] border-[#e5b94c]/20 hover:border-[#e5b94c]/50 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-[#e5b94c]">
                              #{idx + 1}
                            </span>
                            {tabLogo ? (
                              <div className="w-5 h-5 rounded bg-[#071326] border border-[#e5b94c]/30 overflow-hidden flex items-center justify-center p-0.5">
                                <img src={tabLogo} alt="" className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded bg-[#071326] border border-[#e5b94c]/20 flex items-center justify-center text-[#e5b94c]">
                                <Building2 className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#071326] border border-[#e5b94c]/30 text-[#fcedbe]">
                            {o.shortName || 'ORG'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-100 truncate">
                          {o.name || 'Untitled Organization'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {o.role || 'Partner'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Grid */}
              {currentOrg && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                  {/* Left Column: Form Fields */}
                  <div className="lg:col-span-7 space-y-4 bg-[#071326]/60 p-4 sm:p-5 rounded-xl border border-[#e5b94c]/25">
                    <div className="flex items-center justify-between border-b border-[#e5b94c]/15 pb-2.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#fcedbe]">
                          Editing: Partner #{activeIdx + 1} ({currentOrg.shortName})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Reorder Buttons */}
                        <button
                          type="button"
                          disabled={activeIdx === 0}
                          onClick={() => handleMoveOrg(activeIdx, 'prev')}
                          className="p-1 rounded bg-[#0a1b35] text-slate-300 hover:text-[#fcedbe] disabled:opacity-30 disabled:cursor-not-allowed border border-[#e5b94c]/20 text-[11px] flex items-center gap-0.5"
                          title="Move this partner earlier in the list"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 text-[#e5b94c]" />
                          <span className="hidden sm:inline">Earlier</span>
                        </button>

                        <button
                          type="button"
                          disabled={activeIdx === orgs.length - 1}
                          onClick={() => handleMoveOrg(activeIdx, 'next')}
                          className="p-1 rounded bg-[#0a1b35] text-slate-300 hover:text-[#fcedbe] disabled:opacity-30 disabled:cursor-not-allowed border border-[#e5b94c]/20 text-[11px] flex items-center gap-0.5"
                          title="Move this partner later in the list"
                        >
                          <span className="hidden sm:inline">Later</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#e5b94c]" />
                        </button>

                        {/* Clone Partner */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateOrg(activeIdx)}
                          className="p-1 px-1.5 rounded bg-[#0a1b35] text-slate-300 hover:text-[#fcedbe] border border-[#e5b94c]/20 text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Duplicate this partner configuration"
                        >
                          <Copy className="w-3 h-3 text-[#e5b94c]" />
                          <span className="hidden sm:inline">Clone</span>
                        </button>

                        {/* Delete Partner */}
                        {orgs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteOrg(activeIdx)}
                            className="px-2 py-1 text-[11px] text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded flex items-center gap-1 transition-colors cursor-pointer"
                            title="Remove this collaborator"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Short Name & Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Short Name / Badge
                        </label>
                        <input
                          type="text"
                          value={currentOrg.shortName}
                          onChange={(e) => handleUpdateCurrentField('shortName', e.target.value)}
                          placeholder="e.g. PTC MENA"
                          className="w-full px-3 py-2 bg-[#0a1b35] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-[#e5b94c]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Role / Affiliation Label
                        </label>
                        <input
                          type="text"
                          value={currentOrg.role}
                          onChange={(e) => handleUpdateCurrentField('role', e.target.value)}
                          placeholder="e.g. Professional Accreditation & Registry Partner"
                          className="w-full px-3 py-2 bg-[#0a1b35] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                        />
                      </div>
                    </div>

                    {/* Full Organization Name */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Full Organization Name
                      </label>
                      <input
                        type="text"
                        value={currentOrg.name}
                        onChange={(e) => handleUpdateCurrentField('name', e.target.value)}
                        placeholder="e.g. Philippine Technological Council (PTC) MENA"
                        className="w-full px-3 py-2 bg-[#0a1b35] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 font-semibold focus:outline-none focus:border-[#e5b94c]"
                      />
                    </div>

                    {/* Subtitle / Description */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Subtitle / Mission Description
                      </label>
                      <textarea
                        rows={2}
                        value={currentOrg.subtitle}
                        onChange={(e) => handleUpdateCurrentField('subtitle', e.target.value)}
                        placeholder="e.g. The Umbrella Organization of 13 PRC-Accredited Engineering Disciplines"
                        className="w-full px-3 py-2 bg-[#0a1b35] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                      />
                    </div>

                    {/* Accreditations / Key Areas */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Accreditations or Key Initiatives (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(currentOrg.accreditations || []).join(', ')}
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean);
                          handleUpdateCurrentField('accreditations', tags);
                        }}
                        placeholder="e.g. ASEAN Engineer Registry (AER), International Professional Engineer (intPE)"
                        className="w-full px-3 py-2 bg-[#0a1b35] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                      />
                      {currentOrg.accreditations && currentOrg.accreditations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {currentOrg.accreditations.map((acc, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f2448] text-[#fcedbe] border border-[#e5b94c]/25 flex items-center gap-1"
                            >
                              <Award className="w-2.5 h-2.5 text-[#e5b94c]" />
                              <span>{acc}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Official Website / Portal URL */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Official Portal / Website URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={currentOrg.websiteUrl || ''}
                        onChange={(e) => handleUpdateCurrentField('websiteUrl', e.target.value)}
                        placeholder="https://ptc.org.ph"
                        className="w-full px-3 py-2 bg-[#0a1b35] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-[#e5b94c]"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        When provided, an interactive portal badge appears on the partner card for attendees to explore their official site.
                      </p>
                    </div>

                    {/* Partner Logo & Media Controls */}
                    <div className="p-3.5 rounded-xl bg-[#071326] border border-[#e5b94c]/30 space-y-3 shadow-inner">
                      {(() => {
                        const slotId = getPartnerSlotId(currentOrg, activeIdx);
                        const currentLogo = resolvePartnerLogo(currentOrg, slotId, getImageUrl);

                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold text-[#e5b94c] uppercase tracking-wider">
                                Partner Logo & Emblem
                              </label>
                              <span className="text-[10px] font-mono text-slate-400">Slot: {slotId}</span>
                            </div>

                            <input
                              type="file"
                              id={`modal-collab-file-${slotId}`}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85 })
                                  .then((compressed) => {
                                    handleUpdateCurrentField('logo', compressed);
                                    updateSlotUrl(slotId, compressed);
                                  })
                                  .catch(() => {
                                    const reader = new FileReader();
                                    reader.onload = (evt) => {
                                      const dataUrl = evt.target?.result as string;
                                      if (dataUrl) {
                                        handleUpdateCurrentField('logo', dataUrl);
                                        updateSlotUrl(slotId, dataUrl);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                e.target.value = '';
                              }}
                            />

                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl bg-[#0a1b35] border border-[#e5b94c]/40 shrink-0 overflow-hidden flex items-center justify-center p-1 shadow-inner">
                                {currentLogo ? (
                                  <img src={currentLogo} alt="" className="max-w-full max-h-full object-contain filter drop-shadow" />
                                ) : (
                                  <Building2 className="w-6 h-6 text-[#e5b94c]/50" />
                                )}
                              </div>

                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`modal-collab-file-${slotId}`)?.click()}
                                    className="px-3 py-1.5 rounded-lg bg-[#e5b94c] text-[#071326] font-bold text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow-sm transition-transform"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload Logo File</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      openEditor(slotId);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#0f2448] text-[#fcedbe] hover:bg-[#163363] border border-[#e5b94c]/40 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                                  >
                                    <Sliders className="w-3.5 h-3.5 text-[#e5b94c]" />
                                    <span>Media Studio</span>
                                  </button>

                                  {currentLogo && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateCurrentField('logo', '');
                                        updateSlotUrl(slotId, '');
                                      }}
                                      className="px-2 py-1 rounded bg-red-950/40 text-red-300 hover:text-white border border-red-500/30 text-xs cursor-pointer"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>

                                <input
                                  type="text"
                                  placeholder="Or paste Direct Image URL (e.g. ./images/logo.png)..."
                                  value={currentOrg.logo || ''}
                                  onChange={(e) => {
                                    handleUpdateCurrentField('logo', e.target.value);
                                    updateSlotUrl(slotId, e.target.value);
                                  }}
                                  className="w-full px-2.5 py-1 bg-[#0a1b35] border border-[#e5b94c]/30 rounded text-slate-100 text-xs font-mono focus:outline-none focus:border-[#e5b94c]"
                                />
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Right Column: Live Card Preview */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#e5b94c] uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Live Card Panel Preview</span>
                      </div>

                      <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0c1f3d] via-[#0a1b35] to-[#071326] border-2 border-[#e5b94c]/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#e5b94c]/60 to-transparent absolute top-0 left-0 right-0" />

                        <div>
                          {(() => {
                            const slotId = getPartnerSlotId(currentOrg, activeIdx);
                            const currentLogo = resolvePartnerLogo(currentOrg, slotId, getImageUrl);

                            return (
                              <>
                                <div className="flex items-center justify-between mb-3 mt-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-[#e5b94c] font-bold bg-[#071326] px-2 py-0.5 rounded border border-[#e5b94c]/30">
                                      #{activeIdx + 1}
                                    </span>
                                    <span className="text-[11px] font-mono text-[#fcedbe] font-bold bg-[#0f2448] px-2.5 py-0.5 rounded-md border border-[#e5b94c]/30 shadow-inner">
                                      {currentOrg.shortName || 'CODE'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {currentOrg.websiteUrl && (
                                      <span className="p-1 rounded bg-[#071326] text-[#e5b94c] border border-[#e5b94c]/30">
                                        <ExternalLink className="w-3 h-3" />
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        onClose();
                                        openEditor(slotId);
                                      }}
                                      className="px-2 py-0.5 rounded bg-[#071326] text-[#fcedbe] hover:text-white border border-[#e5b94c]/30 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Edit this partner's logo in Media Studio"
                                    >
                                      <Sliders className="w-3 h-3 text-[#e5b94c]" />
                                      <span>Edit Logo</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Enlarged Logo Showcase Box in Preview */}
                                <div
                                  onClick={() => {
                                    document.getElementById(`modal-collab-file-${slotId}`)?.click();
                                  }}
                                  className="w-full h-28 rounded-xl bg-gradient-to-b from-[#0f2448] to-[#071326] border border-[#e5b94c]/30 hover:border-[#e5b94c]/70 flex items-center justify-center p-3 mb-3.5 text-[#fcedbe] cursor-pointer transition-colors shadow-inner"
                                  title="Click to upload/change this partner's logo"
                                >
                                  {currentLogo ? (
                                    <img
                                      src={currentLogo}
                                      alt={currentOrg.name}
                                      className="max-h-full max-w-full object-contain filter drop-shadow"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center gap-1.5 text-center select-none">
                                      <div className="p-2.5 rounded-full bg-[#0a1b35] border border-[#e5b94c]/30 text-[#e5b94c] shadow">
                                        {activeIdx === 0 && <Shield className="w-8 h-8 text-[#e5b94c]" />}
                                        {activeIdx === 1 && <GraduationCap className="w-8 h-8 text-[#e5b94c]" />}
                                        {activeIdx === 2 && <Cpu className="w-8 h-8 text-[#e5b94c]" />}
                                        {activeIdx === 3 && <Network className="w-8 h-8 text-[#e5b94c]" />}
                                        {activeIdx > 3 && <Building2 className="w-8 h-8 text-[#e5b94c]" />}
                                      </div>
                                      <span className="text-[10px] font-mono tracking-wider text-[#e5b94c]/80 uppercase">
                                        Click to Upload Logo
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          })()}

                          <h4 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">
                            {currentOrg.name || 'Organization Name'}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                            {currentOrg.subtitle || 'Subtitle / organizational mission statement will appear here.'}
                          </p>

                          {currentOrg.accreditations && currentOrg.accreditations.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[#e5b94c]/15">
                              {currentOrg.accreditations.map((acc, aIdx) => (
                                <span
                                  key={aIdx}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f2448]/90 text-[#fcedbe] border border-[#e5b94c]/20 flex items-center gap-1"
                                >
                                  <Award className="w-2.5 h-2.5 text-[#e5b94c]" />
                                  <span>{acc}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#e5b94c]/15 text-[11px] text-[#fcedbe] font-medium flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#e5b94c]" />
                            <span>{currentOrg.role || 'Partner Role'}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
                        </div>
                      </div>
                    </div>

                    {/* Helpful Tip with Quick Jump */}
                    <div className="p-3 rounded-lg bg-[#071326] border border-[#e5b94c]/15 text-[11px] text-slate-400 space-y-2">
                      <div className="flex items-center gap-1.5 text-[#fcedbe] font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-[#e5b94c]" />
                        <span>Media Studio Logo Sync</span>
                      </div>
                      <p>
                        Every partner—including newly added institutions—is automatically registered in the Logo Editor Studio with custom zoom, pan, and containment controls.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const slotId = currentOrg.id || defaultPartnerSlotIds[activeIdx] || `partner_${activeIdx}`;
                          onClose();
                          openEditor(slotId);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0f2448] hover:bg-[#163363] border border-[#e5b94c]/40 text-[#fcedbe] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#e5b94c]" />
                        <span>Edit Logo for this Partner in Media Studio</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#071326] border-t border-[#e5b94c]/25 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            <span>Total Collaborators: </span>
            <strong className="text-[#fcedbe]">{orgs.length}</strong>
            <span className="mx-2 text-slate-600">|</span>
            <span className="text-slate-400">Current Tab: </span>
            <span className="text-[#e5b94c] font-semibold">
              {activeTab === 'arrange' ? 'Arrange Logo Positions' : 'Edit Partner Details'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0f2448] hover:bg-[#163363] border border-[#e5b94c]/20 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#071326] bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] hover:brightness-110 shadow-lg shadow-[#e5b94c]/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {showSavedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-900" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
