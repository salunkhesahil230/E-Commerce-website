import { Router, Request, Response, NextFunction } from "express";
import { Type } from "../entities/Type";
import { Category } from "../entities/Category";
import { SubCategory } from "../entities/SubCategory";
import { AppDataSource } from "../data-source";

const router = Router();

// Get All Types
router.get("/types", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const typeRepo = AppDataSource.getRepository(Type);
        const types = await typeRepo.find();
        return res.json(types);
    } catch (error) {
        next(error);
    }
});

// Get Categories by Type
router.get("/categories/:typeId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const typeId = parseInt(req.params.typeId as string);

        if (isNaN(typeId)) {
            return res.status(400).json({ message: "Invalid type ID" });
        }

        const categoryRepo = AppDataSource.getRepository(Category);
        const categories = await categoryRepo.find({
            where: { type: { id: typeId } },
            relations: ["type"],
        });

        return res.json(categories);
    } catch (error) {
        next(error);
    }
});

// Get SubCategories by Category
router.get("/subcategories/:categoryId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = parseInt(req.params.categoryId as string);

        if (isNaN(categoryId)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const subCategoryRepo = AppDataSource.getRepository(SubCategory);
        const subCategories = await subCategoryRepo.find({
            where: { category: { id: categoryId } },
            relations: ["category"],
        });

        return res.json(subCategories);
    } catch (error) {
        next(error);
    }
});

// Get Full Taxonomy Tree
router.get("/tree", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const typeRepo = AppDataSource.getRepository(Type);
        const tree = await typeRepo.find({
            relations: [
                "categories",
                "categories.subCategories",
            ],
        });
        return res.json(tree);
    } catch (error) {
        next(error);
    }
});

export default router;