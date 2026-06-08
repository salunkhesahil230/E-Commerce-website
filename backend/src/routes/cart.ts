import { Router, Request, Response, NextFunction } from "express";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { Product } from "../entities/Product";
import { authenticate, requireCustomer } from "../middleware/authMiddleware";
import { AppDataSource } from "../data-source";

const router = Router();

// All cart routes require login
router.use(authenticate, requireCustomer);

// Get Cart
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const cartRepo = AppDataSource.getRepository(Cart);

        const cart = await cartRepo.findOne({
            where: { user: { id: userId } },
            relations: ["items", "items.product", "items.product.subCategory",
                "items.product.subCategory.category",
                "items.product.subCategory.category.type"],
        });

        if (!cart) {
            return res.json({ items: [] });
        }

        return res.json(cart);
    } catch (error) {
        next(error);
    }
});

// Add to Cart
router.post("/add", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const productRepo = AppDataSource.getRepository(Product);
        const cartRepo = AppDataSource.getRepository(Cart);
        const cartItemRepo = AppDataSource.getRepository(CartItem);

        // Check product exists and has stock
        const product = await productRepo.findOne({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        // Get user cart
        const cart = await cartRepo.findOne({
            where: { user: { id: userId } },
            relations: ["items", "items.product"],
        });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Check if product already in cart
        const existingItem = cart.items?.find(
            (item) => item.product.id === productId
        );

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            if (product.stock < newQuantity) {
                return res.status(400).json({ message: "Insufficient stock" });
            }
            existingItem.quantity = newQuantity;
            await cartItemRepo.save(existingItem);
        } else {
            // Add new item
            const cartItem = cartItemRepo.create({
                cart,
                product,
                quantity,
            });
            await cartItemRepo.save(cartItem);
        }

        return res.json({ message: "Product added to cart" });
    } catch (error) {
        next(error);
    }
});

// Update Cart Item Quantity
router.put("/update/:itemId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const itemId = parseInt(req.params.itemId as string);
        const { quantity } = req.body;

        if (isNaN(itemId)) {
            return res.status(400).json({ message: "Invalid item ID" });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const cartItemRepo = AppDataSource.getRepository(CartItem);

        const cartItem = await cartItemRepo.findOne({
            where: { id: itemId },
            relations: ["cart", "cart.user", "product"],
        });

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        // Make sure item belongs to this user
        if (cartItem.cart.user.id !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (cartItem.product.stock < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        cartItem.quantity = quantity;
        await cartItemRepo.save(cartItem);

        return res.json({ message: "Cart updated" });
    } catch (error) {
        next(error);
    }
});

// Remove Cart Item
router.delete("/remove/:itemId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const itemId = parseInt(req.params.itemId as string);

        if (isNaN(itemId)) {
            return res.status(400).json({ message: "Invalid item ID" });
        }

        const cartItemRepo = AppDataSource.getRepository(CartItem);

        const cartItem = await cartItemRepo.findOne({
            where: { id: itemId },
            relations: ["cart", "cart.user"],
        });

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        if (cartItem.cart.user.id !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await cartItemRepo.remove(cartItem);

        return res.json({ message: "Item removed from cart" });
    } catch (error) {
        next(error);
    }
});

// Clear Cart
router.delete("/clear", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const cartRepo = AppDataSource.getRepository(Cart);
        const cartItemRepo = AppDataSource.getRepository(CartItem);

        const cart = await cartRepo.findOne({
            where: { user: { id: userId } },
            relations: ["items"],
        });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        await cartItemRepo.remove(cart.items);

        return res.json({ message: "Cart cleared" });
    } catch (error) {
        next(error);
    }
});

export default router;