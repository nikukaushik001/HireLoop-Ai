async function testJob() {
  try {
    console.log("Registering test user...");
    const regRes = await fetch('http://localhost:4000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Job Test User",
        email: `jobtester_${Date.now()}@test.com`,
        password: "password123"
      })
    });
    const regData = await regRes.json();
    if (!regData.success) {
      console.error("Registration failed:", regData);
      return;
    }
    
    const token = regData.data.accessToken;
    console.log("Got token:", token);

    console.log("Creating Job...");
    const jobRes = await fetch('http://localhost:4000/api/v1/jobs', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "Software Engineer",
        department: "Engineering",
        description: "Must know React and Node.",
        requirements: "5 years experience."
      })
    });
    const jobData = await jobRes.json();
    console.log("Job Create Status:", jobRes.status);
    console.log("Job Create Response:", jobData);
    
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testJob();
