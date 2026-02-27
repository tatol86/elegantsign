import { getProductByHandle } from '@/data/products';
import { notFound } from 'next/navigation';
import ProductConfigurator from '@/components/product/ProductConfigurator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
    const product = getProductByHandle(params.handle);
    if (!product) return { title: 'Product Not Found' };

    return {
        title: `${product.title} | ElegantSign`,
        description: product.description,
        openGraph: {
            title: product.title,
            description: product.description,
            images: [product.images[0]],
        }
    };
}

export default function ProductPage({ params }: { params: { handle: string } }) {
    const product = getProductByHandle(params.handle);

    if (!product) {
        notFound();
    }

    // Professional Mock Reviews (until real ones are added via Admin)
    const reviews = [
        {
            id: 1,
            author: 'James B.',
            rating: 5,
            date: 'Last Month',
            text: 'The quality of the acrylic is outstanding. It looks very premium on our rendered wall.'
        },
        {
            id: 2,
            author: 'Sarah L.',
            rating: 5,
            date: '3 weeks ago',
            text: 'Fast dispatch and very easy to install. The double layer effect adds great depth.'
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Dynamic Configurator Component */}
            <ProductConfigurator product={product} />

            {/* Details & Reviews Section */}
            <div className="mt-24 pt-16 border-t border-neutral-200">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Accordion Info */}
                    <div className="w-full lg:w-1/3">
                        <h3 className="text-2xl font-bold tracking-tight mb-6">Product Details</h3>
                        <Accordion type="multiple" defaultValue={['materials', 'shipping']} className="w-full">
                            <AccordionItem value="materials" className="border-b-neutral-200">
                                <AccordionTrigger className="text-left font-semibold">Materials & Finish</AccordionTrigger>
                                <AccordionContent className="text-neutral-600 leading-relaxed">
                                    We use premium 3mm and 6mm cast acrylic for our signage, offering superior UV resistance and durability compared to extruded alternatives. 3D printed components are made from aerospace-grade ASA, ensuring they won&apos;t warp or fade in direct sunlight.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="installation" className="border-b-neutral-200">
                                <AccordionTrigger className="text-left font-semibold">Installation Instructions</AccordionTrigger>
                                <AccordionContent className="text-neutral-600 leading-relaxed">
                                    <strong>Mounting Tape:</strong> Ensure surface is clean and dry. Peel backing and press firmly for 30 seconds. Full cure takes 24 hours. Ideal for smooth render, painted brick, or timber.
                                    <br /><br />
                                    <strong>Standoff Screws:</strong> Use provided template to mark holes. Drill using a 6mm masonry bit. Insert wall plugs, screw in the standoff bases, place the sign, and screw on the caps.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="shipping" className="border-b-neutral-200">
                                <AccordionTrigger className="text-left font-semibold">Fast Turnaround & Shipping</AccordionTrigger>
                                <AccordionContent className="text-neutral-600 leading-relaxed">
                                    Current production time is {product.leadTimeDays} business days. Enjoy free standard shipping Australia-wide via AusPost (3-5 days). Express option available at checkout.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Customer Reviews */}
                    <div className="w-full lg:w-2/3">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight mb-2">Customer Reviews</h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-black">★★★★★</div>
                                    <span className="font-semibold">{product.rating} out of 5</span>
                                    <span className="text-neutral-500">Based on {product.reviews} reviews</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                                    <div className="flex text-black text-sm mb-3">★★★★★</div>
                                    <p className="text-neutral-700 font-medium mb-4 leading-snug">&quot;{review.text}&quot;</p>
                                    <div className="text-sm text-neutral-500 flex justify-between">
                                        <span className="font-semibold text-neutral-900">{review.author}</span>
                                        <span>{review.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
