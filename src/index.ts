import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import authRouter from "./routes/auth.js";
import transactionsRouter from "./routes/transactions.js";
import budgetsRouter from "./routes/budget.js";
import goalsRouter from "./routes/goals.js";
import usersRouter from "./routes/users.js";
import notificationsRouter from "./routes/notifications.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = process.env.PORT ?? 4000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL?.replace(/\/$/, ""),
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/cairn-[a-z0-9-]+\.vercel\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.json({ name: "Cairn API", status: "ok", health: "/api/health" });
});

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.json({
    workspace: {
      root: process.cwd(),
      uuid: "cairn-api"
    }
  });
});

app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/users", usersRouter);
app.use("/api/notifications", notificationsRouter);

app.use((req, res) => {
  console.error(`Unknown route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Unknown route: ${req.method} ${req.originalUrl}` });
});

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