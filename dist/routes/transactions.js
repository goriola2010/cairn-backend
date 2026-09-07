"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Transaction_1 = require("../models/Transaction");
const requireAuth_1 = require("../middlewares/requireAuth");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    type: zod_1.z.enum(["debit", "credit"]),
    amount: zod_1.z.number().positive(),
    category: zod_1.z.string().min(1),
    note: zod_1.z.string().optional(),
    date: zod_1.z.string()
});
router.get("/", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const filter = { userId: req.userId };
    if (req.query.type === "debit" || req.query.type === "credit") {
        filter.type = req.query.type;
    }
    const transactions = await Transaction_1.Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json({ transactions });
});
router.post("/", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Check the transaction details and try again." });
    }
    const transaction = await Transaction_1.Transaction.create({
        userId: req.userId,
        type: parsed.data.type,
        amount: parsed.data.amount,
        category: parsed.data.category,
        date: parsed.data.date,
        ...(parsed.data.note ? { note: parsed.data.note } : {})
    });
    res.status(201).json({ transaction });
});
router.delete("/:id", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const transactionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!transactionId) {
        return res.status(400).json({ message: "Transaction id is required." });
    }
    const transaction = await Transaction_1.Transaction.findOneAndDelete({ _id: transactionId, userId: req.userId });
    if (!transaction) {
        return res.status(404).json({ message: "Transaction not found." });
    }
    res.status(204).send();
});
exports.default = router;
//# sourceMappingURL=transactions.js.map