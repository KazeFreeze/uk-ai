import { NextRequest, NextResponse } from 'next/server';
import { getTagsFromText, getTagsFromImage } from '@/app/lib/aiAdapter';
import { loadDb } from '@/app/lib/db';
import { assembleSetFromTags } from '@/app/lib/outfitLogic';

export async function POST(request: NextRequest) {
  try {
    // 1. Load DB ONCE and get 'products'
    const { available_tags, products } = loadDb(); // <-- Was 'clothes'

    // 2. Get form data (text or image)
    const formData = await request.formData();
    const theme = formData.get('theme') as string | null;
    const imageFile = formData.get('image') as File | null;

    let tags: string[] = [];

    // 3. Call the correct AI Adapter
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const base64Image = Buffer.from(bytes).toString('base64');
      const mimeType = imageFile.type;

      tags = await getTagsFromImage(base64Image, mimeType, available_tags);

    } else if (theme) {
      tags = await getTagsFromText(theme, available_tags);
    } else {
      return NextResponse.json({ error: 'No theme or image provided' }, { status: 400 });
    }

    // 4. Call the Outfit Logic, passing 'products'
    const outfitSet = assembleSetFromTags(tags, products); // <-- Was 'clothes'

    // 5. Return the result
    return NextResponse.json({ outfit: outfitSet, tags: tags });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error in generate-outfit-set:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
