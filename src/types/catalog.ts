export type Category =
  | 'House Numbers'
  | 'House Number + Street'
  | 'No Junk Mail'
  | 'Custom Text'
  | '3D Printed';

export type SizeOption = {
  label: string;
  width: number;
  height: number;
  price: number;
};

export type PersonalizationFont = 'modern' | 'serif' | 'stencil' | 'mono';

export type PersonalizationLayout = 'center' | 'left';

export type SignShape = 'Square' | 'Rectangle' | 'Circle' | 'Arch' | 'Rounded Rectangle';

export type ProductPersonalization = {
  text1?: string;
  text2?: string;
  font?: PersonalizationFont;
  layout?: PersonalizationLayout;
  shape?: SignShape;
};

export type Product = {
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
  buildStyle?: 'Single Layer' | 'Double Layer' | '3D Raised';
  shape?: SignShape;
  mountingOptions?: ('Mounting Tape' | 'Standoff Screws')[];
  materials?: string[];
  colors?: string[];
  sizes?: string[];
  sizeOptions?: SizeOption[];
  price?: number;
};
