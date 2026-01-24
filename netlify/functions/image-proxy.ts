import type { Handler } from '@netlify/functions';

const ALLOWED_ORIGINS = [
  'https://firebasestorage.googleapis.com',
  'https://past-palette-3c4ea.firebasestorage.app',
];

export const handler: Handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing url parameter' }),
    };
  }

  // Validate the URL is from Firebase Storage
  const isAllowed = ALLOWED_ORIGINS.some((origin) => url.startsWith(origin));
  if (!isAllowed) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'URL not allowed' }),
    };
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Failed to fetch image: ${response.statusText}` }),
      };
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Image proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch image' }),
    };
  }
};
