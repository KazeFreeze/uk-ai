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
  products: ClothingItem[]; // <-- Was 'clothes'
}

// This type defines the structure of the assembled outfit
export type OutfitSet = {
  [key: string]: ClothingItem | null;
  tops: ClothingItem | null;     // <-- Was 'top'
  bottoms: ClothingItem | null;  // <-- Was 'bottom'
  accessories: ClothingItem | null; // <-- Was 'jacket'
};
