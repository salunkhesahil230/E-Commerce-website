import { Request, Response, NextFunction } from "express";
import sessionStore from "../sessionStore";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const session = sessionStore.get(token);

        if (!session) {
            res.clearCookie("token");
            return res.status(401).json({ message: "Session expired. Please login again." });
        }

        // Check if user is locked
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: session.userId } });

        if (!user) {
            sessionStore.delete(token);
            res.clearCookie("token");
            return res.status(401).json({ message: "User not found" });
        }

        if (user.isLocked) {
            sessionStore.delete(token);
            res.clearCookie("token");
            return res.status(403).json({ message: "Your account has been locked. Please contact support." });
        }

        // Attach user info to request
        (req as any).user = {
            id: session.userId,
            role: session.role,
            email: session.email,
        };

        next();
    } catch (error) {
        return res.status(500).json({ message: "Authentication error" });
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

export const requireCustomer = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || (user.role !== "customer" && user.role !== "admin")) {
        return res.status(403).json({ message: "Customer access required" });
    }
    next();
};