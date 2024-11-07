import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Website } from "./Website";

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column('boolean', {default: false})
    isCrawled: boolean = false;

    @Column({ nullable: true})
    title: string

    @Column({type: 'jsonb', nullable: true, })
    content: string

    @ManyToOne(() => Website, (website) => website.articles)
    website: Website;
}