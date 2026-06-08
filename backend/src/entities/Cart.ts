import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { CartItem } from "./CartItem";

@Entity()
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.cart, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User;

    @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
    items: CartItem[];
}