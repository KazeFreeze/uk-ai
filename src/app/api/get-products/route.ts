import { NextResponse } from 'next/server';
import { loadDb } from '@/lib/db';

const MAX_INITIAL_PRODUCTS = 15;

export async function GET() {
  try {
    const { products } = loadDb();

    // Limit to the first 15 products
    const initialProducts = products.slice(0, MAX_INITIAL_PRODUCTS);

    return NextResponse.json({ products: initialProducts });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error in get-products:", errorMessage);
    return NextResponse.json({ error: 'Failed to load initial products', message: errorMessage }, { status: 500 });
  }
}
