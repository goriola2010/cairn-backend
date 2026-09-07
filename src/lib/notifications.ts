import { Notification } from "../models/Notification";
import { Budget } from "../models/Budget";
import { Transaction } from "../models/Transaction";
import { Goal } from "../models/Goal";

const MILESTONES = [25, 50, 75, 100] as const;

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "budget_alert" | "goal_milestone" | "welcome"
) {
  return Notification.create({ userId, title, message, type });
}

export async function sendWelcomeNotification(userId: string) {
  await createNotification(
    userId,
    "Welcome to Cairn",
    "Start tracking your finances by adding your first transaction.",
    "welcome"
  );
}

export async function checkBudgetAlert(userId: string, category: string) {
  const budget = await Budget.findOne({ userId, category });
  if (!budget) return;

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;

  const result = await Transaction.aggregate([
    {
      $match: {
        userId: budget.userId,
        type: "debit",
        category,
        date: { $gte: monthStart, $lte: monthEnd }
      }
    },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const spent = result[0]?.total ?? 0;
  const pct = (spent / budget.limit) * 100;
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  if (pct >= 100) {
    const alreadySent = await Notification.findOne({
      userId,
      type: "budget_alert",
      message: { $regex: `${category}.*100%|${category}.*over` },
      createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) }
    });
    if (!alreadySent) {
      await createNotification(
        userId,
        "Budget exceeded",
        `You've spent ₦${spent.toLocaleString()} of your ₦${budget.limit.toLocaleString()} ${category} budget this month — that's over the limit.`,
        "budget_alert"
      );
    }
  } else if (pct >= 80) {
    const alreadySent = await Notification.findOne({
      userId,
      type: "budget_alert",
      message: { $regex: `${category}.*80%` },
      createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) }
    });
    if (!alreadySent) {
      await createNotification(
        userId,
        "Budget alert",
        `You've spent ${Math.round(pct)}% of your ${category} budget this month (₦${spent.toLocaleString()} of ₦${budget.limit.toLocaleString()}).`,
        "budget_alert"
      );
    }
  }
}

export async function checkGoalMilestone(userId: string, goalId: string) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal || goal.targetAmount <= 0) return;

  const pct = Math.round((goal.saved / goal.targetAmount) * 100);

  for (const threshold of MILESTONES) {
    if (pct >= threshold) {
      const alreadySent = await Notification.findOne({
        userId,
        type: "goal_milestone",
        message: { $regex: `${goal.name}.*${threshold}%` }
      });
      if (!alreadySent) {
        const title = threshold === 100 ? "Goal reached!" : "Goal milestone";
        const message =
          threshold === 100
            ? `Congratulations! Your "${goal.name}" goal is fully funded at ₦${goal.targetAmount.toLocaleString()}.`
            : `Your "${goal.name}" savings goal is now ${threshold}% complete (₦${goal.saved.toLocaleString()} of ₦${goal.targetAmount.toLocaleString()}).`;
        await createNotification(userId, title, message, "goal_milestone");
      }
    }
  }
}
