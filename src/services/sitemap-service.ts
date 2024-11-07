import axios from "axios";
import * as xml2js from "xml2js";

export async function fetchSitemap(url: string) {
    console.log("Fetching sitemap...", url);
    try {
        // Validate URL format
        if (typeof url !== 'string' || !/^https?:\/\/.+/i.test(url)) {
            throw new Error("Invalid URL format");
        }

        // Attempt to fetch the sitemap
        let response;
        try {
            response = await axios.get(url, {timeout: 10000}); // 10 seconds timeout
        } catch (error) {
            if (error.response && error.response.status === 404 && url.endsWith("/sitemap.xml")) {
                console.log("Trying alternative URL: /sitemap_index.xml");
                url = url.replace("/sitemap.xml", "/sitemap_index.xml");
                response = await axios.get(url, {timeout: 10000});
            } else {
                throw error;
            }
        }


        if (response.status !== 200) {
            throw new Error(`Failed to fetch sitemap, status code: ${response.status}`);
        }

        const xmlData = response.data;
        if (!xmlData) {
            throw new Error("Received empty sitemap XML data");
        }

        // Parse the XML data safely
        const parser = new xml2js.Parser({explicitArray: false});
        const result = await parser.parseStringPromise(xmlData);

        // Check if it's a sitemap index (contains links to other sitemaps)
        if (result.sitemapindex && Array.isArray(result.sitemapindex.sitemap)) {
            const postSitemaps = [];
            for (const sitemap of result.sitemapindex.sitemap) {
                if (sitemap.loc && typeof sitemap.loc === 'string' && sitemap.loc.includes("post")) {
                    postSitemaps.push(sitemap.loc);
                }
            }

            // Recursively fetch URLs from each post sitemap
            const postUrls = [];
            for (const postSitemapUrl of postSitemaps) {
                try {
                    const urls = await fetchSitemap(postSitemapUrl); // Recursive call
                    postUrls.push(...urls);
                } catch (nestedError) {
                    console.error(`Error fetching nested sitemap at ${postSitemapUrl}:`, nestedError);
                }
            }
            return postUrls;
        }

        // If it is a regular sitemap, extract URLs directly
        const urls = [];
        if (result.urlset && Array.isArray(result.urlset.url)) {
            result.urlset.url.forEach((entry) => {
                if (entry.loc && typeof entry.loc === 'string') {
                    urls.push(entry.loc);
                }
            });
        }

        return urls;
    } catch (error) {
        console.error("Error fetching or parsing sitemap:", error.message);
        return [];
    }
}