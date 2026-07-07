const CURRENT_USER_STORAGE_KEY = "recognition-current-user-id";
const USER_ID_KEYS = ["currentUserId", "user_id", "emp_id", "fs_id", "createdBy"];
const USER_ID_HEADERS = ["x-current-user-id", "x-user-id", "x-employee-id", "x-fs-id"];

export const TEST_CURRENT_USER = {
  user_id: "10183",
  firstName: "Pumin",
  lastName: "Intarasri",
  email: "pumin@teckbeehang.com",
  role: "I.T. Specialist",
  location: "HQ"
};

export class CurrentUserService {
  normalizeUserId(value: unknown) {
    if (typeof value !== "string" && typeof value !== "number") return "";
    return String(value).trim();
  }

  isSameUserId(a: unknown, b: unknown) {
    const left = this.normalizeUserId(a);
    const right = this.normalizeUserId(b);
    return Boolean(left && right && left === right);
  }

  private cleanUserIdParamsFromUrl() {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    let hasChanges = false;

    USER_ID_KEYS.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      const nextUrl = `${url.pathname}${url.search ? `?${url.search}` : ""}${url.hash}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }

  getClientCurrentUserId() {
    if (typeof window === "undefined") return TEST_CURRENT_USER.user_id;

    const params = new URLSearchParams(window.location.search);
    const fromUrl =
      USER_ID_KEYS.map((key) => this.normalizeUserId(params.get(key))).find(Boolean) || "";

    if (fromUrl) {
      window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, fromUrl);
      this.cleanUserIdParamsFromUrl();
      return fromUrl;
    }

    this.cleanUserIdParamsFromUrl();

    const fromStorage = this.normalizeUserId(window.localStorage.getItem(CURRENT_USER_STORAGE_KEY));
    return fromStorage || TEST_CURRENT_USER.user_id;
  }

  buildCurrentUserHref(pathname: string, _currentUserId: string) {
    if (!pathname) return pathname;

    const [path, search = ""] = pathname.split("?");
    const params = new URLSearchParams(search);
    params.delete("currentUserId");

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return `${path}${suffix}`;
  }

  async getRequestCurrentUserId(request: Request, body?: Record<string, unknown>) {
    const headerUserId = USER_ID_HEADERS
      .map((header) => this.normalizeUserId(request.headers.get(header)))
      .find(Boolean);

    if (headerUserId) return headerUserId;

    const params = new URL(request.url).searchParams;
    const queryUserId = USER_ID_KEYS.map((key) => this.normalizeUserId(params.get(key))).find(Boolean);

    if (queryUserId) return queryUserId;

    if (!body) return TEST_CURRENT_USER.user_id;

    return (
      USER_ID_KEYS.map((key) => this.normalizeUserId(body[key])).find(Boolean) ||
      this.normalizeUserId(body.current_user_id) ||
      this.normalizeUserId(body.created_by) ||
      TEST_CURRENT_USER.user_id
    );
  }
}

export const currentUserService = new CurrentUserService();

export const normalizeUserId = (value: unknown) => currentUserService.normalizeUserId(value);
export const isSameUserId = (a: unknown, b: unknown) => currentUserService.isSameUserId(a, b);
export const getClientCurrentUserId = () => currentUserService.getClientCurrentUserId();
export const buildCurrentUserHref = (pathname: string, currentUserId: string) =>
  currentUserService.buildCurrentUserHref(pathname, currentUserId);
export const getRequestCurrentUserId = (request: Request, body?: Record<string, unknown>) =>
  currentUserService.getRequestCurrentUserId(request, body);
