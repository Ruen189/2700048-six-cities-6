import type { CreateOfferDto } from './dto/create-offer.dto.js';
import type { UpdateOfferDto } from './dto/update-offer.dto.js';
import type { OfferEntity } from './offer-entity.type.js';

export interface OfferServiceInterface {
  create(dto: CreateOfferDto, hostId: string): Promise<OfferEntity>;
  findById(id: string, currentUserId?: string): Promise<OfferEntity | null>;
  find(limit?: number, currentUserId?: string): Promise<OfferEntity[]>;
  findByIds(ids: string[], currentUserId?: string): Promise<OfferEntity[]>;
  updateById(id: string, dto: UpdateOfferDto, currentUserId?: string): Promise<OfferEntity | null>;
  deleteById(id: string): Promise<boolean>;
  findPremiumByCity(city: string, limit?: number, currentUserId?: string): Promise<OfferEntity[]>;
  exists(id: string): Promise<boolean>;
  findOwnerId(id: string): Promise<string | null>;
  updateRatingAndCommentCount(offerId: string): Promise<void>;
}
