export interface PDFDocument {
  id: string;
  filename: string;
  content: string;
  chunks: TextChunk[];
  uploadedAt: Date;
}

export interface TextChunk {
  id: string;
  text: string;
  embedding?: number[];
  metadata: {
    documentId: string;
    filename: string;
    chunkIndex: number;
  };
}

export interface QueryResponse {
  answer: string;
  relevantChunks: TextChunk[];
  sources: string[];
}

export interface AgentConfig {
  awsRegion: string;
  bedrockModelId: string;
  embeddingModelId: string;
  pineconeApiKey: string;
  pineconeEnvironment: string;
  pineconeIndexName: string;
}
