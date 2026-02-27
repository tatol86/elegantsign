import productsData from './products.json';

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

// Cast the JSON data to typed Product array
export const products: Product[] = (productsData as unknown as Product[]).map(p => ({
  ...p,
  // Provide legacy `price` field from startingPrice for backward compat
  price: p.price ?? p.startingPrice ?? 0,
}));

export const getProductByHandle = (handle: string): Product | undefined =>
  products.find(p => p.handle === handle);

export const getProductsByCategory = (category: string): Product[] =>
  products.filter(p => p.category === category);

export const getProductsByTag = (tag: string): Product[] =>
  products.filter(p => p.tags.includes(tag));

export const getProductsByBuildStyle = (style: string): Product[] =>
  products.filter(p => p.buildStyle === style);

export const getProductsByShape = (shape: string): Product[] =>
  products.filter(p => p.shape === shape);

export const getAllProducts = (): Product[] => products;
