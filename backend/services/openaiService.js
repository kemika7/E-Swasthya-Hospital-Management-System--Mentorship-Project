const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes medical report text and images using OpenAI Vision with role-based behavior.
 * @param {string} reportText - The text extracted from the PDF.
 * @param {string[]} images - Array of base64 encoded page images.
 * @param {Object} historicalContext - Analysis from previous reports for comparison.
 * @param {string} role - The role of the user (patient, doctor, admin).
 * @returns {Promise<Object>} - The structured analysis result.
 */
const analyzeMedicalReport = async (reportText, images = [], historicalContext = null, role = 'patient') => {
  try {
    const prompt = `
You are a highly accurate medical report analysis AI.

TASK:
Analyze the provided medical report text (and images if provided) and extract meaningful clinical insights.

INSTRUCTIONS:
- Identify ALL medical tests, values, units, and reference ranges.
- Detect abnormalities (HIGH / LOW / CRITICAL / NORMAL).
- DO NOT skip data even if formatting is messy.
- DO NOT return generic responses.
- DO NOT say "no findings" unless the report truly has zero medical content.
- DO NOT classify valid reports as non-medical.

ANALYSIS REQUIREMENTS:
- Compare values with reference ranges (if available).
- If no range is given, use general medical knowledge.
- Explain what each abnormal value means in simple terms.
- Infer possible conditions (only if logically inferred, do not overdiagnose).
- Give practical recommendations.

OUTPUT FORMAT (STRICT JSON ONLY — NO EXTRA TEXT):
{
  "type": "LAB_REPORT | RADIOLOGY | PRESCRIPTION | OTHER",
  "summary": "Clear 2-3 line summary of actual findings",
  "key_findings": [
    {
      "test": "Test name",
      "value": "Value with unit",
      "normal_range": "Range or null",
      "status": "HIGH | LOW | NORMAL | CRITICAL",
      "meaning": "Brief medical implication"
    }
  ],
  "abnormalities": ["List of abnormal findings strings"],
  "possible_conditions": ["Inferred conditions"],
  "recommendations": ["Actionable steps"],
  "explanation": "Simple explanation in plain language"
}

REPORT TEXT CONTENT:
"""
${reportText}
"""
`;

    const userContent = [{ type: "text", text: prompt }];
    
    // Add images for Vision analysis if available
    if (images && images.length > 0) {
      images.forEach((base64Image, index) => {
        // CLEAN BASE64: Strip whitespace and ensure correct URI prefix
        const cleanBase64 = base64Image.replace(/\s/g, '');
        const hasPrefix = cleanBase64.startsWith('data:');
        const imageUrl = hasPrefix ? cleanBase64 : `data:image/jpeg;base64,${cleanBase64}`;
        
        console.log(`[AI Vision] Attaching image ${index+1} (Length: ${imageUrl.length})`);
        
        userContent.push({
          type: "image_url",
          image_url: { url: imageUrl }
        });
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: "You are a specialized medical analysis AI that provides structured clinical data." },
        { role: "user", content: userContent }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI Service Error:', error);
    throw new Error('Failed to analyze report with AI');
  }
};

module.exports = { analyzeMedicalReport };
