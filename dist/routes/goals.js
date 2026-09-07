"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Goal_1 = require("../models/Goal");
const Transaction_1 = require("../models/Transaction");
const requireAuth_1 = require("../middlewares/requireAuth");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    targetAmount: zod_1.z.number().positive(),
    targetDate: zod_1.z.string()
});
const contributeSchema = zod_1.z.object({
    amount: zod_1.z.number().positive()
});
router.get("/", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const goals = await Goal_1.Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ goals });
});
router.post("/", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Check the goal details and try again." });
    }
    const goal = await Goal_1.Goal.create({ ...parsed.data, userId: req.userId, saved: 0 });
    res.status(201).json({ goal });
});
router.patch("/:id/contribute", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const parsed = contributeSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Enter a valid contribution amount." });
    }
    const filter = {
        _id: req.params.id,
        userId: req.userId
    };
    const goal = await Goal_1.Goal.findOneAndUpdate(filter, { $inc: { saved: parsed.data.amount } }, { new: true });
    if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
    }
    const transaction = await Transaction_1.Transaction.create({
        userId: req.userId,
        type: "debit",
        amount: parsed.data.amount,
        category: "Savings",
        note: `Contribution to ${goal.name}`,
        date: new Date().toISOString().slice(0, 10)
    });
    res.json({ goal, transaction });
});
router.delete("/:id", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const filter = {
        _id: req.params.id,
        userId: req.userId
    };
    const goal = await Goal_1.Goal.findOneAndDelete(filter);
    if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
    }
    res.status(204).send();
});
exports.default = router;
//# sourceMappingURL=goals.js.map