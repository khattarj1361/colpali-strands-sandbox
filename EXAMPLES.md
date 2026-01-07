# Example Usage Guide

This guide demonstrates how to use the PDF AI Agent.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your environment variables in `.env`:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Build the project:
```bash
npm run build
```

## Example 1: Upload a PDF

```bash
npm start upload ./path/to/your/document.pdf
```

Example output:
```
Initializing PDF Agent...
Index pdf-documents already exists
PDF Agent ready!

Processing PDF: ./path/to/your/document.pdf
Extracted 25 chunks from PDF
Stored 25 chunks in vector database
✓ Successfully uploaded and processed: document.pdf
```

## Example 2: Query the Agent

```bash
npm start query "What is the main topic discussed in the documents?"
```

Example output:
```
Initializing PDF Agent...
PDF Agent ready!

Query: What is the main topic discussed in the documents?
Searching and generating response...

Answer:
Based on the documents provided, the main topic is...

Sources:
- document.pdf
```

## Example 3: Interactive Mode

```bash
npm start
```

Example session:
```
Initializing PDF Agent...
PDF Agent ready!

=== Interactive Mode ===
Commands:
  - Type your question to query the agent
  - "upload <file_path>" to upload a new PDF
  - "clear" to clear conversation history
  - "quit" or "exit" to exit

You: upload ./research.pdf
Processing PDF: ./research.pdf
Extracted 30 chunks from PDF
✓ Successfully uploaded and processed: research.pdf

You: What are the key findings?
Searching and generating response...

Agent: The key findings from the research paper include:
1. [Finding 1]
2. [Finding 2]
...

Sources: research.pdf

You: Can you elaborate on the first finding?
Searching and generating response...

Agent: Certainly! The first finding discusses...

Sources: research.pdf

You: quit
Goodbye!
```

## Tips

- The agent works best with text-based PDFs (not scanned images)
- For better results, ask specific questions about the content
- Use the interactive mode for follow-up questions with context retention
- Multiple PDFs can be uploaded to query across all documents
- The conversation history in interactive mode helps maintain context

## Troubleshooting

If you encounter issues:

1. **Build errors**: Make sure all dependencies are installed with `npm install`
2. **AWS errors**: Verify your AWS credentials and Bedrock access
3. **Pinecone errors**: Check your API key and ensure the index is created
4. **PDF parsing errors**: Ensure the PDF is text-based and not corrupted
