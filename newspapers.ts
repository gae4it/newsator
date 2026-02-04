import { Newspaper } from './types';

export const NEWSPAPERS: Newspaper[] = [
  // Italian Sources
  {
    id: 'televideo',
    name: 'Televideo RAI',
    url: 'https://www.servizitelevideo.rai.it/televideo/pub/index.jsp',
    rssUrl: 'https://www.servizitelevideo.rai.it/televideo/pub/rss102.xml',
    country: 'IT',
    flag: '🇮🇹',
  },
  {
    id: 'il-fatto',
    name: 'Il Fatto Quotidiano',
    url: 'https://www.ilfattoquotidiano.it/',
    rssUrl: 'https://www.ilfattoquotidiano.it/feed/',
    country: 'IT',
    flag: '🇮🇹',
  },
  {
    id: 'repubblica',
    name: 'Repubblica',
    url: 'https://www.repubblica.it/',
    rssUrl: 'https://www.repubblica.it/rss/homepage/rss2.0.xml',
    country: 'IT',
    flag: '🇮🇹',
  },
  {
    id: 'ansa',
    name: 'ANSA',
    url: 'https://www.ansa.it/',
    rssUrl: 'https://www.ansa.it/sito/ansait_rss.xml',
    country: 'IT',
    flag: '🇮🇹',
  },
  {
    id: 'il-sole-24-ore',
    name: 'Il Sole 24 Ore',
    url: 'https://www.ilsole24ore.com/',
    rssUrl: 'https://www.ilsole24ore.com/rss/mondo--europa.xml',
    country: 'IT',
    flag: '🇮🇹',
  },
  {
    id: 'sky-tg24',
    name: 'SkyTg24',
    url: 'https://tg24.sky.it/',
    rssUrl: 'https://tg24.sky.it/rss/home.xml',
    country: 'IT',
    flag: '🇮🇹',
  },
  {
    id: 'internazionale',
    name: 'Internazionale',
    url: 'https://www.internazionale.it/',
    rssUrl: 'https://www.internazionale.it/sitemaps/rss.xml',
    country: 'IT',
    flag: '🇮🇹',
  },

  // German Sources
  {
    id: 'dw',
    name: 'Deutsche Welle',
    url: 'https://www.dw.com/',
    rssUrl: 'https://rss.dw.com/xml/rss-de-all',
    country: 'DE',
    flag: '🇩🇪',
  },
  {
    id: 'tagesschau',
    name: 'Tagesschau',
    url: 'https://www.tagesschau.de/',
    rssUrl: 'https://www.tagesschau.de/inland/index~rss2.xml',
    country: 'DE',
    flag: '🇩🇪',
  },
  {
    id: 'sueddeutsche',
    name: 'Süddeutsche Zeitung',
    url: 'https://www.sueddeutsche.de/',
    rssUrl: 'https://rss.sueddeutsche.de/rss/Topthemen',
    country: 'DE',
    flag: '🇩🇪',
  },
  {
    id: 'faz',
    name: 'Frankfurter Allgemeine',
    url: 'https://www.faz.net/',
    rssUrl: 'https://www.faz.net/rss/aktuell',
    country: 'DE',
    flag: '🇩🇪',
  },
  {
    id: 'spiegel',
    name: 'Der Spiegel',
    url: 'https://www.spiegel.de/',
    rssUrl: 'https://www.spiegel.de/schlagzeilen/tops/index.rss',
    country: 'DE',
    flag: '🇩🇪',
  },

  // US Sources
  {
    id: 'reuters',
    name: 'Reuters',
    url: 'https://www.reuters.com/',
    rssUrl: 'https://www.reuters.com/rssfeed/worldNews',
    country: 'US',
    flag: '🇺🇸',
  },
  {
    id: 'nytimes',
    name: 'New York Times',
    url: 'https://www.nytimes.com/',
    rssUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    country: 'US',
    flag: '🇺🇸',
  },

  // European Sources
  {
    id: 'euronews',
    name: 'EuroNews',
    url: 'https://www.euronews.com/',
    rssUrl: 'https://www.euronews.com/rss?format=mrss&level=vertical&name=my-europe',
    country: 'EU',
    flag: '🇪🇺',
  },
];
