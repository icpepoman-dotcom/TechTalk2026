import { CollaboratingOrg } from '../types';
import { resolveImageUrl } from './imagePath';

/**
 * Returns a stable, deterministic slotId for a collaborating organization.
 * Prefers org.id, then known semantic identifiers, then index-based fallback.
 */
export function getPartnerSlotId(org: Partial<CollaboratingOrg> | undefined, index: number): string {
  if (!org) return `partner_${index}`;
  if (org.id && org.id.trim()) {
    return org.id.trim();
  }

  const searchStr = `${org.shortName || ''} ${org.name || ''}`.toLowerCase();

  if (searchStr.includes('gipa') || searchStr.includes('grand institute')) {
    return 'partner_gipa';
  }
  if (searchStr.includes('pillar') || searchStr.includes('world bright')) {
    return 'partner_world_bright_pillars';
  }
  if (searchStr.includes('icpep') || searchStr.includes('computer engineer of the philippines')) {
    return 'partner_1791919214161';
  }
  if (searchStr.includes('mena oman') || searchStr.includes('council - mena')) {
    return 'partner_1791920199106';
  }
  if (searchStr.includes('ptc') || searchStr.includes('philippine technological council')) {
    return 'partner_ptc';
  }
  if (searchStr.includes('cisco') || searchStr.includes('netacad')) {
    return 'partner_cisco';
  }
  if (searchStr.includes('ieee')) {
    return 'partner_ieee';
  }
  if (searchStr.includes('utas') || searchStr.includes('university of technology and applied')) {
    return 'partner_utas';
  }

  return `partner_${index}`;
}

/**
 * Resolves the display logo URL for an organization by checking:
 * 1. org.logo
 * 2. org.logoUrl
 * 3. ImageContext getImageUrl(slotId)
 * 4. Normalizes path with resolveImageUrl
 */
export function resolvePartnerLogo(
  org: Partial<CollaboratingOrg> | undefined,
  slotId: string,
  getImageUrl: (slotId: string) => string
): string {
  if (!org) return '';
  const rawUrl = org.logo || org.logoUrl || getImageUrl(slotId);
  return resolveImageUrl(rawUrl);
}
