"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const User_1 = require("../models/User");
const Transaction_1 = require("../models/Transaction");
const Budget_1 = require("../models/Budget");
const Goal_1 = require("../models/Goal");
const requireAuth_1 = require("../middlewares/requireAuth");
const router = (0, express_1.Router)();
const updateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional()
});
router.patch("/me", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Check the name/email and try again." });
    }
    if (parsed.data.email) {
        const existing = await User_1.User.findOne({ email: parsed.data.email, _id: { $ne: req.userId } });
        if (existing) {
            return res.status(409).json({ message: "That email is already in use." });
        }
    }
    const user = await User_1.User.findByIdAndUpdate(req.userId, parsed.data, { new: true });
    if (!user) {
        return res.status(401).json({ message: "Not signed in." });
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
});
router.delete("/me", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not signed in." });
    }
    // Cascade delete — remove everything tied to this account, not just the user document.
    await Promise.all([
        Transaction_1.Transaction.deleteMany({ userId: req.userId }),
        Budget_1.Budget.deleteMany({ userId: req.userId }),
        Goal_1.Goal.deleteMany({ userId: req.userId }),
        User_1.User.findByIdAndDelete(req.userId)
    ]);
    res.clearCookie("cairn_session");
    res.status(204).send();
});
exports.default = router;
//# sourceMappingURL=users.js.map