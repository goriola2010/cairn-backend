import { Router } from "express";
import { z } from "zod";
import { Transaction } from "../models/Transaction.js";
import { requireAuth, AuthedRequest } from "../middlewares/requireAuth.js";
import { checkBudgetAlert } from "../lib/notifications.js";

const router: Router = Router();

const createSchema = z.object({
  type: z.enum(["debit", "credit"]),
  amount: z.number().positive(),
  category: z.string().min(1),
  note: z.string().optional(),
  date: z.string()
});

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const filter: { userId: string; type?: "debit" | "credit" } = { userId: req.userId };
  if (req.query.type === "debit" || req.query.type === "credit") {
    filter.type = req.query.type;
  }

  const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
  res.json({ transactions });
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Check the transaction details and try again." });
  }

  const transaction = await Transaction.create({
    userId: req.userId,
    type: parsed.data.type,
    amount: parsed.data.amount,
    category: parsed.data.category,
    date: parsed.data.date,
    ...(parsed.data.note ? { note: parsed.data.note } : {})
  });

  if (parsed.data.type === "debit") {
    checkBudgetAlert(req.userId, parsed.data.category).catch(() => {});
  }

  res.status(201).json({ transaction });
});

router.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const transactionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!transactionId) {
    return res.status(400).json({ message: "Transaction id is required." });
  }

  const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId: req.userId });
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found." });
  }
  res.status(204).send();
});

export default router;