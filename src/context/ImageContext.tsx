import React, { createContext, useContext, useState, useEffect } from 'react';
import { useEventData } from './EventDataContext';
import { dbSetItem, dbGetItem, dbRemoveItem } from '../utils/storageDb';
import { compressImage } from '../utils/imageCompressor';
import { resolveImageUrl, syncImageToDisk } from '../utils/imagePath';
import siteState from '../data/site_state.json';

// Default asset paths
import defaultHeroImg from '../assets/images/hero_tech_engineer_muscat_1790851939093.jpg';
import defaultVenueImg from '../assets/images/venue_wyndham_muscat_1790851970416.jpg';
import defaultGalaImg from '../assets/images/anniversary_gala_hall_1790852620720.jpg';
import defaultSpkApag from '../assets/images/speaker_dr_apag_updated.png';
import defaultSpkMaglalang from '../assets/images/speaker_engr_maglalang_updated.jpg';
import defaultSpkAlbadi from '../assets/images/speaker_dr_albadi_updated.png';
import defaultSpkCareon from '../assets/images/speaker_careon_tech_updated.webp';
import defaultSpkHernandez from '../assets/images/speaker_hernandez_ai_updated.jpg';
import defaultSpkBustamante from '../assets/images/speaker_engr_bustamante_updated.png';
import defaultSpkMonsada from '../assets/images/speaker_engr_monsada_updated.png';
import defaultSpkTambaoan from '../assets/images/speaker_engr_tambaoan_updated.png';
import defaultSpkCanlas from '../assets/images/speaker_dr_canlas_updated.png';
import defaultSpkManglicmot from '../assets/images/speaker_engr_manglicmot_updated.png';
import defaultSpkAgatep from '../assets/images/slot_spk_agatep.webp';
import defaultSpkAerConferees from '../assets/images/speaker_aer_conferees_1791927650929.jpg';
import defaultSpkIntpeConferees from '../assets/images/speaker_intpe_conferees_1791927652021.jpg';
import defaultSpkCrisostomo from '../assets/images/speaker_dr_crisostomo_updated.png';
import defaultSpkYeong from '../assets/images/speaker_ts_yeong_chin_chow.png';
import defaultSpkAlAlawi from '../assets/images/speaker_dr_ali_al_alawi.webp';
import defaultQrCodeImg from '../assets/images/qr_code_registration.webp';
import defaultPartnerPtc from '../assets/images/partner_ptc_updated.png';
import defaultPartnerUtas from '../assets/images/partner_utas_updated.png';
import defaultPartnerIeee from '../assets/images/partner_ieee_updated.png';
import defaultPartnerCisco from '../assets/images/partner_cisco_updated.png';

export interface ImageAdjustments {
  brightness: number; // 50 to 150 (default 100)
  contrast: number;   // 50 to 150 (default 100)
  saturate: number;   // 0 to 200 (default 100)
  goldTint: number;   // 0 to 100 (default 0)
  zoom: number;       // 100 to 160 (default 100)
  objectFit: 'cover' | 'contain' | 'fill';
}

export interface ImageSlot {
  id: string;
  name: string;
  category: 'banners' | 'speakers' | 'partners';
  defaultUrl: string;
  customUrl?: string;
  aspectRatio: string;
  description: string;
  adjustments: ImageAdjustments;
  presets?: { name: string; url: string }[];
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  goldTint: 0,
  zoom: 100,
  objectFit: 'cover'
};

