import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Upload,
  Edit3,
  RefreshCw,
  Download,
  Link2,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { useEventData } from '../context/EventDataContext';
import { useImageManager } from '../context/ImageContext';
import { compressImage } from '../utils/imageCompressor';
import { resolveImageUrl } from '../utils/imagePath';

interface ScanToRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToForm: () => void;
  initialEditMode?: boolean;
}

export const ScanToRegisterModal: React.FC<ScanToRegisterModalProps> = ({
  isOpen,
  onClose,
  onProceedToForm,
  initialEditMode = false
}) => {
  const { eventDetails, updateEventDetails, saveToServer, isAdminLoggedIn } = useEventData();
  const { slots, updateSlotUrl, resetSlot } = useImageManager();

  // Modal UI state
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(initialEditMode && isAdminLoggedIn);
  const [activeTab, setActiveTab] = useState<'upload' | 'generate' | 'url'>('upload');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync initial link when modal opens or eventDetails changes
  useEffect(() => {
    if (isOpen) {
      setLinkInput(eventDetails.qrCodeTargetUrl || eventDetails.globalRegistrationUrl || (typeof window !== 'undefined' ? window.location.href : "https://icpep-oman.org/techtalk2026"));
      setIsEditing(initialEditMode && isAdminLoggedIn);
    }
  }, [isOpen, initialEditMode, isAdminLoggedIn, eventDetails.qrCodeTargetUrl, eventDetails.globalRegistrationUrl]);

  // If admin logs out, immediately exit edit mode
  useEffect(() => {
    if (!isAdminLoggedIn) {
      setIsEditing(false);
    }
  }, [isAdminLoggedIn]);

  // QR generation state
  const defaultBaseUrl = typeof window !== 'undefined' ? window.location.href : "https://icpep-oman.org/techtalk2026";
  const activeTargetUrl = eventDetails.qrCodeTargetUrl || eventDetails.globalRegistrationUrl || defaultBaseUrl;

  const [linkInput, setLinkInput] = useState(activeTargetUrl);
  const [directImageUrlInput, setDirectImageUrlInput] = useState('');
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string>('');
  const [showCenterLogo, setShowCenterLogo] = useState<boolean>(eventDetails.qrCodeCenterLogo !== false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial link when modal opens or eventDetails changes
  useEffect(() => {
    if (isOpen) {
      setLinkInput(eventDetails.qrCodeTargetUrl || eventDetails.globalRegistrationUrl || (typeof window !== 'undefined' ? window.location.href : "https://icpep-oman.org/techtalk2026"));
      setIsEditing(initialEditMode);
    }
  }, [isOpen, initialEditMode, eventDetails.qrCodeTargetUrl, eventDetails.globalRegistrationUrl]);

  // Determine active QR display
  const customImageFromSlot = slots.qr_code?.customUrl;
  const customImageFromDetails = eventDetails.qrCodeCustomUrl;
  const activeCustomImage = resolveImageUrl(customImageFromSlot || customImageFromDetails);

  const isCustomImageMode = (eventDetails.qrCodeType === 'custom_image' || (!eventDetails.qrCodeType && !!activeCustomImage)) && !!activeCustomImage;

  // Generate dynamic QR code whenever link changes
  useEffect(() => {
    let isCancelled = false;
    const target = linkInput.trim() || defaultBaseUrl;

    QRCode.toDataURL(target, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#071326',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (!isCancelled) {
          setGeneratedQrDataUrl(url);
        }
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [linkInput, defaultBaseUrl]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    const urlToCopy = isCustomImageMode ? (eventDetails.qrCodeTargetUrl || defaultBaseUrl) : (linkInput.trim() || defaultBaseUrl);
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    showToast('Event registration link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Handle file upload for custom QR code image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    try {
      setIsProcessing(true);
      // For QR codes, keep high resolution and crisp contrast
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.95,
        mimeType: file.type === 'image/svg+xml' ? 'image/webp' : 'image/png'
      });

      // Update both EventData and ImageContext
      updateEventDetails({
        qrCodeCustomUrl: compressed,
        qrCodeType: 'custom_image'
      });
      updateSlotUrl('qr_code', compressed);

      if (saveToServer) {
        saveToServer();
      }

      showToast('New QR Code image uploaded and applied successfully!');
    } catch (err) {
      console.error('Failed to process QR image:', err);
      showToast('Failed to process image. Please try another file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 2. Handle direct image URL replacement
  const handleApplyDirectImageUrl = () => {
    if (!directImageUrlInput.trim()) {
      showToast('Please enter an image URL');
      return;
    }
    const cleanUrl = directImageUrlInput.trim();
    updateEventDetails({
      qrCodeCustomUrl: cleanUrl,
      qrCodeType: 'custom_image'
    });
    updateSlotUrl('qr_code', cleanUrl);
    if (saveToServer) {
      saveToServer();
    }
    showToast('Custom QR Code image URL applied successfully!');
  };

  // 3. Handle saving custom dynamic target URL
  const handleApplyTargetUrl = () => {
    const cleanUrl = linkInput.trim();
    if (!cleanUrl) {
      showToast('Please enter a target URL for the QR code');
      return;
    }

    updateEventDetails({
      qrCodeTargetUrl: cleanUrl,
      qrCodeType: 'auto',
      qrCodeCenterLogo: showCenterLogo
    });

    if (saveToServer) {
      saveToServer();
    }

    showToast('QR Code re-generated for new target link!');
  };

  // 4. Handle Reset to default QR
  const handleResetToDefault = () => {
    updateEventDetails({
      qrCodeCustomUrl: '',
      qrCodeTargetUrl: '',
      qrCodeType: 'auto',
      qrCodeCenterLogo: true
    });
    resetSlot('qr_code');
    setLinkInput(typeof window !== 'undefined' ? window.location.href : "https://icpep-oman.org/techtalk2026");
    setShowCenterLogo(true);

    if (saveToServer) {
      saveToServer();
    }

    showToast('Reset back to default ICpEP TechTalk 2026 QR Code');
  };

  // 5. Download QR Code as high-res PNG
  const handleDownloadQr = () => {
    const srcToDownload = isCustomImageMode ? activeCustomImage : generatedQrDataUrl;
    if (!srcToDownload) {
      showToast('QR code is not ready to download');
      return;
    }

    const a = document.createElement('a');
    a.href = srcToDownload;
    a.download = `icpep_techtalk_2026_qr_code_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('QR code image downloaded successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040c1a]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0a1b35] border-2 border-[#e5b94c] shadow-2xl p-5 sm:p-7 text-slate-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
        {/* Floating Toast */}
        {toastMessage && (
          <div className="sticky top-0 z-20 -mt-2 mb-2 p-2.5 rounded-xl bg-emerald-500 text-[#071326] font-bold text-xs text-center flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-150">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#0f2448] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071326] border border-[#e5b94c]/40 text-[#e5b94c] text-[11px] font-mono uppercase tracking-widest font-semibold mb-1">
            <QrCode className="w-3.5 h-3.5 text-[#e5b94c]" />
            <span>Instant Mobile Registration</span>
          </div>
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100 mt-1">
            {isAdminLoggedIn && isEditing ? 'Customize & Replace QR Code' : 'Scan to Register'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
            {isAdminLoggedIn && isEditing
              ? 'Upload your own custom QR image, or generate a live QR code for any link.'
              : eventDetails.bannerNotice}
          </p>
        </div>

        {/* QR Code Container & Display */}
        <div className="text-center">
          <div className="relative p-5 bg-white rounded-2xl inline-block shadow-xl mx-auto border-4 border-[#e5b94c]/80 transition-transform duration-200 hover:scale-[1.02]">
            <div className="relative w-52 h-52 sm:w-56 sm:h-56 bg-white flex flex-col items-center justify-center p-1 overflow-hidden">
              {isCustomImageMode && activeCustomImage ? (
                // Custom Uploaded QR Image
                <img
                  src={activeCustomImage}
                  alt="Custom Event Registration QR Code"
                  className="w-full h-full object-contain"
                />
              ) : generatedQrDataUrl ? (
                // Dynamically Generated Real Scannable QR Code
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={generatedQrDataUrl}
                    alt="Registration QR Code"
                    className="w-full h-full object-contain"
                  />
                  {showCenterLogo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white p-1 border-2 border-[#e5b94c] shadow-md flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-[#071326] flex flex-col items-center justify-center text-[#e5b94c]">
                          <span className="text-[8px] font-bold font-mono tracking-tighter">ICpEP</span>
                          <span className="text-[5px] text-[#fcedbe]">OMAN</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Fallback spinner or placeholder
                <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#c9982a]" />
                  <span className="text-xs">Generating QR...</span>
                </div>
              )}
            </div>

            {/* Label below QR */}
            <div className="text-[10px] text-slate-800 font-mono mt-2 font-bold flex items-center justify-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-[#071326]" />
              <span>
                {isCustomImageMode ? 'Custom Uploaded QR Code' : 'Scan with smartphone camera'}
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY FEATURE: "Edit or Replace QR Code" Button Bar - ONLY visible when admin is logged in */}
        {isAdminLoggedIn && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isEditing
                  ? 'bg-[#163363] text-[#fcedbe] border border-[#e5b94c]'
                  : 'bg-gradient-to-r from-[#e5b94c] to-[#c9982a] text-[#071326] hover:brightness-110'
              }`}
              title="Edit or replace the registration QR code"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Hide Edit Controls' : 'Edit or Replace QR Code'}</span>
            </button>

            <button
              onClick={handleDownloadQr}
              className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-[#0f2448] text-slate-200 border border-[#e5b94c]/30 hover:bg-[#163363] hover:text-[#fcedbe] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download QR code image for tarpaulin, flyers, or name badges"
            >
              <Download className="w-3.5 h-3.5 text-[#e5b94c]" />
              <span>Download PNG</span>
            </button>

            {isCustomImageMode && (
              <button
                onClick={handleResetToDefault}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-600/40 hover:bg-rose-900/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset back to default dynamic QR code"
              >
                <RotateCcwIcon className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        )}

        {/* EXPANDABLE EDIT & REPLACE PANEL - ONLY visible when admin is logged in and editing */}
        {isAdminLoggedIn && isEditing && (
          <div className="bg-[#071326] border-2 border-[#e5b94c]/60 rounded-xl p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between border-b border-[#e5b94c]/20 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#e5b94c]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#fcedbe]">
                  QR Code Replacement Options
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {isCustomImageMode ? 'Status: Custom Image' : 'Status: Dynamic Generated'}
              </span>
            </div>

            {/* Sub-tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#0a1b35] p-1 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#e5b94c] text-[#071326] font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image</span>
              </button>

              <button
                onClick={() => setActiveTab('generate')}
                className={`py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'generate'
                    ? 'bg-[#e5b94c] text-[#071326] font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Custom Link</span>
              </button>

              <button
                onClick={() => setActiveTab('url')}
                className={`py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-[#e5b94c] text-[#071326] font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image Link</span>
              </button>
            </div>

            {/* Tab 1: Upload Image File */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Upload an existing QR code image from your poster, registration brochure, GCash, bank receipt, or WhatsApp community:
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#fcedbe] to-[#e5b94c] text-[#071326] font-bold text-xs sm:text-sm hover:brightness-110 flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing Image...' : 'Choose QR Image File (PNG/JPG)'}</span>
                  </button>

                  {isCustomImageMode && (
                    <button
                      onClick={handleResetToDefault}
                      className="py-3 px-3.5 rounded-xl bg-[#0f2448] text-slate-300 hover:text-rose-400 border border-[#e5b94c]/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Clear custom QR and revert to dynamic QR"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Images are automatically compressed and saved safely across devices.</span>
                </div>
              </div>
            )}

            {/* Tab 2: Generate dynamic QR code from custom link */}
            {activeTab === 'generate' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Enter any website URL or form link. A crisp, real scannable QR Code will be generated instantly:
                </p>

                <div>
                  <label className="block text-[11px] font-medium text-[#fcedbe] mb-1">
                    QR Code Target Link (URL)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      placeholder="https://forms.google.com/your-form-url"
                      className="w-full py-2.5 pl-3 pr-20 bg-[#0a1b35] border border-[#e5b94c]/40 rounded-lg text-xs text-white focus:outline-none focus:border-[#e5b94c]"
                    />
                    <button
                      onClick={handleApplyTargetUrl}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#e5b94c] text-[#071326] text-[11px] font-bold rounded-md hover:brightness-110 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Link Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => {
                        const current = typeof window !== 'undefined' ? window.location.href : "https://icpep-oman.org/techtalk2026";
                        setLinkInput(current);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-[#0f2448] text-slate-300 hover:text-white border border-slate-700 hover:border-[#e5b94c]/40 cursor-pointer"
                    >
                      Current Website URL
                    </button>
                    {eventDetails.globalRegistrationUrl && (
                      <button
                        onClick={() => setLinkInput(eventDetails.globalRegistrationUrl)}
                        className="text-[10px] px-2 py-1 rounded bg-[#0f2448] text-[#fcedbe] hover:text-white border border-[#e5b94c]/30 cursor-pointer"
                      >
                        Global Registration Link
                      </button>
                    )}
                    <button
                      onClick={() => setLinkInput('https://icpep-oman.org/techtalk2026')}
                      className="text-[10px] px-2 py-1 rounded bg-[#0f2448] text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                    >
                      icpep-oman.org
                    </button>
                  </div>
                </div>

                {/* Center Badge Toggle */}
                <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={showCenterLogo}
                    onChange={(e) => {
                      setShowCenterLogo(e.target.checked);
                      updateEventDetails({ qrCodeCenterLogo: e.target.checked });
                    }}
                    className="rounded border-[#e5b94c] text-[#e5b94c] focus:ring-0 cursor-pointer"
                  />
                  <span>Show ICpEP shield emblem in center of QR code</span>
                </label>
              </div>
            )}

            {/* Tab 3: Paste Direct Image URL */}
            {activeTab === 'url' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Paste the web link (URL) of an existing QR code image hosted online:
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={directImageUrlInput}
                    onChange={(e) => setDirectImageUrlInput(e.target.value)}
                    placeholder="https://example.com/qr-code.png"
                    className="flex-1 py-2 px-3 bg-[#0a1b35] border border-[#e5b94c]/40 rounded-lg text-xs text-white focus:outline-none focus:border-[#e5b94c]"
                  />
                  <button
                    onClick={handleApplyDirectImageUrl}
                    className="py-2 px-3 bg-[#e5b94c] text-[#071326] text-xs font-bold rounded-lg hover:brightness-110 cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            )}

            {/* Panel Footer: Save and Close */}
            <div className="flex items-center justify-between pt-2 border-t border-[#e5b94c]/20">
              <button
                onClick={handleResetToDefault}
                className="text-xs text-slate-400 hover:text-[#fcedbe] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 bg-[#e5b94c] text-[#071326] text-xs font-bold rounded-lg hover:brightness-110 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Modal Primary Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onProceedToForm();
            }}
            className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-[#071326] bg-gradient-to-r from-[#fcedbe] via-[#e5b94c] to-[#c9982a] rounded-lg hover:brightness-110 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
          >
            <ExternalLink className="w-4 h-4 text-[#071326]" />
            <span>Open Registration Form Directly</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full py-2 px-4 text-xs font-semibold text-slate-300 bg-[#0f2448] border border-[#e5b94c]/30 rounded-lg hover:text-[#fcedbe] hover:bg-[#163363] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Registration Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#e5b94c]" />
                <span>Copy Event Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function RotateCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
