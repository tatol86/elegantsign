'use client';

import { useState, useMemo } from 'react';
import { Product, SizeOption } from '@/data/products';
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
    const isDoubleLayer = product.buildStyle === 'Double Layer';
    const is3DRaised = product.buildStyle === '3D Raised';
    const { addItem } = useCartStore();
    const { toast } = useToast();

    const [quantity, setQuantity] = useState(1);

    // Customization State
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
    const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
    const [selectedMaterial, setSelectedMaterial] = useState(product.materials?.[0] || '');
    const [selectedMounting, setSelectedMounting] = useState(product.mountingOptions?.[0] || '');

    // Text Personalization
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [font, setFont] = useState('modern');
    const [layout, setLayout] = useState('center');
    const shape = product.shape || 'Rectangle';

    // Get current size option
    const currentSize: SizeOption | null = product.sizeOptions?.[selectedSizeIndex] || null;
    const currentPrice = currentSize?.price ?? product.startingPrice ?? product.price ?? 0;

    // Dimensions for SVG preview (normalize to SVG space)
    const svgWidth = currentSize?.width || 300;
    const svgHeight = currentSize?.height || 150;

    // Scale factor: fit within a 500px display canvas
    const maxDim = Math.max(svgWidth, svgHeight);
    const scale = 500 / maxDim;
    const displayW = svgWidth * scale;
    const displayH = svgHeight * scale;

    // Real-time SVG Preview Generator
    const previewSvg = useMemo(() => {
        if (!isAcrylic) return null;

        // Color extraction
        let bgColor = '#1a1a1a';
        let textColor = '#e0e0e0';
        const lc = selectedColor.toLowerCase();

        if (lc.includes('black on white') || lc.includes('white')) {
            bgColor = '#f8f9fa';
            textColor = '#111111';
        }
        if (lc.includes('white on') || lc.includes('on black') || lc.includes('matte black') || lc.includes('black')) {
            if (!lc.includes('on white')) {
                bgColor = '#111111';
                textColor = '#f0f0f0';
            }
        }
        if (lc.includes('gold')) {
            textColor = '#d4a853';
            if (lc.includes('on black')) bgColor = '#111111';
        }
        if (lc.includes('silver')) {
            textColor = '#c0c0c0';
            if (lc.includes('on white')) bgColor = '#f8f9fa';
        }

        // Double layer offset
        const layerOffset = isDoubleLayer ? 6 : 0;

        const cx = displayW / 2;
        const cy = displayH / 2;
        const cornerR = Math.min(displayW, displayH) * 0.08;

        const fontFamily = font === 'modern' ? "'Inter', sans-serif" : font === 'serif' ? "'Georgia', serif" : "'Courier New', monospace";
        const fontSize = Math.min(displayW * 0.35, displayH * 0.55);
        const smallFontSize = fontSize * 0.32;

        const textAnchor = layout === 'left' ? 'start' : 'middle';
        const textX = layout === 'left' ? displayW * 0.12 : cx;
        const textY = text2 ? cy - fontSize * 0.1 : cy + fontSize * 0.3;
        const text2Y = textY + fontSize * 0.6;

        let shapeSvg = '';
        let backShapeSvg = '';

        switch (shape) {
            case 'Circle': {
                const r = Math.min(displayW, displayH) / 2 - 2;
                if (isDoubleLayer) {
                    backShapeSvg = `<circle cx="${cx + layerOffset}" cy="${cx + layerOffset}" r="${r}" fill="#333333" opacity="0.6"/>`;
                }
                shapeSvg = `<circle cx="${cx}" cy="${cx}" r="${r}" fill="${bgColor}" />`;
                break;
            }
            case 'Arch': {
                const w = displayW;
                const h = displayH;
                const archR = w / 2;
                const archPath = `M 0 ${h} L 0 ${archR} A ${archR} ${archR} 0 0 1 ${w} ${archR} L ${w} ${h} Z`;
                if (isDoubleLayer) {
                    backShapeSvg = `<path d="${archPath}" fill="#333333" opacity="0.6" transform="translate(${layerOffset},${layerOffset})"/>`;
                }
                shapeSvg = `<path d="${archPath}" fill="${bgColor}"/>`;
                break;
            }
            case 'Rounded Rectangle': {
                if (isDoubleLayer) {
                    backShapeSvg = `<rect x="${layerOffset}" y="${layerOffset}" width="${displayW}" height="${displayH}" rx="${cornerR}" ry="${cornerR}" fill="#333333" opacity="0.6"/>`;
                }
                shapeSvg = `<rect x="0" y="0" width="${displayW}" height="${displayH}" rx="${cornerR}" ry="${cornerR}" fill="${bgColor}"/>`;
                break;
            }
            default: { // Rectangle / Square
                if (isDoubleLayer) {
                    backShapeSvg = `<rect x="${layerOffset}" y="${layerOffset}" width="${displayW}" height="${displayH}" fill="#333333" opacity="0.6"/>`;
                }
                shapeSvg = `<rect x="0" y="0" width="${displayW}" height="${displayH}" fill="${bgColor}"/>`;
                break;
            }
        }

        // 3D raised style: individual characters with shadows
        let textSvg = '';
        if (is3DRaised) {
            const displayText = text1 || '12';
            const chars = displayText.split('');
            const charSpacing = fontSize * 0.75;
            const totalWidth = chars.length * charSpacing;
            const startX = cx - totalWidth / 2 + charSpacing * 0.4;
            const charY = text2 ? cy - fontSize * 0.1 : cy + fontSize * 0.3;

            textSvg = chars.map((char, i) => `
                <text x="${startX + i * charSpacing}" y="${charY + 3}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="bold" fill="rgba(0,0,0,0.3)" text-anchor="middle">${char}</text>
                <text x="${startX + i * charSpacing}" y="${charY}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="bold" fill="${textColor}" text-anchor="middle">${char}</text>
            `).join('');
        } else {
            textSvg = `
                <text x="${textX}" y="${textY}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="bold" fill="${textColor}" text-anchor="${textAnchor}">${text1 || '12'}</text>
            `;
        }

        const text2Svg = text2 ? `
            <text x="${textX}" y="${text2Y}" font-family="${fontFamily}" font-size="${smallFontSize}" fill="${textColor}" letter-spacing="3" text-anchor="${textAnchor}">${text2.toUpperCase()}</text>
        ` : '';

        // Adjust viewBox for circle (square aspect)
        const vbW = shape === 'Circle' ? Math.max(displayW, displayH) + layerOffset * 2 : displayW + layerOffset * 2;
        const vbH = shape === 'Circle' ? Math.max(displayW, displayH) + layerOffset * 2 : displayH + layerOffset * 2;

        return `
            <svg width="100%" height="100%" viewBox="-${layerOffset} -${layerOffset} ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="signShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.25)" />
                    </filter>
                </defs>
                <g filter="url(#signShadow)">
                    ${backShapeSvg}
                    ${shapeSvg}
                    ${textSvg}
                    ${text2Svg}
                </g>
            </svg>
        `;
    }, [isAcrylic, isDoubleLayer, is3DRaised, selectedColor, shape, layout, font, text1, text2, displayW, displayH, currentSize]);

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
            selectedSize: currentSize?.label || '',
            selectedMaterial,
            selectedMounting,
            personalization: isAcrylic ? { text1, text2, font, layout, shape } : undefined,
            previewSvg: previewSvg || undefined,
            unitPrice: currentPrice,
        });

        toast({
            title: "Added to Cart",
            description: `${quantity}x ${product.title} added to your cart.`,
        });
    };

    // Color swatch helper
    const getSwatchColor = (colorName: string) => {
        const lc = colorName.toLowerCase();
        if (lc.includes('gold')) return '#d4a853';
        if (lc.includes('silver') || lc.includes('brushed')) return '#c0c0c0';
        if (lc.includes('white') && !lc.includes('on')) return '#f5f5f5';
        if (lc.includes('black on white')) return '#f5f5f5';
        if (lc.includes('white on black') || lc.includes('on black')) return '#1a1a1a';
        return '#1a1a1a';
    };

    return (
        <div className="flex flex-col lg:flex-row gap-12">
            {/* Media & Preview Gallery (Left) */}
            <div className="w-full lg:w-[55%] space-y-4">
                <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center relative">
                    {isAcrylic && previewSvg ? (
                        <div
                            className="w-[75%] h-[75%] flex items-center justify-center transition-all duration-500 ease-out"
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

                    {/* Size indicator */}
                    {currentSize && (
                        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white shadow">
                            {currentSize.width} × {currentSize.height}mm
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
                    <span className="text-2xl font-medium">
                        {product.sizeOptions && product.sizeOptions.length > 1
                            ? `From $${product.startingPrice?.toFixed(2)}`
                            : `$${currentPrice.toFixed(2)}`
                        }
                    </span>
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
                    {/* Size Options with Pricing */}
                    {product.sizeOptions && product.sizeOptions.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Size</Label>
                            <RadioGroup
                                value={String(selectedSizeIndex)}
                                onValueChange={(v) => setSelectedSizeIndex(parseInt(v))}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                            >
                                {product.sizeOptions.map((s, i) => (
                                    <div key={s.label}>
                                        <RadioGroupItem value={String(i)} id={`size-${i}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`size-${i}`}
                                            className="flex items-center justify-between rounded-xl border-2 border-neutral-200 bg-white p-4 hover:bg-neutral-50 hover:border-neutral-300 peer-data-[state=checked]:border-black peer-data-[state=checked]:border-2 cursor-pointer transition-all"
                                        >
                                            <span className="font-medium text-sm">{s.label}</span>
                                            <span className="font-bold text-sm">${s.price.toFixed(2)}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {/* Color Swatches */}
                    {product.colors && (
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Color / Finish</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {product.colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setSelectedColor(c)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${selectedColor === c ? 'border-black bg-neutral-50 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'}`}
                                    >
                                        <span
                                            className="w-5 h-5 rounded-full border border-neutral-300 shrink-0"
                                            style={{ backgroundColor: getSwatchColor(c) }}
                                        />
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Personalization */}
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

                    {/* Mounting Options */}
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
                                Add to Cart — ${(currentPrice * quantity).toFixed(2)}
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