const DEFAULT_IMAGE_SLOTS: Record<string, ImageSlot> = {
  hero: {
    id: 'hero',
    name: 'Hero Graphic (Cyber Engineer & Skyline)',
    category: 'banners',
    defaultUrl: defaultHeroImg,
    aspectRatio: '16:9',
    description: 'Prominent centerpiece graphic in the hero section displaying the cybernetic engineer and gold Muscat skyline motif.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Original Cyber Engineer', url: defaultHeroImg },
      { name: 'Wyndham Muscat Venue Dusk', url: defaultVenueImg },
      { name: 'Anniversary Gala Ballroom', url: defaultGalaImg }
    ]
  },
  venue: {
    id: 'venue',
    name: 'Wyndham Hotel Muscat (Venue Photo)',
    category: 'banners',
    defaultUrl: defaultVenueImg,
    aspectRatio: '16:10',
    description: 'Day 1 conference host venue photo displayed in the Venue and Muscat Travel Guide section.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Wyndham Hotel Dusk', url: defaultVenueImg },
      { name: 'Gala Hall Interior', url: defaultGalaImg },
      { name: 'Muscat Tech Artwork', url: defaultHeroImg }
    ]
  },
  gala: {
    id: 'gala',
    name: 'Anniversary Gala Dinner Ballroom',
    category: 'banners',
    defaultUrl: defaultGalaImg,
    aspectRatio: '16:9',
    description: 'Visual for the Evening Anniversary Gala Night dinner and awards banquet.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Anniversary Gala Ballroom', url: defaultGalaImg },
      { name: 'Wyndham Hotel Facade', url: defaultVenueImg }
    ]
  },
  qr_code: {
    id: 'qr_code',
    name: 'Event Registration QR Code',
    category: 'banners',
    defaultUrl: defaultQrCodeImg,
    aspectRatio: '1:1',
    description: 'Instant mobile registration QR code. Replace with custom image (PNG/JPG/SVG) or customize target link.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, objectFit: 'contain' },
    presets: []
  },

  // Speakers
  spk_apag: {
    id: 'spk_apag',
    name: 'Dr. Desiderio A. Apag III',
    category: 'speakers',
    defaultUrl: defaultSpkApag,
    aspectRatio: '1:1',
    description: 'CHED Commissioner & ICpEP National President. Keynote Speaker.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Dr. Apag Executive Barong', url: defaultSpkApag },
      { name: 'Engr. Maglalang Boardroom', url: defaultSpkMaglalang }
    ]
  },
  spk_maglalang: {
    id: 'spk_maglalang',
    name: 'Engr. Leopoldo Jr Maglalang',
    category: 'speakers',
    defaultUrl: defaultSpkMaglalang,
    aspectRatio: '1:1',
    description: 'ICpEP-Oman President & Chair, PTC Engineers Registration Board.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Engr. Maglalang Executive Barong', url: defaultSpkMaglalang },
      { name: 'Dr. Apag Academic Headshot', url: defaultSpkApag }
    ]
  },
  spk_albadi: {
    id: 'spk_albadi',
    name: 'Dr. Abdullah Al-Badi',
    category: 'speakers',
    defaultUrl: defaultSpkAlbadi,
    aspectRatio: '1:1',
    description: 'Chairman, IEEE Oman Chapter. Keynote on High Renewable Energy Power Grids.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Dr. Al-Badi IEEE Oman Headshot', url: defaultSpkAlbadi },
      { name: 'Engr. Hernandez Enterprise AI', url: defaultSpkHernandez }
    ]
  },
  spk_careon: {
    id: 'spk_careon',
    name: 'Engr. Raymond Careon',
    category: 'speakers',
    defaultUrl: defaultSpkCareon,
    aspectRatio: '1:1',
    description: 'Project Engineer, ASMPT SMT Solutions (Mexico). Intelligent Factory Speaker.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Engr. Careon Industry 4.0', url: defaultSpkCareon },
      { name: 'Engr. Hernandez AI Solutions', url: defaultSpkHernandez }
    ]
  },
  spk_hernandez: {
    id: 'spk_hernandez',
    name: 'Engr. Reginald Norris Hernandez',
    category: 'speakers',
    defaultUrl: defaultSpkHernandez,
    aspectRatio: '1:1',
    description: 'AI Solution Manager, CDW (Canada). Enterprise AI & Network Strategy Speaker.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Engr. Hernandez AI Enterprise', url: defaultSpkHernandez },
      { name: 'Engr. Careon SMT Systems', url: defaultSpkCareon }
    ]
  },
  spk_bustamante: {
    id: 'spk_bustamante',
    name: 'Engr. Trese Bustamante',
    category: 'speakers',
    defaultUrl: defaultSpkBustamante,
    aspectRatio: '1:1',
    description: 'Vice Chair, PTC-ERB & PTC-MENA International Affairs. AER Mentorship.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Engr. Bustamante Official Portrait', url: defaultSpkBustamante },
      { name: 'PTC-MENA Leadership Barong', url: defaultSpkMaglalang }
    ]
  },
  spk_monsada: {
    id: 'spk_monsada',
    name: 'Engr. Federico A. Monsada',
    category: 'speakers',
    defaultUrl: defaultSpkMonsada,
    aspectRatio: '1:1',
    description: 'President, Philippine Technological Council (PTC).',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'PTC President Monsada Executive', url: defaultSpkMonsada },
      { name: 'Boardroom Leadership', url: defaultSpkMaglalang }
    ]
  },
  spk_tambaoan: {
    id: 'spk_tambaoan',
    name: 'Engr. Jonathan PG Tambaoan',
    category: 'speakers',
    defaultUrl: defaultSpkTambaoan,
    aspectRatio: '1:1',
    description: 'VP Education, ICpEP-Oman Chapter. TechTalk Workshops & Academy Lead.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'VP Education Engr. Tambaoan', url: defaultSpkTambaoan },
      { name: 'Technology Director', url: defaultSpkHernandez }
    ]
  },
  spk_canlas: {
    id: 'spk_canlas',
    name: 'Dr. Ferdi Canlas',
    category: 'speakers',
    defaultUrl: defaultSpkCanlas,
    aspectRatio: '1:1',
    description: 'Panel Moderator & Senior Technology Educator. Industry Leaders Panel.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Dr. Canlas Panel Moderator', url: defaultSpkCanlas },
      { name: 'Academic Keynote', url: defaultSpkApag }
    ]
  },
  spk_manglicmot: {
    id: 'spk_manglicmot',
    name: 'Engr. Gerry Manglicmot',
    category: 'speakers',
    defaultUrl: defaultSpkManglicmot,
    aspectRatio: '1:1',
    description: 'PTC-Presidential Adviser, PTC Global MENA – Oman. AER & intPE Conferment Dignitary.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'PTC-Presidential Adviser Manglicmot', url: defaultSpkManglicmot },
      { name: 'Senior Council Executive', url: defaultSpkMaglalang }
    ]
  },
  spk_agatep: {
    id: 'spk_agatep',
    name: 'Engr. Romy R. Agatep',
    category: 'speakers',
    defaultUrl: defaultSpkAgatep,
    aspectRatio: '1:1',
    description: 'Chair, PTC Engineers Registration Board (PTC-ERB). Conferment Charging Officer.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'PTC-ERB Chair Agatep Official', url: defaultSpkAgatep },
      { name: 'Council Dignitary', url: defaultSpkMonsada }
    ]
  },
  spk_crisostomo: {
    id: 'spk_crisostomo',
    name: 'Dr. Ana Shiela Crisostomo',
    category: 'speakers',
    defaultUrl: defaultSpkCrisostomo,
    aspectRatio: '1:1',
    description: 'VP Internal, ICpEP-Oman Chapter. Institutional Synergy & Governance.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'Dr. Crisostomo VP Internal Portrait', url: defaultSpkCrisostomo },
      { name: 'Academic Leadership', url: defaultSpkApag }
    ]
  },
  spk_aer_conferees: {
    id: 'spk_aer_conferees',
    name: 'ASEAN Engineer (AER) Conferees Cohort',
    category: 'speakers',
    defaultUrl: defaultSpkAerConferees,
    aspectRatio: '1:1',
    description: 'Batch 2026 ASEAN Engineer Registry conferees and investiture honorees.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'AER 2026 Stage Investiture Cohort', url: defaultSpkAerConferees },
      { name: 'Grand Ballroom Banquet', url: defaultGalaImg }
    ]
  },
  spk_intpe_conferees: {
    id: 'spk_intpe_conferees',
    name: 'International Professional Engineer (intPE) Conferees',
    category: 'speakers',
    defaultUrl: defaultSpkIntpeConferees,
    aspectRatio: '1:1',
    description: 'Batch 2026 International Professional Engineer (intPE) register inductees.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [
      { name: 'intPE 2026 Global Registry Cohort', url: defaultSpkIntpeConferees },
      { name: 'Engineering Excellence Motif', url: defaultHeroImg }
    ]
  },

  spk_yeong: {
    id: 'spk_yeong',
    name: 'Ts. Yeong Chin Chow',
    category: 'speakers',
    defaultUrl: defaultSpkYeong,
    aspectRatio: '1:1',
    description: 'Head Commissioner, ASEAN Engineering Register.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [{ name: 'Ts. Yeong Chin Chow Official', url: defaultSpkYeong }]
  },
  spk_1791926121607: {
    id: 'spk_1791926121607',
    name: 'Ts. Yeong Chin Chow',
    category: 'speakers',
    defaultUrl: defaultSpkYeong,
    aspectRatio: '1:1',
    description: 'Head Commissioner, ASEAN Engineering Register.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [{ name: 'Ts. Yeong Chin Chow Official', url: defaultSpkYeong }]
  },
  spk_al_alawi: {
    id: 'spk_al_alawi',
    name: 'Dr. Ali Humaid Mohammed Al Alawi',
    category: 'speakers',
    defaultUrl: defaultSpkAlAlawi,
    aspectRatio: '1:1',
    description: 'Board Chairman, Grand Institute for Practical Application (GIPA).',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [{ name: 'Dr. Ali Al Alawi Official', url: defaultSpkAlAlawi }]
  },
  spk_1792011173758: {
    id: 'spk_1792011173758',
    name: 'Dr. Ali Humaid Mohammed Al Alawi',
    category: 'speakers',
    defaultUrl: defaultSpkAlAlawi,
    aspectRatio: '1:1',
    description: 'Board Chairman, Grand Institute for Practical Application (GIPA).',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    presets: [{ name: 'Dr. Ali Al Alawi Official', url: defaultSpkAlAlawi }]
  },

  // Partners
  partner_ptc: {
    id: 'partner_ptc',
    name: 'PTC MENA Council Emblem',
    category: 'partners',
    defaultUrl: defaultPartnerPtc,
    aspectRatio: '1:1',
    description: 'Philippine Technological Council MENA logo emblem.',
    adjustments: { ...DEFAULT_ADJUSTMENTS }
  },
  partner_utas: {
    id: 'partner_utas',
    name: 'UTAS Oman Insignia',
    category: 'partners',
    defaultUrl: defaultPartnerUtas,
    aspectRatio: '1:1',
    description: 'University of Technology and Applied Sciences Oman emblem.',
    adjustments: { ...DEFAULT_ADJUSTMENTS }
  },
  partner_ieee: {
    id: 'partner_ieee',
    name: 'IEEE Oman Section Logo',
    category: 'partners',
    defaultUrl: defaultPartnerIeee,
    aspectRatio: '1:1',
    description: 'IEEE Oman Section official badge.',
    adjustments: { ...DEFAULT_ADJUSTMENTS }
  },
  partner_cisco: {
    id: 'partner_cisco',
    name: 'Cisco Networking Academy Seal',
    category: 'partners',
    defaultUrl: defaultPartnerCisco,
    aspectRatio: '1:1',
    description: 'Cisco Networking Academy verified partner emblem.',
    adjustments: { ...DEFAULT_ADJUSTMENTS }
  }
};

