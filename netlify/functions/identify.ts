import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface IdentifyRequest {
  imageBase64: string;
}

interface IdentifyResponse {
  success: boolean;
  name?: string;
  error?: string;
}

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  try {
    // Validate API key
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable not set');
    }

    // Parse request
    const body = JSON.parse(event.body || '{}') as IdentifyRequest;
    if (!body.imageBase64) {
      throw new Error('Missing imageBase64');
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Ask model to identify the artifact
    const prompt = `Look at this archaeological artifact image. Identify what it is in exactly 2-3 words.
Be specific but concise. Examples: "Bronze Dagger", "Clay Amphora", "Stone Tablet", "Gold Pendant", "Marble Bust".
Respond with ONLY the name, nothing else.`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: body.imageBase64,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text().trim();

    // Clean up the response - take first 3 words max
    const words = text.split(/\s+/).slice(0, 3);
    const name = words.join(' ');

    const responseBody: IdentifyResponse = {
      success: true,
      name,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseBody),
    };
  } catch (error) {
    console.error('Identification error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const responseBody: IdentifyResponse = {
      success: false,
      error: errorMessage,
    };

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(responseBody),
    };
  }
};
