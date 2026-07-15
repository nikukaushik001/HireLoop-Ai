const axios = require('axios');

async function testFrontendUpload() {
  try {
    console.log("Registering test user...");
    const regRes = await axios.post('http://localhost:4000/api/v1/auth/register', {
      name: "Frontend Tester",
      email: `frontend_${Date.now()}@test.com`,
      password: "password123"
    });
    
    const token = regRes.data.data.accessToken;

    console.log("Creating Job...");
    const jobRes = await axios.post('http://localhost:4000/api/v1/jobs', {
      title: "Software Engineer",
      department: "Engineering",
      description: "Must know React and Node.",
      requirements: "5 years experience."
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const jobId = jobRes.data.data.id;

    console.log("Simulating Frontend Axios Upload...");
    const FormData = require('form-data');
    const form = new FormData();
    form.append('jobId', jobId);
    form.append('files', Buffer.from("dummy pdf text"), {
      filename: 'dummy.pdf',
      contentType: 'application/pdf'
    });

    const uploadRes = await axios.post('http://localhost:4000/api/v1/resumes/upload', form, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      }
    });

    console.log("Upload Response:", uploadRes.data);
  } catch (err) {
    if (err.response) {
      console.error("Axios error status:", err.response.status);
      console.error("Axios error data:", err.response.data);
    } else {
      console.error("Fetch error:", err.message);
    }
  }
}

testFrontendUpload();
