import {AppDataSource} from "./utils/data-source"
import {Article, Website} from "./entity"
import 'dotenv/config'
import {syncDatabaseWithGoogleSheet} from "./services/sheet-sync-services";
import {fetchArticleContent, fetchWebsitePostUrls} from "./services/article-fetch-sercvice";


async function main() {
    const websiteRepository = AppDataSource.getRepository(Website);
    const articleRepository = AppDataSource.getRepository(Article);

    await syncDatabaseWithGoogleSheet();

    const websites = await websiteRepository.find({where: {isCrawled: false}});
    for (const website of websites) {
        await fetchWebsitePostUrls(website.id);
    }

    const articles = await articleRepository.find({
        where: {isCrawled: false},
        relations: ['website', 'website.subCategory', 'website.subCategory.category'],
        select: {
            id: true,
            url: true,
            title: true,
            isCrawled: true,
            content: true,
            website: {url: true, subCategory: {name: true, category: {name: true}}}
        }
    });
    for (const article of articles) {
        console.log(article.isCrawled)
        await fetchArticleContent(article);
    }
}

AppDataSource.initialize().then(main).catch(error => console.log(error))
