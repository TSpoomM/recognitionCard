import { getClientCurrentUserId } from "./currentUser";

export function logRecognitionAction(action: string, employeeId = getClientCurrentUserId()) {
  if (!employeeId || !action.trim()) return;

  void fetch("/api/log-recognition", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentUserId: employeeId, action: action.trim() }),
    keepalive: true,
  }).catch(() => {
    // Logging must never interrupt the user's primary action.
  });
}
