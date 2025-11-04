export type Protocol = {
  name: string;
  category: string;
  verified: boolean;
  logoUrl: string | null;
  websiteUrl: string | null;
}

export type PositionType = {
  name: string;
  slug: string;
  description: string | null;
}

export type FormattedPosition = {
  id: string;
  protocol: Protocol;
  positionType: PositionType;
  assetPair: string;
  usdValue: number;
  apy: number | null;
  change24h: number | null;
  changePercent24h: number | null;
  tokenAddresses: string[];
  metadata: Record<string, any>;
  updatedAt: string;
}