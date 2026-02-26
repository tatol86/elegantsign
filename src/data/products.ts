export type Category = 'House Numbers' | 'House Number + Street' | 'No Junk Mail' | 'Custom Text' | '3D Printed';

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  price: number;
  images: string[];
  rating: number;
  reviews: number;
  leadTimeDays: string;
  // Specific properties based on category
  buildStyle?: 'Single Layer' | 'Double Layer' | '3D Raised';
  shape?: 'Square' | 'Rectangle' | 'Circle' | 'Arch' | 'Rounded Rectangle';
  mountingOptions?: ('Mounting Tape' | 'Standoff Screws')[];
  materials?: string[]; // e.g., 'PLA', 'PETG', 'ASA'
  colors?: string[];
  sizes?: string[];
};

export const products: Product[] = [
  {
    id: 'acrylic-1',
    handle: 'single-layer-house-number',
    title: 'Minimalist Single Layer House Number',
    description: 'A clean, modern single-layer acrylic house number sign perfectly suited for contemporary Australian homes.',
    category: 'House Numbers',
    tags: ['acrylic', 'single-layer', 'modern'],
    price: 45.0,
    images: ['https://placehold.co/800x800/eeeeee/333333?text=Single+Layer+Sign'],
    rating: 4.8,
    reviews: 124,
    leadTimeDays: '1-2',
    buildStyle: 'Single Layer',
    shape: 'Rectangle',
    mountingOptions: ['Mounting Tape', 'Standoff Screws'],
    colors: ['Matte Black', 'Gloss White', 'Brushed Gold', 'Silver'],
    sizes: ['Small (150x150mm)', 'Medium (200x200mm)', 'Large (300x300mm)']
  },
  {
    id: 'acrylic-2',
    handle: 'double-layer-house-street',
    title: 'Double Layer Premium Address Sign',
    description: 'Add depth and prestige to your entryway with our double layer acrylic address sign, featuring contrasting base and top text layers.',
    category: 'House Number + Street',
    tags: ['acrylic', 'double-layer', 'premium'],
    price: 85.0,
    images: ['https://placehold.co/800x800/e0e0e0/111111?text=Double+Layer+Sign'],
    rating: 4.9,
    reviews: 86,
    leadTimeDays: '2-3',
    buildStyle: 'Double Layer',
    shape: 'Arch',
    mountingOptions: ['Standoff Screws'],
    colors: ['Black on White', 'White on Black', 'Gold on Black', 'Silver on White'],
    sizes: ['Medium (200x300mm)', 'Large (300x400mm)']
  },
  {
    id: 'acrylic-3',
    handle: '3d-raised-custom-text',
    title: '3D Raised Lettering Business Sign',
    description: 'Make a bold statement with precision-cut 3D raised lettering. Ideal for business names or custom household statements.',
    category: 'Custom Text',
    tags: ['acrylic', '3d-raised', 'business'],
    price: 120.0,
    images: ['https://placehold.co/800x800/d5d5d5/222222?text=3D+Raised+Text'],
    rating: 5.0,
    reviews: 42,
    leadTimeDays: '3-4',
    buildStyle: '3D Raised',
    shape: 'Rounded Rectangle',
    mountingOptions: ['Mounting Tape', 'Standoff Screws'],
    colors: ['Matte Black', 'Gloss White', 'Rose Gold', 'Copper'],
    sizes: ['Large (300x400mm)', 'Extra Large (400x600mm)']
  },
  {
    id: '3d-1',
    handle: '3d-printed-planter',
    title: 'Geometric 3D Printed Planter',
    description: 'A striking geometric planter, 3D printed with eco-friendly PLA or durable PETG. Perfect for succulents and small house plants.',
    category: '3D Printed',
    tags: ['3d-printed', 'planter', 'decor'],
    price: 35.0,
    images: ['https://placehold.co/800x800/f5f5f5/555555?text=3D+Printed+Planter'],
    rating: 4.7,
    reviews: 210,
    leadTimeDays: '1-3',
    materials: ['PLA', 'PETG', 'ASA'],
    colors: ['Marble', 'Charcoal', 'Terracotta', 'Sage Green'],
    sizes: ['Small (10cm)', 'Medium (15cm)', 'Large (20cm)']
  },
  {
    id: '3d-2',
    handle: '3d-printed-junk-mail-plaque',
    title: 'Durable 3D Printed No Junk Mail Plaque',
    description: 'Tough, weather-resistant ASA 3D printed plaque to keep unwanted mail away. Subtle and modern.',
    category: 'No Junk Mail',
    tags: ['3d-printed', 'utility', 'outdoor'],
    price: 18.0,
    images: ['https://placehold.co/800x800/cccccc/000000?text=No+Junk+Mail'],
    rating: 4.6,
    reviews: 340,
    leadTimeDays: '1-2',
    materials: ['ASA'],
    colors: ['Black', 'White', 'Graphite'],
    sizes: ['Standard (120x40mm)'],
    mountingOptions: ['Mounting Tape']
  }
];

export const getProductByHandle = (handle: string) => products.find(p => p.handle === handle);
export const getProductsByCategory = (category: Category) => products.filter(p => p.category === category);
