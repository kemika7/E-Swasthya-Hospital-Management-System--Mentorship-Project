const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

/**
 * Analyzes medical report text using OpenAI with advanced medical reasoning.
 * @param {string} extractedText - The text extracted from the PDF.
 * @param {Object} historicalContext - Analysis from previous reports for comparison.
 * @returns {Promise<Object>} - The structured analysis result.
 */
const analyzeMedicalReport = async (extractedText, historicalContext = null) => {
  try {
    const prompt = `
You are an advanced medical diagnostic assistant. Analyze the provided medical report and generate a high-fidelity summarized analysis.

CONTEXT:
${historicalContext ? `HISTORICAL DATA (for Trend Analysis): ${JSON.stringify(historicalContext)}` : 'No previous reports available for trend analysis.'}

TASK:
1. Summary: Condense into a few clear sentences highlighting diagnoses, prescriptions, and key lab results.
2. Lab Test Interpretation: Analyze values (CBC, Glucose, Liver/Kidney, Mutations, etc.). Flag abnormal values with explanations.
3. Trend Analysis: Compare current report to historical data if available.
4. Risk & Alerts: Identify high-risk conditions and provide recommendations.
5. Medication Summary: List all medications, dosages, and durations.
6. Actionable Insights: Suggest next steps.

CRITICAL INSTRUCTIONS FOR DATA EXTRACTION:
- extracted_data: Extract ALL key numeric or status values into this object. (e.g., {"PDGFRA": "Pathogenic", "Tumor Content": "60%"}).
- chart_data: Create a valid Chart.js data object. 
  * If multiple reports (Trend): Show parameter changes over time.
  * If single report: Extract every numeric parameter (e.g., Tumor Content, Allele Frequency, or key Lab Values) and create a BAR chart showing their values.
  * ALWAYS provide at least one dataset if any numeric value exists. Example for single report: {"labels": ["Tumor Content"], "datasets": [{"label": "Percentage (%)", "data": [60]}]}
- abnormality_pie: Count interprets. If status is NOT 'Normal', it's 'Abnormal'.

OUTPUT FORMAT (STRICT JSON):
{
  "summary": "string",
  "lab_interpretation": [
    { "parameter": "name", "value": "value", "status": "Normal|High|Low|Abnormal|Pathogenic", "insight": "explanation" }
  ],
  "trends": "string",
  "risks": [
    { "condition": "name", "severity": "Mild|Moderate|High", "recommendation": "string" }
  ],
  "medications": [
    { "name": "drug", "dose": "dose", "duration": "duration", "notes": "string" }
  ],
  "actionable_insights": ["string"],
  "extracted_data": { "Key": "Value", ... },
  "chart_data": {
    "labels": ["string"],
    "chart_type": "line|bar",
    "datasets": [{ "label": "string", "data": [number] }]
  },
  "abnormality_pie": {
    "labels": ["Normal", "Abnormal"],
    "values": [number, number]
  }
}

REPORT TEXT:
${extractedText.substring(0, 15000)}
`;

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI Service Error:', error);
    throw new Error('Failed to analyze report with AI');
  }
};

module.exports = { analyzeMedicalReport };
