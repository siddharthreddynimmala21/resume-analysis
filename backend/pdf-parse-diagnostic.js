import pdfParse from 'pdf-parse';

console.log('PDF Parse Module Diagnostic');
console.log('Module Type:', typeof pdfParse);
console.log('Module Keys:', Object.keys(pdfParse));

try {
  console.log('Attempting to call pdfParse directly');
  const result = pdfParse(Buffer.from('test'));
  console.log('Direct call result:', result);
} catch (error) {
  console.error('Error in direct call:', error);
}

export default pdfParse; 