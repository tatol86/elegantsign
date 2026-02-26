import { products, getProductsByCategory, Category } from '@/data/products';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Helper to convert slug to category name for our mock data
const slugToCategory: Record<string, Category | 'All'> = {
    'all': 'All',
    'house-numbers': 'House Numbers',
    'house-number-street': 'House Number + Street',
    'custom-text': 'Custom Text',
    'no-junk-mail': 'No Junk Mail',
    '3d-printed': '3D Printed',
};

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

export default function CollectionPage({ params }: { params: { slug: string } }) {
    const categoryName = slugToCategory[params.slug];

    // Filter products based on slug
    let filteredProducts = products;

    if (categoryName && categoryName !== 'All') {
        filteredProducts = getProductsByCategory(categoryName);
    } else if (params.slug === 'single-layer') {
        filteredProducts = products.filter(p => p.buildStyle === 'Single Layer');
    } else if (params.slug === 'double-layer') {
        filteredProducts = products.filter(p => p.buildStyle === 'Double Layer');
    } else if (params.slug === '3d-raised') {
        filteredProducts = products.filter(p => p.buildStyle === '3D Raised');
    }

    const title = slugToTitle[params.slug] || 'Collection';

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs Placeholder */}
            <div className="text-sm text-neutral-500 mb-8">
                <Link href="/" className="hover:text-black">Home</Link> / <span className="text-black capitalize">{title}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-12">
                {/* Filters Sidebar */}
                <aside className="w-full md:w-64 shrink-0">
                    <h2 className="text-xl font-bold mb-6">Filters</h2>
                    <div className="space-y-6">
                        <Accordion type="multiple" defaultValue={['shape', 'material']} className="w-full text-sm">
                            <AccordionItem value="shape">
                                <AccordionTrigger className="font-semibold px-1">Shape</AccordionTrigger>
                                <AccordionContent className="px-1 space-y-2 text-neutral-600">
                                    {['Rectangle', 'Square', 'Circle', 'Arch', 'Rounded'].map((shape) => (
                                        <div key={shape} className="flex items-center gap-2">
                                            <input type="checkbox" id={`shape-${shape}`} className="accent-black w-4 h-4 rounded-sm border-neutral-300" />
                                            <label htmlFor={`shape-${shape}`}>{shape}</label>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="material">
                                <AccordionTrigger className="font-semibold px-1">Material</AccordionTrigger>
                                <AccordionContent className="px-1 space-y-2 text-neutral-600">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="mat-acrylic" className="accent-black w-4 h-4 rounded-sm" />
                                        <label htmlFor="mat-acrylic">Premium Acrylic</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="mat-pla" className="accent-black w-4 h-4 rounded-sm" />
                                        <label htmlFor="mat-pla">Eco PLA (3D)</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="mat-asa" className="accent-black w-4 h-4 rounded-sm" />
                                        <label htmlFor="mat-asa">Outdoor ASA (3D)</label>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-8 border-b pb-4">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
                        <span className="text-sm text-neutral-500 hidden sm:block">{filteredProducts.length} Products</span>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-neutral-500 mb-4">No products found in this category.</p>
                            <Button asChild variant="outline">
                                <Link href="/collections/all">Clear Filters</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                            {filteredProducts.map((product) => (
                                <Link key={product.id} href={`/products/${product.handle}`} className="group block">
                                    <Card className="border-none shadow-none bg-transparent">
                                        <CardContent className="p-0">
                                            <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden relative mb-4">
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {product.leadTimeDays === '1-2' && (
                                                    <Badge className="absolute top-3 left-3 bg-white text-black hover:bg-white border-none shadow-sm font-semibold text-xs tracking-wider uppercase">
                                                        Fast Dispatch
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-semibold text-base leading-snug group-hover:text-neutral-600 transition-colors">{product.title}</h3>
                                                    <span className="font-medium whitespace-nowrap">${product.price.toFixed(2)}</span>
                                                </div>
                                                <p className="text-sm text-neutral-500 line-clamp-1">{product.category}</p>

                                                <div className="flex items-center gap-1 pt-1">
                                                    <div className="flex text-black text-[10px]">
                                                        {'★★★★★'.split('').map((star, i) => (
                                                            <span key={i} className={i < Math.floor(product.rating) ? "text-black" : "text-neutral-300"}>★</span>
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-neutral-500">({product.reviews})</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
