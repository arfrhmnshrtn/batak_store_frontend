/**
 * Utility untuk membangun URL gambar katalog menu yang benar.
 *
 * Mendukung:
 * 1. Path lokal dari backend: "/uploads/katalog-menu/uuid.jpg"
 * 2. URL eksternal lama (tetap ditampilkan apa adanya): "https://..."
 * 3. null / undefined → mengembalikan null (komponen menangani fallback)
 *
 * Penting: Base URL untuk gambar adalah root backend (tanpa /api),
 * karena static files di-serve di luar prefix API.
 *
 * Contoh:
 *   VITE_API_BASE_URL = "http://localhost:3000/api"
 *   Static images  → "http://localhost:3000/uploads/katalog-menu/uuid.jpg"
 */

// Extract backend root URL from VITE_API_BASE_URL
// e.g. "http://localhost:3000/api" → "http://localhost:3000"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function getBackendRoot() {
  try {
    const url = new URL(API_BASE_URL.trim());
    return `${url.protocol}//${url.host}`;
  } catch {
    // fallback: strip trailing "/api" if present
    return API_BASE_URL.trim().replace(/\/api\/?$/, '');
  }
}

const BACKEND_ROOT = getBackendRoot();

/**
 * Converts a url_gambar value from the database into a displayable image URL.
 *
 * @param {string|null|undefined} urlGambar - Value from katalog_menu.url_gambar
 * @returns {string|null} - Full URL to display, or null if no image
 */
export function getMenuImageUrl(urlGambar) {
  if (!urlGambar) return null;

  // Already an absolute URL (external / old data)
  if (urlGambar.startsWith('http://') || urlGambar.startsWith('https://')) {
    return urlGambar;
  }

  // Local upload path: prefix with backend root
  // Ensure no double slashes
  const path = urlGambar.startsWith('/') ? urlGambar : `/${urlGambar}`;
  return `${BACKEND_ROOT}${path}`;
}

/**
 * Default fallback image to display when no image is set or image fails to load.
 */
export const DEFAULT_MENU_IMAGE =
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80';

/**
 * Returns a src value for menu images, with fallback.
 *
 * @param {string|null|undefined} urlGambar
 * @returns {string}
 */
export function getMenuImageSrc(urlGambar) {
  return getMenuImageUrl(urlGambar) || DEFAULT_MENU_IMAGE;
}
