import { getClientCurrentUserId } from "./auth/currentUser";
import { withBasePath } from "./basePath";

function send(employeeId: string, action: string) {
  if (!employeeId) return;

  void fetch(withBasePath("/api/log-recognition"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentUserId: employeeId, action }),
    keepalive: true,
  }).catch(() => {
    // Logging must never interrupt the user's primary action.
  });
}

export function logRecognitionAction(action: string, employeeId?: string) {
  const trimmedAction = action.trim();
  if (!trimmedAction) return;

  if (employeeId) {
    send(employeeId, trimmedAction);
  } else {
    getClientCurrentUserId().then((id) => send(id, trimmedAction));
  }
}
