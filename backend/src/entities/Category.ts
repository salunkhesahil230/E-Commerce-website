import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Type } from "./Type";
import { SubCategory } from "./SubCategory";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Type, (type) => type.categories, { onDelete: "CASCADE" })
    type: Type;

    @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
    subCategories: SubCategory[];
}