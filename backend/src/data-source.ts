import { DataSource } from "typeorm";
import { Type } from "./entities/Type";
import { Category } from "./entities/Category";
import { SubCategory } from "./entities/SubCategory";
import { Product } from "./entities/Product";
import { User } from "./entities/User";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";
import { Order } from "./entities/Order";
import { OrderItem } from "./entities/OrderItem";

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "ecommerce.db",
    synchronize: true,
    logging: false,
    entities: [Type, Category, SubCategory, Product, User, Cart, CartItem, Order, OrderItem,],
});