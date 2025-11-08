// This file defines the data structures used across the app
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
  clothes: ClothingItem[];
}

// This type defines the structure of the assembled outfit
export type OutfitSet = {
  [key: string]: ClothingItem | null;
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  jacket: ClothingItem | null;
};
