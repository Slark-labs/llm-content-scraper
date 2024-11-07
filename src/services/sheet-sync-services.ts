import {Repository} from "typeorm";
import {Category, SubCategory, Website} from "../entity";
import {GoogleSpreadsheet} from "google-spreadsheet";
import {AppDataSource} from "../utils/data-source";
import {JWT} from "google-auth-library";

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON); // Store JSON in .env
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
];


const jwt = new JWT({
    email: credentials.client_email,
    key: credentials.private_key.split(String.raw`\n`).join('\n'),
    scopes: SCOPES,
});


export async function syncDataFromSheet(sheet, categoryRepository: Repository<Category>, subCategoryRepository: Repository<SubCategory>, websiteRepository: Repository<Website>) {
    const categoryName = sheet.title;
    let category = await categoryRepository.findOne({where: {name: categoryName}});
    if (!category) {
        category = categoryRepository.create({name: categoryName});
        await categoryRepository.save(category);
    }

    const rows = await sheet.getRows();
    for (const row of rows) {
        if (row._rowNumber === '1') continue

        console.log(row.toObject())
        const subCategoryName = row._rawData[0];
        let subCategory = await subCategoryRepository.findOne({
            where: {name: subCategoryName, category},
        });
        if (!subCategory) {
            subCategory = subCategoryRepository.create({name: subCategoryName, category});
            await subCategoryRepository.save(subCategory);
        }
        const lastCrawled = row._rawData[row._rawData.length - 1]
        if (!lastCrawled || lastCrawled === subCategoryName) continue
        if (subCategory.last_crawled && ((new Date(subCategory.last_crawled).getTime()) >= (new Date(lastCrawled).getTime()))) continue

        subCategory.last_crawled = new Date(row._rawData[row._rawData.length - 1]);
        await subCategoryRepository.save(subCategory);


        const websiteUrls = row._rawData.slice(1, row._rawData.length - 1).filter(url => url);
        for (const url of websiteUrls) {
            let website = await websiteRepository.findOne({where: {url, subCategory: subCategory}});
            if (!website) {
                website = websiteRepository.create({url, subCategory: subCategory});
                await websiteRepository.save(website);
            }
        }
    }
}

// Main function to authenticate, load data, and sync
export async function syncDatabaseWithGoogleSheet() {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo(true)

    const categoryRepository = AppDataSource.getRepository(Category);
    const subCategoryRepository = AppDataSource.getRepository(SubCategory);
    const websiteRepository = AppDataSource.getRepository(Website);

    // Iterate through each sheet representing a category
    for (const sheet of doc.sheetsByIndex) {
        await syncDataFromSheet(sheet, categoryRepository, subCategoryRepository, websiteRepository);
    }

    console.log("Database sync with Google Sheets complete.");
}