// Auto-seed DEFAULT_IMAGE_SLOTS with saved customImages from site_state.json
// This ensures that when the site is compiled for production (GitHub Pages),
// ALL custom sponsor logos, custom photos, and logo adjustments are baked in as defaults.
const rawSiteState = (siteState as Record<string, any>) || {};
if (rawSiteState.customImages && typeof rawSiteState.customImages === 'object') {
  for (const [key, slotVal] of Object.entries(rawSiteState.customImages)) {
    if (!slotVal || typeof slotVal !== 'object') continue;
    const item = slotVal as any;
    if (DEFAULT_IMAGE_SLOTS[key]) {
      DEFAULT_IMAGE_SLOTS[key] = {
        ...DEFAULT_IMAGE_SLOTS[key],
        name: item.name || DEFAULT_IMAGE_SLOTS[key].name,
        description: item.description || DEFAULT_IMAGE_SLOTS[key].description,
        defaultUrl: item.customUrl || DEFAULT_IMAGE_SLOTS[key].defaultUrl,
        customUrl: item.customUrl || DEFAULT_IMAGE_SLOTS[key].customUrl,
        adjustments: {
          ...DEFAULT_IMAGE_SLOTS[key].adjustments,
          ...(item.adjustments || {})
        }
      };
    } else if (key.startsWith('partner_')) {
      DEFAULT_IMAGE_SLOTS[key] = {
        id: key,
        name: item.name || 'Collaborating Partner',
        category: 'partners',
        defaultUrl: item.customUrl || '',
        customUrl: item.customUrl,
        aspectRatio: '1:1',
        description: item.description || 'Institutional Collaborator Emblem',
        adjustments: {
          ...DEFAULT_ADJUSTMENTS,
          objectFit: 'contain',
          ...(item.adjustments || {})
        }
      };
    }
  }
}

