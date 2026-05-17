import { env } from "../env/env";

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    signed: true,
    maxAge: env.SESSION_MAX_AGE_SECONDS,
  };
}

export function getSessionExpiresAt(): Date {
  return new Date(Date.now() + env.SESSION_MAX_AGE_SECONDS * 1000);
}
