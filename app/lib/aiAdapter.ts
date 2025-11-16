import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);
// Use Gemini 2.0 or 2.5 - Gemini 1.5 models are retired
// Options: gemini-2.5-flash, gemini-2.0-flash, gemini-2.5-pro
const MODEL_NAME = "gemini-2.5-flash";

// Use a single model instance for both text and vision
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

/**
 * Helper function to parse the AI's JSON response,
 * which might be wrapped in markdown.
 */
function parseAiResponse(rawText: string): string[] {
  try {
    // Clean the text: remove markdown backticks and 'json' label
    const cleanedText = rawText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    // Ensure we return an array
    if (!Array.isArray(parsed)) {
      console.error("AI response is not an array:", parsed);
      return [];
    }

    return parsed as string[];
  } catch (error) {
    console.error("Failed to parse AI JSON response:", rawText, error);
    return [];
  }
}

/**
 * AI Adapter for turning a text theme into "mood tags"
 */
export async function getTagsFromText(
  theme: string,
  available_tags: string[]
): Promise<string[]> {
  if (!theme || theme.trim().length === 0) {
    throw new Error("Theme cannot be empty");
  }

  if (!available_tags || available_tags.length === 0) {
    throw new Error("Available tags list cannot be empty");
  }

  const systemPrompt = `You are an expert fashion stylist AI. Your ONLY job is to analyze a user's theme and return a JSON array of tags that match it.

You MUST ONLY use tags from this list: ${available_tags.join(", ")}.
You MUST respond with ONLY a valid JSON array. No markdown, no code blocks, no explanations.

Example Response:
["casual", "summer", "beach"]

User's Theme: "${theme}"

Return only the JSON array:`;

  try {
    console.log("Connecting to Gemini for text prompt...");

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const rawText = response.text();

    console.log("Gemini raw response:", rawText);

    const tags = parseAiResponse(rawText);

    // Filter to only include valid tags
    const validTags = tags.filter((tag) =>
      available_tags.includes(tag.toLowerCase())
    );

    console.log("Gemini text response (tags):", validTags);
    return validTags;
  } catch (error: unknown) {
    console.error("Error in getTagsFromText (Gemini):", error);
    throw new Error(
      `Failed to get tags from AI: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * AI Adapter for turning an image into "mood tags"
 */
export async function getTagsFromImage(
  base64Image: string,
  mimeType: string,
  available_tags: string[]
): Promise<string[]> {
  if (!base64Image || base64Image.trim().length === 0) {
    throw new Error("Base64 image cannot be empty");
  }

  if (!mimeType || !mimeType.startsWith("image/")) {
    throw new Error("Invalid mime type for image");
  }

  if (!available_tags || available_tags.length === 0) {
    throw new Error("Available tags list cannot be empty");
  }

  const systemPrompt = `You are an expert fashion analyst. Analyze the clothes in this image and return a JSON array of "mood tags" that describe its style.

You MUST ONLY use tags from this list: ${available_tags.join(", ")}.
You MUST respond with ONLY a valid JSON array. No markdown, no code blocks, no explanations.

Example Response:
["streetwear", "casual"]

Return only the JSON array:`;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  try {
    console.log("Connecting to Gemini for image analysis...");

    const result = await model.generateContent([systemPrompt, imagePart]);
    const response = await result.response;
    const rawText = response.text();

    console.log("Gemini raw response:", rawText);

    const tags = parseAiResponse(rawText);

    // Filter to only include valid tags
    const validTags = tags.filter((tag) =>
      available_tags.includes(tag.toLowerCase())
    );

    console.log("Gemini image response (tags):", validTags);
    return validTags;
  } catch (error: unknown) {
    console.error("Error in getTagsFromImage (Gemini):", error);
    throw new Error(
      `Failed to get tags from AI image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
