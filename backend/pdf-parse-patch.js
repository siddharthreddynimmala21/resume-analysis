import * as pdfParseModule from 'pdf-parse';

// Extract the default export or the main function
const originalPdfParse = pdfParseModule.default || pdfParseModule;

// Wrap the original pdf-parse to prevent file system operations
export default function safePdfParse(buffer, options) {
  // Remove any file system related initialization
  if (typeof buffer === 'string') {
    console.warn('File path parsing disabled for security');
    return Promise.resolve({ text: '' });
  }
  
  return originalPdfParse(buffer, options);
}

// Copy over static methods and properties
Object.keys(originalPdfParse).forEach(key => {
  if (key !== 'default') {
    safePdfParse[key] = originalPdfParse[key];
  }
}); 