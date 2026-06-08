import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { OrderItem } from "./OrderItem";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    paymentMethod: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ default: "confirmed" })
    status: string;

    @ManyToOne(() => User, (user) => user.orders, { onDelete: "CASCADE" })
    user: User;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
    items: OrderItem[];
}