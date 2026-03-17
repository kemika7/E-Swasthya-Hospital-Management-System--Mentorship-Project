const http = require('http');

http.get('http://localhost:5001/api/doctors/hospitals/1/doctors', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const doctors = JSON.parse(data);
    console.log('Doctors count:', doctors.length);
    doctors.forEach(d => {
        console.log(`- ${d.doctor_name} (${d.specialization})`);
    });
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
