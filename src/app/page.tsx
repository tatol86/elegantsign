import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center bg-neutral-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
            Elegant Custom Signage
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">
            Design your custom house number or explore our precision-crafted collection. Australian made, premium materials.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-8 text-base bg-white text-black hover:bg-neutral-200">
              <Link href="/collections/house-numbers">Start Customising</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base text-white border-white bg-transparent hover:bg-white/10 hover:text-white">
              <Link href="/collections/all">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b bg-neutral-50/50 hidden md:block">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-5xl mx-auto gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-600 tracking-wide uppercase">20k+ Orders Delivered</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-600 tracking-wide uppercase">Free AU Shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-600 tracking-wide uppercase">1-2 Day Dispatch</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-600 tracking-wide uppercase">Proudly Aussie Made</span>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Style — now with real product images */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Shop by Style</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">Find the perfect aesthetic for your home facade.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/collections/single-layer" className="group block">
              <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden mb-6 relative">
                <Image
                  src="/products/round-single-1.png"
                  alt="Single Layer acrylic house number sign"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-none mb-2 text-xs">3 Products</Badge>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Single Layer</h3>
              <p className="text-neutral-500">Clean, flush-mounted minimalism.</p>
            </Link>

            <Link href="/collections/double-layer" className="group block">
              <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden mb-6 relative">
                <Image
                  src="/products/square-double-1.png"
                  alt="Double Layer acrylic house number sign"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-none mb-2 text-xs">4 Products</Badge>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Double Layer</h3>
              <p className="text-neutral-500">Extra depth and high contrast text.</p>
            </Link>

            <Link href="/collections/3d-raised" className="group block">
              <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden mb-6 relative">
                <Image
                  src="/products/3d-raised-1.png"
                  alt="3D Raised individual house numbers"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-none mb-2 text-xs">1 Product</Badge>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">3D Raised</h3>
              <p className="text-neutral-500">Bold, standoff lettering that casts a shadow.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Categories — only link to categories that have products */}
      <section className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Browse Our Collection</h2>
              <p className="text-neutral-500 max-w-xl">Australian-made house number signs in every style.</p>
            </div>
            <Button variant="ghost" className="font-semibold" asChild>
              <Link href="/collections/all">View All Products &rarr;</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { name: 'All Products', href: '/collections/all' },
              { name: 'Single Layer', href: '/collections/single-layer' },
              { name: 'Double Layer', href: '/collections/double-layer' },
              { name: '3D Raised', href: '/collections/3d-raised' },
              { name: 'House Numbers', href: '/collections/house-numbers' },
            ].map((category) => (
              <Link key={category.name} href={category.href}>
                <Badge variant="outline" className="px-6 py-3 text-sm hover:bg-black hover:text-white transition-colors cursor-pointer rounded-full border-neutral-300">
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk & Trade Discounts — improved from placeholder */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Bulk & Trade Discounts</h2>
              <p className="text-neutral-400 text-lg max-w-md">
                Perfect for builders, body corporates, and multi-dwelling developments. Discounts apply automatically in your cart.
              </p>
              <div className="pt-4 flex flex-col gap-4">
                <div className="flex items-center gap-4 border-b border-neutral-800 pb-4">
                  <div className="text-2xl font-bold w-16">15%</div>
                  <div className="text-neutral-300">Off orders of 5+ items</div>
                </div>
                <div className="flex items-center gap-4 border-b border-neutral-800 pb-4">
                  <div className="text-2xl font-bold w-16 text-white">20%</div>
                  <div className="text-neutral-300">Off orders of 10+ items</div>
                </div>
                <div className="flex items-center gap-4 pb-4">
                  <div className="text-2xl font-bold w-16">30%</div>
                  <div className="text-neutral-300">Off orders of 20+ items</div>
                </div>
              </div>
              <Button asChild size="lg" className="bg-white text-black hover:bg-neutral-200 mt-4">
                <Link href="/collections/all">Start Shopping</Link>
              </Button>
            </div>
            <div className="bg-neutral-900 rounded-3xl overflow-hidden aspect-square relative">
              <Image
                src="/products/round-double-1.png"
                alt="Bulk order house number signs"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">30%</span>
                  <span className="text-neutral-400 text-lg">off</span>
                </div>
                <p className="text-neutral-300 text-sm">on orders of 20+ signs. Perfect for apartment blocks & developments.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-neutral-500">Everything you need to know about our products and ordering process.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">How long does shipping take?</AccordionTrigger>
              <AccordionContent className="text-neutral-500 leading-relaxed">
                Most acrylic signs are dispatched within 1-2 business days. Standard free shipping within Australia takes 3-5 business days. Express options are available at checkout.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">Can I install the sign on brick or render?</AccordionTrigger>
              <AccordionContent className="text-neutral-500 leading-relaxed">
                Yes! Our high-adhesion exterior mounting tape works excellently on most flat or slightly textured surfaces including brick, render, and timber. For very uneven surfaces, we recommend selecting our standoff screw mounting option.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">Are the signs weatherproof?</AccordionTrigger>
              <AccordionContent className="text-neutral-500 leading-relaxed">
                Absolutely. Our acrylic is UV stabilized and designed to endure harsh Australian sun without fading or yellowing.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">Do you offer custom designs?</AccordionTrigger>
              <AccordionContent className="text-neutral-500 leading-relaxed">
                Yes, our online configurator handles most custom text and layouts. If you need a specific logo or highly unique shape, please contact our support team for a bespoke quote.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link href="/pages/faqs">View All FAQs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
