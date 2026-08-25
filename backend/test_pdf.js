const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const { extractLeadInfoFromText } = require('./services/parsingService');

async function extractTextFromPDFBuffer(buffer) {
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data, disableFontFace: true });
  const pdfDocument = await loadingTask.promise;
  let fullText = '';
  
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const content = await page.getTextContent();
    let lastY = null;
    let pageText = '';
    
    for (const item of content.items) {
      const currentY = item.transform ? item.transform[5] : null;
      if (lastY !== null && currentY !== null && Math.abs(lastY - currentY) > 5) {
        pageText += '\n';
      } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
        pageText += ' ';
      }
      pageText += item.str;
      lastY = currentY;
    }
    fullText += pageText + '\n';
  }
  
  return fullText;
}

async function createAndTestPDF() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText('Candidate Contact List', { x: 50, y: 350, size: 18, font, color: rgb(0, 0.2, 0.8) });
  page.drawText('1. Aarav Patel - +91 98765 43210 - English', { x: 50, y: 300, size: 12, font });
  page.drawText('2. Priya Sharma - +91 98765 43211 - Hindi', { x: 50, y: 270, size: 12, font });
  page.drawText('3. Rahul Verma - +91 98765 43212 - Tamil', { x: 50, y: 240, size: 12, font });
  page.drawText('4. Sneha Desai - +91 98765 43213 - Spanish', { x: 50, y: 210, size: 12, font });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  console.log('--- TESTING PERFECT PDF LINE EXTRACTION ---');
  const rawText = await extractTextFromPDFBuffer(pdfBuffer);
  console.log('RAW EXTRACTED TEXT:\n' + rawText);

  const leads = extractLeadInfoFromText(rawText, 'Contact_List.pdf');
  console.log('Extracted Candidate Leads Count:', leads.length);
  console.log(JSON.stringify(leads, null, 2));
}

createAndTestPDF().catch(console.error);
