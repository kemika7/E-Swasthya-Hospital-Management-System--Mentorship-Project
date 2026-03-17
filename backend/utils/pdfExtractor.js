const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * Extracts text from a PDF file and cleans it up.
 * @param {string} absolutePath - The absolute path to the PDF file.
 * @returns {Promise<string>} - The extracted and cleaned text.
 */
const extractTextFromPDF = async (absolutePath) => {
  try {
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const dataBuffer = fs.readFileSync(absolutePath);
    
    // v2.4.5 usage:
    const parser = new pdf.PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    
    // Basic cleaning: remove noise, unnecessary spaces, and broken lines
    let text = data.text;
    
    // Replace multiple newlines or spaces with single ones
    text = text.replace(/\n+/g, '\n');
    text = text.replace(/[ \t]+/g, ' ');
    
    // Trim each line
    text = text.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');

    await parser.destroy();
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

module.exports = { extractTextFromPDF };
