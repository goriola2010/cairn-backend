import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { connectDB } from "./lib/db";
import authRouter from "./routes/auth";
import transactionsRouter from "./routes/transactions";
import budgetsRouter from "./routes/budget";
import goalsRouter from "./routes/goals";
import usersRouter from "./routes/users";
import notificationsRouter from "./routes/notifications";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/users", usersRouter);
app.use("/api/notifications", notificationsRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on our end." });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Cairn API running on http://localhost:${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });