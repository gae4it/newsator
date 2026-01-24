export enum Region {
  WORLD = 'World',
  EUROPE = 'Europe',
  GERMANY = 'Germany',
  ITALY = 'Italy',
  SPAIN = 'Spain',
  SWITZERLAND = 'Switzerland',
  USA = 'USA',
  ASIA = 'Asia',
  UK = 'UK',
  BADEN_WUERTTEMBERG = 'Baden-Württemberg',
  BAYERN = 'Bayern',
  LOMBARDIA = 'Lombardia'
}

export enum NewsCategory {
  BREAKING = 'Breaking News',
  POLITICS = 'Politics',
  ECONOMY = 'Economy & Finance',
  CRIME = 'Crime',
  BUSINESS = 'Business & Industry',
  TECHNOLOGY = 'Technology',
  WORLD = 'World',
  CLIMATE = 'Climate & Environment',
  HEALTH = 'Health',
  CULTURE = 'Culture'
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