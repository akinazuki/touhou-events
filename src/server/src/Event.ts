export interface Event {
  id: string;
  start: number;
  end: number;
  title: string;
  desc: string;
  url: string;
  type: string[];
  color: string;
  uniqueId: string;
  location: EventLocation;
  platform: EventPlatform;
  extra?: EventExtra;
}

export interface EventLocation {
  type: LocationType;
  text: string;
  desc: string;
  lnglat: [number, number];
}

export enum LocationType {
  wgs84 = "wgs84",
  amap = "amap",
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
