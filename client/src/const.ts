export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// PREVIEW MODE: login disabled, return home page instead of OAuth portal
export const getLoginUrl = () => window.location.origin + "/training";
