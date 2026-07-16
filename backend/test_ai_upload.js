const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  formData.append('job_description', 'Title: Software Engineer\nRequirements: Python, React');
  
  // create a dummy pdf file
  const dummyPdfBytes = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n198\n%%EOF');
  
  const blob = new Blob([new Uint8Array(dummyPdfBytes)], { type: 'application/pdf' });
  formData.append('files', blob, 'test.pdf');

  try {
    const response = await fetch('http://localhost:8000/process-resumes', {
      method: 'POST',
      body: formData,
    });
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testUpload();
