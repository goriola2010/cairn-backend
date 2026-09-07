"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("dotenv/config");
const db_1 = require("./lib/db");
const auth_1 = __importDefault(require("./routes/auth"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const budget_1 = __importDefault(require("./routes/budget"));
const goals_1 = __importDefault(require("./routes/goals"));
const users_1 = __importDefault(require("./routes/users"));
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(["8.8.8.8", "8.8.4.4"]);
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 4000;
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});
app.use("/api/auth", auth_1.default);
app.use("/api/transactions", transactions_1.default);
app.use("/api/budgets", budget_1.default);
app.use("/api/goals", goals_1.default);
app.use("/api/users", users_1.default);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Something went wrong on our end." });
});
(0, db_1.connectDB)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Cairn API running on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
});
//# sourceMappingURL=index.js.map