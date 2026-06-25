const CURRENT_USER_STORAGE_KEY = "recognition-current-user-id";
const USER_ID_KEYS = ["currentUserId", "user_id", "emp_id", "fs_id", "createdBy"];
const USER_ID_HEADERS = ["x-current-user-id", "x-user-id", "x-employee-id", "x-fs-id"];

export const TEST_CURRENT_USER = {
  user_id: "9999",
  firstName: "test",
  lastName: "naja",
  email: "testnaja@teckbeehang.com",
  role: "tester",
};

export function normalizeUserId(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).trim();
}

export function isSameUserId(a: unknown, b: unknown) {
  const left = normalizeUserId(a);
  const right = normalizeUserId(b);
  return Boolean(left && right && left === right);
}

export function getClientCurrentUserId() {
  if (typeof window === "undefined") return TEST_CURRENT_USER.user_id;

  const params = new URLSearchParams(window.location.search);
  const fromUrl = USER_ID_KEYS.map((key) => normalizeUserId(params.get(key))).find(Boolean) || "";

  if (fromUrl) {
    window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, fromUrl);
    return fromUrl;
  }

  return TEST_CURRENT_USER.user_id;
}

export function buildCurrentUserHref(pathname: string, currentUserId: string) {
  if (!currentUserId) return pathname;
  return `${pathname}?currentUserId=${encodeURIComponent(currentUserId)}`;
}

export async function getRequestCurrentUserId(request: Request, body?: Record<string, unknown>) {
  const headerUserId = USER_ID_HEADERS
    .map((header) => normalizeUserId(request.headers.get(header)))
    .find(Boolean);

  if (headerUserId) return headerUserId;

  const params = new URL(request.url).searchParams;
  const queryUserId = USER_ID_KEYS.map((key) => normalizeUserId(params.get(key))).find(Boolean);

  if (queryUserId) return queryUserId;

  if (!body) return TEST_CURRENT_USER.user_id;

  return (
    USER_ID_KEYS.map((key) => normalizeUserId(body[key])).find(Boolean) ||
    normalizeUserId(body.current_user_id) ||
    normalizeUserId(body.created_by) ||
    TEST_CURRENT_USER.user_id
  );
}
