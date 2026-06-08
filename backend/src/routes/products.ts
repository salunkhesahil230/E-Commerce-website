import { Router, Request, Response } from "express";
import { Product } from "../entities/Product";
import { SubCategory } from "../entities/SubCategory";
import { Category } from "../entities/Category";
import { Type } from "../entities/Type";
import { AppDataSource } from "../data-source";

const router = Router();

// Get All Products (Homepage)
router.get("/", async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const productRepo = AppDataSource.getRepository(Product);

        const [products, total] = await productRepo.findAndCount({
            relations: ["subCategory", "subCategory.category", "subCategory.category.type"],
            skip,
            take: limit,
            order: { createdAt: "DESC" },
        });

        return res.json({
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Get products error:", error);
        return res.status(500).json({ message: "Failed to fetch products" });
    }
});

// Search Products
router.get("/search", async (req: Request, res: Response) => {
    try {
        const keyword = (req.query.keyword as string) || "";
        const typeId = req.query.typeId as string;
        const categoryId = req.query.categoryId as string;
        const subCategoryId = req.query.subCategoryId as string;
        const minPrice = req.query.minPrice as string;
        const maxPrice = req.query.maxPrice as string;
        const inStock = req.query.inStock as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const productRepo = AppDataSource.getRepository(Product);

        let query = productRepo.createQueryBuilder("product")
            .leftJoinAndSelect("product.subCategory", "subCategory")
            .leftJoinAndSelect("subCategory.category", "category")
            .leftJoinAndSelect("category.type", "type");

        // Full text search across name and description
        if (keyword.trim()) {
            query = query.andWhere(
                "(LOWER(product.name) LIKE LOWER(:keyword) OR LOWER(product.description) LIKE LOWER(:keyword))",
                { keyword: `%${keyword.trim()}%` }
            );
        }

        // Filter by taxonomy
        if (subCategoryId) {
            query = query.andWhere("subCategory.id = :subCategoryId", { subCategoryId });
        } else if (categoryId) {
            query = query.andWhere("category.id = :categoryId", { categoryId });
        } else if (typeId) {
            query = query.andWhere("type.id = :typeId", { typeId });
        }

        // Filter by price range
        if (minPrice) {
            query = query.andWhere("product.price >= :minPrice", { minPrice: parseFloat(minPrice) });
        }
        if (maxPrice) {
            query = query.andWhere("product.price <= :maxPrice", { maxPrice: parseFloat(maxPrice) });
        }

        // Filter by stock
        if (inStock === "true") {
            query = query.andWhere("product.stock > 0");
        }

        const [products, total] = await query
            .skip(skip)
            .take(limit)
            .orderBy("product.createdAt", "DESC")
            .getManyAndCount();

        return res.json({
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ message: "Search failed" });
    }
});

// Get Single Product
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const productRepo = AppDataSource.getRepository(Product);
        const product = await productRepo.findOne({
            where: { id },
            relations: ["subCategory", "subCategory.category", "subCategory.category.type"],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json(product);
    } catch (error) {
        console.error("Get product error:", error);
        return res.status(500).json({ message: "Failed to fetch product" });
    }
});

// Browse by SubCategory 
router.get("/browse/subcategory/:subCategoryId", async (req: Request, res: Response) => {
    try {
        const subCategoryId = parseInt(req.params.subCategoryId as string);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;
        const minPrice = req.query.minPrice as string;
        const maxPrice = req.query.maxPrice as string;
        const inStock = req.query.inStock as string;

        if (isNaN(subCategoryId)) {
            return res.status(400).json({ message: "Invalid subcategory ID" });
        }

        const productRepo = AppDataSource.getRepository(Product);

        let query = productRepo
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.subCategory", "subCategory")
            .leftJoinAndSelect("subCategory.category", "category")
            .leftJoinAndSelect("category.type", "type")
            .where("subCategory.id = :subCategoryId", { subCategoryId });

        if (minPrice) {
            query = query.andWhere("product.price >= :minPrice", { minPrice: parseFloat(minPrice) });
        }
        if (maxPrice) {
            query = query.andWhere("product.price <= :maxPrice", { maxPrice: parseFloat(maxPrice) });
        }
        if (inStock === "true") {
            query = query.andWhere("product.stock > 0");
        }

        const [products, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return res.json({
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch products" });
    }
});

// Browse by Category
router.get("/browse/category/:categoryId", async (req: Request, res: Response) => {
    try {
        const categoryId = parseInt(req.params.categoryId as string);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        if (isNaN(categoryId)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const productRepo = AppDataSource.getRepository(Product);

        const [products, total] = await productRepo
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.subCategory", "subCategory")
            .leftJoinAndSelect("subCategory.category", "category")
            .leftJoinAndSelect("category.type", "type")
            .where("category.id = :categoryId", { categoryId })
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return res.json({
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch products" });
    }
});

// Browse by Type
router.get("/browse/type/:typeId", async (req: Request, res: Response) => {
    try {
        const typeId = parseInt(req.params.typeId as string);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        if (isNaN(typeId)) {
            return res.status(400).json({ message: "Invalid type ID" });
        }

        const productRepo = AppDataSource.getRepository(Product);

        const [products, total] = await productRepo
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.subCategory", "subCategory")
            .leftJoinAndSelect("subCategory.category", "category")
            .leftJoinAndSelect("category.type", "type")
            .where("type.id = :typeId", { typeId })
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return res.json({
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch products" });
    }
});

export default router;