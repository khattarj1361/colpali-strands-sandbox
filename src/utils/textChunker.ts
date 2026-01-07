import { TextChunk } from '../types/index.js';

/**
 * Splits text into chunks of approximately the specified size
 * @param text The text to split
 * @param chunkSize The approximate size of each chunk
 * @param overlap The number of characters to overlap between chunks
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  // Validate inputs to prevent infinite loops
  if (overlap >= chunkSize) {
    throw new Error('Overlap must be less than chunk size');
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.slice(startIndex, endIndex);
    chunks.push(chunk);

    // Move the start index forward, accounting for overlap
    startIndex += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Creates text chunks with metadata
 * @param text The text to chunk
 * @param documentId The document ID
 * @param filename The filename
 * @param chunkSize The size of each chunk
 * @param overlap The overlap between chunks
 * @returns Array of TextChunk objects
 */
export function createTextChunks(
  text: string,
  documentId: string,
  filename: string,
  chunkSize: number = 1000,
  overlap: number = 200
): TextChunk[] {
  const textChunks = chunkText(text, chunkSize, overlap);

  return textChunks.map((chunk, index) => ({
    id: `${documentId}-chunk-${index}`,
    text: chunk,
    metadata: {
      documentId,
      filename,
      chunkIndex: index,
    },
  }));
}
