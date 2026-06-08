import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import { SubCategory } from "./SubCategory";
import { CartItem } from "./CartItem";
import { OrderItem } from "./OrderItem";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    price: number;

    @Column({ default: 0 })
    stock: number;

    @Column({ nullable: true })
    imagePath: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, { onDelete: "CASCADE" })
    subCategory: SubCategory;

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];

    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    orderItems: OrderItem[];
}