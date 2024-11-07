import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Timestamp} from "typeorm";
import { Category } from "./Category";
import { Website } from "./Website";

@Entity()
export class SubCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: "timestamp", nullable: true })
    last_crawled: Date | null; // Set manually when the subcategory is crawled

    @ManyToOne(() => Category, (category) => category.subCategories)
    category: Category;

    @OneToMany(() => Website, (website) => website.subCategory)
    websites: Website[];
}