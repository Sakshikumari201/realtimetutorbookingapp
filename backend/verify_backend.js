import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function verify() {
  console.log('🔍 Verifying Backend API...');

  try {
    // 1. Health Check
    console.log('👉 Checking Health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.statusText}`);
    const healthData = await healthRes.json();
    console.log('✅ Health OK:', healthData);

    // 2. Access Tutors (Public endpoint)
    console.log('👉 Fetching Tutors...');
    const tutorsRes = await fetch(`${BASE_URL}/api/tutors`);
    if (!tutorsRes.ok) throw new Error(`Fetch tutors failed: ${tutorsRes.statusText}`);
    const tutorsData = await tutorsRes.json();
    console.log(`✅ Tutors Fetched: ${tutorsData.total || tutorsData.tutors.length} found`);

    if (tutorsData.tutors && tutorsData.tutors.length > 0) {
      console.log('   Sample Tutor:', tutorsData.tutors[0].name);
    } else {
      console.warn('⚠️ No tutors found in response');
    }

    console.log('🎉 Backend Verification Passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification Failed:', error.message);
    process.exit(1);
  }
}

// Wait for server to start
setTimeout(verify, 3000);
