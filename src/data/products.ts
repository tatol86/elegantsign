import fs from 'fs';
import path from 'path';

export type Category = 'House Numbers' | 'House Number + Street' | 'No Junk Mail' | 'Custom Text' | '3D Printed';

export type SizeOption = {
  label: string;
  width: number;
  height: number;
  price: number;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  startingPrice: number;
  images: string[];
  rating: number;
  reviews: number;
  leadTimeDays: string;
  buildStyle?: 'Single Layer' | 'Double Layer' | '3D Raised';
  shape?: 'Square' | 'Rectangle' | 'Circle' | 'Arch' | 'Rounded Rectangle';
  mountingOptions?: ('Mounting Tape' | 'Standoff Screws')[];
  materials?: string[];
  colors?: string[];
  sizes?: string[]; // Legacy flat sizes
  sizeOptions?: SizeOption[];
  // Legacy single price field — use startingPrice or sizeOptions[].price instead
  price?: number;
};

// Read products dynamically from the JSON file to ensure we get real-time admin updates
const getProductsData = (): Product[] => {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'data', 'products.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const productsData = JSON.parse(rawData);
    return (productsData as unknown as Product[]).map(p => ({
      ...p,
      // Provide legacy `price` field from startingPrice for backward compat
      price: p.price ?? p.startingPrice ?? 0,
    }));
  } catch (error) {
    console.error("Error reading products:", error);
    return [];
  }
};

export const products: Product[] = []; // Kept for backwards compatibility but shouldn't be used directly

export const getProductByHandle = (handle: string): Product | undefined =>
  getProductsData().find(p => p.handle === handle);

export const getProductsByCategory = (category: string): Product[] =>
  getProductsData().filter(p => p.category === category);

export const getProductsByTag = (tag: string): Product[] =>
  getProductsData().filter(p => p.tags.includes(tag));

export const getProductsByBuildStyle = (style: string): Product[] =>
  getProductsData().filter(p => p.buildStyle === style);

export const getProductsByShape = (shape: string): Product[] =>
  getProductsData().filter(p => p.shape === shape);

export const getAllProducts = (): Product[] => getProductsData();
