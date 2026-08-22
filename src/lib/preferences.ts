// Single first-party cookie holding all client-side UI preferences.
//
// The cookie value is URL-encoded JSON. This module is framework-agnostic:
// `parsePreferences` is pure and safe to call on the server (pass the value
// from `next/headers` cookies()), while the get/set helpers touch
// `document.cookie` and are only meant for client components.

export const PREFERENCES_COOKIE_NAME = "app_pref";
const PREFERENCES_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const PREFERENCES_COOKIE_PATTERN = /(?:^|;\s*)app_pref=([^;]+)/;

export type LastAuthMethod = "google" | "email";

export interface Preferences {
  lastAuthMethod: LastAuthMethod | null;
  termsAgreed: boolean;
}

export const defaultPreferences: Preferences = {
  termsAgreed: false,
  lastAuthMethod: null,
};

function parseLastAuthMethod(value: unknown): LastAuthMethod | null {
  return value === "google" || value === "email" ? value : null;
}

// Pure parser usable on both server and client.
export function parsePreferences(raw: string | undefined | null): Preferences {
  if (!raw) {
    return { ...defaultPreferences };
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return {
      termsAgreed: parsed?.termsAgreed === true,
      lastAuthMethod: parseLastAuthMethod(parsed?.lastAuthMethod),
    };
  } catch {
    return { ...defaultPreferences };
  }
}

function readRawCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(PREFERENCES_COOKIE_PATTERN);
  return match ? match[1] : null;
}

function writePreferences(preferences: Preferences): void {
  if (typeof document === "undefined") {
    return;
  }
  const value = encodeURIComponent(JSON.stringify(preferences));
  // biome-ignore lint/suspicious/noDocumentCookie: first-party preference cookie needs broad browser support (Cookie Store API lacks Safari/Firefox)
  document.cookie = `${PREFERENCES_COOKIE_NAME}=${value}; Path=/; Max-Age=${PREFERENCES_COOKIE_MAX_AGE}; SameSite=Lax`;
}

// Client-side: read the full preferences object from document.cookie.
export function getPreferences(): Preferences {
  return parsePreferences(readRawCookie());
}

export function getPreference<K extends keyof Preferences>(
  key: K
): Preferences[K] {
  return getPreferences()[key];
}

// Client-side: merge a single preference into the existing cookie and persist.
export function setPreference<K extends keyof Preferences>(
  key: K,
  value: Preferences[K]
): void {
  writePreferences({ ...getPreferences(), [key]: value });
}
