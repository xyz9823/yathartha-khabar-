/**
 * Yathartha Khabar - Image Utility Helpers
 * Ensures authentic rendering, editorial placeholder detection, and graceful fallbacks.
 */

export function isEditorialPlaceholder(imageUrl?: string, isPlaceholderFlag?: boolean): boolean {
  if (isPlaceholderFlag) return true;
  if (!imageUrl) return true;
  if (imageUrl.startsWith('data:image/svg+xml')) return true;
  if (imageUrl.includes('EDITORIAL NOTICE') || imageUrl.includes('EDITORIAL PLACEHOLDER')) return true;
  return false;
}

export function createEditorialFallbackSvg(category: string, title: string): string {
  const cat = (category || 'NEWS').toUpperCase();
  const safeTitle = (title || 'News Update').slice(0, 50);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
    <rect width="800" height="450" fill="#0f172a" />
    <rect x="16" y="16" width="768" height="418" rx="8" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4" />
    <g transform="translate(40, 48)">
      <rect x="0" y="0" width="6" height="24" fill="#dc2626" rx="2" />
      <text x="16" y="18" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#f8fafc" letter-spacing="1.5">
        YATHARTHA KHABAR
      </text>
    </g>
    <g transform="translate(40, 110)">
      <rect x="0" y="0" width="120" height="24" rx="4" fill="#dc2626" opacity="0.2" />
      <text x="60" y="16" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#f87171" letter-spacing="1" text-anchor="middle">
        ${cat}
      </text>
    </g>
    <g transform="translate(40, 180)">
      <text x="0" y="0" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#ffffff">
        ${safeTitle}
      </text>
    </g>
    <g transform="translate(40, 260)">
      <rect x="0" y="0" width="720" height="110" rx="6" fill="#1e293b" stroke="#334155" />
      <text x="24" y="36" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#f59e0b">
        EDITORIAL NOTICE: SCENE PHOTO PENDING CLEARANCE
      </text>
      <text x="24" y="64" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8">
        Yathartha Khabar does not display generic stock photos.
      </text>
      <text x="24" y="86" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">
        Official editorial photo is awaiting verification from authorized field sources.
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
