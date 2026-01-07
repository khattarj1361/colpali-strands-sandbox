# PDF AI Agent with AWS Bedrock and Vector Database

An intelligent AI agent built with AWS Bedrock that processes PDF documents, stores content in a vector database (Pinecone), and allows users to query information using natural language.

## Features

- 📄 **PDF Processing**: Upload and extract text content from PDF documents
- 🔍 **Vector Database**: Store document chunks with embeddings in Pinecone
- 🤖 **AI Agent**: Query documents using AWS Bedrock (Claude) with RAG (Retrieval Augmented Generation)
- 💬 **Interactive Chat**: Conversational interface with context retention
- 🎯 **Semantic Search**: Find relevant information across multiple documents

## Architecture

The application follows a RAG (Retrieval Augmented Generation) pattern:

1. **PDF Processing**: PDFs are parsed and split into manageable chunks
2. **Embedding Generation**: Text chunks are converted to embeddings using Amazon Titan
3. **Vector Storage**: Embeddings are stored in Pinecone for efficient similarity search
4. **Query Processing**: User queries are embedded and matched against stored documents
5. **Answer Generation**: Relevant context is passed to Claude (via Bedrock) to generate answers

## Prerequisites

- Node.js 18+ and npm
- AWS Account with Bedrock access
- Pinecone account and API key
- AWS credentials configured

## Installation

1. Clone the repository:
```bash
git clone https://github.com/khattarj1361/colpali-strands-sandbox.git
cd colpali-strands-sandbox
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1

PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=pdf-documents
```

4. Build the project:
```bash
npm run build
```

## Usage

### Interactive Mode

Start the interactive chat interface:

```bash
npm start
```

Commands available in interactive mode:
- Type any question to query the agent
- `upload <file_path>` - Upload a new PDF document
- `clear` - Clear conversation history
- `quit` or `exit` - Exit the application

### Upload a PDF

```bash
npm start upload path/to/document.pdf
```

### Query the Agent

```bash
npm start query "What is the main topic of the documents?"
```

## Example Usage

```bash
# Start interactive mode
npm start

# In interactive mode:
You: upload ./documents/research-paper.pdf
Processing PDF: ./documents/research-paper.pdf
Extracted 45 chunks from PDF
✓ Successfully uploaded and processed: research-paper.pdf

You: What are the key findings in the research paper?
Agent: Based on the research paper, the key findings are:
1. [Finding 1]
2. [Finding 2]
...

Sources: research-paper.pdf
```

## Project Structure

```
.
├── src/
│   ├── index.ts                 # Main application entry point
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── services/
│   │   ├── pdfProcessor.ts      # PDF parsing and processing
│   │   ├── embeddingService.ts  # AWS Bedrock embedding generation
│   │   ├── vectorDBService.ts   # Pinecone vector database operations
│   │   └── aiAgent.ts           # AI agent with RAG implementation
│   └── utils/
│       └── textChunker.ts       # Text chunking utilities
├── package.json
├── tsconfig.json
└── README.md
```

## Services

### PDF Processor
Handles PDF file parsing and text extraction using `pdf-parse`.

### Embedding Service
Generates vector embeddings using Amazon Titan embedding model via AWS Bedrock.

### Vector DB Service
Manages document storage and retrieval in Pinecone vector database.

### AI Agent
Implements RAG pattern to answer questions based on stored documents using Claude via AWS Bedrock.

## Configuration

### AWS Bedrock Models

The application supports various AWS Bedrock models:

**LLM Models (for answering questions):**
- `anthropic.claude-3-sonnet-20240229-v1:0` (default)
- `anthropic.claude-3-haiku-20240307-v1:0`
- `anthropic.claude-3-opus-20240229-v1:0`

**Embedding Models:**
- `amazon.titan-embed-text-v1` (default, 1536 dimensions)
- `amazon.titan-embed-text-v2:0`

### Pinecone Configuration

The application creates a serverless Pinecone index with:
- Dimension: 1536 (matching Titan embeddings)
- Metric: Cosine similarity
- Cloud: AWS
- Region: us-east-1

## AWS Permissions

Your AWS credentials need the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/amazon.titan-embed-text-v1",
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
      ]
    }
  ]
}
```

## Troubleshooting

### AWS Credentials Error
Ensure your AWS credentials are properly configured:
```bash
aws configure
```

### Bedrock Model Access
Request access to Bedrock models in the AWS Console:
1. Go to AWS Bedrock Console
2. Navigate to Model Access
3. Request access to Claude and Titan models

### Pinecone Index Issues
If the index creation fails, verify:
- Your Pinecone API key is correct
- You have sufficient quota for creating indexes

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

Build the project:
```bash
npm run build
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.