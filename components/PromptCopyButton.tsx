import React, { useState } from 'react';
import { Region, NewsCategory, Language, PromptType } from '../types';

interface PromptCopyButtonProps {
  region: Region;
  category: NewsCategory;
  language: Language;
  promptType: PromptType;
}

export const PromptCopyButton: React.FC<PromptCopyButtonProps> = ({ region, category, language, promptType }) => {
  const [copied, setCopied] = useState(false);

  const generatePrompt = () => {
    const isTitlesOnly = promptType === PromptType.TITLES;
    const isSocialTrends = category === NewsCategory.SOCIAL_TRENDS;
    
    // Different prompt templates based on language and type
    const templates: Record<Language, string> = {
      [Language.IT]: isSocialTrends
        ? (isTitlesOnly 
            ? `Cerca i temi più caldi e i trend attuali sui social media in "${region}" e forniscimi una lista di almeno 50 titoli dei trend più discussi. Rispondi in Italiano.`
            : `Agisci come un analista esperto di tendenze digitali. Analizza i temi, gli hashtag e le discussioni più calde attualmente sui social media in "${region}". Fornisci un report dettagliato di almeno 5000 caratteri sulle tendenze emergenti e i segnali sociali più forti. Rispondi in Italiano.`)
        : (isTitlesOnly 
            ? `Cerca le ultime notizie di "${category}" in "${region}" e forniscimi una lista di almeno 50 titoli, brevi e concisi. Rispondi in Italiano.`
            : `Agisci come un analista esperto di notizie. Cerca e riassumi le ultime notizie più importanti riguardo a "${category}" in "${region}". Fornisci un'analisi dettagliata di almeno 5000 caratteri e rispondi in Italiano.`),
      
      [Language.EN]: isSocialTrends
        ? (isTitlesOnly
            ? `Search for the hottest topics and current trends on social media in "${region}" and provide a list of at least 50 titles of the most discussed trends. Respond in English.`
            : `Act as an expert digital trend analyst. Analyze the hottest topics, hashtags, and discussions currently on social media in "${region}". Provide a detailed report of at least 5000 characters on emerging trends and the strongest social signals. Respond in English.`)
        : (isTitlesOnly
            ? `Search for the latest "${category}" news in "${region}" and provide a list of at least 50 titles, short and concise. Respond in English.`
            : `Act as an expert news analyst. Search for and summarize the most important latest news regarding "${category}" in "${region}". Provide a detailed analysis of at least 5000 characters and respond in English.`),
      
      [Language.DE]: isSocialTrends
        ? (isTitlesOnly
            ? `Suchen Sie nach den heißesten Themen und aktuellen Trends in den sozialen Medien in "${region}" und erstellen Sie eine Liste mit mindestens 50 Titeln der am meisten diskutierten Trends. Antworten Sie auf Deutsch.`
            : `Agieren Sie als Experte für digitale Trends. Analysieren Sie die aktuell heißesten Themen, Hashtags und Diskussionen in den sozialen Medien in "${region}". Erstellen Sie einen detaillierten Bericht von mindestens 5000 Zeichen über aufkommende Trends und die stärksten sozialen Signale. Antworten Sie auf Deutsch.`)
        : (isTitlesOnly
            ? `Suchen Sie nach den neuesten Nachrichten zu "${category}" in "${region}" und erstellen Sie eine Liste mit mindestens 50 Titeln, kurz und prägnant. Antworten Sie auf Deutsch.`
            : `Agieren Sie als Experten-Nachrichtenanalyst. Suchen Sie nach den wichtigsten aktuellen Nachrichten zu "${category}" in "${region}" und fassen Sie diese zusammen. Erstellen Sie eine detaillierte Analyse von mindestens 5000 Zeichen und antworten Sie auf Deutsch.`),
      
      [Language.ES]: isSocialTrends
        ? (isTitlesOnly
            ? `Busca los temas más candentes e i las tendencias actuales en las redes sociales en "${region}" y proporciona una lista de al menos 50 títulos de las tendencias más discutidas. Responde en español.`
            : `Actúa como un analista experto en tendencias digitales. Analiza los temas, hashtags y discusiones más candentes actualmente en las redes sociales en "${region}". Proporciona un informe detallado de al menos 5000 caracteres sobre las tendencias emergentes y las señales sociales más fuertes. Responde en español.`)
        : (isTitlesOnly
            ? `Busca las últimas noticias sobre "${category}" en "${region}" y proporciona una lista de al menos 50 títulos, breves y concisos. Responde en español.`
            : `Actúa como un analista de noticias experto. Busca e resume las noticias más importantes e recientes sobre "${category}" en "${region}". Proporciona un análisis detallado de al menos 5000 caracteres e responde en español.`),
    };

    return templates[language] || templates[Language.EN];
  };

  const handleCopy = async () => {
    const prompt = generatePrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex justify-center w-full mb-8">
      <button
        onClick={handleCopy}
        className={`
          relative flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm tracking-wide uppercase transition-all duration-300
          ${copied 
            ? 'bg-green-500 text-white scale-95' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-1 active:scale-95 shadow-lg'
          }
        `}
      >
        {copied ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <span className="text-xl">✨</span>
            <span>Copy Prompt</span>
            <div className="absolute -top-2 -right-2 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-slate-900"></span>
            </div>
          </>
        )}
      </button>
    </div>
  );
};
