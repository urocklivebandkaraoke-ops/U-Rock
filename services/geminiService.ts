
import { GoogleGenAI } from "@google/genai";
import { ImageSize } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
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

export const generateAlbumArt = async (prompt: string, size: ImageSize) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
            const base64EncodeString: string = part.inlineData.data;
            return `data:image/png;base64,${base64EncodeString}`;
        }
      }
  }
  throw new Error("No image generated");
};