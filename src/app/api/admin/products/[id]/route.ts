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

// GET single product
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const products = readProducts();
        const product = products.find((p: any) => p.id === params.id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read product' }, { status: 500 });
    }
}

// PUT update product
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const products = readProducts();
        const index = products.findIndex((p: any) => p.id === params.id);

        if (index === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Merge existing product with updates
        products[index] = {
            ...products[index],
            ...body,
            id: params.id, // Prevent ID change
        };

        // Auto-update startingPrice from sizeOptions if present
        if (body.sizeOptions && body.sizeOptions.length > 0) {
            products[index].startingPrice = Math.min(
                ...body.sizeOptions.map((s: any) => s.price)
            );
        }

        writeProducts(products);
        return NextResponse.json(products[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE product
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const products = readProducts();
        const filtered = products.filter((p: any) => p.id !== params.id);

        if (filtered.length === products.length) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        writeProducts(filtered);
        return NextResponse.json({ success: true, message: `Product ${params.id} deleted` });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
