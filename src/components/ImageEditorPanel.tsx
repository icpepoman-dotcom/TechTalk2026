import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Sliders,
  Sparkles,
  Check,
  Image as ImageIcon,
  User,
  Building,
  Download,
  FileUp,
  AlertCircle,
  Search,
  Edit,
  Save,
  Award
} from 'lucide-react';
import { useImageManager } from '../context/ImageContext';
import { useEventData } from '../context/EventDataContext';
import { compressImage } from '../utils/imageCompressor';
import { downloadAllImagesZip } from '../utils/imagePath';

export const ImageEditorPanel: React.FC = () => {
  const {
    slots,
    isEditorOpen,
    activeEditingSlotId,
    openEditor,
    closeEditor,
    updateSlotUrl,
    updateSlotDetails,
    updateSlotAdjustments,
    resetSlot,
    resetAllSlots,
    getImageStyle,
    exportConfiguration,
    importConfiguration
  } = useImageManager();

  const { speakers, updateSpeaker, collaboratingOrgs, updateCollaboratingOrgs, isAdminLoggedIn } = useEventData();

  const [activeCategory, setActiveCategory] = useState<'banners' | 'speakers' | 'partners'>('banners');
  const [currentSlotId, setCurrentSlotId] = useState<string>(activeEditingSlotId || 'hero');
  const [urlInput, setUrlInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Speaker and Conferee search & sub-filter
  const [speakerSearch, setSpeakerSearch] = useState('');
  const [speakerSubFilter, setSpeakerSubFilter] = useState<'all' | 'keynote' | 'leadership' | 'industry' | 'conferees'>('all');

  // Inline editing of speaker/conferee name & role
  const [isEditingName, setIsEditingName] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [customDescInput, setCustomDescInput] = useState('');

  // Sync current slot if changed from external openEditor(slotId)
  React.useEffect(() => {
    if (activeEditingSlotId) {
      if (slots[activeEditingSlotId]) {
        setCurrentSlotId(activeEditingSlotId);
        setActiveCategory(slots[activeEditingSlotId].category);
        setUrlInput(slots[activeEditingSlotId].customUrl || '');
      } else if (activeEditingSlotId.startsWith('partner_')) {
        setCurrentSlotId(activeEditingSlotId);
        setActiveCategory('partners');
      }
    }
  }, [activeEditingSlotId, slots]);

  const currentSlot = slots[currentSlotId] || (currentSlotId.startsWith('partner_') ? {
    id: currentSlotId,
    name: 'Collaborating Partner Logo',
    category: 'partners' as const,
    defaultUrl: '',
    aspectRatio: '1:1',
    description: 'Upload official emblem or crest for partner.',
    adjustments: { brightness: 100, contrast: 100, saturate: 100, goldTint: 0, zoom: 100, objectFit: 'contain' as const }
  } : slots.hero);

  React.useEffect(() => {
    if (currentSlot) {
      setCustomNameInput(currentSlot.name);
      setCustomDescInput(currentSlot.description);
      setIsEditingName(false);
    }
  }, [currentSlotId, currentSlot?.name, currentSlot?.description]);

  if (!isEditorOpen || !isAdminLoggedIn) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    const maxDim = currentSlot.category === 'banners' ? 1440 : 800;
    compressImage(file, { maxWidth: maxDim, maxHeight: maxDim, quality: 0.85 })
      .then((compressedUrl) => {
        updateSlotUrl(currentSlotId, compressedUrl);

        // Keep matching speaker in sync if slot is a speaker
        if (currentSlot.category === 'speakers') {
          const spkId = currentSlotId.replace(/_/g, '-');
          const matching = speakers.find((s) => s.id === spkId || s.id === currentSlotId);
          if (matching) {
            updateSpeaker(matching.id, { photoUrl: compressedUrl });
          }
        }

        setUrlInput('');
        showToast(`Image uploaded & optimized for ${currentSlot.name}!`);
      })
      .catch((err) => {
        console.warn('Fallback to direct file read:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            updateSlotUrl(currentSlotId, dataUrl);
            setUrlInput('');
            showToast(`Image uploaded for ${currentSlot.name}!`);
          }
        };
        reader.readAsDataURL(file);
      });

    e.target.value = '';
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    updateSlotUrl(currentSlotId, urlInput.trim());
    showToast(`Image URL applied for ${currentSlot.name}!`);
  };

  const handlePresetSelect = (presetUrl: string) => {
    updateSlotUrl(currentSlotId, presetUrl);
    setUrlInput('');
    showToast('Preset loaded!');
  };

  const handleResetCurrent = () => {
    resetSlot(currentSlotId);
    setUrlInput('');
    showToast(`Reset ${currentSlot.name} to default`);
  };

  const handleExport = () => {
    const json = exportConfiguration();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `icpep_techtalk_images_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    showToast('Image package exported!');
  };

  const handleDownloadPicturesZip = async () => {
    try {
      showToast('Generating images ZIP archive...');
      const { count, filename } = await downloadAllImagesZip(slots, speakers);
      showToast(`Downloaded ${count} pictures as ${filename}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Export failed: ${msg}`);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const str = event.target?.result as string;
      const success = importConfiguration(str);
      if (success) {
        showToast('Image package imported successfully!');
      } else {
        showToast('Invalid configuration file. Please check JSON format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredSlots = Object.values(slots).filter((s) => {
    if (s.category !== activeCategory) return false;
    if (activeCategory === 'speakers') {
      if (speakerSearch.trim()) {
        const query = speakerSearch.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesDesc = s.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      if (speakerSubFilter !== 'all') {
        const desc = s.description.toLowerCase();
        const name = s.name.toLowerCase();
        if (speakerSubFilter === 'conferees') {
          return desc.includes('conferment') || desc.includes('conferee') || name.includes('conferee');
        }
        if (speakerSubFilter === 'keynote') {
          return desc.includes('keynote');
        }
        if (speakerSubFilter === 'leadership') {
          return desc.includes('president') || desc.includes('vp') || desc.includes('chair');
        }
        if (speakerSubFilter === 'industry') {
          return desc.includes('industry') || desc.includes('factory') || desc.includes('ai') || desc.includes('moderator');
        }
      }
    }
    return true;
  });

  const handleSaveSpeakerDetails = () => {
    if (!customNameInput.trim()) {
      showToast('Name cannot be empty');
      return;
    }
    updateSlotDetails(currentSlot.id, {
      name: customNameInput.trim(),
      description: customDescInput.trim()
    });
    // Also sync to eventData speakers if matching id
    const matchingSpeaker = speakers.find(
      (s) => s.id === currentSlot.id.replace(/_/g, '-') || s.id.replace(/-/g, '_') === currentSlot.id
    );
    if (matchingSpeaker) {
      updateSpeaker(matchingSpeaker.id, {
        name: customNameInput.trim(),
        topic: customDescInput.trim() || matchingSpeaker.topic
      });
    }

    // Also sync to eventData collaboratingOrgs if matching partner id
    if (currentSlot.category === 'partners') {
      const defaultPartnerSlotIds = ['partner_ptc', 'partner_utas', 'partner_ieee', 'partner_cisco'];
      const orgIdx = collaboratingOrgs.findIndex((org, idx) => {
        const slotId = org.id || defaultPartnerSlotIds[idx] || `partner_${idx}`;
        return slotId === currentSlot.id;
      });
      if (orgIdx !== -1) {
        const updated = [...collaboratingOrgs];
        updated[orgIdx] = {
          ...updated[orgIdx],
          name: customNameInput.trim(),
          subtitle: customDescInput.trim() || updated[orgIdx].subtitle
        };
        updateCollaboratingOrgs(updated);
      }
    }

    showToast(`Updated "${customNameInput.trim()}"!`);
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#040c1a]/85 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      {/* Slide-Over Drawer Container */}
      <div className="relative w-full max-w-2xl bg-[#0a1b35] border-l-2 border-[#e5b94c] shadow-2xl flex flex-col h-full text-slate-100">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#e5b94c]/25 bg-[#071326] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0f2448] border border-[#e5b94c]/40 text-[#fcedbe]">
              <Sliders className="w-5 h-5 text-[#e5b94c]" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>Website Media & Image Studio</span>
                <span className="text-[10px] font-mono text-[#071326] bg-[#e5b94c] px-2 py-0.5 rounded font-bold">
                  LIVE EDITOR
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Replace photos, edit speaker & conferee names, or fine-tune image color & zoom
              </p>
            </div>
          </div>

          <button
            onClick={closeEditor}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#0f2448] transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 pt-3 bg-[#071326]/70 border-b border-[#e5b94c]/20 flex gap-2">
          <button
            onClick={() => {
              setActiveCategory('banners');
              const first = Object.values(slots).find((s) => s.category === 'banners');
              if (first) setCurrentSlotId(first.id);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeCategory === 'banners'
                ? 'border-[#e5b94c] text-[#fcedbe]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Key Banners & Venue</span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('speakers');
              const first = Object.values(slots).find((s) => s.category === 'speakers');
              if (first) setCurrentSlotId(first.id);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeCategory === 'speakers'
                ? 'border-[#e5b94c] text-[#fcedbe]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Speakers & Conferees</span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('partners');
              const first = Object.values(slots).find((s) => s.category === 'partners');
              if (first) setCurrentSlotId(first.id);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeCategory === 'partners'
                ? 'border-[#e5b94c] text-[#fcedbe]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Partner Logos</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Target Slot Selector Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#e5b94c]">
                Select {activeCategory === 'speakers' ? 'Speaker / Conferee' : 'Slot'} to Edit:
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredSlots.length} available
              </span>
            </div>

            {/* Sub-Filters & Search for Speakers & Conferees */}
            {activeCategory === 'speakers' && (
              <div className="mb-3 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search speakers or conferees by name..."
                    value={speakerSearch}
                    onChange={(e) => setSpeakerSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {(['all', 'keynote', 'leadership', 'industry', 'conferees'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setSpeakerSubFilter(filterKey)}
                      className={`px-2.5 py-1 rounded capitalize transition-colors cursor-pointer ${
                        speakerSubFilter === filterKey
                          ? 'bg-[#e5b94c] text-[#071326] font-bold shadow'
                          : 'bg-[#071326] text-slate-300 hover:text-white border border-[#e5b94c]/20'
                      }`}
                    >
                      {filterKey === 'conferees' ? 'Conferees & Dignitaries' : filterKey}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredSlots.map((slot) => {
                const isSelected = slot.id === currentSlotId;
                const hasCustom = !!slot.customUrl;
                const previewImg = slot.customUrl || slot.defaultUrl;

                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setCurrentSlotId(slot.id);
                      setUrlInput(slot.customUrl || '');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#163363] border-[#e5b94c] ring-1 ring-[#e5b94c]'
                        : 'bg-[#071326]/70 border-[#e5b94c]/20 hover:border-[#e5b94c]/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#040c1a] border border-[#e5b94c]/30 shrink-0 flex items-center justify-center">
                      {previewImg ? (
                        <img
                          src={previewImg}
                          alt={slot.name}
                          className={`w-full h-full ${slot.category === 'partners' ? 'object-contain p-0.5' : 'object-cover'}`}
                        />
                      ) : slot.category === 'partners' ? (
                        <Building className="w-5 h-5 text-[#e5b94c]" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-100 truncate">
                        {slot.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        {hasCustom ? (
                          <span className="text-emerald-400 font-medium">Custom Logo</span>
                        ) : (
                          'Default'
                        )}
                        {slot.category === 'partners' ? (
                          <span className="text-[9px] text-[#e5b94c] font-medium">· Partner</span>
                        ) : slot.description.toLowerCase().includes('conferee') ? (
                          <span className="text-[9px] text-[#e5b94c] font-bold">· Conferee</span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Slot Live Canvas Preview & Name Editing */}
          <div className="p-4 rounded-xl bg-[#071326] border border-[#e5b94c]/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <span className="text-[10px] font-mono uppercase text-[#e5b94c] font-semibold">
                  Selected Profile: {currentSlot.id}
                </span>

                {!isEditingName ? (
                  <div className="mt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-100">{currentSlot.name}</h4>
                      {currentSlot.category === 'speakers' && (
                        <button
                          onClick={() => {
                            setCustomNameInput(currentSlot.name);
                            setCustomDescInput(currentSlot.description);
                            setIsEditingName(true);
                          }}
                          className="px-2 py-0.5 text-[11px] font-semibold text-[#fcedbe] bg-[#0f2448] hover:bg-[#163363] border border-[#e5b94c]/30 rounded flex items-center gap-1 cursor-pointer"
                          title="Edit this speaker or conferee's name and role"
                        >
                          <Edit className="w-3 h-3 text-[#e5b94c]" />
                          <span>Edit Name & Role</span>
                        </button>
                      )}
                      {currentSlot.category === 'partners' && (
                        <button
                          onClick={() => {
                            setCustomNameInput(currentSlot.name);
                            setCustomDescInput(currentSlot.description);
                            setIsEditingName(true);
                          }}
                          className="px-2 py-0.5 text-[11px] font-semibold text-[#fcedbe] bg-[#0f2448] hover:bg-[#163363] border border-[#e5b94c]/30 rounded flex items-center gap-1 cursor-pointer"
                          title="Edit partner name label and subtitle"
                        >
                          <Edit className="w-3 h-3 text-[#e5b94c]" />
                          <span>Edit Partner Label</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{currentSlot.description}</p>
                  </div>
                ) : (
                  <div className="mt-2 p-3 rounded-lg bg-[#0a1b35] border border-[#e5b94c]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#fcedbe] flex items-center gap-1.5">
                        <Edit className="w-3.5 h-3.5 text-[#e5b94c]" />
                        <span>Edit Speaker / Conferee Name</span>
                      </span>
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Full Name</label>
                      <input
                        type="text"
                        value={customNameInput}
                        onChange={(e) => setCustomNameInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#071326] border border-[#e5b94c]/40 rounded text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                        placeholder="e.g. Dr. Ferdi Canlas or Conferee Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Role / Affiliation / Topic</label>
                      <input
                        type="text"
                        value={customDescInput}
                        onChange={(e) => setCustomDescInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#071326] border border-[#e5b94c]/30 rounded text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                        placeholder="e.g. Panel Moderator / ASEAN Engineer Conferee"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="px-2.5 py-1 bg-[#0f2448] text-slate-300 rounded text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSpeakerDetails}
                        className="px-3 py-1 bg-[#e5b94c] text-[#071326] font-bold rounded text-xs hover:brightness-110 flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Name & Info</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {currentSlot.customUrl && (
                <button
                  onClick={handleResetCurrent}
                  className="px-2.5 py-1 text-xs font-semibold text-[#fcedbe] bg-[#0f2448] border border-[#e5b94c]/30 rounded hover:bg-[#163363] transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3 text-[#e5b94c]" />
                  <span>Reset Picture</span>
                </button>
              )}
            </div>

            {/* Live Interactive Preview Box */}
            <div className="relative w-full aspect-[16/9] max-h-56 rounded-lg overflow-hidden bg-[#040c1a] border-2 border-[#e5b94c]/40 flex items-center justify-center">
              {currentSlot.customUrl || currentSlot.defaultUrl ? (
                <img
                  src={currentSlot.customUrl || currentSlot.defaultUrl}
                  alt={currentSlot.name}
                  style={getImageStyle(currentSlot.id)}
                  className="w-full h-full"
                />
              ) : (
                <div className="text-center p-4">
                  <User className="w-12 h-12 text-[#e5b94c]/60 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    No custom photo yet. Upload or enter a URL below.
                  </p>
                </div>
              )}

              {/* Aspect Ratio Badge */}
              <div className="absolute top-2 right-2 text-[10px] font-mono text-[#fcedbe] bg-[#071326]/80 px-2 py-0.5 rounded border border-[#e5b94c]/30 backdrop-blur-md">
                Aspect: {currentSlot.aspectRatio}
              </div>
            </div>
          </div>

          {/* Action 1: Upload from Device */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#e5b94c]">
              Option 1: Upload from Your Device
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#e5b94c]/40 hover:border-[#e5b94c] bg-[#0f2448]/50 hover:bg-[#163363]/50 transition-colors flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-[#fcedbe] cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#e5b94c]" />
              <span>Choose Image File (JPG, PNG, WebP, SVG)</span>
            </button>
            <p className="text-[11px] text-slate-400">
              Files are saved locally in your browser storage so they stay across page refreshes.
            </p>
          </div>

          {/* Action 2: Image URL */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#e5b94c]">
              Option 2: Paste Direct Image URL
            </label>
            <form onSubmit={handleApplyUrl} className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#071326] border border-[#e5b94c]/30 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#e5b94c]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#e5b94c] text-[#071326] font-bold text-xs rounded-lg hover:brightness-110 shrink-0 cursor-pointer"
              >
                Apply URL
              </button>
            </form>
          </div>

          {/* Action 3: Curated Presets if available */}
          {currentSlot.presets && currentSlot.presets.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#e5b94c] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Option 3: Curated Conference Presets</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {currentSlot.presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(preset.url)}
                    className="p-2 rounded-lg bg-[#071326] border border-[#e5b94c]/25 hover:border-[#e5b94c] text-left transition-all cursor-pointer"
                  >
                    <div className="aspect-[16/10] rounded overflow-hidden bg-[#040c1a] mb-1.5">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[11px] font-medium text-slate-200 truncate">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action 4: Visual Adjustments Sliders */}
          <div className="p-4 rounded-xl bg-[#071326]/90 border border-[#e5b94c]/30 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-[#fcedbe] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#e5b94c]" />
                <span>Visual Fine-Tuning & Filters</span>
              </h5>
              <button
                type="button"
                onClick={() =>
                  updateSlotAdjustments(currentSlotId, {
                    brightness: 100,
                    contrast: 100,
                    saturate: 100,
                    goldTint: 0,
                    zoom: 100,
                    objectFit: 'cover'
                  })
                }
                className="text-[11px] text-[#e5b94c] hover:underline cursor-pointer"
              >
                Reset Sliders
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Brightness */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono text-[#e5b94c]">{currentSlot.adjustments.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={currentSlot.adjustments.brightness}
                  onChange={(e) =>
                    updateSlotAdjustments(currentSlotId, { brightness: Number(e.target.value) })
                  }
                  className="w-full accent-[#e5b94c]"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono text-[#e5b94c]">{currentSlot.adjustments.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={currentSlot.adjustments.contrast}
                  onChange={(e) =>
                    updateSlotAdjustments(currentSlotId, { contrast: Number(e.target.value) })
                  }
                  className="w-full accent-[#e5b94c]"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Saturation</span>
                  <span className="font-mono text-[#e5b94c]">{currentSlot.adjustments.saturate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={currentSlot.adjustments.saturate}
                  onChange={(e) =>
                    updateSlotAdjustments(currentSlotId, { saturate: Number(e.target.value) })
                  }
                  className="w-full accent-[#e5b94c]"
                />
              </div>

              {/* Gold Tint / Warmth */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Gold Warmth Tint</span>
                  <span className="font-mono text-[#e5b94c]">{currentSlot.adjustments.goldTint}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentSlot.adjustments.goldTint}
                  onChange={(e) =>
                    updateSlotAdjustments(currentSlotId, { goldTint: Number(e.target.value) })
                  }
                  className="w-full accent-[#e5b94c]"
                />
              </div>

              {/* Zoom / Scale */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Zoom / Scale</span>
                  <span className="font-mono text-[#e5b94c]">{currentSlot.adjustments.zoom}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="160"
                  value={currentSlot.adjustments.zoom}
                  onChange={(e) =>
                    updateSlotAdjustments(currentSlotId, { zoom: Number(e.target.value) })
                  }
                  className="w-full accent-[#e5b94c]"
                />
              </div>

              {/* Object Fit */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Object Fit</span>
                  <span className="font-mono text-[#e5b94c] uppercase">{currentSlot.adjustments.objectFit}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['cover', 'contain', 'fill'] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => updateSlotAdjustments(currentSlotId, { objectFit: fit })}
                      className={`py-1 text-[10px] rounded uppercase font-semibold transition-colors cursor-pointer ${
                        currentSlot.adjustments.objectFit === fit
                          ? 'bg-[#e5b94c] text-[#071326]'
                          : 'bg-[#0f2448] text-slate-300 hover:text-white'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Restore Tools */}
          <div className="pt-3 border-t border-[#e5b94c]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPicturesZip}
                className="px-3 py-1.5 bg-gradient-to-r from-[#163363] to-[#0f2448] text-[#fcedbe] hover:brightness-110 rounded border border-[#e5b94c]/60 flex items-center gap-1.5 cursor-pointer font-medium shadow-sm"
                title="Download all active custom pictures as a ZIP to put into public/images/ for GitHub deployment"
              >
                <Download className="w-3.5 h-3.5 text-[#e5b94c]" />
                <span>Download Pictures ZIP (for images/ folder)</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="px-3 py-1.5 bg-[#0f2448] text-slate-200 hover:text-[#fcedbe] rounded border border-[#e5b94c]/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#e5b94c]" />
                <span>Export JSON Package</span>
              </button>

              <input
                type="file"
                ref={jsonInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => jsonInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#0f2448] text-slate-200 hover:text-[#fcedbe] rounded border border-[#e5b94c]/30 flex items-center gap-1.5 cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5 text-[#e5b94c]" />
                <span>Import JSON</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                resetAllSlots();
                showToast('All images reset to default');
              }}
              className="text-red-400 hover:text-red-300 hover:underline cursor-pointer"
            >
              Reset All to Defaults
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#e5b94c]/20 bg-[#071326] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Changes take effect immediately across all website sections.
          </div>
          <button
            onClick={closeEditor}
            className="px-6 py-2 bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] text-[#071326] font-bold text-xs rounded-lg hover:brightness-110 shadow-md cursor-pointer"
          >
            Done Editing
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
