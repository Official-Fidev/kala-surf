export type ISODate = string;

export interface AvailabilityInput {
  checkIn: ISODate;
  checkOut: ISODate;
  adults: number;
  children: number;
}

export type GuestForm = {
  firstName: string;
  lastName: string;
  gender: string;
  arrivalTime: string;
  country: string;
  email: string;
  phoneCode: string;
  phone: string;
  etd: string;
  notes: string;
};

export type GuestFormErrors = Partial<Record<keyof GuestForm, string>>;

export type CategoryGroup = {
  key: string;
  label: string;
  description: string;
  rooms: RoomOption[];
  imageUrl?: string;
};

export interface RoomOption {
  roomTypeId: string;
  category?: string;
  roomTypeName: string;
  propertyId?: string;
  roomTypeNameShort?: string;
  ratePlanId?: string;
  ratePlanName?: string;
  price?: number;
  available: boolean;
  imageUrl?: string;
  photos?: string[];
  description?: string;
  maxGuests?: number;
  adultsIncluded?: number;
  childrenIncluded?: number;
  roomsAvailable?: number;
  roomTypeUnits?: number;
  isPrivate?: boolean;
  features?: string[];
  rawData?: Record<string, unknown>;
}

export interface AvailabilityResponse {
  propertyId?: string;
  currency?: string;
  rooms: RoomOption[];
  sourceEndpoint: string;
}

export interface AddOn {
  itemId: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  imageUrl?: string;
}

export interface BookingInput extends AvailabilityInput {
  roomTypeId: string;
  ratePlanId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  notes?: string;
  items?: string[];
}

export interface BookingResponse {
  reservationId: string;
  status: string;
  sourceEndpoint: string;
}
