import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FaqsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-center">Frequently Asked Questions</h1>
            <p className="text-lg text-neutral-500 mb-12 text-center">
                Everything you need to know about our products, ordering, and installation.
            </p>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-medium text-left">How long does production and shipping take?</AccordionTrigger>
                    <AccordionContent className="text-neutral-600 leading-relaxed pt-2">
                        Most acrylic signs are dispatched within 1-2 business days. 3D printed items may take 2-3 days depending on complexity. Standard free shipping within Australia takes 3-5 business days. Express options (1-2 days transit) are available at checkout.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-medium text-left">Can I install the sign on brick, render, or cladding?</AccordionTrigger>
                    <AccordionContent className="text-neutral-600 leading-relaxed pt-2">
                        Yes! Our high-adhesion exterior mounting tape works excellently on most flat or slightly textured surfaces including brick, render, cladding, and timber. Ensure the surface is clean, dry, and free of dust before application. For very uneven surfaces, we recommend selecting our standoff screw mounting option.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-medium text-left">Are the signs weatherproof and UV stable?</AccordionTrigger>
                    <AccordionContent className="text-neutral-600 leading-relaxed pt-2">
                        Absolutely. Our acrylic is UV stabilized and designed to endure harsh Australian sun without fading, peeling, or yellowing for many years. Our 3D printed objects in ASA or PETG are extremely durable and temperature resistant up to 80°C.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger className="text-lg font-medium text-left">Do you offer custom designs or logos?</AccordionTrigger>
                    <AccordionContent className="text-neutral-600 leading-relaxed pt-2">
                        Yes, our online configurator handles most custom text and layouts. If you need a specific logo, highly unique shape, or trade quantity order, please check out our business contact page for a bespoke quote. We work frequently with builders and architects.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                    <AccordionTrigger className="text-lg font-medium text-left">What is the difference between Single Layer and Double Layer signs?</AccordionTrigger>
                    <AccordionContent className="text-neutral-600 leading-relaxed pt-2">
                        Single layer signs are a simple, minimalist plaque where the text design is cut directly into a single piece of 3mm or 6mm acrylic. Double layer signs feature a backing plate of one color, with a top plate of another color physically mounted on top, providing depth, dimension, and higher contrast.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                    <AccordionTrigger className="text-lg font-medium text-left">What if my custom order has a spelling mistake?</AccordionTrigger>
                    <AccordionContent className="text-neutral-600 leading-relaxed pt-2">
                        Please double-check your spelling and capitalisation before adding the item to your cart. We manufacture exactly what is entered. If you notice an error immediately after ordering, email us within 2 hours. Once production begins, we cannot alter or refund custom products.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
