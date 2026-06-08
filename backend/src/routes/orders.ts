import { Router, Request, Response, NextFunction } from "express";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { Product } from "../entities/Product";
import { authenticate, requireCustomer } from "../middleware/authMiddleware";
import { AppDataSource } from "../data-source";

const router = Router();

router.use(authenticate, requireCustomer);

// Place Order
router.post("/place", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { paymentMethod } = req.body;

        const validPaymentMethods = ["Credit Card", "Debit Card", "Cash on Delivery", "Bank Transfer"];
        if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({ message: "Valid payment method is required" });
        }

        const cartRepo = AppDataSource.getRepository(Cart);
        const orderRepo = AppDataSource.getRepository(Order);
        const orderItemRepo = AppDataSource.getRepository(OrderItem);
        const cartItemRepo = AppDataSource.getRepository(CartItem);
        const productRepo = AppDataSource.getRepository(Product);

        // Get cart with items
        const cart = await cartRepo.findOne({
            where: { user: { id: userId } },
            relations: ["items", "items.product"],
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }

        // Check stock for all items
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${item.product.name}`,
                });
            }
        }

        // Calculate total
        let totalAmount = 0;
        for (const item of cart.items) {
            totalAmount += Number(item.product.price) * item.quantity;
        }

        // Create order
        const order = orderRepo.create({
            user: { id: userId },
            paymentMethod,
            totalAmount,
            status: "confirmed",
        });

        const savedOrder = await orderRepo.save(order);

        // Create order items with price snapshot
        for (const item of cart.items) {
            const orderItem = orderItemRepo.create({
                order: savedOrder,
                product: item.product,
                quantity: item.quantity,
                priceAtPurchase: item.product.price,
            });
            await orderItemRepo.save(orderItem);

            // Deduct stock
            item.product.stock -= item.quantity;
            await productRepo.save(item.product);
        }

        // Clear cart
        await cartItemRepo.remove(cart.items);

        // Return order with items
        const fullOrder = await orderRepo.findOne({
            where: { id: savedOrder.id },
            relations: ["items", "items.product"],
        });

        return res.status(201).json({
            message: "Order placed successfully",
            order: fullOrder,
        });
    } catch (error) {
        next(error);
    }
});

// Get My Orders
router.get("/my-orders", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const orderRepo = AppDataSource.getRepository(Order);

        const orders = await orderRepo.find({
            where: { user: { id: userId } },
            relations: ["items", "items.product"],
            order: { createdAt: "DESC" },
        });

        return res.json(orders);
    } catch (error) {
        next(error);
    }
});

// Get Single Order
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const orderId = parseInt(req.params.id as string);

        if (isNaN(orderId)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        const orderRepo = AppDataSource.getRepository(Order);

        const order = await orderRepo.findOne({
            where: { id: orderId, user: { id: userId } },
            relations: ["items", "items.product"],
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