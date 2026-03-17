const http = require('http');

http.get('http://localhost:5001/api/doctors', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
        const doctors = JSON.parse(data);
        console.log('Doctors count:', doctors.length);
        doctors.forEach(d => {
            console.log(`- ${d.doctor_name} (Hosp: ${d.hospital_name})`);
        });
    } catch(e) {
        console.log('Body:', data);
    }
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
