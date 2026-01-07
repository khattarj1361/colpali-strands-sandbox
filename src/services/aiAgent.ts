import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { QueryResponse, TextChunk } from '../types/index.js';
import { VectorDBService } from './vectorDBService.js';

/**
 * AI Agent service using AWS Bedrock for conversational queries
 */
export class AIAgent {
  private client: BedrockRuntimeClient;
  private modelId: string;
  private vectorDBService: VectorDBService;

  constructor(
    region: string,
    modelId: string,
    vectorDBService: VectorDBService
  ) {
    this.client = new BedrockRuntimeClient({ region });
    this.modelId = modelId;
    this.vectorDBService = vectorDBService;
  }

  /**
   * Query the AI agent with a question
   * @param query The user's question
   * @returns Response with answer and relevant sources
   */
  async query(query: string): Promise<QueryResponse> {
    try {
      // Step 1: Retrieve relevant chunks from vector database
      const relevantChunks = await this.vectorDBService.queryChunks(query, 5);

      if (relevantChunks.length === 0) {
        return {
          answer: "I couldn't find any relevant information in the documents to answer your question.",
          relevantChunks: [],
          sources: [],
        };
      }

      // Step 2: Build context from retrieved chunks
      const context = relevantChunks
        .map((chunk, i) => `[${i + 1}] ${chunk.text}`)
        .join('\n\n');

      // Step 3: Create prompt for the LLM
      const prompt = this.buildPrompt(query, context);

      // Step 4: Invoke the Bedrock model
      const answer = await this.invokeModel(prompt);

      // Step 5: Extract unique sources
      const sources = [
        ...new Set(relevantChunks.map((chunk) => chunk.metadata.filename)),
      ];

      return {
        answer,
        relevantChunks,
        sources,
      };
    } catch (error) {
      throw new Error(
        `Failed to process query: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Build a prompt for the LLM with context
   * @param query User's question
   * @param context Retrieved context from vector database
   * @returns Formatted prompt
   */
  private buildPrompt(query: string, context: string): string {
    return `You are a helpful AI assistant that answers questions based on the provided context from PDF documents.

Context from documents:
${context}

User Question: ${query}

Instructions:
1. Answer the question based only on the information provided in the context above.
2. If the context doesn't contain enough information to answer the question, say so clearly.
3. Cite the relevant parts of the context in your answer.
4. Be concise and accurate.

Answer:`;
  }

  /**
   * Invoke the Bedrock model
   * @param prompt The prompt to send to the model
   * @returns The model's response
   */
  private async invokeModel(prompt: string): Promise<string> {
    try {
      // Format depends on the model being used
      // This example uses Anthropic Claude format
      const requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      };

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // Extract text from Claude response
      return responseBody.content[0].text;
    } catch (error) {
      throw new Error(
        `Failed to invoke model: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Chat with the agent using conversation history
   * @param query Current query
   * @param conversationHistory Previous messages
   * @returns Response with answer and sources
   */
  async chat(
    query: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<QueryResponse> {
    try {
      // Retrieve relevant chunks
      const relevantChunks = await this.vectorDBService.queryChunks(query, 5);

      if (relevantChunks.length === 0) {
        return {
          answer: "I couldn't find any relevant information in the documents to answer your question.",
          relevantChunks: [],
          sources: [],
        };
      }

      // Build context
      const context = relevantChunks
        .map((chunk, i) => `[${i + 1}] ${chunk.text}`)
        .join('\n\n');

      // Build messages with history
      const messages = [
        {
          role: 'user',
          content: `Context from documents:\n${context}\n\nPlease use this context to answer questions.`,
        },
        ...conversationHistory,
        {
          role: 'user',
          content: query,
        },
      ];

      const requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages,
      };

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const answer = responseBody.content[0].text;

      const sources = [
        ...new Set(relevantChunks.map((chunk) => chunk.metadata.filename)),
      ];

      return {
        answer,
        relevantChunks,
        sources,
      };
    } catch (error) {
      throw new Error(
        `Failed to process chat: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
