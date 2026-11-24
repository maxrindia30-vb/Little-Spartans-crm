/**
 * Little Spartans ZenConnect CRM - Brand Identity Palette Service
 *
 * Provides operations and design token management for:
 * - 4 Official Brand Colors (Warm Cream, Spartan Orange, Navy Blue, Pure White)
 * - HEX validation & normalization
 * - Shared CSS custom properties / dynamic DOM injection
 * - LocalStorage caching & synchronization
 */

export const DEFAULT_BRAND_PALETTE = [
  {
    key: 'warmCream',
    name: 'Warm Cream',
    hex: '#FFF4E8',
    defaultHex: '#FFF4E8',
    usage: 'Main Background & Navbar',
    description: 'Subtle ambient background tint for cards, navbars, and surfaces',
    borderStyle: 'border border-[#172B5015]'
  },
  {
    key: 'spartanOrange',
    name: 'Spartan Orange',
    hex: '#F4510B',
    defaultHex: '#F4510B',
    usage: 'Active Nav, CTAs & Highlights',
    description: 'Primary high-energy accent for CTAs, active states, and badges',
    borderStyle: 'border border-[#F4510B]'
  },
  {
    key: 'navyBlue',
    name: 'Navy Blue',
    hex: '#172B50',
    defaultHex: '#172B50',
    usage: 'Headings, Titles & Primary Text',
    description: 'Authoritative contrast tone for headings, sidebar icons, and text',
    borderStyle: 'border border-[#172B50]'
  },
  {
    key: 'pureWhite',
    name: 'Pure White',
    hex: '#FFFFFF',
    defaultHex: '#FFFFFF',
    usage: 'Cards, Containers & Surfaces',
    description: 'Clean crisp surface canvas for dashboard cards and modal sheets',
    borderStyle: 'border border-[#172B5015]'
  }
];

export const BRAND_PALETTE_STORAGE_KEY = 'little_spartans_brand_palette';

/**
 * Validates whether string is a valid 3-char or 6-char HEX color code
 */
export function isValidHex(hex) {
  if (typeof hex !== 'string') return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}

/**
 * Normalizes HEX string to uppercase #RRGGBB format
 */
export function normalizeHex(hex) {
  if (!hex || typeof hex !== 'string') return '#FFFFFF';
  let clean = hex.trim();
  if (!clean.startsWith('#')) clean = '#' + clean;
  if (clean.length === 4) {
    clean = '#' + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3];
  }
  return clean.toUpperCase();
}

/**
 * Converts a HEX string to RGB object
 */
