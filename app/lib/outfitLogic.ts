import { loadDb } from './db';
import { ClothingItem, OutfitSet } from './types';

/**
 * Assembles a complete outfit set (top, bottom, jacket)
 * by filtering the database by a list of AI-generated tags.
 */
export function assembleSetFromTags(tags: string[]): OutfitSet {
  const { clothes } = loadDb();

  // 1. Filter all clothes that match ALL the required tags
  const matchingClothes = clothes.filter((item: ClothingItem) =>
    tags.every(tag => item.tags.includes(tag))
  );

  // 2. Group the matching clothes by their type
  const itemsByType = matchingClothes.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as { [key: string]: ClothingItem[] });

  // 3. Build the outfit by picking one random item from each category
  const outfitSet: OutfitSet = {
    top: null,
    bottom: null,
    jacket: null,
  };

  for (const type in outfitSet) {
    if (itemsByType[type] && itemsByType[type].length > 0) {
      // Pick a random item of that type
      const randomIndex = Math.floor(Math.random() * itemsByType[type].length);
      outfitSet[type] = itemsByType[type][randomIndex];
    }
  }

  return outfitSet;
}
