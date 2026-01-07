import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

/**
 * Service for generating embeddings using AWS Bedrock
 */
export class EmbeddingService {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor(region: string, modelId: string = 'amazon.titan-embed-text-v1') {
    this.client = new BedrockRuntimeClient({ region });
    this.modelId = modelId;
  }

  /**
   * Generate embeddings for a text
   * @param text The text to generate embeddings for
   * @returns Array of embedding values
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: text,
        }),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return responseBody.embedding;
    } catch (error) {
      throw new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate embeddings for multiple texts
   * @param texts Array of texts to generate embeddings for
   * @returns Array of embedding arrays
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Process in batches with concurrency control to respect rate limits
    const maxConcurrent = 5;
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += maxConcurrent) {
      const batch = texts.slice(i, i + maxConcurrent);
      const batchEmbeddings = await Promise.all(
        batch.map((text) => this.generateEmbedding(text))
      );
      embeddings.push(...batchEmbeddings);
    }

    return embeddings;
  }
}
