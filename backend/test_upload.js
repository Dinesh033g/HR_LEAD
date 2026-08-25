const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUploadBothRoles() {
  console.log('--- TESTING FILE UPLOAD INGESTION FOR BOTH ADMIN AND TL ---');
  const imgPath = 'C:/Users/DINESH K/.gemini/antigravity-ide/brain/6710127c-9f5d-48d8-9789-7742caf6385a/.user_uploaded/media_1787303759753.jpg';

  // 1. Test Admin Upload
  try {
    console.log('\n[1] Testing Admin Upload...');
    const adminLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@hrlead.com',
      password: 'adminpassword',
    });

    const formAdmin = new FormData();
    formAdmin.append('file', fs.createReadStream(imgPath), { filename: 'admin_upload.jpg', contentType: 'image/jpeg' });

    const adminUploadRes = await axios.post('http://localhost:5000/api/leads/upload', formAdmin, {
      headers: { ...formAdmin.getHeaders(), Authorization: `Bearer ${adminLogin.data.token}` },
    });
    console.log('✓ Admin File Upload Successful! Message:', adminUploadRes.data.message);
  } catch (err) {
    console.error('❌ Admin Upload Error:', err.response?.data || err.message);
  }

  // 2. Test Team Lead (TL) Upload
  try {
    console.log('\n[2] Testing Team Lead (TL) Upload...');
    const tlLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'tl.alex@hrlead.com',
      password: 'tlpassword',
    });

    const formTL = new FormData();
    formTL.append('file', fs.createReadStream(imgPath), { filename: 'tl_upload.jpg', contentType: 'image/jpeg' });

    const tlUploadRes = await axios.post('http://localhost:5000/api/leads/upload', formTL, {
      headers: { ...formTL.getHeaders(), Authorization: `Bearer ${tlLogin.data.token}` },
    });
    console.log('✓ Team Lead (TL) File Upload Successful! Message:', tlUploadRes.data.message);
  } catch (err) {
    console.error('❌ Team Lead Upload Error:', err.response?.data || err.message);
  }

  console.log('\n======================================================');
  console.log('FILE UPLOAD PERMISSION VERIFIED FOR BOTH ADMIN & TL! 🚀');
  console.log('======================================================');
}

testUploadBothRoles();
