export type CatalogProduct = {
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  stock: number;
  isActive: boolean;
};
