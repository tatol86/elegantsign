import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
    }
}

// POST create new product
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const products = readProducts();

        // Generate ID and handle from title if not provided
        const newProduct = {
            id: body.id || `product-${Date.now()}`,
            handle: body.handle || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            title: body.title,
            description: body.description || '',
            category: body.category || 'House Numbers',
            tags: body.tags || [],
            startingPrice: body.startingPrice || body.sizeOptions?.[0]?.price || 0,
            images: body.images || [],
            rating: body.rating || 0,
            reviews: body.reviews || 0,
            leadTimeDays: body.leadTimeDays || '1-2',
            buildStyle: body.buildStyle || 'Single Layer',
            shape: body.shape || 'Rectangle',
            mountingOptions: body.mountingOptions || ['Mounting Tape'],
            colors: body.colors || ['Matte Black'],
            sizeOptions: body.sizeOptions || [],
            ...body
        };

        products.push(newProduct);
        writeProducts(products);

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
