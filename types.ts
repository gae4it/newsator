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

export enum ViewMode {
  SUMMARY = 'Summary',
  OVERVIEW = 'Overview'
}

export enum AIModel {
  GEMINI_1_5 = 'Gemini 1.5',
  GEMINI_2_0 = 'Gemini 2.0'
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
  title: string;
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