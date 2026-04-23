export type CreateOfferDto = {
  title: string;
  description: string;
  postDate: Date;
  city: string;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  type: string;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: string[];
  host: string;
  latitude: number;
  longitude: number;
};
