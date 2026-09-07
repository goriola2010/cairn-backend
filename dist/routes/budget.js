"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Budget_1 = require("../models/Budget");
const requireAuth_1 = require("../middlewares/requireAuth");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    category: zod_1.z.string().min(1),
    limit: zod_1.z.number().positive()
});
router.get("/", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const budgets = await Budget_1.Budget.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ budgets });
});
router.post("/", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Check the category and limit and try again." });
    }
    const budget = await Budget_1.Budget.create({ ...parsed.data, userId: req.userId });
    res.status(201).json({ budget });
});
router.delete("/:id", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: "Invalid id." });
    }
    const budget = await Budget_1.Budget.findOneAndDelete({ _id: id, userId: req.userId });
    if (!budget) {
        return res.status(404).json({ message: "Budget not found." });
    }
    res.status(204).send();
});
exports.default = router;
//# sourceMappingURL=budget.js.map