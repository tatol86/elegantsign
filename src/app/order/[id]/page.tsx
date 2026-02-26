'use client';

import Link from 'next/link';
import { CheckCircle2, Package, MapPin, Receipt, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Order Confirmed</h1>
            <p className="text-lg text-neutral-600 mb-8 max-w-lg mx-auto">
                Thank you for your purchase! We&apos;ve received your order and are getting it ready to be crafted in our workshop.
            </p>

            <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-8 mb-10 text-left space-y-8">
                <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-neutral-200 gap-4">
                    <div>
                        <span className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-1 block">Order Number</span>
                        <span className="text-xl font-bold">{params.id}</span>
                    </div>
                    <div className="sm:text-right">
                        <span className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-1 block">Date</span>
                        <span className="font-medium text-neutral-900">{new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-neutral-400" /> Shipping Address
                        </h3>
                        <div className="text-sm text-neutral-600 leading-relaxed">
                            Jane Doe<br />
                            123 Sample Street<br />
                            Sydney NSW 2000<br />
                            Australia
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-neutral-400" /> Fulfillment
                        </h3>
                        <div className="text-sm text-neutral-600 leading-relaxed">
                            Estimated Dispatch:<br />
                            <span className="font-medium text-black">1-2 Business Days</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <Receipt className="w-5 h-5 text-neutral-400" />
                        Invoice & Tracking will be emailed to you shortly.
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="h-14 font-semibold px-8">
                    <Link href="/collections/all">Continue Shopping</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 font-semibold px-8 bg-white border-neutral-300">
                    <Link href="/pages/contact">Contact Support</Link>
                </Button>
            </div>
        </div>
    );
}
