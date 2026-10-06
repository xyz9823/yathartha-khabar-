/**
 * Yathartha Khabar - Image Utility Helpers
 * Ensures authentic rendering, editorial placeholder detection, and graceful fallbacks.
 */

export function isEditorialPlaceholder(imageUrl?: string, isPlaceholderFlag?: boolean): boolean {
  if (isPlaceholderFlag) return true;
  if (!imageUrl) return true;
  if (imageUrl.startsWith('data:image/svg+xml')) return true;
  if (imageUrl.includes('No verified image available') || imageUrl.includes('EDITORIAL NOTICE') || imageUrl.includes('EDITORIAL PLACEHOLDER')) return true;
  return false;
}

export function createEditorialFallbackSvg(_category?: string, _title?: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
    <rect width="800" height="450" fill="#0f172a" />
    <rect x="16" y="16" width="768" height="418" rx="8" fill="none" stroke="#334155" stroke-width="1.5" />
    
    <g transform="translate(400, 210)" text-anchor="middle">
      <circle cx="0" cy="-35" r="32" fill="#1e293b" stroke="#475569" stroke-width="2" />
      <path d="M -12 -31 L -6 -31 L -4 -35 L 4 -35 L 6 -31 L 12 -31 C 15 -31 16 -29 16 -26 L 16 -14 C 16 -11 15 -9 12 -9 L -12 -9 C -15 -9 -16 -11 -16 -14 L -16 -26 C -16 -29 -15 -31 -12 -31 Z M 0 -14 C 4.5 -14 8 -17.5 8 -22 C 8 -26.5 4.5 -30 0 -30 C -4.5 -30 -8 -26.5 -8 -22 C -8 -17.5 -4.5 -14 0 -14 Z" fill="#94a3b8" />
      <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#f8fafc">
        No verified image available
      </text>
      <text x="0" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">
        Yathartha Khabar • Verified Media Standards
      </text>
    </g>

    <g transform="translate(36, 40)">
      <rect x="0" y="0" width="5" height="18" fill="#dc2626" rx="1.5" />
      <text x="12" y="14" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#e2e8f0" letter-spacing="1">
        YATHARTHA KHABAR
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
