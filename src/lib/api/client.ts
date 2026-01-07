import type { ColorScheme } from '@/types/artifact';

const API_BASE = '/.netlify/functions';

export interface ColorizeRequest {
  imageBase64: string;
  colorScheme: ColorScheme;
  customPrompt?: string;
  includeRestoration?: boolean;
}

export interface ColorizeResponse {
  success: boolean;
  colorizedImageBase64?: string;
  method?: string;
  error?: string;
  processingTimeMs?: number;
}

export async function colorizeImage(request: ColorizeRequest): Promise<ColorizeResponse> {
  const response = await fetch(`${API_BASE}/colorize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Colorization request failed');
  }

  return response.json();
}

export interface IdentifyResponse {
  success: boolean;
  name?: string;
  error?: string;
}

export async function identifyArtifact(imageBase64: string): Promise<IdentifyResponse> {
  const response = await fetch(`${API_BASE}/identify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Identification request failed');
  }

  return response.json();
}

// Utility to convert Blob to base64
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Utility to convert base64 to Blob
export function base64ToBlob(base64: string, mimeType = 'image/png'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
