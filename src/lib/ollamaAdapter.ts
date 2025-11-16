import { Ollama } from 'ollama';

// Read the host from the environment variable set in docker-compose.
const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
const ollama = new Ollama({ host: host });

/**
 * AI Adapter for turning a text theme into "mood tags"
 */
export async function getTagsFromText(theme: string, available_tags: string[]): Promise<string[]> {
  const systemPrompt = `
    You are an expert fashion stylist AI. Your ONLY job is to analyze a user's
    theme and return a JSON array of tags that match it.
    
    You MUST ONLY use tags from this list: ${available_tags.join(', ')}.
    You MUST ONLY respond with a valid, non-explanatory JSON array.
  `;

  try {
    console.log(`Connecting to Ollama at ${host} for text prompt...`);
    // --- FIX: Pass all required arguments to .generate() ---
    const response = await ollama.generate({
      model: "llama3", // Or your preferred model
      prompt: theme,
      system: systemPrompt,
      format: "json",
    });

    const tags = JSON.parse(response.response) as string[];
    console.log("Ollama text response (tags):", tags);
    return tags;

  } catch (error: unknown) {
    console.error("Error in getTagsFromText adapter:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to get tags from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred in the AI adapter.");
  }
}

/**
 * AI Adapter for turning an image into "mood tags"
 */
export async function getTagsFromImage(base64Image: string, available_tags: string[]): Promise<string[]> {
  const systemPrompt = `
    You are an expert fashion analyst. Analyze the clothes in this image
    and return a JSON array of "mood tags" that describe its style.
    
    You MUST ONLY use tags from this list: ${available_tags.join(', ')}.
    You MUST ONLY respond with a valid, non-explanatory JSON array.
  `;

  try {
    console.log(`Connecting to Ollama at ${host} for image analysis...`);
    // --- FIX: Pass all required arguments to .generate() ---
    const response = await ollama.generate({
      model: "llava", // IMPORTANT: Must be a multimodal model
      prompt: "Analyze the clothing in this image and provide the matching mood tags.",
      images: [base64Image],
      system: systemPrompt,
      format: "json",
    });

    const tags = JSON.parse(response.response) as string[];
    console.log("Ollama image response (tags):", tags);
    return tags;

  } catch (error: unknown) {
    console.error("Error in getTagsFromImage adapter:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to get tags from AI image: ${error.message}`);
    }
    throw new Error("An unknown error occurred in the image AI adapter.");
  }
}