// Auto-seed DEFAULT_IMAGE_SLOTS for speakers from rawSiteState.speakers
if (Array.isArray(rawSiteState.speakers)) {
  for (const spk of rawSiteState.speakers) {
    if (!spk || !spk.id) continue;
    const slotId = spk.id.replace(/-/g, '_');
    const resolvedPhoto = resolveImageUrl(spk.photoUrl);
    if (DEFAULT_IMAGE_SLOTS[slotId]) {
      if (resolvedPhoto) {
        DEFAULT_IMAGE_SLOTS[slotId] = {
          ...DEFAULT_IMAGE_SLOTS[slotId],
          defaultUrl: resolvedPhoto,
          customUrl: resolvedPhoto
        };
      }
    } else {
      DEFAULT_IMAGE_SLOTS[slotId] = {
        id: slotId,
        name: spk.name || 'Speaker',
        category: 'speakers',
        defaultUrl: resolvedPhoto || '',
        customUrl: resolvedPhoto,
        aspectRatio: '1:1',
        description: `${spk.title || ''} - ${spk.organization || ''}`,
        adjustments: { ...DEFAULT_ADJUSTMENTS }
      };
    }
  }
}

// Auto-seed QR code registration slot
if (rawSiteState.eventDetails?.qrCodeCustomUrl && DEFAULT_IMAGE_SLOTS['qrcode_slot']) {
  const resolvedQr = resolveImageUrl(rawSiteState.eventDetails.qrCodeCustomUrl);
  DEFAULT_IMAGE_SLOTS['qrcode_slot'] = {
    ...DEFAULT_IMAGE_SLOTS['qrcode_slot'],
    defaultUrl: resolvedQr,
    customUrl: resolvedQr
  };
}

