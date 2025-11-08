import { NextRequest, NextResponse } from 'next/server';
import { getTagsFromText, getTagsFromImage } from '@/app/lib/ollama/mock-adapter';
import { loadDb } from '@/app/lib/db';
import { assembleSetFromTags } from '@/app/lib/outfitLogic';

export async function POST(request: NextRequest) {
  try {
    // 1. Load DB to get available tags for the AI prompt
    // loadDb() is sync, so no 'await' is needed
    const { available_tags } = loadDb();

    // 2. Get form data (text or image)
    const formData = await request.formData();
    const theme = formData.get('theme') as string | null;
    const imageFile = formData.get('image') as File | null;

    let tags: string[] = [];

    // 3. Call the correct AI Adapter (these are async)
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const base64Image = Buffer.from(bytes).toString('base64');
      tags = await getTagsFromImage(base64Image, available_tags);
    } else if (theme) {
      tags = await getTagsFromText(theme, available_tags);
    } else {
      return NextResponse.json({ error: 'No theme or image provided' }, { status: 400 });
    }

    // 4. Call the Outfit Logic (this is sync)
    const outfitSet = assembleSetFromTags(tags);

    // 5. Return the result
    return NextResponse.json({ outfit: outfitSet, tags: tags });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error in generate-outfit-set:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
