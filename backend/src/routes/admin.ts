import { Router, Request, Response, NextFunction } from "express";
import { Product } from "../entities/Product";
import { User } from "../entities/User";
import { Order } from "../entities/Order";
import { Type } from "../entities/Type";
import { Category } from "../entities/Category";
import { SubCategory } from "../entities/SubCategory";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import sessionStore from "../sessionStore";
import { AppDataSource } from "../data-source";

const router = Router();

// All admin routes require login + admin role
router.use(authenticate, requireAdmin);

// Multer Setup for Image Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../../ProductImages");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    },
});

const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// TAXONOMY MANAGEMENT

// Add Type
router.post("/types", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: "Type name must be at least 2 characters" });
        }

        const typeRepo = AppDataSource.getRepository(Type);
        const existing = await typeRepo.findOne({ where: { name: name.trim() } });
        if (existing) {
            return res.status(400).json({ message: "Type already exists" });
        }

        const type = typeRepo.create({ name: name.trim() });
        await typeRepo.save(type);
        return res.status(201).json(type);
    } catch (error) {
        next(error);
    }
});

// Add Category
router.post("/categories", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, typeId } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: "Category name must be at least 2 characters" });
        }
        if (!typeId) {
            return res.status(400).json({ message: "Type is required" });
        }

        const typeRepo = AppDataSource.getRepository(Type);
        const categoryRepo = AppDataSource.getRepository(Category);

        const type = await typeRepo.findOne({ where: { id: typeId } });
        if (!type) {
            return res.status(404).json({ message: "Type not found" });
        }

        const category = categoryRepo.create({ name: name.trim(), type });
        await categoryRepo.save(category);
        return res.status(201).json(category);
    } catch (error) {
        next(error);
    }
});

// Add SubCategory
router.post("/subcategories", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, categoryId } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: "SubCategory name must be at least 2 characters" });
        }
        if (!categoryId) {
            return res.status(400).json({ message: "Category is required" });
        }

        const categoryRepo = AppDataSource.getRepository(Category);
        const subCategoryRepo = AppDataSource.getRepository(SubCategory);

        const category = await categoryRepo.findOne({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const subCategory = subCategoryRepo.create({ name: name.trim(), category });
        await subCategoryRepo.save(subCategory);
        return res.status(201).json(subCategory);
    } catch (error) {
        next(error);
    }
});

// PRODUCT MANAGEMENT

// Get All Products
router.get("/products", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const productRepo = AppDataSource.getRepository(Product);
        const [products, total] = await productRepo.findAndCount({
            relations: ["subCategory", "subCategory.category", "subCategory.category.type"],
            skip,
            take: limit,
            order: { createdAt: "DESC" },
        });

        return res.json({ products, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        next(error);
    }
});

// Add Product
router.post("/products", upload.single("image"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, price, stock, subCategoryId } = req.body;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: "Product name must be at least 2 characters" });
        }
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            return res.status(400).json({ message: "Valid price is required" });
        }
        if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
            return res.status(400).json({ message: "Valid stock quantity is required" });
        }
        if (!subCategoryId) {
            return res.status(400).json({ message: "SubCategory is required" });
        }

        const subCategoryRepo = AppDataSource.getRepository(SubCategory);
        const productRepo = AppDataSource.getRepository(Product);

        const subCategory = await subCategoryRepo.findOne({
            where: { id: parseInt(subCategoryId) },
        });

        if (!subCategory) {
            return res.status(404).json({ message: "SubCategory not found" });
        }

        const imagePath = req.file ? req.file.filename : null;

        const product = productRepo.create({
            name: name.trim(),
            description: description?.trim() || "",
            price: parseFloat(price),
            stock: parseInt(stock),
            subCategory,
            imagePath,
        });

        await productRepo.save(product);
        return res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

// Edit Product
router.put("/products/:id", upload.single("image"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = parseInt(req.params.id as string);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const { name, description, price, stock, subCategoryId } = req.body;

        const productRepo = AppDataSource.getRepository(Product);
        const subCategoryRepo = AppDataSource.getRepository(SubCategory);

        const product = await productRepo.findOne({
            where: { id: productId },
            relations: ["subCategory"],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (name) product.name = name.trim();
        if (description !== undefined) product.description = description.trim();
        if (price !== undefined) product.price = parseFloat(price);
        if (stock !== undefined) product.stock = parseInt(stock);

        if (subCategoryId) {
            const subCategory = await subCategoryRepo.findOne({
                where: { id: parseInt(subCategoryId) },
            });
            if (!subCategory) {
                return res.status(404).json({ message: "SubCategory not found" });
            }
            product.subCategory = subCategory;
        }

        if (req.file) {
            if (product.imagePath) {
                const oldImagePath = path.join(__dirname, "../../../ProductImages", product.imagePath);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            product.imagePath = req.file.filename;
        }

        await productRepo.save(product);
        return res.json(product);
    } catch (error) {
        next(error);
    }
});

// Delete Product 
router.delete("/products/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = parseInt(req.params.id as string);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const productRepo = AppDataSource.getRepository(Product);
        const product = await productRepo.findOne({ where: { id: productId } });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.imagePath) {
            const imagePath = path.join(__dirname, "../../../ProductImages", product.imagePath);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await productRepo.remove(product);
        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
});

// CUSTOMER MANAGEMENT

// Get All Customers
router.get("/customers", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const customers = await userRepo.find({
            where: { role: "customer" },
            select: ["id", "name", "email", "isLocked", "createdAt"],
            order: { createdAt: "DESC" },
        });
        return res.json(customers);
    } catch (error) {
        next(error);
    }
});

// Lock / Unlock Customer
router.put("/customers/:id/lock", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = parseInt(req.params.id as string);
        if (isNaN(customerId)) {
            return res.status(400).json({ message: "Invalid customer ID" });
        }

        const { isLocked } = req.body;
        if (typeof isLocked !== "boolean") {
            return res.status(400).json({ message: "isLocked must be true or false" });
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: customerId, role: "customer" } });

        if (!user) {
            return res.status(404).json({ message: "Customer not found" });
        }

        user.isLocked = isLocked;
        await userRepo.save(user);

        if (isLocked) {
            for (const [token, session] of sessionStore.entries()) {
                if (session.userId === customerId) {
                    sessionStore.delete(token);
                }
            }
        }

        return res.json({
            message: isLocked ? "Customer locked successfully" : "Customer unlocked successfully",
        });
    } catch (error) {
        next(error);
    }
});

// ORDER MANAGEMENT

// Get All Orders
router.get("/orders", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const orderRepo = AppDataSource.getRepository(Order);
        const [orders, total] = await orderRepo.findAndCount({
            relations: ["user", "items", "items.product"],
            order: { createdAt: "DESC" },
            skip,
            take: limit,
        });

        return res.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        next(error);
    }
});

// Get Single Order
router.get("/orders/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = parseInt(req.params.id as string);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        const orderRepo = AppDataSource.getRepository(Order);
        const order = await orderRepo.findOne({
            where: { id: orderId },
            relations: ["user", "items", "items.product"],
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json(order);
    } catch (error) {
        next(error);
    }
});

export default router;