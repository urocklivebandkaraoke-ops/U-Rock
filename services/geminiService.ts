import { GoogleGenAI } from "@google/genai";
import { ImageSize } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAlbumArt = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getClient();
  
  // Gemini 3 Pro Image Preview supports imageSize config
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  // Extract the image from the response parts
  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image generated.");
};

export const createChatStream = async (message: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[]) => {
  const ai = getClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
        systemInstruction: "You are a witty, knowledgeable Karaoke DJ assistant named 'Vinyl'. You help users pick songs, give trivia about artists, and hype up the crowd. Keep responses concise and fun.",
    }
  });

  const result = await chat.sendMessageStream({ message });
  return result;
};