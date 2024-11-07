import "reflect-metadata"
import {DataSource} from "typeorm"
import {Article, Website, Category, SubCategory} from "../entity"

export const AppDataSource = new DataSource({
    "type": "postgres",
    "host": "localhost",
    "port": 54321,
    "username": "admin",
    "password": "admin",
    "database": "scraping_db",
    synchronize: true,
    logging: false,
    entities: [Category, SubCategory, Website, Article],
    migrations: [],
    subscribers: [],
})
