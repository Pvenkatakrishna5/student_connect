import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      return NextResponse.json({ 
        reply: "I am currently running in offline mock mode. The GEMINI_API_KEY environment variable is not configured. Please add your Gemini API Key to .env.local to activate my neural net." 
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are Jarvis, an advanced AI platform agent for StudentConnect. 
You provide career guidance, technical support, and platform navigation.
Format your responses using markdown.
Keep responses concise and professional.
User message: ${message}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return NextResponse.json({ reply: response.text });
  } catch (err: any) {
    console.error("Gemini AI error:", err);
    return NextResponse.json({ reply: "My neural link to Google Gemini encountered an error. Please check your API key and network connection." });
  }
}
