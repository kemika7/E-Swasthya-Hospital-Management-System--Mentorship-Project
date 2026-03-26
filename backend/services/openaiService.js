const OpenAI = require('openai');

let openai = null;

const getOpenAIClient = () => {
  if (openai) return openai;
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[OpenAI] OPENAI_API_KEY is missing. AI analysis will be disabled.');
    return null;
  }

  openai = new OpenAI({
    apiKey: apiKey,
  });
  return openai;
};

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
- Give a simple explanation in plain language.

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

    const client = getOpenAIClient();
    if (client) {
      // ─── OpenAI Implementation (Supports Vision) ───────────────────────────
      const userContent = [{ type: "text", text: prompt }];

      if (images && images.length > 0) {
        images.forEach((base64Image, index) => {
          const cleanBase64 = base64Image.replace(/\s/g, '');
          const hasPrefix = cleanBase64.startsWith('data:');
          const imageUrl = hasPrefix ? cleanBase64 : `data:image/jpeg;base64,${cleanBase64}`;
          userContent.push({
            type: "image_url",
            image_url: { url: imageUrl }
          });
        });
      }

      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a specialized medical analysis AI that provides structured clinical data." },
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(completion.choices[0].message.content);
    } else {
      // ─── Groq Fallback (Text-only Analysis) ────────────────────────────────
      const Groq = require('groq-sdk');
      const groqKey = process.env.GROQ_API_KEY;
      
      if (!groqKey) {
        throw new Error('Both OpenAI and Groq API keys are missing. AI analysis unavailable.');
      }

      console.log('[OpenAI Service] Falling back to Groq for analysis...');
      const groqClient = new Groq({ apiKey: groqKey });
      
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [
          { role: "system", content: "You are a specialized medical analysis AI that provides structured clinical data." },
          { role: "user", content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      return JSON.parse(chatCompletion.choices[0].message.content);
    }
  } catch (error) {
    console.error('AI Service (OpenAI/Groq) Error:', error);
    throw new Error('Failed to analyze report with AI: ' + error.message);
  }
};

module.exports = { analyzeMedicalReport };
