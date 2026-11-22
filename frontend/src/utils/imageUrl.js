/**
 * Utility helper to resolve dish and restaurant image URLs.
 * إذا كان مسار imageUrl يبدأ بـ /uploads يدمج قبله رابط السيرفر الأساسي: http://localhost:5107
 */
const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5107/api')
  .replace(/\/api\/?$/, '')
  .trim();

export function getFullImageUrl(url) {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_HOST}${cleanPath}`;
}
