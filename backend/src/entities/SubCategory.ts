import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Category } from "./Category";
import { Product } from "./Product";

@Entity()
export class SubCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Category, (category) => category.subCategories, { onDelete: "CASCADE" })
    category: Category;

    @OneToMany(() => Product, (product) => product.subCategory)
    products: Product[];
}