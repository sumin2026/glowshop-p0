export type Category = "Audio" | "Home" | "Wearables" | "Travel";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  imageAlt: string;
  shortDescription: string;
  description: string;
  features: string[];
  badge?: "Bestseller" | "New" | "Limited";
}

export interface CartLine {
  product: Product;
  quantity: number;
}
