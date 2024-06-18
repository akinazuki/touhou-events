export interface Event {
  id: string;
  start: number;
  end: number;
  title: string;
  desc: string;
  url: string;
  type?: string[];
  color: string;
  uniqueId?: string;
  location?: EventLocation;
  platform?: EventPlatform;
  extra?: EventExtra;
}

export interface LocationEntity {
  id: string;
  addressLine1: string;
  addressLine2: string;
  fullAddress: string;
  title: string;
  lat: number;
  long: number;
}

export interface EventLocation {
  type: LocationType;
  text: string;
  desc?: string;
  entity?: LocationEntity[];
}

export enum LocationType {
  GOOGLE = "google",
}

export interface EventExtra {
  background: string;
  ticket: EventTicket[];
}

export interface EventTicket {
  title: string;
  desc: string;
  url: string;
  price: {
    currency: string;
    value: number;
  };
}

export enum EventPlatform {
  TouhouMarket,
  THBWiki,
  Bilibili,
}
