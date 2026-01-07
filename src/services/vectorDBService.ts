import { Pinecone } from '@pinecone-database/pinecone';
import { TextChunk, EMBEDDING_DIMENSION } from '../types/index.js';
import { EmbeddingService } from './embeddingService.js';

/**
 * Service for managing vector database operations using Pinecone
 */
export class VectorDBService {
  private pinecone: Pinecone;
  private indexName: string;
  private embeddingService: EmbeddingService;

  constructor(
    apiKey: string,
    indexName: string,
    embeddingService: EmbeddingService
  ) {
    this.pinecone = new Pinecone({ apiKey });
    this.indexName = indexName;
    this.embeddingService = embeddingService;
  }

  /**
   * Initialize the Pinecone index
   */
  async initializeIndex(): Promise<void> {
    try {
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(
        (index) => index.name === this.indexName
      );

      if (!indexExists) {
        console.log(`Creating index: ${this.indexName}`);
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: EMBEDDING_DIMENSION,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
        });
        console.log(`Index ${this.indexName} created successfully`);
      } else {
        console.log(`Index ${this.indexName} already exists`);
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize index: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Store document chunks in the vector database
   * @param chunks Array of text chunks to store
   */
  async storeChunks(chunks: TextChunk[]): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);

      // Generate embeddings for all chunks
      const embeddings = await this.embeddingService.generateEmbeddings(
        chunks.map((chunk) => chunk.text)
      );

      // Prepare vectors for upsert
      const vectors = chunks.map((chunk, i) => ({
        id: chunk.id,
        values: embeddings[i],
        metadata: {
          text: chunk.text,
          documentId: chunk.metadata.documentId,
          filename: chunk.metadata.filename,
          chunkIndex: chunk.metadata.chunkIndex,
        },
      }));

      // Upsert vectors in batches of 100
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
      }

      console.log(`Stored ${chunks.length} chunks in vector database`);
    } catch (error) {
      throw new Error(
        `Failed to store chunks: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Query the vector database for relevant chunks
   * @param query The search query
   * @param topK Number of results to return
   * @returns Array of relevant text chunks
   */
  async queryChunks(query: string, topK: number = 5): Promise<TextChunk[]> {
    try {
      const index = this.pinecone.index(this.indexName);

      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Query the index
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });

      // Convert results to TextChunk format
      const chunks: TextChunk[] = queryResponse.matches.map((match) => {
        // Validate metadata exists and has required fields
        if (!match.metadata) {
          throw new Error(`Missing metadata for match ${match.id}`);
        }

        const text = match.metadata.text;
        const documentId = match.metadata.documentId;
        const filename = match.metadata.filename;
        const chunkIndex = match.metadata.chunkIndex;

        if (typeof text !== 'string' || typeof documentId !== 'string' || 
            typeof filename !== 'string' || typeof chunkIndex !== 'number') {
          throw new Error(`Invalid metadata types for match ${match.id}`);
        }

        return {
          id: match.id,
          text,
          embedding: match.values,
          metadata: {
            documentId,
            filename,
            chunkIndex,
          },
        };
      });

      return chunks;
    } catch (error) {
      throw new Error(
        `Failed to query chunks: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Delete all chunks for a specific document
   * @param documentId The document ID
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);

      // Query all chunks for this document
      const allChunks = await index.query({
        vector: new Array(EMBEDDING_DIMENSION).fill(0), // Dummy vector
        topK: 10000,
        includeMetadata: true,
        filter: {
          documentId: { $eq: documentId },
        },
      });

      // Delete all matching IDs
      const ids = allChunks.matches.map((match) => match.id);
      if (ids.length > 0) {
        await index.deleteMany(ids);
        console.log(`Deleted ${ids.length} chunks for document ${documentId}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to delete document: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
