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
  LOMBARDIA = 'Lombardia',
}

export enum ViewMode {
  SUMMARY = 'Detailed Report',
  OVERVIEW = 'Headlines Only',
}

export enum AppMode {
  RSS = 'RSS Mode',
  PROMPT = 'Prompt Mode',
  READ = 'Read Mode',
}

export enum PromptType {
  EXTENDED = 'Detailed Report',
  TITLES = 'Headlines Only',
}

export enum AIModel {
  GEMINI_1_5 = 'Gemini 1.5',
  GEMINI_2_0 = 'Gemini 2.0',
  LLAMA_3 = 'Llama 3',
  MISTRAL = 'Mistral',
}

export enum Language {
  EN = 'English',
  DE = 'Deutsch',
  ES = 'Español',
  IT = 'Italiano',
}

export enum NewsCategory {
  BREAKING = 'Breaking News',
  POLITICS = 'Politics',
  ECONOMY = 'Economy & Finance',
  CRIME = 'Crime',
  BUSINESS = 'Business & Industry',
  TECHNOLOGY = 'Technology',
  WORLD = 'World',
  SOCIAL_TRENDS = 'Social Media',
  CLIMATE = 'Climate & Environment',
  HEALTH = 'Health',
  CULTURE = 'Culture',
  SPORT = 'Sport',
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

// RSS Mode Types
export interface Newspaper {
  id: string;
  name: string;
  url: string;
  rssUrl?: string;
  country: string;
  flag: string;
}

export interface RSSHeadline {
  title: string;
  link?: string;
}
