require('dotenv').config({ path: '../.env' });
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5001/api';

async function testPatientAnalysis() {
  try {
    console.log('--- Testing Patient Analysis Endpoint ---');

    // 1. Generate a mock token for patient ID 1
    const patientToken = jwt.sign(
      { id: 1, role: 'patient', roleId: 1 },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    console.log('[Mock] Generated Patient Token');

    // 2. Fetch patient's reports
    let response = await fetch(`${API_BASE}/reports/my-patient-reports`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
    }
    
    const reports = await response.json();
    if (reports.length === 0) {
      console.log('No reports found for patient 1. Please ask the user to upload a document first.');
      return;
    }

    const targetReport = reports[0];
    console.log(`Found Report ID: ${targetReport.id}, File: ${targetReport.file_name}`);

    // 3. Trigger analysis as patient
    console.log('Triggering AI Analysis...');
    response = await fetch(`${API_BASE}/reports/analyze-report`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reportId: targetReport.id })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Analysis failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const analysisData = await response.json();
    console.log('Analysis Response Status:', response.status);
    console.log('Analysis Result:', JSON.stringify(analysisData.analysis.summary, null, 2));
    console.log('-> Success! Patient successfully triggered and received report analysis.');

  } catch (err) {
    console.error('Test Failed! Error:', err.message);
  }
}

testPatientAnalysis();
