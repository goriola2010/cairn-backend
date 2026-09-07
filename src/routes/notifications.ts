import { Router } from "express";
import { Notification } from "../models/Notification";
import { requireAuth, AuthedRequest } from "../middlewares/requireAuth";

const router: Router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }
  const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ notifications });
});

router.get("/unread-count", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }
  const count = await Notification.countDocuments({ userId: req.userId, read: false });
  res.json({ count });
});

router.patch("/:id/read", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id as any, userId: req.userId } as any,
    { read: true },
    { new: true }
  );
  if (!notification) {
    return res.status(404).json({ message: "Notification not found." });
  }
  res.json({ notification });
});

router.patch("/read-all", requireAuth, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not signed in." });
  }
  await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
  res.json({ ok: true });
});

export default router;
