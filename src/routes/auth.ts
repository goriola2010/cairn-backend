import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth, AuthedRequest } from "../middlewares/requireAuth.js";
import { sendWelcomeNotification } from "../lib/notifications.js";
import { setSessionCookie, clearSessionCookie } from "../lib/cookies.js";

const router: ReturnType<typeof Router> = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(7)
});

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Check your name, email, and password." });
  }
  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
  setSessionCookie(res, token);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });

  sendWelcomeNotification(user.id).catch(() => {});
});

router.post("/signin", async (req, res) => {
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Enter a valid email and password." });
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "That email or password isn't right." });
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
  setSessionCookie(res, token);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/signout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).send();
});

const verifyPasswordSchema = z.object({
  password: z.string().min(7)
});

router.post("/verify-password", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const parsed = verifyPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Enter your current password." });
  }

  const user = await User.findById(req.userId);
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(400).json({ message: "That isn't your current password." });
  }

  res.json({ ok: true });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(7),
  newPassword: z.string().min(8)
});

router.post("/change-password", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Current password is required and the new password must be at least 8 characters." });
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(401).json({ message: "Not signed in." });
  }
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(400).json({ message: "Your current password isn't right." });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(req.userId, { passwordHash });

  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(401).json({ message: "Not signed in." });
  }
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

export default router;