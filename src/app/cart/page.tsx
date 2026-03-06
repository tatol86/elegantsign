'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import SignPreview, { isPreviewSupported } from '@/components/product/SignPreview';

type SessionUser = {
    id: string;
    email: string;
    name: string | null;
};

export default function CartPage() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, getSubtotal, getDiscount, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
    const [sessionLoading, setSessionLoading] = useState(true);
    const [checkoutError, setCheckoutError] = useState('');
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        firstName: '',
        lastName: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Australia',
        phone: '',
    });

    useEffect(() => {
        setMounted(true);
        fetch('/api/auth/session', { cache: 'no-store' })
            .then((response) => response.json())
            .then((data) => {
                setSessionUser(data?.user || null);
            })
            .catch(() => {
                setSessionUser(null);
            })
            .finally(() => {
                setSessionLoading(false);
            });
    }, []);

    if (!mounted) return null; // Avoid hydration mismatch

    const subtotal = getSubtotal();
    const { amount: discountAmount, percentage } = getDiscount();
    const shippingCost = shippingMethod === 'express' ? 10 : 0;
    const grandTotal = subtotal - discountAmount + shippingCost;

    const handleCheckout = async () => {
        if (!sessionUser) {
            router.push('/account/login?next=/cart');
            return;
        }

        setSubmittingOrder(true);
        setCheckoutError('');

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shippingMethod,
                    shippingAddress,
                    items: items.map((item) => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                        selectedColor: item.selectedColor,
                        selectedSize: item.selectedSize,
                        selectedMaterial: item.selectedMaterial,
                        selectedMounting: item.selectedMounting,
                        personalization: item.personalization,
                    })),
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                setCheckoutError(data?.error || 'Checkout failed');
                return;
            }

            const data = await response.json();
            clearCart();
            router.push(`/checkout/pay/${data.orderNumber}`);
        } catch {
            setCheckoutError('Checkout failed');
        } finally {
            setSubmittingOrder(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 max-w-2xl text-center space-y-6">
                <h1 className="text-4xl font-bold tracking-tight">Your Cart is Empty</h1>
                <p className="text-neutral-500 text-lg">Looks like you haven&apos;t added anything to your cart yet.</p>
                <Button asChild size="lg" className="mt-8">
                    <Link href="/collections/all">Start Shopping</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 lg:py-16">
            <h1 className="text-4xl font-bold tracking-tight mb-12">Your Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12 items-start">
                {/* Cart Items List */}
                <div className="w-full lg:w-2/3 space-y-8">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-6 bg-white border border-neutral-200 rounded-3xl relative">
                            {/* Item Image / Preview */}
                            <div className="w-full sm:w-32 h-32 shrink-0 bg-neutral-100 rounded-2xl overflow-hidden relative flex items-center justify-center">
                                {item.personalization && isPreviewSupported(item.product) ? (
                                    <SignPreview
                                        product={item.product}
                                        selectedColor={item.selectedColor}
                                        personalization={item.personalization}
                                        size={item.product.sizeOptions?.find((option) => option.label === item.selectedSize) || null}
                                        className="w-[80%] h-[80%] drop-shadow-md"
                                    />
                                ) : (
                                    <Image
                                        src={item.product.images[0]}
                                        alt={item.product.title}
                                        fill
                                        sizes="128px"
                                        className="object-cover"
                                    />
                                )}
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="space-y-1 pr-8">
                                    <h3 className="font-semibold text-lg leading-snug">{item.product.title}</h3>
                                    <p className="text-sm font-medium text-black">${item.unitPrice.toFixed(2)}</p>

                                    {/* Variant Config List */}
                                    <div className="text-xs text-neutral-500 space-y-1 mt-2">
                                        {item.selectedSize && <p>Size: <span className="text-neutral-800">{item.selectedSize}</span></p>}
                                        {item.selectedColor && <p>Color: <span className="text-neutral-800">{item.selectedColor}</span></p>}
                                        {item.selectedMaterial && <p>Material: <span className="text-neutral-800">{item.selectedMaterial}</span></p>}
                                        {item.selectedMounting && <p>Mount: <span className="text-neutral-800">{item.selectedMounting}</span></p>}

                                        {/* Personalization Info */}
                                        {item.personalization && item.personalization.text1 && (
                                            <div className="bg-neutral-50 p-2 rounded mt-2 border text-black font-medium">
                                                Text: {item.personalization.text1} {item.personalization.text2 && `| ${item.personalization.text2}`}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center border border-neutral-200 rounded-lg h-10 bg-white shadow-sm overflow-hidden">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 text-neutral-500 hover:bg-neutral-50 hover:text-black transition-colors">-</button>
                                        <span className="w-8 text-center text-sm font-medium cursor-default">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 text-neutral-500 hover:bg-neutral-50 hover:text-black transition-colors">+</button>
                                    </div>
                                    <span className="font-bold text-lg">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => removeItem(item.id)}
                                className="absolute top-6 right-6 text-neutral-400 hover:text-red-500 transition-colors p-2 -m-2"
                                aria-label="Remove item"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Order Summary Sidebar */}
                <div className="w-full lg:w-1/3 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 md:p-8 space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight">Order Summary</h2>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-600">Subtotal</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>

                            {percentage > 0 && (
                                <div className="flex justify-between text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg -mx-3">
                                    <span className="flex items-center gap-1">Bulk Discount ({(percentage * 100).toFixed(0)}%)</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-neutral-200 space-y-4">
                            <h3 className="font-semibold">Shipping</h3>
                            <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                                <div className="flex items-center justify-between space-x-2 block border rounded-xl p-4 cursor-pointer hover:border-black transition-colors bg-white">
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="standard" id="standard" />
                                        <Label htmlFor="standard" className="cursor-pointer font-medium">Standard (3-5 days)</Label>
                                    </div>
                                    <span className="font-semibold text-sm">FREE</span>
                                </div>
                                <div className="flex items-center justify-between space-x-2 block border rounded-xl p-4 cursor-pointer hover:border-black transition-colors bg-white mt-3">
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="express" id="express" />
                                        <Label htmlFor="express" className="cursor-pointer font-medium">Express (1-2 days)</Label>
                                    </div>
                                    <span className="font-semibold text-sm">$10.00</span>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="pt-6 border-t border-neutral-200 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="font-semibold">Customer</h3>
                                {!sessionLoading && !sessionUser && (
                                    <Link href="/account/login?next=/cart" className="text-sm font-medium text-black underline">
                                        Sign in
                                    </Link>
                                )}
                            </div>

                            {sessionLoading ? (
                                <p className="text-sm text-neutral-500">Checking account status...</p>
                            ) : sessionUser ? (
                                <div className="rounded-2xl border bg-white p-4">
                                    <p className="font-medium">{sessionUser.name || sessionUser.email}</p>
                                    <p className="text-sm text-neutral-500 mt-1">{sessionUser.email}</p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border bg-white p-4 space-y-3">
                                    <p className="text-sm text-neutral-600">Please sign in or create an account before placing an order.</p>
                                    <div className="flex gap-3">
                                        <Button asChild variant="outline" className="flex-1">
                                            <Link href="/account/login?next=/cart">Sign in</Link>
                                        </Button>
                                        <Button asChild className="flex-1">
                                            <Link href="/account/register?next=/cart">Register</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-neutral-200 space-y-4">
                            <h3 className="font-semibold">Shipping Address</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input id="firstName" value={shippingAddress.firstName} onChange={(event) => setShippingAddress((current) => ({ ...current, firstName: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input id="lastName" value={shippingAddress.lastName} onChange={(event) => setShippingAddress((current) => ({ ...current, lastName: event.target.value }))} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="line1">Address line 1</Label>
                                    <Input id="line1" value={shippingAddress.line1} onChange={(event) => setShippingAddress((current) => ({ ...current, line1: event.target.value }))} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="line2">Address line 2</Label>
                                    <Input id="line2" value={shippingAddress.line2} onChange={(event) => setShippingAddress((current) => ({ ...current, line2: event.target.value }))} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="city">City / Suburb</Label>
                                    <Input id="city" value={shippingAddress.city} onChange={(event) => setShippingAddress((current) => ({ ...current, city: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" value={shippingAddress.state} onChange={(event) => setShippingAddress((current) => ({ ...current, state: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Postcode</Label>
                                    <Input id="postalCode" value={shippingAddress.postalCode} onChange={(event) => setShippingAddress((current) => ({ ...current, postalCode: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" value={shippingAddress.country} onChange={(event) => setShippingAddress((current) => ({ ...current, country: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" value={shippingAddress.phone} onChange={(event) => setShippingAddress((current) => ({ ...current, phone: event.target.value }))} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-neutral-200 pb-2">
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-lg font-semibold">Total (AUD)</span>
                                <span className="text-3xl font-bold tracking-tight">${grandTotal.toFixed(2)}</span>
                            </div>
                            {checkoutError && <p className="text-sm text-red-600 mb-4">{checkoutError}</p>}
                            <Button onClick={handleCheckout} size="lg" disabled={submittingOrder || sessionLoading} className="w-full h-14 text-base font-bold flex items-center justify-between px-6 rounded-xl hover:scale-[1.02] transition-transform disabled:hover:scale-100">
                                <span>{submittingOrder ? 'Creating order...' : 'Create Order & Pay'}</span>
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <p className="text-center text-xs text-neutral-400 mt-4 flex items-center justify-center gap-1">
                                <ShieldCheck className="w-4 h-4" /> Next step opens the local test payment screen.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border rounded-2xl p-6 flex gap-4 items-center">
                        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                            <Truck className="w-6 h-6 text-neutral-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Australian Made & Owned</h4>
                            <p className="text-sm text-neutral-500">Every sign is designed, cut, and hand-finished in Australia.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
