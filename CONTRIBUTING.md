# Contributing Guide

Thank you for considering contributing to the PDF AI Agent project!

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/colpali-strands-sandbox.git
   cd colpali-strands-sandbox
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file with your test credentials

## Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the `src/` directory

3. Build and test your changes:
   ```bash
   npm run build
   npm start
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Open a Pull Request

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

## Project Structure

```
src/
├── index.ts              # Main application entry
├── services/             # Business logic
│   ├── aiAgent.ts       # RAG implementation
│   ├── embeddingService.ts
│   ├── pdfProcessor.ts
│   └── vectorDBService.ts
├── types/               # TypeScript types
└── utils/               # Helper functions
```

## Adding New Features

### Adding a New PDF Processor
1. Create a new file in `src/services/`
2. Implement the same interface as `pdfProcessor.ts`
3. Update `index.ts` to use your new processor

### Adding a New Vector Database
1. Create a new service in `src/services/`
2. Implement methods: `initializeIndex`, `storeChunks`, `queryChunks`
3. Update `index.ts` to allow selection via config

### Adding a New LLM Provider
1. Create a new agent service
2. Implement the `query` and `chat` methods
3. Update configuration to support provider selection

## Testing

Currently, the project uses manual testing. To test:

1. Upload a sample PDF:
   ```bash
   npm start upload test.pdf
   ```

2. Query the content:
   ```bash
   npm start query "What is this document about?"
   ```

3. Try interactive mode:
   ```bash
   npm start
   ```

## Documentation

When adding features, please update:
- README.md for user-facing changes
- ARCHITECTURE.md for architectural changes
- EXAMPLES.md for usage examples
- Code comments for implementation details

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include a clear description of the changes
- Update documentation as needed
- Ensure the code builds without errors
- Test your changes manually

## Areas for Contribution

We welcome contributions in these areas:

- **Testing**: Add unit tests and integration tests
- **Error Handling**: Improve error messages and recovery
- **Performance**: Optimize embedding generation and vector search
- **Features**:
  - Support for other document formats (Word, HTML, etc.)
  - Multiple vector database backends
  - Streaming responses
  - Document update/deletion UI
  - Web interface
- **Documentation**: Improve guides and add tutorials
- **Examples**: Add more usage examples

## Questions?

Open an issue for:
- Bug reports
- Feature requests
- Questions about implementation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
