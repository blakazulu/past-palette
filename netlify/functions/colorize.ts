import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Color scheme type matching frontend
type ColorScheme =
  | 'roman'
  | 'greek'
  | 'egyptian'
  | 'mesopotamian'
  | 'weathered'
  | 'original'
  | 'custom';

// Request/Response types
interface ColorizeRequest {
  imageBase64: string;
  colorScheme: ColorScheme;
  customPrompt?: string;
  includeRestoration?: boolean;
}

interface ColorizeResponse {
  success: boolean;
  colorizedImageBase64?: string;
  method?: string;
  error?: string;
  processingTimeMs?: number;
}

// Historically accurate color scheme prompts
const COLOR_SCHEME_PROMPTS: Record<ColorScheme, string> = {
  roman: `Colorize this archaeological artifact using historically accurate Ancient Roman colors:
- Vermillion and crimson reds (from cinnabar and iron oxide)
- Egyptian blue (calcium copper silicate)
- Gold leaf accents on important areas
- Terracotta and ochre earth tones
- Deep purple (Tyrian purple for prestigious items)
Apply colors as they would have appeared when newly made in Ancient Rome.`,

  greek: `Colorize this archaeological artifact using historically accurate Ancient Greek colors:
- Terracotta orange (natural clay color)
- Black glaze (black-figure pottery style)
- Mediterranean blue for sea-related items
- White slip for backgrounds
- Red-figure style with reserved red on black
Apply colors consistent with Classical Greek pottery and sculpture.`,

  egyptian: `Colorize this archaeological artifact using historically accurate Ancient Egyptian colors:
- Lapis lazuli blue (sacred color of the sky and Nile)
- Gold (sacred color of the sun god Ra)
- Turquoise and Egyptian faience blue
- Emerald green (color of rebirth and vegetation)
- Red ochre (color of life and vitality)
- Black (color of fertile Nile soil)
Apply colors as they would have appeared in Ancient Egyptian art.`,

  mesopotamian: `Colorize this archaeological artifact using historically accurate Ancient Mesopotamian colors:
- Ultramarine and lapis lazuli blue (precious and sacred)
- Gold and bronze metallic tones
- Brick red and terracotta (ziggurat colors)
- Bitumen black
- White limestone accents
Apply colors consistent with Babylonian and Assyrian art.`,

  weathered: `Apply historically plausible colors to this artifact, but show them as weathered and aged:
- Muted, faded versions of original pigments
- Visible patina and surface degradation
- Some original color remaining in protected areas
- Natural aging and oxidation effects
Show how the artifact might look with its original colors partially preserved.`,

  original: `Analyze this archaeological artifact and apply the most historically accurate colors based on:
- The artifact's apparent culture and time period
- Typical pigments and dyes available to that civilization
- Common color schemes used for this type of object
- Archaeological evidence of original coloring
Apply colors as they would have originally appeared.`,

  custom: '', // User provides their own prompt
};

// Validate request body
function validateRequest(body: unknown): ColorizeRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }

  const req = body as Record<string, unknown>;

  if (!req.imageBase64 || typeof req.imageBase64 !== 'string') {
    throw new Error('Missing or invalid imageBase64');
  }

  if (!req.colorScheme || typeof req.colorScheme !== 'string') {
    throw new Error('Missing or invalid colorScheme');
  }

  const validSchemes: ColorScheme[] = [
    'roman', 'greek', 'egyptian', 'mesopotamian', 'weathered', 'original', 'custom'
  ];

  if (!validSchemes.includes(req.colorScheme as ColorScheme)) {
    throw new Error(`Invalid colorScheme: ${req.colorScheme}`);
  }

  if (req.colorScheme === 'custom' && (!req.customPrompt || typeof req.customPrompt !== 'string')) {
    throw new Error('Custom color scheme requires customPrompt');
  }

  return {
    imageBase64: req.imageBase64 as string,
    colorScheme: req.colorScheme as ColorScheme,
    customPrompt: req.customPrompt as string | undefined,
    includeRestoration: Boolean(req.includeRestoration),
  };
}

// Build the full prompt
function buildPrompt(request: ColorizeRequest): string {
  const basePrompt = request.colorScheme === 'custom'
    ? request.customPrompt!
    : COLOR_SCHEME_PROMPTS[request.colorScheme];

  const restorationAddition = request.includeRestoration
    ? `

Also restore and repair any visible damage:
- Fill in cracks and missing areas
- Repair chips and erosion
- Enhance clarity while maintaining authenticity
- Remove dirt and discoloration artifacts`
    : '';

  return `${basePrompt}${restorationAddition}

IMPORTANT: This is for archaeological research and education.
The colorization is speculative and based on historical evidence.
Output a high-quality colorized version of the artifact image.
Maintain the original composition and details while adding color.`;
}

// Main handler
export const handler: Handler = async (event) => {
  const startTime = Date.now();

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

    // Parse and validate request
    const body = JSON.parse(event.body || '{}');
    const request = validateRequest(body);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        // @ts-expect-error - responseModalities is a valid config but not in types yet
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // Build prompt
    const prompt = buildPrompt(request);

    // Call Gemini with image
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: request.imageBase64,
        },
      },
    ]);

    // Extract colorized image from response
    const response = await result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    let colorizedImageBase64: string | undefined;

    for (const part of parts) {
      if ('inlineData' in part && part.inlineData?.data) {
        colorizedImageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!colorizedImageBase64) {
      throw new Error('No image in AI response');
    }

    const processingTimeMs = Date.now() - startTime;

    const responseBody: ColorizeResponse = {
      success: true,
      colorizedImageBase64,
      method: 'gemini-2.0-flash-exp',
      processingTimeMs,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseBody),
    };
  } catch (error) {
    console.error('Colorization error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const processingTimeMs = Date.now() - startTime;

    const responseBody: ColorizeResponse = {
      success: false,
      error: errorMessage,
      processingTimeMs,
    };

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(responseBody),
    };
  }
};
