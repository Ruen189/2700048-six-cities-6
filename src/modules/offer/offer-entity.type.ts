import type { OfferDocument } from './offer.model.js';

export type OfferEntity = ReturnType<OfferDocument['toObject']> & {
  isFavorite: boolean;
};
