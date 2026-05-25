import { NextResponse } from "next/server";

// Using an environment variable that contains comma-separated keys
const getGroqKeys = () => {
  const keysString = process.env.GROQ_API_KEYS;
  if (!keysString) return [];
  return keysString.split(",").map(k => k.trim());
};

// In-memory index to track the current active key
let currentKeyIndex = 0;

export async function POST(req: Request) {
  try {
    const GROQ_KEYS = getGroqKeys();
    if (GROQ_KEYS.length === 0) {
      return NextResponse.json({ error: "No API keys configured" }, { status: 500 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const maxRetries = GROQ_KEYS.length;
    let attempts = 0;
    
    // Default system prompt
    const fullMessages = [
      { role: "system", content: "You are Tilda, an intelligent productivity assistant for a web application called 'Productivity Dashboard'. Be helpful, friendly, and concise. You can answer questions about productivity, the app itself, or general knowledge." },
      ...messages
    ];

    while (attempts < maxRetries) {
      const apiKey = GROQ_KEYS[currentKeyIndex];
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // Fast and efficient model
          messages: fullMessages,
          temperature: 0.7,
        })
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ 
          reply: data.choices[0].message.content,
          usedKeyIndex: currentKeyIndex // purely for debugging/info
        });
      }

      // If we hit rate limits (429) or other server errors (5xx)
      if (response.status === 429 || response.status >= 500) {
        console.warn(`[Groq AI] Key at index ${currentKeyIndex} failed with status ${response.status}. Rotating...`);
        // Move to the next key
        currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length;
        attempts++;
      } else {
        // Other errors (e.g. 400 Bad Request) shouldn't trigger key rotation
        const errorData = await response.text();
        return NextResponse.json({ error: "Groq API error: " + errorData }, { status: response.status });
      }
    }

    return NextResponse.json({ error: "All API keys failed due to rate limits." }, { status: 429 });

  } catch (error: any) {
    console.error("[Chat API] Exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
