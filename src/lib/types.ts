export interface ClothingItem {
  id: string;
  name: string;
  type: string;
  tags: string[];
  imageUrl: string;
  shopUrl: string;
}

export interface Database {
  available_tags: string[];
  products: ClothingItem[];
}

// This type defines the structure of the assembled outfit
export type OutfitSet = {
  [key: string]: ClothingItem | null;
  tops: ClothingItem | null;
  bottoms: ClothingItem | null;
  accessories: ClothingItem | null;
  bags: ClothingItem | null;
  shoes: ClothingItem | null;
};
