import { Router } from "express";
import { z } from "zod";
import { Goal } from "../models/Goal.js";
import { Transaction } from "../models/Transaction.js";
import { requireAuth, AuthedRequest } from "../middlewares/requireAuth.js";
import { checkGoalMilestone } from "../lib/notifications.js";

const router: Router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  targetDate: z.string()
});

const contributeSchema = z.object({
  amount: z.number().positive()
});

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }
  const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ goals });
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Check the goal details and try again." });
  }

  const goal = await Goal.create({ ...parsed.data, userId: req.userId, saved: 0 });
  res.status(201).json({ goal });
});

router.patch("/:id/contribute", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const parsed = contributeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Enter a valid contribution amount." });
  }

  const filter: { _id: string; userId: string } = {
    _id: req.params.id as string,
    userId: req.userId
  };

  const goal = await Goal.findOneAndUpdate(
    filter,
    { $inc: { saved: parsed.data.amount } },
    { new: true }
  );

  if (!goal) {
    return res.status(404).json({ message: "Goal not found." });
  }

  const transaction = await Transaction.create({
    userId: req.userId,
    type: "debit",
    amount: parsed.data.amount,
    category: "Savings",
    note: `Contribution to ${goal.name}`,
    date: new Date().toISOString().slice(0, 10)
  });

  res.json({ goal, transaction });

  checkGoalMilestone(req.userId, goal._id.toString()).catch(() => {});
});

router.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const filter: { _id: string; userId: string } = {
    _id: req.params.id as string,
    userId: req.userId
  };

  const goal = await Goal.findOneAndDelete(filter);
  if (!goal) {
    return res.status(404).json({ message: "Goal not found." });
  }
  res.status(204).send();
});

export default router;