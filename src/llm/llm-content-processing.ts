import {z} from "zod";
import {llm} from "./llm-client";

const extractTitle = async (firstChunk: string) => {
    const titleSchema = z.object({
        title: z.string(),
    });
    const modelWithStructure = llm.withStructuredOutput(titleSchema, {
        name: "title",
        includeRaw: true,
    });

    const prompt = `
        From the content below, extract only the title and return it as a JSON object with the key "title".
        Important: No additional text, preamble, or postamble. Only return the JSON object without any extra formatting, such as \`\`\`json\`\`\`.
    
        Content:
        ${firstChunk}
    `;
    const response = await modelWithStructure.invoke(prompt);
    return response.parsed.title;
};

const analyzeComplexity = async (combinedContent: string) => {
    const complexitySchema = z.object({
        complexity: z.string(),
    });
    const modelWithStructure = llm.withStructuredOutput(complexitySchema, {
        name: "complexity",
        includeRaw: true,
    });

    const prompt = `
        Analyze the following content and determine its overall complexity level as one of: "simple," "medium," or "complex." 
        Respond with only a JSON object containing the key "complexity" and no additional text or formatting.
    
        Content:
        ${combinedContent}
    `;

    const response = await modelWithStructure.invoke(prompt);
    return response.parsed.complexity;
};

const generatePrompt = async (combinedContent: string, headlines: string[] = []) => {
    const promptSchema = z.object({
        prompt: z.string(),
    });

    const modelWithStructure = llm.withStructuredOutput(promptSchema, {
        name: "article_prompt",
        includeRaw: true,
    });

    const prompt = (`
     Given the following article excerpts and list of headlines, create a detailed prompt that would guide an AI to generate an article on the same topic. This generated prompt should instruct the AI to create an article covering the topic, perspective, target audience, tone, key points, and structure in a style and depth similar to the original article.

    Requirements:
    - Output only a JSON object with a single key "prompt" that contains the suggested prompt as a string. This suggested prompt should be designed to generate an article directly.
    - Avoid adding any preamble, postamble, or formatting such as \`\`\`json\`\`\`.
    - The prompt should be fully self-contained and should not reference or depend on any specific prior content.
    
    Article excerpts:
    ${combinedContent}

    Article headlines:
    ${headlines.join(', ')}
    `);

    const response = await modelWithStructure.invoke(prompt);
    return response.parsed.prompt;
}

const processChunks = async (chunks: string[]) => {
    const ArticleSchema = z.object({
        keywords: z.array(z.string()),
        // headlines: z.array(z.string()),
        tone: z.string(),
    });
    const modelWithStructure = llm.withStructuredOutput(ArticleSchema, {
        name: "keyword_tone",
        includeRaw: true,
    });

    // REMOVED: - headlines: an array of extracted headlines, in the order they appear.
    const promptTemplate = (chunk: string) => `
       Analyze the following content chunk of an article and extract the following in JSON format:   
        - keywords: an array of relevant keywords (a mix of long-tail and short-tail, max 5 keywords, no unnecessary words).
        - tone: one of the following tones - informative, persuasive, or formal.
    
        Important:
        - Output only the JSON object with correct syntax.
        - Do not include quotes around the arrays.
        - Ensure arrays are output as valid JSON arrays, not as strings.
        - Avoid adding any preamble, postamble text and any notes, or formatting such as \`\`\`json\`\`\`. Only return keywords and tone!
        
        Content: ${chunk}
    `


    let aggregatedKeywords = new Set<string>();
    // let aggregatedHeadlines = new Set<string>();
    let tone = "";
    for (const chunk of chunks) {
        const response = await modelWithStructure.invoke(promptTemplate(chunk));
        let {keywords, tone: chunkTone} = response.parsed;

        try {
            if (typeof keywords === "string") keywords = JSON.parse(keywords);
            // if (typeof headlines === "string") headlines = JSON.parse(headlines);
        } catch (error) {
            console.warn("Error parsing response arrays:", error);
            continue; // Skip this chunk if parsing fails
        }


        keywords.forEach((kw: string) => aggregatedKeywords.add(kw));
        // headlines.forEach((hl: string) => aggregatedHeadlines.add(hl));
        tone = chunkTone || tone;
    }

    return {
        keywords: Array.from(aggregatedKeywords),
        // headlines: Array.from(aggregatedHeadlines),
        tone,
    };
};

export {extractTitle, analyzeComplexity, generatePrompt, processChunks}