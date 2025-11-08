import { NextRequest, NextResponse } from 'next/server';
// --- FIX: Update the import path ---
import { getTagsFromText, getTagsFromImage } from '@/app/lib/aiAdapter';
import { loadDb } from '@/app/lib/db';
import { assembleSetFromTags } from '@/app/lib/outfitLogic';

export async function POST(request: NextRequest) {
  try {
    const { available_tags } = loadDb();

    const formData = await request.formData();
    const theme = formData.get('theme') as string | null;
    const imageFile = formData.get('image') as File | null;

    let tags: string[] = [];

    if (imageFile) {
      // --- FIX: We now need the mimeType for Gemini ---
      const bytes = await imageFile.arrayBuffer();
      const base64Image = Buffer.from(bytes).toString('base64');
      const mimeType = imageFile.type; // Get the file's mime type

      tags = await getTagsFromImage(base64Image, mimeType, available_tags);

    } else if (theme) {
      tags = await getTagsFromText(theme, available_tags);
    } else {
      return NextResponse.json({ error: 'No theme or image provided' }, { status: 400 });
    }

    const outfitSet = assembleSetFromTags(tags);

    return NextResponse.json({ outfit: outfitSet, tags: tags });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error in generate-outfit-set:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
