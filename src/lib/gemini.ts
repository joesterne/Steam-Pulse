import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getSoundtrackRecommendations(gameName: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Recommend 5 soundtracks or songs that would be perfect to listen to while playing "${gameName}". 
    Provide the response in JSON format with an array of objects, each containing "title", "artist", and "reason".`,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are a music expert who specializes in gaming soundtracks and atmospheric music."
    }
  });
  
  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

export async function generateMusicClip(prompt: string) {
  const response = await ai.models.generateContentStream({
    model: "lyria-3-clip-preview",
    contents: prompt,
  });

  let audioBase64 = "";
  let mimeType = "audio/wav";

  for await (const chunk of response) {
    const parts = chunk.candidates?.[0]?.content?.parts;
    if (!parts) continue;
    for (const part of parts) {
      if (part.inlineData?.data) {
        if (!audioBase64 && part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
        audioBase64 += part.inlineData.data;
      }
    }
  }

  if (!audioBase64) return null;

  const binary = atob(audioBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}
