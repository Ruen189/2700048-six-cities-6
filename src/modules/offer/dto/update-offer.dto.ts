export type UpdateOfferDto = {
  title?: string;
  description?: string;
  city?: string;
  previewImage?: string;
  images?: string[];
  isPremium?: boolean;
  type?: string;
  bedrooms?: number;
  maxAdults?: number;
  price?: number;
  goods?: string[];
  latitude?: number;
  longitude?: number;
};
