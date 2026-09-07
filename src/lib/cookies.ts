import { Response } from "express";

const isProd = process.env.NODE_ENV === "production";

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: isProd ? "none" : "lax",
  secure: isProd,
  partitioned: isProd
} as const;

export function setSessionCookie(res: Response, token: string) {
  res.cookie("cairn_session", token, sessionCookieOptions);
}

export function clearSessionCookie(res: Response) {
  res.clearCookie("cairn_session", sessionCookieOptions);
}