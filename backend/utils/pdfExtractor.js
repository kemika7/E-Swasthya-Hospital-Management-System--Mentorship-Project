const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

/**
 * Extracts text and optionally images (for Vision analysis) from a PDF file.
 * @param {string} absolutePath - The absolute path to the PDF file.
 * @returns {Promise<{text: string, images: string[]}>} - The extracted text and page screenshots as base64.
 */
const extractTextFromPDF = async (absolutePath) => {
  try {
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const dataBuffer = fs.readFileSync(absolutePath);
    
    // Correct pdf-parse v2 usage:
    const parser = new PDFParse({ data: dataBuffer });
    const textResult = await parser.getText();
    
    // Basic cleaning: remove noise, unnecessary spaces, and broken lines
    let text = textResult.text || '';
    text = text.replace(/\n+/g, '\n').replace(/[ \t]+/g, ' ');
    text = text.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');

    // Vision Fallback: If text is very short (e.g. scanned PDF), render pages as images
    let images = [];
    if (text.length < 500) {
      console.log(`[PdfExtractor] Short text (${text.length} chars). Rendering pages for Vision...`);
      try {
        const screenshotResult = await parser.getScreenshot({ 
          scale: 1.5,
          first: 1,
          last: 3 // Only render first 3 pages to save tokens/memory
        });
        if (screenshotResult && screenshotResult.pages) {
          images = screenshotResult.pages.map((p, i) => {
            // Ensure we have a Buffer before converting to base64
            const imgBuffer = Buffer.isBuffer(p.data) ? p.data : Buffer.from(p.data);
            const base64 = imgBuffer.toString('base64');
            console.log(`[PdfExtractor] Page ${i+1} rendered. Buffer size: ${imgBuffer.length}, Base64 length: ${base64.length}`);
            return base64;
          });
        }
      } catch (screenshotErr) {
        console.warn('[PdfExtractor] Screenshot rendering failed:', screenshotErr.message);
      }
    }

    await parser.destroy(); // Free memory
    return { text, images };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

module.exports = { extractTextFromPDF };
