require('dotenv').config();
const db = require('./config/db');
const path = require('path');
const { extractTextFromPDF } = require('./utils/pdfExtractor');
const { analyzeMedicalReport } = require('./services/openaiService');

async function test(reportId) {
    console.log(`--- Testing Final AI Logic for Report ID: ${reportId} ---`);
    try {
        const [reports] = await db.execute('SELECT * FROM patient_reports WHERE id = ?', [reportId]);
        if (reports.length === 0) throw new Error('Report not found');
        const report = reports[0];

        // 1.5 Fetch previous analyses
        const [previousReports] = await db.execute(
            'SELECT gpt_analysis, uploaded_at FROM patient_reports WHERE patient_id = ? AND id != ? AND gpt_analysis IS NOT NULL ORDER BY uploaded_at DESC LIMIT 3',
            [report.patient_id, reportId]
        );

        const historicalContext = previousReports.map(pr => ({
            date: pr.uploaded_at,
            analysis: JSON.parse(pr.gpt_analysis)
        }));
        console.log('Historical context records:', historicalContext.length);

        const filePath = path.join(__dirname, report.file_path);
        const { text, images } = await extractTextFromPDF(filePath);
        console.log('Extracted text length:', text?.length);
        console.log('Extracted images count:', images?.length);

        console.log('Analyzing with AI...');
        const analysis = await analyzeMedicalReport(text, images, historicalContext);
        console.log('Analysis summary:', analysis.summary);

        console.log('Updating DB...');
        await db.execute(
            'UPDATE patient_reports SET gpt_analysis = ?, extracted_data = ?, chart_data = ? WHERE id = ?',
            [JSON.stringify(analysis), JSON.stringify(analysis.extracted_data || {}), JSON.stringify(analysis.chart_data || {}), reportId]
        );
        console.log('✓ Success');
    } catch (e) {
        console.error('Test failed:', e);
    }
    process.exit(0);
}

const reportId = process.argv[2] || 4;
test(parseInt(reportId));
