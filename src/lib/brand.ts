import danteAvatar from "@/assets/dante-avatar.webp.asset.json";
import universoLogo from "@/assets/universo-dante-logo.webp.asset.json";

// CDN-hosted, immutable URLs: the browser caches them long-term, so they cost no
// transfer from the club database after the first load.
export const DANTE_AVATAR_URL = danteAvatar.url;
export const UNIVERSO_LOGO_URL = universoLogo.url;
export const DEFAULT_UNIVERSO_URL = "https://queridodante.site";
export const DEFAULT_ADMIN_EMAIL = "admin@danteclube.com";
export const DEFAULT_ADMIN_PASSWORD = "DanteClube#2026";
