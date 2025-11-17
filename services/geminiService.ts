// FIX: Uncommented the service and updated it to follow Gemini API best practices.
import { GoogleGenAI, Type } from '@google/genai';

// FIX: Initialize GoogleGenAI with the API key from environment variables.
// The API key must be provided via `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBtcTrendSignal = async (): Promise<boolean> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Based on the very latest market data and news, is the current short-term (next 24 hours) price trend for BTC/USD more likely to be bullish or bearish? Respond ONLY with the specified JSON format.',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_bullish: {
              type: Type.BOOLEAN,
              description: 'True if the trend is bullish, false if it is bearish.'
            },
            confidence: {
              type: Type.STRING,
              description: 'Confidence level: high, medium, or low.'
            }
          },
          required: ['is_bullish']
        }
      }
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      console.error("Gemini API returned an empty response.");
      return Math.random() > 0.5; // Fallback to random
    }
    
    const result = JSON.parse(jsonText);
    return result.is_bullish;

  } catch (error) {
    console.error("Error fetching BTC trend from Gemini API:", error);
    // In case of an API error, return a random boolean as a fallback.
    return Math.random() > 0.5;
  }
};