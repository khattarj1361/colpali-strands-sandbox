import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { PDFProcessor } from './services/pdfProcessor.js';
import { EmbeddingService } from './services/embeddingService.js';
import { VectorDBService } from './services/vectorDBService.js';
import { AIAgent } from './services/aiAgent.js';
import { AgentConfig } from './types/index.js';

// Load environment variables
dotenv.config();

/**
 * Load configuration from environment variables
 */
function loadConfig(): AgentConfig {
  const config: AgentConfig = {
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    bedrockModelId:
      process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
    embeddingModelId:
      process.env.EMBEDDING_MODEL_ID || 'amazon.titan-embed-text-v1',
    pineconeApiKey: process.env.PINECONE_API_KEY || '',
    pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || '',
    pineconeIndexName: process.env.PINECONE_INDEX_NAME || 'pdf-documents',
  };

  // Validate required configuration
  if (!config.pineconeApiKey) {
    throw new Error('PINECONE_API_KEY is required in environment variables');
  }

  return config;
}

/**
 * Main application class
 */
class PDFAgentApp {
  private pdfProcessor: PDFProcessor;
  private embeddingService: EmbeddingService;
  private vectorDBService: VectorDBService;
  private aiAgent: AIAgent;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(config: AgentConfig) {
    this.pdfProcessor = new PDFProcessor();
    this.embeddingService = new EmbeddingService(
      config.awsRegion,
      config.embeddingModelId
    );
    this.vectorDBService = new VectorDBService(
      config.pineconeApiKey,
      config.pineconeIndexName,
      this.embeddingService
    );
    this.aiAgent = new AIAgent(
      config.awsRegion,
      config.bedrockModelId,
      this.vectorDBService
    );
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    console.log('Initializing PDF Agent...');
    await this.vectorDBService.initializeIndex();
    console.log('PDF Agent ready!');
  }

  /**
   * Upload and process a PDF file
   * @param filePath Path to the PDF file
   */
  async uploadPDF(filePath: string): Promise<void> {
    try {
      console.log(`\nProcessing PDF: ${filePath}`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Process the PDF
      const document = await this.pdfProcessor.processPDF(filePath);
      console.log(`Extracted ${document.chunks.length} chunks from PDF`);

      // Store chunks in vector database
      await this.vectorDBService.storeChunks(document.chunks);
      console.log(`✓ Successfully uploaded and processed: ${document.filename}`);
    } catch (error) {
      console.error(
        `Error uploading PDF: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Query the AI agent
   * @param query User's question
   */
  async query(query: string): Promise<void> {
    try {
      console.log(`\nQuery: ${query}`);
      console.log('Searching and generating response...\n');

      const response = await this.aiAgent.query(query);

      console.log('Answer:');
      console.log(response.answer);
      console.log('\nSources:');
      response.sources.forEach((source) => console.log(`- ${source}`));
    } catch (error) {
      console.error(
        `Error querying agent: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Start interactive chat mode
   */
  async startInteractiveMode(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n=== Interactive Mode ===');
    console.log('Commands:');
    console.log('  - Type your question to query the agent');
    console.log('  - "upload <file_path>" to upload a new PDF');
    console.log('  - "clear" to clear conversation history');
    console.log('  - "quit" or "exit" to exit\n');

    const askQuestion = () => {
      rl.question('You: ', async (input) => {
        const trimmedInput = input.trim();

        if (!trimmedInput) {
          askQuestion();
          return;
        }

        if (trimmedInput.toLowerCase() === 'quit' || trimmedInput.toLowerCase() === 'exit') {
          console.log('Goodbye!');
          rl.close();
          return;
        }

        if (trimmedInput.toLowerCase() === 'clear') {
          this.conversationHistory = [];
          console.log('Conversation history cleared.\n');
          askQuestion();
          return;
        }

        if (trimmedInput.toLowerCase().startsWith('upload ')) {
          const filePath = trimmedInput.substring(7).trim();
          try {
            await this.uploadPDF(filePath);
          } catch (error) {
            console.error('Failed to upload PDF');
          }
          askQuestion();
          return;
        }

        try {
          console.log('Searching and generating response...\n');
          const response = await this.aiAgent.chat(
            trimmedInput,
            this.conversationHistory
          );

          console.log('Agent:', response.answer);
          if (response.sources.length > 0) {
            console.log('\nSources:', response.sources.join(', '));
          }
          console.log('');

          // Update conversation history
          this.conversationHistory.push(
            { role: 'user', content: trimmedInput },
            { role: 'assistant', content: response.answer }
          );
        } catch (error) {
          console.error(
            `Error: ${error instanceof Error ? error.message : String(error)}`
          );
        }

        askQuestion();
      });
    };

    askQuestion();
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    // Load configuration
    const config = loadConfig();

    // Create and initialize the app
    const app = new PDFAgentApp(config);
    await app.initialize();

    // Parse command line arguments
    const args = process.argv.slice(2);

    if (args.length === 0) {
      // No arguments - start interactive mode
      await app.startInteractiveMode();
    } else if (args[0] === 'upload' && args[1]) {
      // Upload a PDF
      await app.uploadPDF(args[1]);
    } else if (args[0] === 'query' && args[1]) {
      // Query the agent
      await app.query(args.slice(1).join(' '));
    } else {
      console.log('Usage:');
      console.log('  npm start                    - Start interactive mode');
      console.log('  npm start upload <file>      - Upload a PDF file');
      console.log('  npm start query <question>   - Query the agent');
    }
  } catch (error) {
    console.error(
      `Fatal error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

// Run the application
main();
