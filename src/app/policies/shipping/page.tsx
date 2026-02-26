export default function ShippingPolicy() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Shipping Policy</h1>

            <div className="prose prose-neutral max-w-none text-neutral-600 space-y-6">
                <h2 className="text-2xl font-bold text-black mt-8 mb-4">Processing Time</h2>
                <p>
                    All of our signs are made to order. Our standard production time is <strong>1-2 business days</strong> for acrylic signs, and <strong>2-3 business days</strong> for 3D printed items.
                    During peak periods or sales, production times may be slightly extended, but we always aim to dispatch as quickly as possible.
                </p>

                <h2 className="text-2xl font-bold text-black mt-8 mb-4">Shipping Rates - Australia</h2>
                <p>We use Australia Post for all domestic deliveries.</p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>Standard Shipping:</strong> FREE on all orders. (Typically 3-5 business days)</li>
                    <li><strong>Express Shipping:</strong> $10.00 flat rate. (Typically 1-2 business days)</li>
                </ul>

                <h2 className="text-2xl font-bold text-black mt-8 mb-4">Tracking Your Order</h2>
                <p>
                    Once your order has been dispatched, you will receive an email containing a tracking number.
                    You can use this number to track your delivery directly on the Australia Post website.
                </p>

                <h2 className="text-2xl font-bold text-black mt-8 mb-4">Damaged Items</h2>
                <p>
                    We pack our signs very carefully, but occasionally transit damage occurs. If your item arrives damaged, please contact us within 48 hours of delivery with photos of the damaged item and the packaging, and we will send a replacement immediately.
                </p>
            </div>
        </div>
    );
}
