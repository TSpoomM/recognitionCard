'use client';

import { Component } from "react";
import { withBasePath } from "../lib/basePath";

// hrkpis clears the shared session after 30 minutes with NO real page
// activity (see hrkpis/api/sessionTimeout.php + js/sessionKeepAlive.js), not
// simply "30 minutes since the last page load". Since this app is a
// single-page app that rarely triggers a fresh hrkpis page request, a user
// who stays here actively filling out a card for 30+ minutes must not be
// treated as idle just because hrkpis never saw a new request from them.
//
// This tracks real browser activity (mouse/keyboard/touch/scroll/click) on
// this page and, only while that activity is genuinely happening, pings
// hrkpis directly to refresh the *shared* session's last_activity. A tab
// left open-but-idle does NOT ping, so it still expires on schedule. It also
// keeps its own local idle clock as an immediate backstop: if this page
// itself sees zero interaction for 30 minutes, it redirects to the hrkpis
// login page right away rather than waiting for another server round trip
// to notice.
const IDLE_LIMIT_MS = 30 * 60 * 1000; // keep in sync with hrkpis/api/sessionTimeout.php
const CHECK_INTERVAL_MS = 30_000;
const HRKPIS_KEEPALIVE_URL = process.env.NEXT_PUBLIC_HRKPIS_KEEPALIVE_URL || "/hrkpis/api/keepAlive.php";
const FALLBACK_LOGIN_URL = "/hrkpis/index.php";
const ACTIVITY_EVENTS = ["mousemove", "keydown", "mousedown", "touchstart", "scroll", "click"] as const;

export default class SessionWatcher extends Component {
  private intervalId: number | null = null;
  private lastActivity = Date.now();
  private lastPinged = 0;
  private redirecting = false;

  componentDidMount() {
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, this.markActive, { passive: true });
    });

    this.intervalId = window.setInterval(() => {
      this.tick();
    }, CHECK_INTERVAL_MS);
  }

  componentWillUnmount() {
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.removeEventListener(eventName, this.markActive);
    });
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }
  }

  private markActive = () => {
    this.lastActivity = Date.now();
  };

  private async tick() {
    if (this.redirecting) return;

    const idleFor = Date.now() - this.lastActivity;
    if (idleFor >= IDLE_LIMIT_MS) {
      this.redirectToLogin();
      return;
    }

    if (this.lastActivity > this.lastPinged) {
      this.lastPinged = this.lastActivity;
      fetch(HRKPIS_KEEPALIVE_URL, { credentials: "same-origin" }).catch(() => {});
    }

    // Also catch expiry from any other cause (e.g. logged out of hrkpis in
    // another tab), not just this page's own idle clock.
    try {
      const response = await fetch(withBasePath("/api/session"));
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        this.redirectToLogin(data?.loginUrl);
      }
    } catch {
      // Transient network issue - don't force a redirect on this signal alone.
    }
  }

  private redirectToLogin(loginUrl?: string) {
    if (this.redirecting) return;
    this.redirecting = true;
    window.location.href = loginUrl || FALLBACK_LOGIN_URL;
  }

  render() {
    return null;
  }
}
