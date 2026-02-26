'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/data/products';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ProductConfiguratorProps {
    product: Product;
}

export default function ProductConfigurator({ product }: ProductConfiguratorProps) {
    const isAcrylic = product.category.includes('House Number') || product.category === 'Custom Text';
    const { addItem } = useCartStore();
    const { toast } = useToast();

    const [quantity, setQuantity] = useState(1);

    // Customization State
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
    const [selectedMaterial, setSelectedMaterial] = useState(product.materials?.[0] || '');
    const [selectedMounting, setSelectedMounting] = useState(product.mountingOptions?.[0] || '');

    // Text Personalization
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [font, setFont] = useState('modern');
    const [layout, setLayout] = useState('center');
    const [shape, setShape] = useState(product.shape || 'Rectangle');

    // Real-time SVG Preview Generator (Mockup generation)
    const previewSvg = useMemo(() => {
        if (!isAcrylic) return null;

        // Color extraction logic based on selectedColor ("Black on White", "Matte Black", etc.)
        let bgColor = '#ffffff';
        let textColor = '#000000';
        if (selectedColor.toLowerCase().includes('black on white')) {
            bgColor = '#f8f9fa';
            textColor = '#111111';
        } else if (selectedColor.toLowerCase().includes('white on black')) {
            bgColor = '#111111';
            textColor = '#f8f9fa';
        } else if (selectedColor.toLowerCase().includes('matte black')) {
            bgColor = '#1a1a1a';
            textColor = '#e0e0e0'; // cutout effect
        } // simplify for brevity

        const shapeRx = shape === 'Circle' ? '50%' : shape === 'Rounded Rectangle' || shape === 'Arch' ? '20' : '0';
        // Arch needs specific path, but for simplicity we simulate with CSS radius on the container

        return `
      <svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="500" fill="${bgColor}" rx="${shapeRx}" ry="${shapeRx}" />
        <text 
          x="${layout === 'left' ? '50' : '250'}" 
          y="${text2 ? '220' : '270'}" 
          font-family="${font === 'modern' ? 'sans-serif' : font === 'serif' ? 'serif' : 'monospace'}" 
          font-size="120" 
          font-weight="bold"
          fill="${textColor}" 
          text-anchor="${layout === 'left' ? 'start' : 'middle'}">
          ${text1 || '12'}
        </text>
        ${text2 ? `
        <text 
          x="${layout === 'left' ? '50' : '250'}" 
          y="350" 
          font-family="sans-serif" 
          font-size="40" 
          fill="${textColor}" 
          letter-spacing="4"
          text-transform="uppercase"
          text-anchor="${layout === 'left' ? 'start' : 'middle'}">
          ${text2}
        </text>
        ` : ''}
      </svg>
    `;
    }, [isAcrylic, selectedColor, shape, layout, font, text1, text2]);

    const handleAddToCart = () => {
        if (isAcrylic && !text1) {
            toast({
                title: "Missing Information",
                description: "Please enter your house number.",
                variant: "destructive"
            });
            return;
        }

        addItem({
            product,
            quantity,
            selectedColor,
            selectedSize,
            selectedMaterial,
            selectedMounting,
            personalization: isAcrylic ? { text1, text2, font, layout, shape } : undefined,
            previewSvg: previewSvg || undefined,
            unitPrice: product.price // Ignoring variant pricing for simplicity
        });

        toast({
            title: "Added to Cart",
            description: `${quantity}x ${product.title} added to your cart.`,
        });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-12">
            {/* Media & Preview Gallery (Left) */}
            <div className="w-full lg:w-[55%] space-y-4">
                <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center relative">
                    {isAcrylic && previewSvg ? (
                        <div
                            className="w-[70%] h-[70%] drop-shadow-2xl transition-all duration-300 pointer-events-none"
                            style={{
                                borderRadius: shape === 'Circle' ? '50%' : shape === 'Arch' ? '200px 200px 10px 10px' : '8px'
                            }}
                            dangerouslySetInnerHTML={{ __html: previewSvg }}
                        />
                    ) : (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    )}

                    {isAcrylic && (
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium shadow flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Preview
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {product.images.map((img, i) => (
                        <div key={i} className="aspect-square bg-neutral-100 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-black transition-colors">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Configurator (Right) */}
            <div className="w-full lg:w-[45%] flex flex-col pt-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{product.title}</h1>
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl font-medium">${product.price.toFixed(2)}</span>
                    <span className="text-neutral-500 text-sm">|</span>
                    <div className="flex items-center text-sm gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-neutral-500 underline decoration-neutral-300 underline-offset-4 cursor-pointer">
                            {product.reviews} reviews
                        </span>
                    </div>
                </div>

                <p className="text-neutral-600 mb-8 leading-relaxed">
                    {product.description}
                </p>

                <div className="space-y-8 flex-1">
                    {/* Options: Acrylic vs 3D Printed differ slightly */}

                    {product.sizes && (
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Size</Label>
                            <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-2 gap-3">
                                {product.sizes.map((s) => (
                                    <div key={s}>
                                        <RadioGroupItem value={s} id={`size-${s}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`size-${s}`}
                                            className="flex flex-col items-center justify-center rounded-xl border-2 border-neutral-200 bg-white p-4 hover:bg-neutral-50 hover:border-neutral-300 peer-data-[state=checked]:border-black peer-data-[state=checked]:border-2 cursor-pointer transition-all"
                                        >
                                            <span className="font-medium text-sm text-center">{s}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {product.colors && (
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Color / Finish</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {product.colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setSelectedColor(c)}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${selectedColor === c ? 'border-black bg-neutral-50 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isAcrylic && (
                        <div className="space-y-5 bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                            <h3 className="font-semibold text-lg border-b pb-3">Personalization</h3>

                            <div className="space-y-3">
                                <Label htmlFor="num">House Number (Required)</Label>
                                <Input
                                    id="num"
                                    value={text1}
                                    onChange={(e) => setText1(e.target.value)}
                                    maxLength={5}
                                    placeholder="e.g. 12"
                                    className="h-12 text-lg bg-white"
                                />
                            </div>

                            {product.category === 'House Number + Street' && (
                                <div className="space-y-3">
                                    <Label htmlFor="street">Street Name</Label>
                                    <Input
                                        id="street"
                                        value={text2}
                                        onChange={(e) => setText2(e.target.value)}
                                        maxLength={30}
                                        placeholder="e.g. SMITH ST"
                                        className="h-12 bg-white"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label>Font Style</Label>
                                    <Select value={font} onValueChange={setFont}>
                                        <SelectTrigger className="h-12 bg-white">
                                            <SelectValue placeholder="Select font" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="modern">Modern Sans</SelectItem>
                                            <SelectItem value="serif">Classic Serif</SelectItem>
                                            <SelectItem value="mono">Architect Mono</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label>Layout</Label>
                                    <Select value={layout} onValueChange={setLayout}>
                                        <SelectTrigger className="h-12 bg-white">
                                            <SelectValue placeholder="Select layout" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="center">Center Aligned</SelectItem>
                                            <SelectItem value="left">Left Aligned</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {product.mountingOptions && (
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Mounting Method</Label>
                            <RadioGroup value={selectedMounting} onValueChange={setSelectedMounting} className="grid grid-cols-2 gap-3">
                                {product.mountingOptions.map((m) => (
                                    <div key={m}>
                                        <RadioGroupItem value={m} id={`mount-${m}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`mount-${m}`}
                                            className="flex flex-col p-4 rounded-xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 peer-data-[state=checked]:border-black cursor-pointer transition-all"
                                        >
                                            <span className="font-medium text-sm mb-1">{m}</span>
                                            <span className="text-xs text-neutral-500 font-normal">
                                                {m === 'Mounting Tape' ? 'No drilling required. Exterior grade.' : 'Requires drilling. Premium standoff look.'}
                                            </span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {/* Add to Cart Footer Action */}
                    <div className="pt-6 mt-8 border-t border-neutral-200">
                        <div className="flex gap-4 mb-4">
                            <div className="flex items-center border rounded-xl h-14 bg-white">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-xl text-neutral-500 hover:text-black transition-colors">-</button>
                                <span className="w-8 text-center font-medium">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-xl text-neutral-500 hover:text-black transition-colors">+</button>
                            </div>
                            <Button
                                onClick={handleAddToCart}
                                disabled={isAcrylic && !text1}
                                className="flex-1 h-14 text-base font-semibold rounded-xl bg-black text-white hover:bg-neutral-800 transition-colors shadow-lg shadow-black/10"
                            >
                                Add to Cart - ${(product.price * quantity).toFixed(2)}
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-neutral-100 text-sm text-neutral-500">
                            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border border-current flex items-center justify-center">?</span> Fast Support</div>
                            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border border-current flex items-center justify-center">✓</span> Secure Checkout</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
