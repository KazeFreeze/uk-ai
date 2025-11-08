import db from '/public/db.json';
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

export async function POST(request: Request) {
  const { theme } = await request.json();
  const { available_tags } = db;

  // This prompt is the "magic" of your wrapper
  const systemPrompt = `
    You are a fashion stylist AI. Your only job is to analyze a user's theme
    and return a JSON array of tags that match it.
    
    You MUST ONLY use tags from this list: ${available_tags.join(', ')}.
    You MUST ONLY respond with a valid, non-explanatory JSON array.
    
    Example:
    User: "I'm going to a beach party"
    Response: ["summer", "beach", "party"]
    
    Example:
    User: "I want to look like a character from Bladerunner"
    Response: ["cyberpunk", "streetwear"]
  `;

  const response = await ollama.generate({
    model: "llama3", // Or whatever model you have
    prompt: theme,
    system: systemPrompt,
    format: "json", // Tell Ollama to *force* JSON output
  });

  // The 'response.response' will be the pure JSON string '["tag1", "tag2"]'
  const tags = JSON.parse(response.response);

  // Now, filter your database
  const matchingClothes = db.clothes.filter(item =>
    tags.every((tag: string) => item.tags.includes(tag))
  );

  return Response.json({ results: matchingClothes });
}
