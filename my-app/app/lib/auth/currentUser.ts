import { withBasePath } from "../basePath";

export class CurrentUserService {
  private cachedCurrentUserId: Promise<string> | null = null;

  normalizeUserId(value: unknown) {
    if (typeof value !== "string" && typeof value !== "number") return "";
    return String(value).trim();
  }

  isSameUserId(a: unknown, b: unknown) {
    const left = this.normalizeUserId(a);
    const right = this.normalizeUserId(b);
    return Boolean(left && right && left === right);
  }

  // Identity comes solely from the verified hrkpis session (see /api/session) — never
  // from URL params or localStorage, which a caller could edit to impersonate anyone.
  // For local testing, set DEV_AUTH_BYPASS=true and DEV_AUTH_EMP_ID in .env — /api/session
  // returns that id directly, so there's no separate test-identity fallback here.
  async getClientCurrentUserId(): Promise<string> {
    if (typeof window === "undefined") return "";

    if (!this.cachedCurrentUserId) {
      this.cachedCurrentUserId = fetch(withBasePath("/api/session"))
        .then((response) => {
          if (!response.ok) {
            console.warn(`/api/session returned ${response.status}.`);
            return null;
          }
          return response.json();
        })
        .then((data) => (data?.authenticated ? this.normalizeUserId(data.empId) : ""))
        .catch((error) => {
          console.warn("Failed to check /api/session.", error);
          return "";
        });
    }

    return this.cachedCurrentUserId;
  }

  buildCurrentUserHref(pathname: string) {
    if (!pathname) return pathname;

    const [path, search = ""] = pathname.split("?");
    const params = new URLSearchParams(search);
    params.delete("currentUserId");

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return `${withBasePath(path)}${suffix}`;
  }
}

export const currentUserService = new CurrentUserService();

export const normalizeUserId = (value: unknown) => currentUserService.normalizeUserId(value);
export const isSameUserId = (a: unknown, b: unknown) => currentUserService.isSameUserId(a, b);
export const getClientCurrentUserId = () => currentUserService.getClientCurrentUserId();
export const buildCurrentUserHref = (pathname: string) =>
  currentUserService.buildCurrentUserHref(pathname);