export function hexToRgb(hex) {
  const norm = normalizeHex(hex);
  if (!isValidHex(norm)) return { r: 244, g: 81, b: 11 };
  const num = parseInt(norm.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Applies palette tokens to DOM root and updates dynamic style block
 */
export function applyBrandPaletteToDom(palette) {
  if (typeof document === 'undefined') return;

  const colors = Array.isArray(palette) && palette.length === 4 ? palette : DEFAULT_BRAND_PALETTE;
  const colorMap = {};
  colors.forEach((c) => {
    const key = c.key || (c.name === 'Warm Cream' ? 'warmCream' : c.name === 'Spartan Orange' ? 'spartanOrange' : c.name === 'Navy Blue' ? 'navyBlue' : 'pureWhite');
    colorMap[key] = normalizeHex(c.hex || c.defaultHex);
  });

  const warmCream = colorMap.warmCream || '#FFF4E8';
  const spartanOrange = colorMap.spartanOrange || '#F4510B';
  const navyBlue = colorMap.navyBlue || '#172B50';
  const pureWhite = colorMap.pureWhite || '#FFFFFF';

  const orangeRgb = hexToRgb(spartanOrange);
  const navyRgb = hexToRgb(navyBlue);
  const creamRgb = hexToRgb(warmCream);
  const whiteRgb = hexToRgb(pureWhite);

  const root = document.documentElement;
  root.style.setProperty('--brand-warm-cream', warmCream);
  root.style.setProperty('--brand-spartan-orange', spartanOrange);
  root.style.setProperty('--brand-navy-blue', navyBlue);
  root.style.setProperty('--brand-pure-white', pureWhite);

  root.style.setProperty('--color-warm-cream', warmCream);
  root.style.setProperty('--color-spartan-orange', spartanOrange);
  root.style.setProperty('--color-navy-blue', navyBlue);
  root.style.setProperty('--color-pure-white', pureWhite);

  root.style.setProperty('--brand-orange-rgb', `${orangeRgb.r}, ${orangeRgb.g}, ${orangeRgb.b}`);
  root.style.setProperty('--brand-navy-rgb', `${navyRgb.r}, ${navyRgb.g}, ${navyRgb.b}`);
  root.style.setProperty('--brand-cream-rgb', `${creamRgb.r}, ${creamRgb.g}, ${creamRgb.b}`);
  root.style.setProperty('--brand-white-rgb', `${whiteRgb.r}, ${whiteRgb.g}, ${whiteRgb.b}`);

  let styleEl = document.getElementById('little-spartans-dynamic-brand-palette');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'little-spartans-dynamic-brand-palette';
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    :root {
      --brand-warm-cream: ${warmCream};
      --brand-spartan-orange: ${spartanOrange};
      --brand-navy-blue: ${navyBlue};
      --brand-pure-white: ${pureWhite};

      --brand-orange-rgb: ${orangeRgb.r}, ${orangeRgb.g}, ${orangeRgb.b};
      --brand-navy-rgb: ${navyRgb.r}, ${navyRgb.g}, ${navyRgb.b};
      --brand-cream-rgb: ${creamRgb.r}, ${creamRgb.g}, ${creamRgb.b};
      --brand-white-rgb: ${whiteRgb.r}, ${whiteRgb.g}, ${whiteRgb.b};
    }

    /* Dynamic Spartan Orange Elements */
    .bg-\\[\\#F4510B\\], .bg-spartan-orange {
      background-color: var(--brand-spartan-orange) !important;
    }
    .text-\\[\\#F4510B\\], .text-spartan-orange {
      color: var(--brand-spartan-orange) !important;
    }
    .border-\\[\\#F4510B\\], .border-spartan-orange {
      border-color: var(--brand-spartan-orange) !important;
    }
    .fill-\\[\\#F4510B\\] {
      fill: var(--brand-spartan-orange) !important;
    }
    .stroke-\\[\\#F4510B\\] {
      stroke: var(--brand-spartan-orange) !important;
    }
    .focus\\:ring-\\[\\#F4510B\\]:focus {
      --tw-ring-color: var(--brand-spartan-orange) !important;
    }
    .shadow-\\[\\#F4510B\\]\\/25 {
      --tw-shadow-color: rgba(var(--brand-orange-rgb), 0.25) !important;
    }

    /* Dynamic Navy Blue Elements */
    .bg-\\[\\#172B50\\], .bg-spartan-navy {
      background-color: var(--brand-navy-blue) !important;
    }
    .text-\\[\\#172B50\\], .text-spartan-navy {
      color: var(--brand-navy-blue) !important;
    }
    .border-\\[\\#172B50\\] {
      border-color: var(--brand-navy-blue) !important;
    }

    /* Dynamic Warm Cream Elements */
    .bg-\\[\\#FFF4E8\\], .bg-spartan-cream {
      background-color: var(--brand-warm-cream) !important;
    }
    .border-\\[\\#FFF4E8\\] {
      border-color: var(--brand-warm-cream) !important;
    }

    /* Dynamic Pure White Elements */
    .bg-\\[\\#FFFFFF\\] {
      background-color: var(--brand-pure-white) !important;
    }
  `;
}

/**
 * Retrieves cached brand palette from localStorage or defaults
 */
export function getStoredBrandPalette() {
  if (typeof window === 'undefined') return DEFAULT_BRAND_PALETTE;
  try {
    const raw = localStorage.getItem(BRAND_PALETTE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 4) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored brand palette', e);
  }
  return DEFAULT_BRAND_PALETTE;
}

/**
 * Persists brand palette in localStorage
 */
export function saveStoredBrandPalette(palette) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BRAND_PALETTE_STORAGE_KEY, JSON.stringify(palette));
  } catch (e) {
    console.error('Error saving brand palette', e);
  }
}

// Initial hydration upon import in browser
if (typeof window !== 'undefined') {
  try {
    applyBrandPaletteToDom(getStoredBrandPalette());
  } catch (e) {
    // Ignore in non-browser environments
  }
}
