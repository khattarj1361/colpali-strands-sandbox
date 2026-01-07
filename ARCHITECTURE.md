# Architecture Overview

## System Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ Uploads PDF or Queries
       ▼
┌─────────────────────────────┐
│   PDF AI Agent (index.ts)   │
└──────┬──────────────────────┘
       │
       ├─── Upload Flow ───┐
       │                   │
       │                   ▼
       │         ┌──────────────────┐
       │         │  PDF Processor   │
       │         │  (pdfProcessor)  │
       │         └────────┬─────────┘
       │                  │
       │                  │ Extracts Text
       │                  ▼
       │         ┌──────────────────┐
       │         │  Text Chunker    │
       │         │ (textChunker)    │
       │         └────────┬─────────┘
       │                  │
       │                  │ Creates Chunks
       │                  ▼
       │         ┌──────────────────────┐
       │         │  Embedding Service   │
       │         │ (Amazon Titan via    │
       │         │  AWS Bedrock)        │
       │         └────────┬─────────────┘
       │                  │
       │                  │ Generates Embeddings
       │                  ▼
       │         ┌──────────────────────┐
       │         │  Vector DB Service   │
       │         │    (Pinecone)        │
       │         └──────────────────────┘
       │
       └─── Query Flow ───┐
                          │
                          ▼
              ┌──────────────────────┐
              │    AI Agent          │
              │   (aiAgent)          │
              └───────┬──────────────┘
                      │
                      │ 1. Embed Query
                      ▼
              ┌──────────────────────┐
              │  Embedding Service   │
              │ (Amazon Titan)       │
              └───────┬──────────────┘
                      │
                      │ 2. Search Similar
                      ▼
              ┌──────────────────────┐
              │  Vector DB Service   │
              │    (Pinecone)        │
              └───────┬──────────────┘
                      │
                      │ 3. Retrieve Context
                      ▼
              ┌──────────────────────┐
              │   Claude 3 (Bedrock) │
              │   Generate Answer    │
              └───────┬──────────────┘
                      │
                      │ 4. Return Response
                      ▼
                  ┌────────┐
                  │  User  │
                  └────────┘
```

## Components

### 1. PDF Processor (`src/services/pdfProcessor.ts`)
- Reads PDF files from disk or buffer
- Extracts text content using `pdf-parse`
- Generates unique document IDs
- Delegates to Text Chunker for splitting content

### 2. Text Chunker (`src/utils/textChunker.ts`)
- Splits documents into manageable chunks (~1000 chars)
- Maintains overlap between chunks for context continuity
- Attaches metadata (document ID, filename, chunk index)

### 3. Embedding Service (`src/services/embeddingService.ts`)
- Uses AWS Bedrock Runtime API
- Invokes Amazon Titan embedding model
- Converts text to 1536-dimensional vectors
- Supports batch embedding generation

### 4. Vector DB Service (`src/services/vectorDBService.ts`)
- Manages Pinecone index lifecycle
- Stores document chunks with embeddings
- Performs semantic similarity search
- Supports document deletion by ID

### 5. AI Agent (`src/services/aiAgent.ts`)
- Implements RAG (Retrieval Augmented Generation)
- Queries vector DB for relevant context
- Constructs prompts with retrieved information
- Invokes Claude 3 via AWS Bedrock for answer generation
- Maintains conversation history for chat mode

### 6. Main Application (`src/index.ts`)
- Command-line interface (CLI)
- Interactive chat mode
- Configuration management
- Error handling and logging

## Data Flow

### Upload Process
1. User provides PDF file path
2. PDF Processor extracts text
3. Text Chunker splits into overlapping segments
4. Embedding Service generates vectors for each chunk
5. Vector DB Service stores chunks with embeddings in Pinecone

### Query Process (RAG)
1. User submits a question
2. AI Agent embeds the question using Embedding Service
3. Vector DB Service finds top-K most similar chunks
4. AI Agent constructs a prompt with retrieved context
5. Claude 3 (via Bedrock) generates an answer
6. Response returned with sources and relevant chunks

## Technologies

- **TypeScript**: Type-safe application code
- **AWS Bedrock**: Managed AI service for LLMs and embeddings
  - Claude 3 Sonnet: Question answering
  - Amazon Titan: Text embeddings
- **Pinecone**: Serverless vector database for similarity search
- **pdf-parse**: PDF text extraction
- **Node.js**: Runtime environment

## Security Considerations

- AWS credentials stored in environment variables
- API keys never committed to version control
- Secure communication with AWS and Pinecone via HTTPS
- Input validation on file paths and queries
