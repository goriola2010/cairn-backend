import { Router } from "express";
import { z } from "zod";
import { Budget } from "../models/Budget";
import { requireAuth, AuthedRequest } from "../middlewares/requireAuth";

const router: Router = Router();

const createSchema = z.object({
  category: z.string().min(1),
  limit: z.number().positive()
});

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }
  const budgets = await Budget.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ budgets });
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Check the category and limit and try again." });
  }

  const budget = await Budget.create({ ...parsed.data, userId: req.userId });
  res.status(201).json({ budget });
});

router.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }

  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid id." });
  }

  const budget = await Budget.findOneAndDelete({ _id: id as any, userId: req.userId } as any);
  if (!budget) {
    return res.status(404).json({ message: "Budget not found." });
  }
  res.status(204).send();
});

export default router;