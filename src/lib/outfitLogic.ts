import { ClothingItem, OutfitSet } from './types';

/**
 * Assembles a complete outfit set
 * by filtering the database by a list of AI-generated tags.
 * @param tags - An array of tags from the AI.
 * @param products - The complete array of clothing items from the DB.
 */
export function assembleSetFromTags(tags: string[], products: ClothingItem[]): OutfitSet {
  // 1. Filter all clothes that match ALL the required tags
  const matchingClothes = products.filter((item: ClothingItem) =>
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
    tops: null,
    bottoms: null,
    accessories: null,
    bags: null,
    shoes: null,
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
