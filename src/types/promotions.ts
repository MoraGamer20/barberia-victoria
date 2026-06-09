export interface Promotion {
  id: string;
  emoji: string;
  tag: string;
  tagColor: string;
  name: string;
  description: string;
  originalPrice: number | null;
  promoPrice: number | null;
  discount: string;
  validFrom: string; // Format: YYYY-MM-DD
  validTo: string;   // Format: YYYY-MM-DD
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: number;
}
