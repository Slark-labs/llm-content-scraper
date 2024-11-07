import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SubCategory } from "./SubCategory";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
    subCategories: SubCategory[];
}