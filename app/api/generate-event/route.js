import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are an event planning assistant. Generate event details based on the user's description.

CRITICAL: Return ONLY valid JSON with properly escaped strings. No newlines in string values - use spaces instead.

Return this exact JSON structure:
{
  "title": "Event title (catchy and professional, single line)",
  "description": "Detailed event description in a single paragraph. Use spaces instead of line breaks. Make it 2-3 sentences describing what attendees will learn and experience.",
  "category": "One of: tech, music, sports, art, food, business, health, education, gaming, networking, outdoor, community",
  "suggestedCapacity": 50,
  "suggestedTicketType": "free"
}

User's event idea: ${prompt}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- All string values must be on a single line with no line breaks
- Use spaces instead of \\n or line breaks in description
- Make title catchy and under 80 characters
- Description should be 2-3 sentences, informative, single paragraph
- suggestedTicketType should be either "free" or "paid"
`;

    // Helper: parse retry delay (ms) from Google RPC RetryInfo if present
    function parseRetryDelayMsFromError(err) {
      try {
        if (err?.errorDetails && Array.isArray(err.errorDetails)) {
          const retryInfo = err.errorDetails.find(
            (d) => d['@type'] && d['@type'].includes('RetryInfo')
          );
          if (retryInfo && retryInfo.retryDelay) {
            const match = String(retryInfo.retryDelay).match(/([0-9]+(\.[0-9]+)?)s/);
            if (match) return Math.ceil(parseFloat(match[1]) * 1000);
          }
        }
      } catch (e) {
        // ignore parse errors
      }
      return null;
    }

    async function generateWithRetry(model, prompt, maxAttempts = 4) {
      let attempt = 0;
      while (attempt < maxAttempts) {
        try {
          const result = await model.generateContent(prompt);
          return result;
        } catch (err) {
          attempt++;
          const isRateLimit = err?.status === 429 || (err?.message && /quota|too many requests/i.test(err.message));
          const retryMs = parseRetryDelayMsFromError(err);
          if (!isRateLimit || attempt >= maxAttempts) {
            throw err;
          }
          const backoffMs = retryMs ?? Math.min(30000, (2 ** attempt) * 1000 + Math.floor(Math.random() * 1000));
          console.warn(`Rate limited, retrying in ${backoffMs}ms (attempt ${attempt} of ${maxAttempts})`);
          await new Promise((r) => setTimeout(r, backoffMs));
        }
      }
      throw new Error('Exceeded retry attempts');
    }

    let result;
    try {
      result = await generateWithRetry(model, systemPrompt);
    } catch (err) {
      const retryMs = parseRetryDelayMsFromError(err);
      const retrySeconds = retryMs ? Math.ceil(retryMs / 1000) : 60;
      console.error('Error generating event (rate limited):', err);
      return NextResponse.json(
        { error: `Rate limit exceeded. Please retry after ${retrySeconds} seconds.` },
        { status: 429, headers: { 'Retry-After': String(retrySeconds) } }
      );
    }

    const response = result.response;
    const text = response.text();

    // Clean the response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }

    console.log(cleanedText);

    let eventData;
    try {
      eventData = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error('Failed to parse model response as JSON:', parseErr, 'response:', cleanedText);
      return NextResponse.json({ error: 'Failed to parse model response' }, { status: 502 });
    }

    return NextResponse.json(eventData);
  } catch (error) {
    console.error("Error generating event:", error);
    return NextResponse.json(
      { error: "Failed to generate event" + error.message },
      { status: 500 }
    );
  }
}