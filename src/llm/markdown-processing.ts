import {marked} from "marked";
import {JSDOM} from "jsdom";

const extractHeadingsFromMarkdown = async (markdownContent: string) => {
    const htmlContent = await marked(markdownContent);

    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(heading => (
        heading.textContent?.trim() || ''
    ));
};


const extractTitleFromMarkdown = (markdownContent: string): string => {
    const titleMatch = markdownContent.match(/^Title:\s*(.+)/m);
    return titleMatch ? titleMatch[1].trim() : '';
};

const extractContentDetails = (content) => {
    // Define regular expressions for title, published time, and markdown content
    const titleRegex = /Title:\s*(.*)/;
    const publishedTimeRegex = /Published Time:\s*(.*)/;
    const contentRegex = /Markdown Content:\s*([\s\S]*)$/;  // Adjusted to capture everything until end of file

    // Extract matches using the regular expressions
    const titleMatch = content.match(titleRegex);
    const publishedTimeMatch = content.match(publishedTimeRegex);
    const contentMatch = content.match(contentRegex);

    // Retrieve matched content or default to null if not found
    const title = titleMatch ? titleMatch[1].trim() : null;
    const publishedTime = publishedTimeMatch ? publishedTimeMatch[1].trim() : null;
    const markdownContent = contentMatch ? contentMatch[1].trim() : null;

    // Calculate word count for markdownContent
    const wordCount = markdownContent ? markdownContent.split(/\s+/).length : 0;

    return {title, publishedTime, markdownContent, wordCount};
};


const extractContentFromMarkdown = (markdownContent: string): string => {
    const titleMatch = markdownContent.match(/^Title:\s*(.+)/m);
    return titleMatch ? titleMatch[1].trim() : '';
};

export {
    extractContentDetails, extractContentFromMarkdown, extractHeadingsFromMarkdown, extractTitleFromMarkdown
}