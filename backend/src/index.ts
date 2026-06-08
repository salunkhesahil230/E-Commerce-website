import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";

// Routes
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import taxonomyRoutes from "./routes/taxonomy";
import { AppDataSource } from "./data-source";

const app = express();
const PORT = 3000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // disabled so Angular app loads fine
}));

app.use(cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { message: "Too many attempts. Please try again later." },
});

// Static Files 
app.use("/ProductImages", express.static(path.join(__dirname, "../../ProductImages")));

// API Routes 
app.use("/api/auth", loginLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/taxonomy", taxonomyRoutes);

// ─── Global Error Handler ──────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error:", err.message || err);
    const statusCode = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === "production" ? "Something went wrong. Please try again." : err.message || "Internal server error";
    return res.status(statusCode).json({ message });
});

// Serve Angular Frontend
const frontendPath = path.join(__dirname, "../../frontend/dist/frontend/browser");
app.use(express.static(frontendPath));

app.get("/{*path}", (req, res) => {
    if (req.path.startsWith("/api")) {
        return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Start Server
AppDataSource.initialize()
    .then(() => {
        console.log("Database connected successfully");
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });