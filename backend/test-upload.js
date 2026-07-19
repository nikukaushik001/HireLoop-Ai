import fs from 'fs';

async function run() {
  const formData = new FormData();
  formData.append('job_description', 'Test Job');
  
  // create dummy pdf
  const pdfBuffer = Buffer.from('%PDF-1.4\nTest');
  
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  formData.append('files', blob, 'test.pdf');
  
  console.log('Sending fetch...');
  const res = await fetch('http://localhost:8000/api/v1/ai/process-resumes', {
    method: 'POST',
    body: formData
  });
  
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
}

run().catch(console.error);
