import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, CreateDateColumn } from "typeorm";
import { Cart } from "./Cart";
import { Order } from "./Order";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: "customer" })
    role: string; // "customer" or "admin"

    @Column({ default: false })
    isLocked: boolean;

    @Column({ nullable: true })
    resetCode: string;

    @Column({ nullable: true, type: "integer" })
    resetCodeExpiry: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => Cart, (cart) => cart.user)
    cart: Cart;

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];
}