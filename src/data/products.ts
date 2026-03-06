import { getCatalogProductByHandle, getCatalogProducts } from '@/lib/catalog';
import type { Product } from '@/types/catalog';

export async function getProductByHandle(handle: string): Promise<Product | undefined> {
  return getCatalogProductByHandle(handle);
}

export async function getAllProducts(): Promise<Product[]> {
  return getCatalogProducts();
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getCatalogProducts();
  return products.filter((product) => product.category === category);
}

export async function getProductsByTag(tag: string): Promise<Product[]> {
  const products = await getCatalogProducts();
  return products.filter((product) => product.tags.includes(tag));
}

export async function getProductsByBuildStyle(style: string): Promise<Product[]> {
  const products = await getCatalogProducts();
  return products.filter((product) => product.buildStyle === style);
}

export async function getProductsByShape(shape: string): Promise<Product[]> {
  const products = await getCatalogProducts();
  return products.filter((product) => product.shape === shape);
}
