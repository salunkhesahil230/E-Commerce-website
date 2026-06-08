import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Cart } from "./Cart";
import { Product } from "./Product";

@Entity()
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 1 })
    quantity: number;

    @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
    cart: Cart;

    @ManyToOne(() => Product, (product) => product.cartItems, { onDelete: "CASCADE" })
    product: Product;
}