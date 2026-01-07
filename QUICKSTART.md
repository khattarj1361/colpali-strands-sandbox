# Quick Start Guide

Get up and running with the PDF AI Agent in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- AWS account with Bedrock access
- Pinecone account

## Step 1: Install

```bash
npm install
```

## Step 2: Configure

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- PINECONE_API_KEY
- PINECONE_INDEX_NAME

## Step 3: Enable AWS Bedrock Models

1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock)
2. Click "Model access" in the left sidebar
3. Request access to:
   - Claude 3 Sonnet
   - Amazon Titan Embeddings

## Step 4: Build

```bash
npm run build
```

## Step 5: Test Setup

```bash
npm run test:setup
```

## Step 6: Run

### Interactive Mode
```bash
npm start
```

### Upload a PDF
```bash
npm start upload path/to/file.pdf
```

### Query
```bash
npm start query "your question here"
```

## Common Issues

### "Model not found" error
- Ensure you've requested model access in AWS Bedrock Console
- Wait a few minutes for access to be granted

### "Index not found" error
- The app will create the index automatically on first run
- Check your Pinecone API key is correct

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

- Read [EXAMPLES.md](EXAMPLES.md) for detailed usage examples
- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
- See [README.md](README.md) for complete documentation
