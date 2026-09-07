"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const requireAuth_1 = require("../middlewares/requireAuth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8)
});
const signinSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(7)
});
router.post("/signup", async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Check your name, email, and password." });
    }
    const { name, email, password } = parsed.data;
    const existing = await User_1.User.findOne({ email });
    if (existing) {
        return res.status(409).json({ message: "An account with that email already exists." });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.User.create({ name, email, passwordHash });
    const token = jsonwebtoken_1.default.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("cairn_session", token, { httpOnly: true, sameSite: "lax" });
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
});
router.post("/signin", async (req, res) => {
    const parsed = signinSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Enter a valid email and password." });
    }
    const { email, password } = parsed.data;
    const user = await User_1.User.findOne({ email });
    if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: "That email or password isn't right." });
    }
    const token = jsonwebtoken_1.default.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("cairn_session", token, { httpOnly: true, sameSite: "lax" });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
});
router.post("/signout", (_req, res) => {
    res.clearCookie("cairn_session");
    res.status(204).send();
});
const verifyPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(7)
});
router.post("/verify-password", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const parsed = verifyPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Enter your current password." });
    }
    const user = await User_1.User.findById(req.userId);
    if (!user || !(await bcryptjs_1.default.compare(parsed.data.password, user.passwordHash))) {
        return res.status(400).json({ message: "That isn't your current password." });
    }
    res.json({ ok: true });
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(7),
    newPassword: zod_1.z.string().min(8)
});
router.post("/change-password", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Current password is required and the new password must be at least 8 characters." });
    }
    const { currentPassword, newPassword } = parsed.data;
    const user = await User_1.User.findById(req.userId);
    if (!user) {
        return res.status(401).json({ message: "Not signed in." });
    }
    if (!(await bcryptjs_1.default.compare(currentPassword, user.passwordHash))) {
        return res.status(400).json({ message: "Your current password isn't right." });
    }
    const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
    await User_1.User.findByIdAndUpdate(req.userId, { passwordHash });
    res.json({ ok: true });
});
router.get("/me", requireAuth_1.requireAuth, async (req, res) => {
    const user = await User_1.User.findById(req.userId);
    if (!user) {
        return res.status(401).json({ message: "Not signed in." });
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
});
exports.default = router;
//# sourceMappingURL=auth.js.map