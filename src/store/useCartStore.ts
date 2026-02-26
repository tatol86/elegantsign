import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../data/products';

export interface CartItem {
    id: string; // Unique ID for the cart item instance (e.g. timestamp or uuid)
    product: Product;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
    selectedMaterial?: string;
    selectedMounting?: string;
    personalization?: {
        text1?: string;
        text2?: string;
        font?: string;
        layout?: string;
        shape?: string;
    };
    previewSvg?: string; // Storing the SVG representation for the cart
    unitPrice: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getSubtotal: () => number;
    getDiscount: () => { amount: number; percentage: number };
    getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                set((state) => {
                    // Check if identical item already exists (same product and configuration)
                    const existingItemIndex = state.items.findIndex(
                        (i) =>
                            i.product.id === item.product.id &&
                            i.selectedColor === item.selectedColor &&
                            i.selectedSize === item.selectedSize &&
                            i.selectedMaterial === item.selectedMaterial &&
                            i.selectedMounting === item.selectedMounting &&
                            JSON.stringify(i.personalization) === JSON.stringify(item.personalization)
                    );

                    if (existingItemIndex > -1) {
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += item.quantity;
                        return { items: newItems };
                    }

                    return {
                        items: [...state.items, { ...item, id: crypto.randomUUID() }]
                    };
                });
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                if (quantity < 1) return;
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getSubtotal: () => {
                return get().items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
            },

            getDiscount: () => {
                const totalItems = get().getTotalItems();
                const subtotal = get().getSubtotal();
                let percentage = 0;

                if (totalItems >= 20) percentage = 0.30;
                else if (totalItems >= 10) percentage = 0.20;
                else if (totalItems >= 5) percentage = 0.15;

                return {
                    percentage,
                    amount: subtotal * percentage
                };
            },

            getTotal: () => {
                const subtotal = get().getSubtotal();
                const { amount: discountAmount } = get().getDiscount();
                return subtotal - discountAmount;
            },
        }),
        {
            name: 'ecommerce-cart-storage',
        }
    )
);
