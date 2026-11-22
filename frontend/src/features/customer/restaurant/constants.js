const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5107/api')
  .replace(/\/api\/?$/, '')
  .trim();

export const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80";

export const DEFAULT_LOGO =
  "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&auto=format&fit=crop&q=80";

export const getFullImageUrl = (url, fallback) => {
  if (!url) return fallback;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  )
    return url;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND_HOST}${cleanPath}`;
};
