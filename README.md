# Newsator AI

Real-time news aggregator powered by Google Gemini with Google Search Grounding.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS v4** (Beta)
- **Google Gemini API** (with Search Grounding)
- **ESLint** + **Prettier**

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Key:**
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey).

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (⚠️ May fail with Tailwind 4 beta)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Features

- 🌍 Multi-region news (World, Europe, Germany, Italy, Spain, Switzerland)
- 🔍 Real-time news via Google Search Grounding
- 🌓 Dark mode support
- ⚡ Fast caching (15 minutes)
- 📱 Responsive design

## Notes

- **Tailwind CSS v4** is in beta - production builds may be unstable
- The app uses **Google Gemini 2.0 Flash** model
- News are fetched in real-time and summarized by AI
