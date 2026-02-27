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
                        <li><Link href="/collections/all" className="hover:text-black">All Products</Link></li>
                        <li><Link href="/collections/house-numbers" className="hover:text-black">House Numbers</Link></li>
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
                    <div className="mt-6 flex gap-2">
                        {/* Real Payment Icons via SVGs */}
                        <svg className="h-6" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="38" height="24" rx="3" fill="white" />
                            <path d="M15.4 12V16.1H13.8V12H15.4ZM23.4 12V16.1H21.8V12H23.4ZM19.4 14.1L20.2 16.1H18.7L19.4 14.1ZM25.8 12L24.1 16.1H22.5L24.2 12H25.8ZM16.4 12L18.1 16.1H16.5L14.8 12H16.4Z" fill="#1434CB" />
                        </svg>
                        <svg className="h-6" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="38" height="24" rx="3" fill="white" />
                            <circle cx="15" cy="12" r="7" fill="#EB001B" />
                            <circle cx="23" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8" />
                        </svg>
                        <svg className="h-6" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="38" height="24" rx="3" fill="#0070D1" />
                            <path d="M13.2 11.2L12.4 14H14.1L13.2 11.2ZM19 10L16 16.1H17.8L18.4 14.8H21L21.6 16.1H23.4L20.4 10H19Z" fill="white" />
                        </svg>
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

