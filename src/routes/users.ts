import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { Budget } from "../models/Budget.js";
import { Goal } from "../models/Goal.js";
import { requireAuth, AuthedRequest } from "../middlewares/requireAuth.js";
import { clearSessionCookie } from "../lib/cookies.js";

const router: Router = Router();

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional()
});

router.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Check the name/email and try again." });
  }

  if (parsed.data.email) {
    const existing = await User.findOne({ email: parsed.data.email, _id: { $ne: req.userId } });
    if (existing) {
      return res.status(409).json({ message: "That email is already in use." });
    }
  }

  const user = await User.findByIdAndUpdate(req.userId, parsed.data, { new: true });
  if (!user) {
    return res.status(401).json({ message: "Not signed in." });
  }

  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

router.delete("/me", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  // Cascade delete — remove everything tied to this account, not just the user document.
  await Promise.all([
    Transaction.deleteMany({ userId: req.userId }),
    Budget.deleteMany({ userId: req.userId }),
    Goal.deleteMany({ userId: req.userId }),
    User.findByIdAndDelete(req.userId)
  ]);

  clearSessionCookie(res);
  res.status(204).send();
});

export default router;