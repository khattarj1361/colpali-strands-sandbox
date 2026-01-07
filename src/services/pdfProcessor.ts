import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument } from '../types/index.js';
import { createTextChunks } from '../utils/textChunker.js';

/**
 * Service for processing PDF documents
 */
export class PDFProcessor {
  /**
   * Process a PDF file and extract text content
   * @param filePath Path to the PDF file
   * @returns Parsed PDF document with chunks
   */
  async processPDF(filePath: string): Promise<PDFDocument> {
    try {
      // Read the PDF file
      const dataBuffer = fs.readFileSync(filePath);

      // Parse the PDF
      const data = await pdfParse(dataBuffer);

      // Extract text content
      const content = data.text;

      // Generate a unique ID for the document
      const id = uuidv4();
      const filename = path.basename(filePath);

      // Create text chunks
      const chunks = createTextChunks(content, id, filename);

      return {
        id,
        filename,
        content,
        chunks,
        uploadedAt: new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to process PDF: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Process a PDF from a buffer
   * @param buffer PDF file buffer
   * @param filename Original filename
   * @returns Parsed PDF document with chunks
   */
  async processPDFBuffer(buffer: Buffer, filename: string): Promise<PDFDocument> {
    try {
      // Parse the PDF
      const data = await pdfParse(buffer);

      // Extract text content
      const content = data.text;

      // Generate a unique ID for the document
      const id = uuidv4();

      // Create text chunks
      const chunks = createTextChunks(content, id, filename);

      return {
        id,
        filename,
        content,
        chunks,
        uploadedAt: new Date(),
      };
    } catch (error) {
      throw new Error(
        `Failed to process PDF buffer: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
