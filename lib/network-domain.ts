export type TcgKey = "pokemon" | "one-piece" | "lorcana" | "yugioh" | "magic" | string;
export type RetailerVerification = "external" | "network" | "verified";
export type OfferChannel = "online" | "local";
export type StockState = "in_stock" | "out_of_stock" | "preorder" | "unknown";

export type NetworkRetailer = {
  id: string;
  name: string;
  website: string | null;
  verification: RetailerVerification;
  catalogueConnected: boolean;
};

export type NetworkLocation = {
  id: string;
  retailerId: string | null;
  provider: "fatedrop" | "google-places" | string;
  providerId: string | null;
  name: string;
  address: string | null;
  postcode: string | null;
  latitude: number;
  longitude: number;
  website: string | null;
  phone: string | null;
  openingDetails: Record<string, unknown> | null;
  verification: RetailerVerification;
};

export type NetworkProductIdentity = {
  id: string;
  tcg: TcgKey;
  canonicalKey: string;
  title: string;
  productType: string | null;
  setName: string | null;
  edition: string | null;
  officialRrpPence: number | null;
  rrpSource: string | null;
  rrpVerifiedAt: number | null;
};

export type NetworkOffer = {
  id: string;
  retailerId: string;
  locationId: string | null;
  productIdentityId: string;
  retailerSku: string | null;
  title: string;
  url: string;
  channel: OfferChannel;
  itemPricePence: number;
  mandatoryPostagePence: number | null;
  mandatoryFeesPence: number | null;
  deliveryKnown: boolean;
  stockState: StockState;
  stockQuantity: number | null;
  observedAt: number;
};

export type TruePriceResult = {
  itemPricePence: number;
  mandatoryPostagePence: number | null;
  mandatoryFeesPence: number | null;
  deliveryKnown: boolean;
  deliveredTruePricePence: number | null;
  rrpPence: number | null;
  differenceFromRrpPence: number | null;
  percentFromRrp: number | null;
  label: "Below RRP" | "RRP" | "Fair" | "Elevated" | "High Premium" | "RRP unknown";
};

export type SignalKind = "whisper" | "echo" | "manifested" | "vanished" | "price_change" | "launch_date_change" | "queue" | "security" | "drop_pulse";

export type NetworkSignalEvent = {
  id: string;
  kind: SignalKind;
  productIdentityId: string | null;
  offerId: string | null;
  retailerId: string | null;
  locationId: string | null;
  occurredAt: number;
  evidence: Record<string, unknown>;
};
