'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const totalItems = useCartStore((state) => state.getTotalItems());

    const navLinks = [
        { name: 'Shop All', href: '/collections/all' },
        { name: 'House Numbers', href: '/collections/house-numbers' },
        { name: 'House No. + Street', href: '/collections/house-number-street' },
        { name: '3D Printed', href: '/collections/3d-printed' },
        { name: 'About', href: '/pages/about' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Mobile Menu & Logo */}
                <div className="flex items-center md:hidden">
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Menu">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <nav className="flex flex-col gap-4 mt-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                <Link href="/" className="text-xl md:text-2xl tracking-tighter font-bold uppercase hidden md:block">
                    ELEGANT<span className="text-neutral-400">SIGN</span>
                </Link>
                <Link href="/" className="text-lg font-bold uppercase tracking-tighter md:hidden mx-auto font-bold tracking-tighter">
                    ELEGANT<span className="text-neutral-400">SIGN</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium tracking-wide text-neutral-600 hover:text-black transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Search">
                                <Search className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="top" className="h-[200px] flex items-center justify-center">
                            <div className="w-full max-w-2xl px-4">
                                <form action="/collections/all" method="GET" className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                    <input
                                        type="text"
                                        name="q"
                                        placeholder="Search products..."
                                        className="w-full h-12 pl-12 pr-4 bg-neutral-100 rounded-full border-none focus:ring-2 focus:ring-black transition-all"
                                        autoFocus
                                    />
                                </form>
                                <p className="text-center text-xs text-neutral-400 mt-4">Press enter to search the catalog</p>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

