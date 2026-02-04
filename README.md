# Newsator AI

Real-time news aggregator powered by Google Gemini with Google Search Grounding and RSS feeds.

## 🚀 Features

### 📡 RSS Mode (Default)

- **18 newspapers** from Italy 🇮🇹, Germany 🇩🇪, USA 🇺🇸, and Europe 🇪🇺
- **Real RSS feeds** with up to 50 headlines per newspaper
- **Instant access** - No AI processing required
- **Google search integration** - Click any headline to search

### 🤖 AI-Powered Modes

- 🌍 **Multi-region news** (World, Europe, Germany, Italy, Spain, Switzerland)
- 🔍 **Real-time news** via Google Search Grounding
- 🤖 **AI-powered summaries** using Gemini 2.5 Flash
- ✨ **Prompt Mode** - Generate custom AI prompts
- 📖 **Read Mode** - AI-summarized news with detailed reports

### 🎨 User Experience

- 🌓 **Dark mode** support
- ⚡ **Smart caching** (30 minutes for both RSS and AI)
- 📱 **Responsive design**
- 🔒 **Privacy-focused** (No cookies, no tracking, noindex/nofollow)

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS v3**
- **Google Gemini 2.5 Flash** (with Search Grounding)
- **RSS Parser** (for RSS feeds)
- **Netlify Functions** (Serverless API for both AI and RSS)
- **ESLint** + **Prettier**

## 📦 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API Key

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_api_key_here
```

Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run development server

**Option A: Standard Vite dev server** (without Netlify Functions)

```bash
npm run dev
```

⚠️ This won't work for API calls. Use Option B for full functionality.

**Option B: Netlify Dev server** (recommended, with Functions)

```bash
npm run dev:netlify
```

This runs the app with Netlify Functions enabled.

Open the URL shown in terminal (usually `http://localhost:8888`)

## 📜 Available Scripts

- `npm run dev` - Start Vite dev server (port 3000)
- `npm run dev:netlify` - Start Netlify dev server with Functions
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🚀 Deployment

### Deploy to Netlify

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Ready for production"
   git push
   ```

2. **Connect to Netlify:**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect settings from `netlify.toml`

3. **Set Environment Variable:**
   - Go to Site Settings → Environment Variables
   - Add: `GEMINI_API_KEY` = `your_api_key_here`

4. **Deploy!**
   - Netlify will automatically build and deploy
   - Your app will be live at `https://your-site.netlify.app`

## 🔒 Security

- ✅ API key is **never exposed** to the client (secured with Netlify Functions)
- ✅ **noindex/nofollow** meta tags prevent search engine indexing
- ✅ `robots.txt` blocks all AI crawlers and search engines
- ✅ HTTP security headers via `_headers` file
- ✅ No cookies, no tracking, privacy-focused

## 📝 Notes

- News are fetched in real-time and summarized by AI
- Cache duration: **30 minutes** (configurable in code)
- Model: **Gemini 2.5 Flash** (updated from 2.0)
- Educational project - not for commercial use

## 🤝 Contributing

This is an educational project. Feel free to fork and modify!

## 📄 License

Educational use only. See legal pages for details.
