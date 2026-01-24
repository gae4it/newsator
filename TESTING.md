# Testing Instructions for Netlify Functions

## Local Testing

To test the app locally with Netlify Functions:

1. **Stop the current dev server** (Ctrl+C in the terminal running `npm run dev`)

2. **Run with Netlify Dev:**
   ```bash
   npm run dev:netlify
   ```
   
   This will:
   - Start Vite dev server on port 3000
   - Start Netlify Functions on `/.netlify/functions/*`
   - Load environment variables from `.env.local`

3. **Open the app:**
   - Go to `http://localhost:8888` (Netlify Dev default port)
   - Or the port shown in the terminal

4. **Test the functionality:**
   - Select a region (e.g., World, Italy)
   - Select a category (e.g., Technology, Sports)
   - Check if news loads correctly

5. **Verify API key is NOT exposed:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look at the request to `/.netlify/functions/fetch-news`
   - **The API key should NOT be visible anywhere**

## What Changed

### Before (Insecure):
- API key was in `vite.config.ts` → exposed to client
- Direct calls to Gemini API from browser
- Anyone could steal the API key

### After (Secure):
- API key only in `.env.local` (server-side)
- Client calls `/.netlify/functions/fetch-news`
- Netlify Function calls Gemini API server-side
- API key never exposed to browser

## Deployment to Netlify

When ready to deploy:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Netlify Functions for API security"
   git push
   ```

2. **In Netlify Dashboard:**
   - Go to Site Settings → Environment Variables
   - Add: `GEMINI_API_KEY` = `your_api_key_here`
   - Deploy

3. **The app will work automatically** because `netlify.toml` is configured!

## Troubleshooting

If you get errors:
- Make sure `.env.local` has `GEMINI_API_KEY=your_key`
- Check terminal for Netlify Function logs
- Verify the function is at `netlify/functions/fetch-news.ts`
