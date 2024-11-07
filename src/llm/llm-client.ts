import {ChatOllama} from "@langchain/ollama";
import {MarkdownTextSplitter} from "langchain/text_splitter";

export const llm = new ChatOllama({
    model: "llama3.1:8b-instruct-q4_0", // Default value
    temperature: 0.3,
    maxRetries: 3,
    topP: 0.95,
    // "predictions": 400,
    // "temperature": 0.7,
    // "repeatPenalty": 1.18,
    // "presencePenalty": 256,
    // "topK": 40,
    // "topP": 0.4,
    // "": 0.05,
    // "penalizeNewline": false
    // 'numCtx': 4096
});

// Initialize the MarkdownTextSplitter
export const textSplitter = new MarkdownTextSplitter({
    chunkSize: 1500, // Adjust based on model's token limit
    chunkOverlap: 100, // Overlap for continuity
});
