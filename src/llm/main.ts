import {LLMOutput} from "./types";
import {extractContentDetails, extractHeadingsFromMarkdown} from "./markdown-processing";
import {textSplitter} from "./llm-client";
import {analyzeComplexity, extractTitle, generatePrompt, processChunks} from "./llm-content-processing";

export const runTheLLM = async (data: string): Promise<LLMOutput> => {
    const headlines = await extractHeadingsFromMarkdown(data)
    const {title: title_, publishedTime, markdownContent, wordCount} = extractContentDetails(data)
    const chunks = await textSplitter.splitText(data);

    const title = title_ || (await extractTitle(chunks[0]))
    const {keywords, tone} = await processChunks(chunks)
    const complexity = await analyzeComplexity(chunks.slice(0, 4).join("\n"));
    const prompt = await generatePrompt(chunks.slice(0, 2).join("\n"), headlines);

    return {
        publishedTime,
        title,
        keywords,
        headlines,
        complexity,
        tone,
        prompt,
        wordCount,
        content: markdownContent,
    }
}
