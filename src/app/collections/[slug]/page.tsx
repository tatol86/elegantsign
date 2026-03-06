import { getAllProducts, getProductsByCategory, getProductsByBuildStyle } from '@/data/products';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import type { Product } from '@/types/catalog';

const slugToTitle: Record<string, string> = {
    'all': 'All Products',
    'house-numbers': 'House Numbers',
    'house-number-street': 'Address Signs',
    'custom-text': 'Custom Lettering & Text',
    'no-junk-mail': 'Utility & Mail Plaques',
    '3d-printed': '3D Printed Decor',
    'single-layer': 'Single Layer Signs',
    'double-layer': 'Double Layer Signs',
    '3d-raised': '3D Raised Signs'
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const title = slugToTitle[params.slug] || 'Collection';
    return {
        title: `${title} | ElegantSign`,
        description: `Explore our ${title.toLowerCase()} collection. Premium Australian-made signage.`
    };
}

async function getFilteredProducts(slug: string, searchQuery?: string): Promise<Product[]> {
    let baseProducts: Product[];
    switch (slug) {
        case 'all':
            baseProducts = await getAllProducts();
            break;
        case 'house-numbers':
            baseProducts = await getProductsByCategory('House Numbers');
            break;
        case 'house-number-street':
        case 'house-number-+-street':
            baseProducts = await getProductsByCategory('House Number + Street');
            break;
        case 'custom-text':
            baseProducts = await getProductsByCategory('Custom Text');
            break;
        case 'no-junk-mail':
            baseProducts = await getProductsByCategory('No Junk Mail');
            break;
        case '3d-printed':
            baseProducts = await getProductsByCategory('3D Printed');
            break;
        case 'single-layer':
            baseProducts = await getProductsByBuildStyle('Single Layer');
            break;
        case 'double-layer':
            baseProducts = await getProductsByBuildStyle('Double Layer');
            break;
        case '3d-raised':
            baseProducts = await getProductsByBuildStyle('3D Raised');
            break;
        default:
            baseProducts = await getAllProducts();
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return baseProducts.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.tags.some(t => t.toLowerCase().includes(query))
        );
    }

    return baseProducts;
}

export default async function CollectionPage({ params, searchParams }: { params: { slug: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
    const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;
    const filteredProducts = await getFilteredProducts(params.slug, query);
    const baseTitle = slugToTitle[params.slug] || 'Collection';
    const title = query ? `Search Results for "${query}"` : baseTitle;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <div className="text-sm text-neutral-500 mb-8">
                <Link href="/" className="hover:text-black">Home</Link> / <span className="text-black capitalize">{baseTitle}</span> {query && <span>/ Search</span>}
            </div>

            {/* Header */}
            <div className="flex justify-between items-end mb-10 border-b pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
                    <p className="text-neutral-500 mt-2">{filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'single-layer', 'double-layer', '3d-raised'].map(slug => (
                        <Link key={slug} href={`/collections/${slug}`}>
                            <Badge
                                variant="outline"
                                className={`px-4 py-2 text-xs cursor-pointer rounded-full transition-colors ${params.slug === slug ? 'bg-black text-white border-black' : 'hover:bg-neutral-100 border-neutral-300'}`}
                            >
                                {slugToTitle[slug]}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="py-24 text-center">
                    <p className="text-neutral-500 mb-4">No products found in this category.</p>
                    <Button asChild variant="outline">
                        <Link href="/collections/all">View All Products</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {filteredProducts.map((product) => (
                        <Link key={product.id} href={`/products/${product.handle}`} className="group block">
                            <Card className="border-none shadow-none bg-transparent">
                                <CardContent className="p-0">
                                    <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden relative mb-4">
                                        <Image
                                            src={product.images[0]}
                                            alt={product.title}
                                            fill
                                            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {product.leadTimeDays === '1-2' && (
                                            <Badge className="absolute top-3 left-3 bg-white text-black hover:bg-white border-none shadow-sm font-semibold text-xs tracking-wider uppercase">
                                                Fast Dispatch
                                            </Badge>
                                        )}
                                        {product.buildStyle && (
                                            <Badge className={`absolute top-3 right-3 border-none shadow-sm text-[10px] tracking-wider uppercase ${product.buildStyle === 'Double Layer' ? 'bg-blue-500 text-white hover:bg-blue-500' :
                                                product.buildStyle === '3D Raised' ? 'bg-amber-500 text-white hover:bg-amber-500' :
                                                    'bg-neutral-700 text-white hover:bg-neutral-700'
                                                }`}>
                                                {product.buildStyle}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="font-semibold text-sm leading-snug group-hover:text-neutral-600 transition-colors line-clamp-2">
                                            {product.title}
                                        </h3>

                                        <div className="flex items-center gap-1 pt-0.5">
                                            <div className="flex text-[10px]">
                                                {'★★★★★'.split('').map((star, i) => (
                                                    <span key={i} className={i < Math.floor(product.rating) ? "text-black" : "text-neutral-300"}>★</span>
                                                ))}
                                            </div>
                                            {product.reviews > 0 && (
                                                <span className="text-xs text-neutral-500">({product.reviews})</span>
                                            )}
                                        </div>

                                        <p className="font-medium text-sm">
                                            {product.sizeOptions && product.sizeOptions.length > 1
                                                ? `From $${product.startingPrice?.toFixed(2)}`
                                                : `$${(product.startingPrice || product.price || 0).toFixed(2)}`
                                            }
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
