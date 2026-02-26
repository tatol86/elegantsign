import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-neutral-50 border-t pt-16 pb-8">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-bold uppercase tracking-tighter mb-4">
                        ELEGANT<span className="text-neutral-400">SIGN</span>
                    </h3>
                    <p className="text-sm text-neutral-500 max-w-xs mb-6">
                        Premium, precision-crafted acrylic and 3D printed signage. Proudly Australian made.
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Shop</h4>
                    <ul className="space-y-3 text-sm text-neutral-600">
                        <li><Link href="/collections/house-numbers" className="hover:text-black">House Numbers</Link></li>
                        <li><Link href="/collections/house-number-street" className="hover:text-black">Address Signs</Link></li>
                        <li><Link href="/collections/custom-text" className="hover:text-black">Custom Text</Link></li>
                        <li><Link href="/collections/3d-printed" className="hover:text-black">3D Printed</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Support</h4>
                    <ul className="space-y-3 text-sm text-neutral-600">
                        <li><Link href="/pages/faqs" className="hover:text-black">FAQs</Link></li>
                        <li><Link href="/policies/shipping" className="hover:text-black">Shipping</Link></li>
                        <li><Link href="/policies/returns" className="hover:text-black">Returns</Link></li>
                        <li><Link href="/pages/contact" className="hover:text-black">Contact Us</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Legal</h4>
                    <ul className="space-y-3 text-sm text-neutral-600">
                        <li><Link href="/policies/terms" className="hover:text-black">Terms of Service</Link></li>
                        <li><Link href="/policies/privacy" className="hover:text-black">Privacy Policy</Link></li>
                    </ul>
                    <div className="mt-6 flex gap-3 text-neutral-400">
                        {/* Payment icons placeholder */}
                        <div className="h-8 w-12 bg-white border rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                        <div className="h-8 w-12 bg-white border rounded flex items-center justify-center text-[10px] font-bold">MC</div>
                        <div className="h-8 w-12 bg-white border rounded flex items-center justify-center text-[10px] font-bold">AMEX</div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-neutral-200">
                <p className="text-xs text-neutral-400 text-center">
                    &copy; {new Date().getFullYear()} ElegantSign. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

