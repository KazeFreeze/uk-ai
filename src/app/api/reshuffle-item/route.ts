import { NextRequest, NextResponse } from 'next/server';
import { loadDb } from '@/lib/db';
import { ClothingItem } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { tags, item_type, exclude_id } = await request.json();

    if (!tags || !item_type || !exclude_id) {
      return NextResponse.json({ error: 'Missing required fields: tags, item_type, exclude_id' }, { status: 400 });
    }

    const { products } = loadDb();

    // 1. Find all items of the correct type that match the tags
    const candidates = products.filter((item: ClothingItem) => {
      return (
        item.type === item_type &&
        tags.every((tag: string) => item.tags.includes(tag))
      );
    });

    // 2. Filter out the item we want to exclude
    const newOptions = candidates.filter((item: ClothingItem) => item.id !== exclude_id);

    if (newOptions.length > 0) {
      // 3. Pick a new random item from the remaining options
      const randomIndex = Math.floor(Math.random() * newOptions.length);
      return NextResponse.json({ newItem: newOptions[randomIndex] });
    } else {
      // No other options found, return the original item
      const originalItem = products.find(item => item.id === exclude_id);
      return NextResponse.json({ newItem: originalItem, message: 'No other items match this style.' });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error in reshuffle-item:", errorMessage);
    return NextResponse.json({ error: 'Failed to reshuffle item', message: errorMessage }, { status: 500 });
  }
}
