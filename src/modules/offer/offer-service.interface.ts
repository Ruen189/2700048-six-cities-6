import type { OfferDocument } from './offer.model.js';

export type CreateOfferDto = {
  title: string;
  description: string;
  postDate: Date;
  city: string;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: string;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: string[];
  host: string;
  latitude: number;
  longitude: number;
};

export interface OfferServiceInterface {
  create(dto: CreateOfferDto): Promise<OfferDocument>;
  findById(id: string): Promise<OfferDocument | null>;
}
