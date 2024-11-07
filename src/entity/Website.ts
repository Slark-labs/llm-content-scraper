import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from "typeorm";
import {SubCategory} from "./SubCategory";
import {Article} from "./Article";

@Entity()
export class Website {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column('boolean', {default: false})
    isCrawled: boolean = false;

    @ManyToOne(() => SubCategory, (subCategory) => subCategory.websites)
    subCategory: SubCategory;

    @OneToMany(() => Article, (article) => article.website)
    articles: Article[];
}