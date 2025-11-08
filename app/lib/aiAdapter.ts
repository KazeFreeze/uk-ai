import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Helper function to parse the AI's JSON response,
 * which might be wrapped in markdown.
 */
function parseAiResponse(rawText: string): string[] {
  try {
    // Clean the text: remove markdown backticks and 'json' label
    const cleanedText = rawText
      .replace(/```json\n/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanedText) as string[];
  } catch (error) {
    console.error("Failed to parse AI JSON response:", rawText);
    return []; // Return empty on failure
  }
}

/**
 * AI Adapter for turning a text theme into "mood tags"
 */
export async function getTagsFromText(theme: string, available_tags: string[]): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const systemPrompt = `
    You are an expert fashion stylist AI. Your ONLY job is to analyze a user's
    theme and return a JSON array of tags that match it.
    
    You MUST ONLY use tags from this list: ${available_tags.join(', ')}.
    You MUST ONLY respond with a valid JSON array inside a markdown code block.
    
    Example Response:
    \`\`\`json
    ["casual", "summer", "beach"]
    \`\`\`

    User's Theme: "${theme}"
  `;

  try {
    console.log("Connecting to Gemini for text prompt...");
    const result = await model.generateContent(systemPrompt);
    const rawText = result.response.text();
    const tags = parseAiResponse(rawText);

    console.log("Gemini text response (tags):", tags);
    return tags;

  } catch (error: unknown) {
    console.error("Error in getTagsFromText (Gemini):", error);
    throw new Error("Failed to get tags from AI.");
  }
}

/**
 * AI Adapter for turning an image into "mood tags"
 * NOTE: This function's signature has changed to accept a mimeType.
 */
export async function getTagsFromImage(
  base64Image: string,
  mimeType: string,
  available_tags: string[]
): Promise<string[]> {

  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const systemPrompt = `
    You are an expert fashion analyst. Analyze the clothes in this image
    and return a JSON array of "mood tags" that describe its style.
    
    You MUST ONLY use tags from this list: ${available_tags.join(', ')}.
    You MUST ONLY respond with a valid JSON array inside a markdown code block.
    
    Example Response:
    \`\`\`json
    ["streetwear", "casual"]
    \`\`\`
  `;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType, // e.g., "image/jpeg", "image/png"
    },
  };

  try {
    console.log("Connecting to Gemini for image analysis...");
    const result = await model.generateContent([systemPrompt, imagePart]);
    const rawText = result.response.text();
    const tags = parseAiResponse(rawText);

    console.log("Gemini image response (tags):", tags);
    return tags;

  } catch (error: unknown) {
    console.error("Error in getTagsFromImage (Gemini):", error);
    throw new Error("Failed to get tags from AI image.");
  }
}
