import {AppDataSource} from "../utils/data-source";
import {Article, Website} from "../entity";
import {fetchSitemap} from "./sitemap-service";
import axios from "axios";
import {runTheLLM} from "../llm/main";
import {setupDirectoryStructure} from "../utils/article-output-manager";

const exclusionSelectors = [
    /* General layout and structure elements */
    "header", "nav", "footer", "sidebar", "img", "#sidebar", ".sidebar", "form",

    /* Footer sections - excludes footer unless inside an article */
    "[class*='footer']:not(article):not(body)", "[id*='footer']:not(article):not(body)", "#footer:not(article)",

    /* Comment sections */
    "#comments", ".comments",

    /* Sharing and advertising-related sections */
    "[class*='share-box']", "[class*='ad-box']", ".ad", ".ads", ".advert", "#ad", ".adthrive:not(body)", "#adthrive:not(body)",

    /* Scripts and invisible elements */
    "script", "style", ".screen-reader-text", "svg:not(article svg)",

    /* Cookie and consent pop-ups */
    ".cookie", "#cookie", ".cli-modal-dialog", "[class*='manage-consent']",

    /* Navigation, breadcrumbs, and search-related sections */
    ".top", ".navbar", ".navigation", "#nav", ".menu", ".breadcrumbs", "#breadcrumbs", "#search-form", ".search", "#search",

    /* Social and language selectors */
    ".lang-selector", ".language", "#language-selector", ".social", ".social-media", ".social-links", "#social",

    /* Overlays and modals */
    ".modal", ".popup", "#modal", ".overlay",

    /* Sidebars and secondary content */
    ".side", ".aside", ".secondary", "#secondary", ".bottom", ".top",

    /* Miscellaneous and marketing sections */
    ".newsletter", "#newsletter", "[class*='course']:not(article)", ".lwptoc", ".language",
    "[href^='https://amzn.to/']", "[href^='https://amzon.com']", "[href^='https://www.amazon.com']",

    /* Specific classes that are often peripheral */
    ".share", "#share", ".bottom", ".cli-modal-dialog", ".screen-reader-text", ".lwptoc", ".manage-consent"
];

export async function fetchWebsitePostUrls(websiteId: number) {
    const websiteRepository = AppDataSource.getRepository(Website);
    const articleRepository = AppDataSource.getRepository(Article);

    // Find the website by ID
    const website = await websiteRepository.findOne({where: {id: websiteId}});
    if (!website) {
        console.error(`Website not found.`);
        return;
    }


    try {
        const urls = await fetchSitemap(website.url + 'sitemap.xml');
        if (!urls.length) return

        const newArticles = urls.map(url => articleRepository.create({url, website}));
        await articleRepository.save(newArticles);
        website.isCrawled = true;
        await websiteRepository.save(website);
    } catch (error) {
        console.error(`Failed to fetch URLs for website ${website.url}:`, error.message);
    }
}

export async function fetchArticleContent(article: Article) {
    const articleRepository = AppDataSource.getRepository(Article);
    const url = 'https://r.jina.ai/' + article.url;

    const options = {
        headers: {
            'Authorization': `Bearer ${process.env.JINA_AUTH_TOKEN}`,
            'X-Remove-Selector': exclusionSelectors.join(',')
        }
    };

    try {
        const response = await axios.get(url, options);
        article.content = response.data;
        await articleRepository.save(article);
        const data = await runTheLLM(response.data);
        setupDirectoryStructure('out', {
            ...article,
            category: article.website.subCategory.category,
            subCategory: article.website.subCategory,
            ...data
        });
        article.isCrawled = true;
        await articleRepository.save(article);
    } catch (error) {
        console.error(`Error fetching content for article ${article.url}:`, error.message);
    }
}
