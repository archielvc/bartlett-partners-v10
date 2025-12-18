// UI Property type used across components
export interface Property {
  id: number;
  title: string;
  description?: string;
  tags?: string[];
  image: string;
  location: string;
  price: string;
  priceValue: number;
  beds: number;
  baths: number;
  sqft: string;
  type: string;
  status: string;
  slug: string;
  address?: string;
  floorPlanUrl?: string;
  vimeoUrl?: string;
}