const STORAGE_KEY = 'icpep_techtalk_2026_custom_images';

interface ImageContextType {
  slots: Record<string, ImageSlot>;
  getImageUrl: (slotId: string) => string;
  getImageStyle: (slotId: string) => React.CSSProperties;
  hasCustomImage: (slotId: string) => boolean;
  updateSlotUrl: (slotId: string, url: string) => void;
  updateSlotDetails: (slotId: string, details: { name?: string; description?: string }) => void;
  updateSlotAdjustments: (slotId: string, adjustments: Partial<ImageAdjustments>) => void;
  resetSlot: (slotId: string) => void;
  resetAllSlots: () => void;
  isEditorOpen: boolean;
  activeEditingSlotId: string;
  openEditor: (slotId?: string) => void;
  closeEditor: () => void;
  exportConfiguration: () => string;
  importConfiguration: (jsonString: string) => boolean;
  getExportableImagesData: () => Record<string, any>;
  isIndexedDbReady: boolean;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { collaboratingOrgs } = useEventData();

  const [slots, setSlots] = useState<Record<string, ImageSlot>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged: Record<string, ImageSlot> = { ...DEFAULT_IMAGE_SLOTS };
        for (const [key, savedVal] of Object.entries(parsed as Record<string, any>)) {
          if (DEFAULT_IMAGE_SLOTS[key]) {
            const isLegacyOldHash = typeof savedVal.customUrl === 'string' && (
              savedVal.customUrl.includes('1791926653953') ||
              savedVal.customUrl.includes('1791926654720') ||
              savedVal.customUrl.includes('1791926655546') ||
              savedVal.customUrl.includes('1791926655896') ||
              savedVal.customUrl.includes('1791926656006') ||
              savedVal.customUrl.includes('1791927625251') ||
              savedVal.customUrl.includes('1791927625971') ||
              savedVal.customUrl.includes('1791927626145') ||
              savedVal.customUrl.includes('1791927626152') ||
              savedVal.customUrl.includes('1791927626406') ||
              savedVal.customUrl.includes('1791927652140')
            );
            const isOutdatedFallback =
              isLegacyOldHash ||
              (savedVal.customUrl === defaultSpkMaglalang && key !== 'spk_maglalang') ||
              (savedVal.customUrl === defaultSpkApag && key !== 'spk_apag') ||
              (savedVal.customUrl === defaultSpkCareon && key !== 'spk_careon') ||
              (savedVal.customUrl === defaultSpkHernandez && key !== 'spk_hernandez') ||
              (savedVal.customUrl === defaultGalaImg && key !== 'gala') ||
              (savedVal.customUrl === defaultHeroImg && key !== 'hero');

            const validCustomUrl = isOutdatedFallback ? undefined : savedVal.customUrl;

            merged[key] = {
              ...DEFAULT_IMAGE_SLOTS[key],
              name: savedVal.name || DEFAULT_IMAGE_SLOTS[key].name,
              description: savedVal.description || DEFAULT_IMAGE_SLOTS[key].description,
              customUrl: validCustomUrl,
              adjustments: {
                ...DEFAULT_IMAGE_SLOTS[key].adjustments,
                ...(savedVal.adjustments || {})
              }
            };
          } else if (key.startsWith('partner_')) {
            // Restore dynamic partner slot
            merged[key] = {
              id: key,
              name: savedVal.name || 'Collaborating Partner',
              category: 'partners',
              defaultUrl: '',
              customUrl: savedVal.customUrl,
              aspectRatio: '1:1',
              description: savedVal.description || 'Institutional Collaborator Emblem',
              adjustments: {
                ...DEFAULT_ADJUSTMENTS,
                ...(savedVal.adjustments || {})
              }
            };
          }
        }
        return merged;
      }
    } catch (err) {
      console.error('Failed to load image configurations:', err);
    }
    return DEFAULT_IMAGE_SLOTS;
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeEditingSlotId, setActiveEditingSlotId] = useState<string>('hero');
  const [isIndexedDbReady, setIsIndexedDbReady] = useState(false);

  // Restore high-capacity custom images from IndexedDB on initial mount
  useEffect(() => {
    let active = true;
    dbGetItem<Record<string, any>>(STORAGE_KEY).then((dbData) => {
      if (!active || !dbData) {
        setIsIndexedDbReady(true);
        return;
      }

      setSlots((prev) => {
        let hasChanges = false;
        const merged = { ...prev };

        for (const [key, savedVal] of Object.entries(dbData)) {
          if (!savedVal) continue;
          const current = merged[key] || DEFAULT_IMAGE_SLOTS[key];

          if (current) {
            const isLegacyOldHash = typeof savedVal.customUrl === 'string' && (
              savedVal.customUrl.includes('1791926653953') ||
              savedVal.customUrl.includes('1791926654720') ||
              savedVal.customUrl.includes('1791926655546') ||
              savedVal.customUrl.includes('1791926655896') ||
              savedVal.customUrl.includes('1791926656006') ||
              savedVal.customUrl.includes('1791927625251') ||
              savedVal.customUrl.includes('1791927625971') ||
              savedVal.customUrl.includes('1791927626145') ||
              savedVal.customUrl.includes('1791927626152') ||
              savedVal.customUrl.includes('1791927626406') ||
              savedVal.customUrl.includes('1791927652140')
            );
            const validCustomUrl = isLegacyOldHash ? undefined : savedVal.customUrl;
            // Check if savedVal has a customUrl or adjustments not yet reflected in current
            const customUrlChanged = validCustomUrl && validCustomUrl !== current.customUrl;
            const adjustmentsChanged =
              savedVal.adjustments &&
              JSON.stringify(savedVal.adjustments) !== JSON.stringify(current.adjustments);

            if (customUrlChanged || adjustmentsChanged) {
              merged[key] = {
                ...current,
                customUrl: validCustomUrl || current.customUrl,
                adjustments: savedVal.adjustments
                  ? { ...current.adjustments, ...savedVal.adjustments }
                  : current.adjustments,
                name: savedVal.name || current.name,
                description: savedVal.description || current.description
              };
              hasChanges = true;
            }
          } else if (key.startsWith('partner_')) {
            merged[key] = {
              id: key,
              name: savedVal.name || 'Collaborating Partner',
              category: 'partners',
              defaultUrl: '',
              customUrl: savedVal.customUrl,
              aspectRatio: '1:1',
              description: savedVal.description || 'Institutional Collaborator Emblem',
              adjustments: {
                ...DEFAULT_ADJUSTMENTS,
                ...(savedVal.adjustments || {})
              }
            };
            hasChanges = true;
          }
        }

        return hasChanges ? merged : prev;
      });

      setIsIndexedDbReady(true);
    }).catch((err) => {
      console.warn('IndexedDB initial load note:', err);
      setIsIndexedDbReady(true);
    });

    // 2. Fetch server stored images for public visitor synchronization if on server backend
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
        if (!active || !serverRes || !serverRes.saved || !serverRes.data?.customImages) return;
        const srvImages = serverRes.data.customImages;
        setSlots((prev) => {
          let hasChanges = false;
          const merged = { ...prev };
          for (const [key, savedVal] of Object.entries(srvImages)) {
            if (!savedVal) continue;
            const current = merged[key] || DEFAULT_IMAGE_SLOTS[key];
            if (current) {
              const val = savedVal as any;
              if (val.customUrl || val.adjustments) {
                merged[key] = {
                  ...current,
                  customUrl: val.customUrl || current.customUrl,
                  adjustments: val.adjustments ? { ...current.adjustments, ...val.adjustments } : current.adjustments,
                  name: val.name || current.name,
                  description: val.description || current.description,
                };
                hasChanges = true;
              }
            }
          }
          return hasChanges ? merged : prev;
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Dynamically sync all collaborating organizations into the image slots so new partners appear in the logo editor
  useEffect(() => {
    if (!collaboratingOrgs || collaboratingOrgs.length === 0) return;

    setSlots((prev) => {
      let hasChanges = false;
      const updated = { ...prev };
      const defaultPartnerSlotIds = ['partner_ptc', 'partner_utas', 'partner_ieee', 'partner_cisco'];
      const activePartnerSlotIds = new Set<string>();

      collaboratingOrgs.forEach((org, idx) => {
        const slotId = org.id || defaultPartnerSlotIds[idx] || `partner_${idx}`;
        activePartnerSlotIds.add(slotId);

        const partnerName = org.name
          ? (org.shortName ? `${org.name} (${org.shortName})` : org.name)
          : `Collaborating Partner #${idx + 1}`;
        const partnerDesc = org.subtitle || org.role || `Institutional partner logo #${idx + 1}`;

        if (!updated[slotId]) {
          updated[slotId] = {
            id: slotId,
            name: partnerName,
            category: 'partners',
            defaultUrl: '',
            aspectRatio: '1:1',
            description: partnerDesc,
            adjustments: { ...DEFAULT_ADJUSTMENTS, objectFit: 'contain' }
          };
          hasChanges = true;
        } else {
          // If name or description changed, keep slot in sync
          if (updated[slotId].name !== partnerName || updated[slotId].description !== partnerDesc) {
            updated[slotId] = {
              ...updated[slotId],
              name: partnerName,
              description: partnerDesc
            };
            hasChanges = true;
          }
        }
      });

      // Clean up orphaned dynamic partner slots (beyond the 4 default ones) if deleted from collaboratingOrgs
      for (const key of Object.keys(updated)) {
        if (updated[key].category === 'partners' && !DEFAULT_IMAGE_SLOTS[key] && !activePartnerSlotIds.has(key)) {
          delete updated[key];
          hasChanges = true;
        }
      }

      return hasChanges ? updated : prev;
    });
  }, [collaboratingOrgs]);

  // Dual-Persist to IndexedDB (unlimited capacity) and LocalStorage (with safe quota handling)
  useEffect(() => {
    const toSave: Record<string, { customUrl?: string; adjustments: ImageAdjustments; name?: string; description?: string }> = {};
    for (const [key, slot] of Object.entries(slots)) {
      if (slot.customUrl || JSON.stringify(slot.adjustments) !== JSON.stringify(DEFAULT_ADJUSTMENTS) || key.startsWith('partner_')) {
        toSave[key] = {
          customUrl: slot.customUrl,
          adjustments: slot.adjustments,
          name: slot.name,
          description: slot.description
        };
      }
    }

    // 1. Primary permanent store: IndexedDB (handles 100MB+ easily, eliminates QuotaExceededError)
    dbSetItem(STORAGE_KEY, toSave).catch((err) => {
      console.warn('IndexedDB auto-save notice:', err);
    });

    // 2. Secondary quick-boot cache: localStorage (with graceful quota protection)
    try {
      const serialized = JSON.stringify(toSave);
      // If payload is under 3MB, store completely
      if (serialized.length < 3000000) {
        localStorage.setItem(STORAGE_KEY, serialized);
      } else {
        // Strip large base64 data URLs from localStorage, preserving adjustments and URLs under 40KB
        const lightSave: Record<string, any> = {};
        for (const [k, v] of Object.entries(toSave)) {
          lightSave[k] = {
            ...v,
            customUrl: v.customUrl && v.customUrl.length > 40000 ? undefined : v.customUrl
          };
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lightSave));
      }
    } catch (err: any) {
      // Gracefully catch QuotaExceededError - data is safely stored in IndexedDB!
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        // No unhandled error is thrown
      } else {
        console.warn('LocalStorage save notice:', err);
      }
    }
  }, [slots]);

  const getImageUrl = (slotId: string): string => {
    const slot = slots[slotId];
    if (!slot) return '';
    return resolveImageUrl(slot.customUrl || slot.defaultUrl);
  };

  const hasCustomImage = (slotId: string): boolean => {
    const slot = slots[slotId];
    return !!slot?.customUrl;
  };

  const getImageStyle = (slotId: string): React.CSSProperties => {
    const slot = slots[slotId];
    if (!slot) return {};
    const { brightness, contrast, saturate, goldTint, zoom, objectFit } = slot.adjustments;

    const filters: string[] = [];
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
    if (saturate !== 100) filters.push(`saturate(${saturate}%)`);
    if (goldTint > 0) {
      filters.push(`sepia(${goldTint * 0.4}%)`);
    }

    return {
      filter: filters.length > 0 ? filters.join(' ') : 'none',
      transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none',
      objectFit: objectFit || (slot.category === 'partners' ? 'contain' : 'cover'),
      transition: 'filter 0.15s ease, transform 0.15s ease'
    };
  };

  const updateSlotUrl = (slotId: string, url: string) => {
    setSlots((prev) => {
      const target = prev[slotId] || DEFAULT_IMAGE_SLOTS[slotId] || {
        id: slotId,
        name: 'Partner Logo',
        category: slotId.startsWith('partner') ? 'partners' : 'banners',
        defaultUrl: '',
        aspectRatio: '1:1',
        description: 'Institutional Partner Emblem',
        adjustments: { ...DEFAULT_ADJUSTMENTS, objectFit: 'contain' }
      };
      return {
        ...prev,
        [slotId]: {
          ...target,
          customUrl: url
        }
      };
    });

    // Auto-sync image to server disk (src/assets/images and public/images)
    if (url && url.startsWith('data:image/')) {
      const slotName = slots[slotId]?.name || slotId;
      syncImageToDisk(slotId, slotName, url).catch(() => {});
    }

    // Auto-compress large data URLs in background to keep storage light and fast
    if (url && url.startsWith('data:image/') && url.length > 100000 && typeof window !== 'undefined') {
      const maxDim = slotId.startsWith('hero') || slotId === 'gala' ? 1440 : 800;
      compressImage(url, { maxWidth: maxDim, maxHeight: maxDim, quality: 0.85 })
        .then((optimized) => {
          if (optimized && optimized !== url) {
            setSlots((prev) => {
              if (!prev[slotId] || prev[slotId].customUrl !== url) return prev;
              return {
                ...prev,
                [slotId]: {
                  ...prev[slotId],
                  customUrl: optimized
                }
              };
            });
          }
        })
        .catch(() => {});
    }
  };

  const updateSlotDetails = (slotId: string, details: { name?: string; description?: string }) => {
    setSlots((prev) => {
      const target = prev[slotId] || DEFAULT_IMAGE_SLOTS[slotId] || {
        id: slotId,
        name: 'Partner Logo',
        category: slotId.startsWith('partner') ? 'partners' : 'banners',
        defaultUrl: '',
        aspectRatio: '1:1',
        description: 'Institutional Partner Emblem',
        adjustments: { ...DEFAULT_ADJUSTMENTS, objectFit: 'contain' }
      };
      return {
        ...prev,
        [slotId]: {
          ...target,
          ...(details.name !== undefined ? { name: details.name } : {}),
          ...(details.description !== undefined ? { description: details.description } : {})
        }
      };
    });
  };

  const updateSlotAdjustments = (slotId: string, adjustments: Partial<ImageAdjustments>) => {
    setSlots((prev) => {
      const target = prev[slotId] || DEFAULT_IMAGE_SLOTS[slotId] || {
        id: slotId,
        name: 'Partner Logo',
        category: slotId.startsWith('partner') ? 'partners' : 'banners',
        defaultUrl: '',
        aspectRatio: '1:1',
        description: 'Institutional Partner Emblem',
        adjustments: { ...DEFAULT_ADJUSTMENTS, objectFit: 'contain' }
      };
      return {
        ...prev,
        [slotId]: {
          ...target,
          adjustments: {
            ...target.adjustments,
            ...adjustments
          }
        }
      };
    });
  };

  const resetSlot = (slotId: string) => {
    setSlots((prev) => {
      const defaultSlot = DEFAULT_IMAGE_SLOTS[slotId];
      if (defaultSlot) {
        return {
          ...prev,
          [slotId]: { ...defaultSlot }
        };
      }
      if (prev[slotId]) {
        return {
          ...prev,
          [slotId]: {
            ...prev[slotId],
            customUrl: undefined,
            adjustments: { ...DEFAULT_ADJUSTMENTS, objectFit: 'contain' }
          }
        };
      }
      return prev;
    });
  };

  const resetAllSlots = () => {
    setSlots(DEFAULT_IMAGE_SLOTS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    dbRemoveItem(STORAGE_KEY).catch(() => {});
  };

  const openEditor = (slotId?: string) => {
    if (slotId) {
      setActiveEditingSlotId(slotId);
    }
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
  };

  const exportConfiguration = (): string => {
    return JSON.stringify(slots, null, 2);
  };

  const getExportableImagesData = (): Record<string, any> => {
    const toSave: Record<string, any> = {};
    for (const [key, slot] of Object.entries(slots)) {
      if (slot.customUrl || JSON.stringify(slot.adjustments) !== JSON.stringify(DEFAULT_ADJUSTMENTS) || key.startsWith('partner_')) {
        toSave[key] = {
          customUrl: slot.customUrl,
          adjustments: slot.adjustments,
          name: slot.name,
          description: slot.description
        };
      }
    }
    return toSave;
  };

  const importConfiguration = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        setSlots((prev) => {
          const next = { ...prev };
          for (const [key, val] of Object.entries(parsed as Record<string, any>)) {
            if (next[key]) {
              next[key] = {
                ...next[key],
                customUrl: val.customUrl !== undefined ? val.customUrl : next[key].customUrl,
                adjustments: val.adjustments ? { ...next[key].adjustments, ...val.adjustments } : next[key].adjustments,
                name: val.name || next[key].name,
                description: val.description || next[key].description
              };
            } else if (key.startsWith('partner_')) {
              next[key] = {
                id: key,
                name: val.name || 'Collaborating Partner',
                category: 'partners',
                defaultUrl: '',
                customUrl: val.customUrl,
                aspectRatio: '1:1',
                description: val.description || 'Institutional Collaborator Emblem',
                adjustments: { ...DEFAULT_ADJUSTMENTS, ...(val.adjustments || {}) }
              };
            }
          }
          return next;
        });
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <ImageContext.Provider
      value={{
        slots,
        getImageUrl,
        getImageStyle,
        hasCustomImage,
        updateSlotUrl,
        updateSlotDetails,
        updateSlotAdjustments,
        resetSlot,
        resetAllSlots,
        isEditorOpen,
        activeEditingSlotId,
        openEditor,
        closeEditor,
        exportConfiguration,
        importConfiguration,
        getExportableImagesData,
        isIndexedDbReady
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImageManager = (): ImageContextType => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageManager must be used within an ImageProvider');
  }
  return context;
};
