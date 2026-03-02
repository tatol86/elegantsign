'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Plus, Package, Image as ImageIcon, ArrowLeft } from 'lucide-react';

type SizeOption = {
    label: string;
    width: number;
    height: number;
    price: number;
};

type Product = {
    id: string;
    handle: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    startingPrice: number;
    images: string[];
    rating: number;
    reviews: number;
    leadTimeDays: string;
    buildStyle?: string;
    shape?: string;
    mountingOptions?: string[];
    colors?: string[];
    sizeOptions?: SizeOption[];
};

export default function AdminDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products', { cache: 'no-store' });
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load products' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
                setMessage({ type: 'success', text: 'Product deleted successfully' });
                setDeleteConfirm(null);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete product' });
        }
    };

    const handleSave = async (product: Product) => {
        setSaving(true);
        try {
            const isNew = isCreating;
            const url = isNew ? '/api/admin/products' : `/api/admin/products/${product.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });

            if (res.ok) {
                const savedProduct = await res.json();
                if (isNew) {
                    setProducts(prev => [...prev, savedProduct]);
                } else {
                    setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
                }
                setEditingProduct(null);
                setIsCreating(false);
                setMessage({ type: 'success', text: `Product ${isNew ? 'created' : 'updated'} successfully` });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save product' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                return data.path;
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="animate-pulse text-neutral-400 text-lg">Loading products...</div>
            </div>
        );
    }

    if (editingProduct || isCreating) {
        return (
            <ProductForm
                product={editingProduct}
                isNew={isCreating}
                onSave={handleSave}
                onCancel={() => { setEditingProduct(null); setIsCreating(false); }}
                onImageUpload={handleImageUpload}
                saving={saving}
            />
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Header */}
            <div className="border-b border-neutral-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-neutral-500 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">
                            <span className="text-neutral-500">ELEGANT</span>SIGN
                            <span className="text-neutral-600 font-normal ml-3 text-sm">Admin</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => { setIsCreating(true); setEditingProduct(null); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Product
                    </button>
                </div>
            </div>

            {/* Message Banner */}
            {message && (
                <div className={`px-6 py-3 text-sm font-medium text-center ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                    {message.text}
                    <button onClick={() => setMessage(null)} className="ml-4 underline text-xs">Dismiss</button>
                </div>
            )}

            {/* Stats Bar */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                        <div className="text-3xl font-bold">{products.length}</div>
                        <div className="text-sm text-neutral-500 mt-1">Total Products</div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                        <div className="text-3xl font-bold">{products.filter(p => p.buildStyle === 'Single Layer').length}</div>
                        <div className="text-sm text-neutral-500 mt-1">Single Layer</div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                        <div className="text-3xl font-bold">{products.filter(p => p.buildStyle === 'Double Layer').length}</div>
                        <div className="text-sm text-neutral-500 mt-1">Double Layer</div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                        <div className="text-3xl font-bold">{products.filter(p => p.buildStyle === '3D Raised').length}</div>
                        <div className="text-sm text-neutral-500 mt-1">3D Raised</div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-neutral-500" /> Product Catalog
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(product => (
                        <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group hover:border-neutral-600 transition-colors">
                            {/* Product Image */}
                            <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                                {product.images[0] && !product.images[0].includes('placehold') ? (
                                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-neutral-700" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingProduct(product)}
                                        className="p-2 bg-white/90 text-black rounded-lg hover:bg-white transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(product.id)}
                                        className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* Build Style Badge */}
                                <div className="absolute bottom-2 left-2">
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${product.buildStyle === 'Double Layer' ? 'bg-blue-500/80 text-white' :
                                        product.buildStyle === '3D Raised' ? 'bg-amber-500/80 text-white' :
                                            'bg-neutral-600/80 text-white'
                                        }`}>
                                        {product.buildStyle}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4 space-y-2">
                                <h3 className="font-semibold text-sm leading-snug line-clamp-2">{product.title}</h3>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-400">From <span className="text-white font-medium">${product.startingPrice?.toFixed(2)}</span></span>
                                    <span className="text-neutral-500 text-xs">{product.sizeOptions?.length || 0} sizes</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-neutral-500">
                                    <span className="text-yellow-500">{'★'.repeat(Math.floor(product.rating))}</span>
                                    <span className="text-neutral-600">{'★'.repeat(5 - Math.floor(product.rating))}</span>
                                    <span>({product.reviews})</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Product Card */}
                    <button
                        onClick={() => { setIsCreating(true); setEditingProduct(null); }}
                        className="aspect-auto min-h-[280px] border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-neutral-600 hover:text-neutral-400 hover:border-neutral-600 transition-colors"
                    >
                        <Plus className="w-8 h-8" />
                        <span className="text-sm font-medium">Add New Product</span>
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4">
                        <h3 className="font-bold text-lg">Delete Product?</h3>
                        <p className="text-neutral-400 text-sm">This action cannot be undone. The product will be permanently removed from your catalog.</p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 border border-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2.5 bg-red-600 rounded-xl text-sm font-bold hover:bg-red-500 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ===== Product Form Component =====
function ProductForm({
    product,
    isNew,
    onSave,
    onCancel,
    onImageUpload,
    saving,
}: {
    product: Product | null;
    isNew: boolean;
    onSave: (product: Product) => void;
    onCancel: () => void;
    onImageUpload: (file: File) => Promise<string | null>;
    saving: boolean;
}) {
    const defaultProduct: Product = {
        id: `new-${Date.now()}`,
        handle: '',
        title: '',
        description: '',
        category: 'House Numbers',
        tags: [],
        startingPrice: 0,
        images: [],
        rating: 0,
        reviews: 0,
        leadTimeDays: '1-2',
        buildStyle: 'Single Layer',
        shape: 'Rectangle',
        mountingOptions: ['Mounting Tape'],
        colors: ['Matte Black'],
        sizeOptions: [{ label: 'Medium (300×150mm)', width: 300, height: 150, price: 30 }],
    };

    const [form, setForm] = useState<Product>(product || defaultProduct);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [tagsInput, setTagsInput] = useState(form.tags?.join(', ') || '');
    const [colorsInput, setColorsInput] = useState(form.colors?.join(', ') || '');
    const [mountingInput, setMountingInput] = useState(form.mountingOptions?.join(', ') || '');

    const updateField = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const path = await onImageUpload(file);
        if (path) {
            updateField('images', [...(form.images || []), path]);
        }
        setUploadingImage(false);
    };

    const removeImage = (index: number) => {
        updateField('images', form.images.filter((_, i) => i !== index));
    };

    const handleSizeChange = (index: number, field: string, value: string | number) => {
        const newSizes = [...(form.sizeOptions || [])];
        newSizes[index] = { ...newSizes[index], [field]: field === 'label' ? value : Number(value) };
        updateField('sizeOptions', newSizes);
    };

    const addSize = () => {
        updateField('sizeOptions', [...(form.sizeOptions || []), { label: '', width: 0, height: 0, price: 0 }]);
    };

    const removeSize = (index: number) => {
        updateField('sizeOptions', form.sizeOptions?.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const finalProduct = {
            ...form,
            tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
            colors: colorsInput.split(',').map(c => c.trim()).filter(Boolean),
            mountingOptions: mountingInput.split(',').map(m => m.trim()).filter(Boolean),
            startingPrice: form.sizeOptions && form.sizeOptions.length > 0
                ? Math.min(...form.sizeOptions.map(s => s.price))
                : form.startingPrice,
        };
        onSave(finalProduct);
    };

    const inputClass = "w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 text-sm transition-colors";
    const labelClass = "block text-sm font-semibold text-neutral-300 mb-2";
    const sectionClass = "space-y-4";

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Header */}
            <div className="border-b border-neutral-800 sticky top-0 bg-neutral-950/80 backdrop-blur-md z-30">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onCancel} className="text-neutral-500 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold">{isNew ? 'Add New Product' : `Edit: ${form.title}`}</h1>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="px-5 py-2.5 border border-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving || !form.title}
                            className="px-6 py-2.5 bg-white text-black font-bold rounded-xl text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Body */}
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
                {/* Basic Info */}
                <div className={sectionClass}>
                    <h2 className="text-lg font-bold border-b border-neutral-800 pb-3">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Product Title *</label>
                            <input className={inputClass} value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. House Numbers — Circle — Double Layer" />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Description</label>
                            <textarea className={`${inputClass} min-h-[100px] resize-y`} value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Product description..." />
                        </div>
                        <div>
                            <label className={labelClass}>URL Handle</label>
                            <input className={inputClass} value={form.handle} onChange={e => updateField('handle', e.target.value)} placeholder="auto-generated-from-title" />
                            <p className="text-xs text-neutral-600 mt-1">Leave blank to auto-generate from title</p>
                        </div>
                        <div>
                            <label className={labelClass}>Category</label>
                            <select className={inputClass} value={form.category} onChange={e => updateField('category', e.target.value)}>
                                <option value="House Numbers">House Numbers</option>
                                <option value="House Number + Street">House Number + Street</option>
                                <option value="Custom Text">Custom Text</option>
                                <option value="No Junk Mail">No Junk Mail</option>
                                <option value="3D Printed">3D Printed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Build & Shape */}
                <div className={sectionClass}>
                    <h2 className="text-lg font-bold border-b border-neutral-800 pb-3">Build & Shape</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Build Style</label>
                            <select className={inputClass} value={form.buildStyle} onChange={e => updateField('buildStyle', e.target.value)}>
                                <option value="Single Layer">Single Layer</option>
                                <option value="Double Layer">Double Layer</option>
                                <option value="3D Raised">3D Raised</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Shape</label>
                            <select className={inputClass} value={form.shape} onChange={e => updateField('shape', e.target.value)}>
                                <option value="Rectangle">Rectangle (Square Corners)</option>
                                <option value="Rounded Rectangle">Rounded Rectangle</option>
                                <option value="Circle">Circle</option>
                                <option value="Arch">Arch</option>
                                <option value="Square">Square</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Lead Time</label>
                            <select className={inputClass} value={form.leadTimeDays} onChange={e => updateField('leadTimeDays', e.target.value)}>
                                <option value="1-2">1-2 days</option>
                                <option value="2-3">2-3 days</option>
                                <option value="3-4">3-4 days</option>
                                <option value="5-7">5-7 days</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Colors & Tags */}
                <div className={sectionClass}>
                    <h2 className="text-lg font-bold border-b border-neutral-800 pb-3">Colors, Tags & Mounting</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Colors (comma separated)</label>
                            <input className={inputClass} value={colorsInput} onChange={e => setColorsInput(e.target.value)} placeholder="Matte Black, Gloss White, Gold" />
                        </div>
                        <div>
                            <label className={labelClass}>Tags (comma separated)</label>
                            <input className={inputClass} value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="acrylic, double-layer, house-numbers" />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Mounting Options (comma separated)</label>
                            <input className={inputClass} value={mountingInput} onChange={e => setMountingInput(e.target.value)} placeholder="Mounting Tape, Standoff Screws" />
                        </div>
                    </div>
                </div>

                {/* Size Options & Pricing */}
                <div className={sectionClass}>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                        <h2 className="text-lg font-bold">Size Options & Pricing</h2>
                        <button onClick={addSize} className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Size
                        </button>
                    </div>
                    <div className="space-y-3">
                        {form.sizeOptions?.map((size, i) => (
                            <div key={i} className="grid grid-cols-12 gap-3 items-end bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                                <div className="col-span-4">
                                    <label className="text-xs text-neutral-500 mb-1 block">Label</label>
                                    <input className={inputClass} value={size.label} onChange={e => handleSizeChange(i, 'label', e.target.value)} placeholder="e.g. Small (200×100mm)" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-neutral-500 mb-1 block">Width (mm)</label>
                                    <input className={inputClass} type="number" value={size.width} onChange={e => handleSizeChange(i, 'width', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-neutral-500 mb-1 block">Height (mm)</label>
                                    <input className={inputClass} type="number" value={size.height} onChange={e => handleSizeChange(i, 'height', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-neutral-500 mb-1 block">Price ($)</label>
                                    <input className={inputClass} type="number" step="0.01" value={size.price} onChange={e => handleSizeChange(i, 'price', e.target.value)} />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <button onClick={() => removeSize(i)} className="p-2.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews */}
                <div className={sectionClass}>
                    <h2 className="text-lg font-bold border-b border-neutral-800 pb-3">Reviews & Rating</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Rating (0-5)</label>
                            <input className={inputClass} type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => updateField('rating', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div>
                            <label className={labelClass}>Number of Reviews</label>
                            <input className={inputClass} type="number" min="0" value={form.reviews} onChange={e => updateField('reviews', parseInt(e.target.value) || 0)} />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className={sectionClass}>
                    <h2 className="text-lg font-bold border-b border-neutral-800 pb-3">Product Images</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {form.images?.map((img, i) => (
                            <div key={i} className="aspect-square bg-neutral-800 rounded-xl overflow-hidden relative group">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeImage(i)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        <label className="aspect-square border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-neutral-500 transition-colors">
                            {uploadingImage ? (
                                <div className="animate-spin w-6 h-6 border-2 border-neutral-500 border-t-white rounded-full" />
                            ) : (
                                <>
                                    <ImageIcon className="w-6 h-6 text-neutral-600" />
                                    <span className="text-xs text-neutral-600">Upload Image</span>
                                </>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploadingImage} />
                        </label>
                    </div>
                    <p className="text-xs text-neutral-600">Supported formats: JPEG, PNG, WebP, AVIF. Images are stored in /public/products/.</p>
                </div>
            </div>
        </div>
    );
}
