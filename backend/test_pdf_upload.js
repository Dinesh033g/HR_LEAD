const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const axios = require('axios');
const FormData = require('form-data');

async function testPDFFileUpload() {
  console.log('--- TESTING PDF FILE UPLOAD VIA HTTP API ---');

  // Create multi-candidate test PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText('Forge Candidate List 2026', { x: 50, y: 350, size: 18, font, color: rgb(0, 0.2, 0.8) });
  page.drawText('1. Aarav Patel - +91 98765 43210 - English', { x: 50, y: 300, size: 12, font });
  page.drawText('2. Priya Sharma - +91 98765 43211 - Hindi', { x: 50, y: 270, size: 12, font });
  page.drawText('3. Rahul Verma - +91 98765 43212 - Tamil', { x: 50, y: 240, size: 12, font });
  page.drawText('4. Sneha Desai - +91 98765 43213 - Spanish', { x: 50, y: 210, size: 12, font });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  // Admin login
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'admin@hrlead.com',
    password: 'adminpassword',
  });

  const form = new FormData();
  form.append('file', pdfBuffer, {
    filename: 'Contact_List_2026.pdf',
    contentType: 'application/pdf',
  });

  const uploadRes = await axios.post('http://localhost:5000/api/leads/upload', form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${loginRes.data.token}`,
    },
  });

  console.log('✓ UPLOAD SUCCESSFUL!');
  console.log('Server Message:', uploadRes.data.message);
  console.log('Extracted Candidate Count:', uploadRes.data.count);
  console.log('Ingested Candidates List:');
  uploadRes.data.leads.forEach((l, idx) => {
    console.log(`  [${idx + 1}] Candidate: ${l.name} | Phone: ${l.phone} | Lang: ${l.language}`);
  });
}

testPDFFileUpload().catch(e => console.error('Upload Error:', e.response?.data || e.message));
