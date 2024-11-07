import path from "path";
import fs from "fs";
import {Category, SubCategory, Website} from "../entity";

export interface ArticleOutput {
    title: string;
    prompt: string;
    publishedTime: string
    complexity: string;
    tone: string;
    keywords?: string[];
    headlines?: string[];
    content: string;
    category: Category;
    subCategory: SubCategory;
    website: Website;
    url: string;
    wordCount: string;
}

// Create JSON article file
export function createArticleFile(directory: string, article: ArticleOutput) {
    const filename = `${article.title.replace(/ /g, '-')}.json`;
    const filePath = path.join(directory, filename);

    const content = {
        prompt: article.prompt,
        title: article.title,
        publishedTime: article.publishedTime,
        wordCount: article.wordCount,
        complexity: article.complexity,
        tone: article.tone,
        category: article.category.name,
        subCategory: article.subCategory.name,
        url: article.url,
        keywords: article.keywords || [],
        headlines: article.headlines || [],
        content: article.content,
    };

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
}

// Set up directory structure and create files
export function setupDirectoryStructure(baseDir: string, article: ArticleOutput) {
    const categoryDir = path.join(__dirname, '..', baseDir, article.category.name);
    const subCategoryDir = path.join(categoryDir, article.subCategory.name);
    const websiteDir = path.join(subCategoryDir, article.website.url.replace('https://', '').replace('http://', ''));

    // Create directories if they don't exist
    fs.mkdirSync(websiteDir, {recursive: true});

    // Create the article file in the specified directory
    createArticleFile(websiteDir, article);
}