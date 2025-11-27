export enum Region {
  WORLD = 'World',
  EUROPE = 'Europe',
  GERMANY = 'Germany',
  ITALY = 'Italy',
  SPAIN = 'Spain',
  SWITZERLAND = 'Switzerland'
}

export interface NewsPoint {
  summary: string;
  sourceName: string;
  sourceUrl: string;
}

export interface NewsTopic {
  category: string; // e.g., "Politics", "Technology"
  points: NewsPoint[];
}

export interface NewsResponse {
  topics: NewsTopic[];
}

export interface CacheEntry {
  data: NewsResponse;
  timestamp: number;
}