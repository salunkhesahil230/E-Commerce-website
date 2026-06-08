import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User } from "../entities/User";
import { Cart } from "../entities/Cart";
import sessionStore from "../sessionStore";
import { authenticate } from "../middleware/authMiddleware";
import { AppDataSource } from "../data-source";

const router = Router();

// Register
router.post("/register", async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const userRepo = AppDataSource.getRepository(User);
        const cartRepo = AppDataSource.getRepository(Cart);

        // Check if email already exists
        const existing = await userRepo.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = userRepo.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "customer",
        });

        await userRepo.save(user);

        // Create cart for user
        const cart = cartRepo.create({ user });
        await cartRepo.save(cart);

        return res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Registration failed. Please try again." });
    }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.isLocked) {
            return res.status(403).json({ message: "Your account has been locked. Please contact support." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Create session token
        const token = uuidv4();
        sessionStore.set(token, {
            userId: user.id,
            role: user.role,
            email: user.email,
        });

        // Set HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Login failed. Please try again." });
    }
});

// Logout
router.post("/logout", authenticate, (req: Request, res: Response) => {
    const token = req.cookies?.token;
    if (token) {
        sessionStore.delete(token);
    }
    res.clearCookie("token");
    return res.json({ message: "Logged out successfully" });
});

// Get Current User
router.get("/me", authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to get user info" });
    }
});

// Forgot Password
router.post("/forgot-password", async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.resetCode = code;
        user.resetCodeExpiry = expiry;
        await userRepo.save(user);

        return res.json({
            message: "Reset code generated",
            code: code,
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to generate reset code" });
    }
});

// Reset Password
router.post("/reset-password", async (req: Request, res: Response) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.resetCode || user.resetCode !== code) {
            return res.status(400).json({ message: "Invalid reset code" });
        }

        if (!user.resetCodeExpiry || Date.now() > user.resetCodeExpiry) {
            return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.resetCode = null;
        user.resetCodeExpiry = null;
        await userRepo.save(user);

        return res.json({ message: "Password reset successful. Please login." });
    } catch (error) {
        return res.status(500).json({ message: "Failed to reset password" });
    }
});

// Update Profile
router.put("/profile", authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const userRepo = AppDataSource.getRepository(User);

        // Check if email taken by another user
        const existing = await userRepo.findOne({
            where: { email: email.toLowerCase().trim() },
        });

        if (existing && existing.id !== userId) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = name.trim();
        user.email = email.toLowerCase().trim();
        await userRepo.save(user);

        return res.json({
            message: "Profile updated successfully",
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update profile" });
    }
});

// Change Password
router.put("/change-password", authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await userRepo.save(user);

        return res.json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to change password" });
    }
});

export default router;