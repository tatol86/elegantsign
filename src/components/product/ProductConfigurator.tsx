'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import SignPreview, { isPreviewSupported } from '@/components/product/SignPreview';
import type {
  PersonalizationFont,
  PersonalizationLayout,
  Product,
  ProductPersonalization,
  SizeOption,
} from '@/types/catalog';

interface ProductConfiguratorProps {
  product: Product;
}

export default function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const isAcrylic = isPreviewSupported(product);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(product.materials?.[0] || '');
  const [selectedMounting, setSelectedMounting] = useState(product.mountingOptions?.[0] || '');
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [font, setFont] = useState<PersonalizationFont>('modern');
  const [layout, setLayout] = useState<PersonalizationLayout>('center');

  const currentSize: SizeOption | null = product.sizeOptions?.[selectedSizeIndex] || null;
  const currentPrice = currentSize?.price ?? product.startingPrice ?? product.price ?? 0;
  const shape = product.shape || 'Rectangle';
  const svgWidth = currentSize?.width || 300;
  const maxNumLength = svgWidth >= 400 ? 7 : svgWidth >= 300 ? 5 : 4;
  const maxStreetLength = svgWidth >= 400 ? 25 : svgWidth >= 300 ? 18 : 12;
  const personalization: ProductPersonalization | undefined = isAcrylic
    ? { text1, text2, font, layout, shape }
    : undefined;

  const handleAddToCart = () => {
    if (isAcrylic && !text1.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your house number.',
        variant: 'destructive',
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
      personalization,
      unitPrice: currentPrice,
    });

    toast({
      title: 'Added to Cart',
      description: `${quantity}x ${product.title} added to your cart.`,
    });
  };

  const getSwatchColor = (colorName: string) => {
    const normalized = colorName.toLowerCase();
    if (normalized.includes('gold')) return '#d4a853';
    if (normalized.includes('silver') || normalized.includes('brushed')) return '#c0c0c0';
    if (normalized.includes('white') && !normalized.includes('on')) return '#f5f5f5';
    if (normalized.includes('black on white')) return '#f5f5f5';
    if (normalized.includes('white on black') || normalized.includes('on black')) return '#1a1a1a';
    return '#1a1a1a';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      <div className="w-full lg:w-[55%] space-y-4">
        <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center relative">
          {isAcrylic ? (
            <SignPreview
              product={product}
              selectedColor={selectedColor}
              personalization={personalization}
              size={currentSize}
              className="w-[75%] h-[75%] flex items-center justify-center transition-all duration-500 ease-out"
            />
          ) : (
            <Image
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          )}

          {isAcrylic ? (
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium shadow flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Preview
            </div>
          ) : null}

          {currentSize ? (
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white shadow">
              {currentSize.width} x {currentSize.height}mm
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {product.images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={`aspect-square bg-neutral-100 rounded-xl overflow-hidden border-2 transition-colors relative ${
                selectedImageIndex === index ? 'border-black' : 'border-transparent hover:border-black'
              }`}
            >
              <Image src={image} alt="" fill sizes="25vw" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex flex-col pt-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{product.title}</h1>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-medium">
            {product.sizeOptions && product.sizeOptions.length > 1
              ? `From $${product.startingPrice?.toFixed(2)}`
              : `$${currentPrice.toFixed(2)}`}
          </span>
          <span className="text-neutral-500 text-sm">|</span>
          <div className="flex items-center text-sm gap-1">
            <span className="text-yellow-500">&#9733;</span>
            <span className="font-medium">{product.rating}</span>
            <span className="text-neutral-500 underline decoration-neutral-300 underline-offset-4 cursor-pointer">
              {product.reviews} reviews
            </span>
          </div>
        </div>

        <p className="text-neutral-600 mb-8 leading-relaxed">{product.description}</p>

        <div className="space-y-8 flex-1">
          {product.sizeOptions && product.sizeOptions.length > 0 ? (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Size</Label>
              <RadioGroup
                value={String(selectedSizeIndex)}
                onValueChange={(value) => setSelectedSizeIndex(parseInt(value, 10))}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {product.sizeOptions.map((size, index) => (
                  <div key={size.label}>
                    <RadioGroupItem value={String(index)} id={`size-${index}`} className="peer sr-only" />
                    <Label
                      htmlFor={`size-${index}`}
                      className="flex items-center justify-between rounded-xl border-2 border-neutral-200 bg-white p-4 hover:bg-neutral-50 hover:border-neutral-300 peer-data-[state=checked]:border-black peer-data-[state=checked]:border-2 cursor-pointer transition-all"
                    >
                      <span className="font-medium text-sm">{size.label}</span>
                      <span className="font-bold text-sm">${size.price.toFixed(2)}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : null}

          {product.colors ? (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Color / Finish</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedColor === color
                        ? 'border-black bg-neutral-50 shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-neutral-300 shrink-0"
                      style={{ backgroundColor: getSwatchColor(color) }}
                    />
                    {color}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {isAcrylic ? (
            <div className="space-y-5 bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
              <h3 className="font-semibold text-lg border-b pb-3">Personalization</h3>

              <div className="space-y-3">
                <Label htmlFor="num">House Number (Required)</Label>
                <Input
                  id="num"
                  value={text1}
                  onChange={(event) => {
                    if (event.target.value.length <= maxNumLength) {
                      setText1(event.target.value);
                    }
                  }}
                  maxLength={maxNumLength}
                  placeholder="e.g. 12"
                  className="h-12 text-lg bg-white"
                />
                <span className="text-xs text-neutral-500 mt-1 block px-1">
                  Max {maxNumLength} characters for this size
                </span>
              </div>

              {product.category === 'House Number + Street' ? (
                <div className="space-y-3">
                  <Label htmlFor="street">Street Name</Label>
                  <Input
                    id="street"
                    value={text2}
                    onChange={(event) => {
                      if (event.target.value.length <= maxStreetLength) {
                        setText2(event.target.value);
                      }
                    }}
                    maxLength={maxStreetLength}
                    placeholder="e.g. SMITH ST"
                    className="h-12 bg-white"
                  />
                  <span className="text-xs text-neutral-500 mt-1 block px-1">
                    Max {maxStreetLength} characters for this size
                  </span>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>Font Style</Label>
                  <Select value={font} onValueChange={(value) => setFont(value as PersonalizationFont)}>
                    <SelectTrigger className="h-12 bg-white">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern Sans</SelectItem>
                      <SelectItem value="serif">Classic Serif</SelectItem>
                      <SelectItem value="stencil">Laser Stencil</SelectItem>
                      <SelectItem value="mono">Architect Mono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Layout</Label>
                  <Select value={layout} onValueChange={(value) => setLayout(value as PersonalizationLayout)}>
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
          ) : null}

          {product.mountingOptions ? (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Mounting Method</Label>
              <RadioGroup
                value={selectedMounting}
                onValueChange={setSelectedMounting}
                className="grid grid-cols-2 gap-3"
              >
                {product.mountingOptions.map((mountingOption) => (
                  <div key={mountingOption}>
                    <RadioGroupItem
                      value={mountingOption}
                      id={`mount-${mountingOption}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`mount-${mountingOption}`}
                      className="flex flex-col p-4 rounded-xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 peer-data-[state=checked]:border-black cursor-pointer transition-all"
                    >
                      <span className="font-medium text-sm mb-1">{mountingOption}</span>
                      <span className="text-xs text-neutral-500 font-normal">
                        {mountingOption === 'Mounting Tape'
                          ? 'No drilling required. Exterior grade.'
                          : 'Requires drilling. Premium standoff look.'}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : null}

          <div className="pt-6 mt-8 border-t border-neutral-200">
            <div className="flex gap-4 mb-4">
              <div className="flex items-center border rounded-xl h-14 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 text-xl text-neutral-500 hover:text-black transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 text-xl text-neutral-500 hover:text-black transition-colors"
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={isAcrylic && !text1.trim()}
                className="flex-1 h-14 text-base font-semibold rounded-xl bg-black text-white hover:bg-neutral-800 transition-colors shadow-lg shadow-black/10"
              >
                Add to Cart - ${(currentPrice * quantity).toFixed(2)}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-neutral-100 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                  ?
                </span>
                Fast Support
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                  &#10003;
                </span>
                Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
