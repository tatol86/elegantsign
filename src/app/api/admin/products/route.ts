import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');

function readProducts() {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
}

function writeProducts(products: any[]) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(products, null, 2), 'utf-8');
}

// GET all products
export async function GET() {
    try {
        const products = readProducts();
        return NextResponse.json(products, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
    }
}

// POST create new product
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const products = readProducts();

        // Generate ID and handle from title
        const cleanTitle = (body.title || '').trim();
        const generatedHandle = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const generatedId = `product-${Date.now()}`;

        // Spread body FIRST, then override id/handle so empty strings never win
        const newProduct = {
            ...body,
            id: (body.id && body.id.trim()) ? body.id : generatedId,
            handle: (body.handle && body.handle.trim()) ? body.handle : generatedHandle,
            startingPrice: body.sizeOptions?.length > 0
                ? Math.min(...body.sizeOptions.map((s: any) => s.price))
                : (body.startingPrice || 0),
        };

        products.push(newProduct);
        writeProducts(products);

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// PUT update existing product
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const products = readProducts();

        const index = products.findIndex((p: any) => p.id === body.id);
        if (index === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        products[index] = { ...products[index], ...body };
        writeProducts(products);

        return NextResponse.json(products[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE product
export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const products = readProducts();
        const filteredProducts = products.filter((p: any) => p.id !== id);

        if (products.length === filteredProducts.length) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        writeProducts(filteredProducts);

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
