# 🚀 Deployment Guide - RSS Mode con Netlify

## ✅ Implementazione Completata

Tutti i file necessari sono stati creati e configurati:

### File Creati/Modificati:

1. ✅ `netlify/functions/fetch-rss.ts` - Netlify Function per fetch RSS
2. ✅ `services/rssService.ts` - Service per chiamare la function
3. ✅ `App.tsx` - Integrazione con gestione errori
4. ✅ `netlify.toml` - Configurazione Netlify
5. ✅ `package.json` - Dipendenza `rss-parser` installata

---

## 🧪 Test in Locale con Netlify CLI

### 1. Installa Netlify CLI (se non l'hai già)

```bash
npm install -g netlify-cli
```

### 2. Avvia il Dev Server con Functions

```bash
netlify dev
```

Questo comando:

- Avvia Vite su `http://localhost:5173`
- Avvia le Netlify Functions su `http://localhost:8888`
- Configura automaticamente il proxy

### 3. Testa l'App

Apri `http://localhost:8888` nel browser e:

1. Seleziona un giornale (es. Repubblica 🇮🇹)
2. Verifica che i titoli reali vengano caricati
3. Clicca su un titolo per testare il link Google

---

## 📦 Deploy su Netlify

### Opzione A: Deploy da GitHub (Consigliato)

#### 1. Pusha il codice su GitHub

```bash
git add .
git commit -m "feat: implement RSS mode with real RSS fetching"
git push origin main
```

#### 2. Connetti a Netlify

1. Vai su [app.netlify.com](https://app.netlify.com)
2. Click su **"Add new site"** → **"Import an existing project"**
3. Seleziona **GitHub** come provider
4. Autorizza Netlify ad accedere al tuo account GitHub
5. Seleziona il repository `newsator`

#### 3. Configura il Build

Netlify rileverà automaticamente le impostazioni da `netlify.toml`:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

#### 4. Aggiungi Environment Variables (se necessario)

Se hai API keys o secrets:

1. Vai su **Site settings** → **Environment variables**
2. Aggiungi le variabili necessarie

#### 5. Deploy!

Click su **"Deploy site"** e attendi il completamento (~2-3 minuti)

---

### Opzione B: Deploy Manuale con Netlify CLI

```bash
# 1. Login a Netlify
netlify login

# 2. Inizializza il sito (solo la prima volta)
netlify init

# 3. Build del progetto
npm run build

# 4. Deploy in produzione
netlify deploy --prod
```

---

## 🔧 Configurazione Avanzata

### Caching Strategy

La Netlify Function è già configurata con caching di **30 minuti**:

```typescript
'Cache-Control': 'public, max-age=1800, s-maxage=1800'
```

Questo significa:

- ✅ Riduce le richieste ai server RSS
- ✅ Migliora le performance
- ✅ Evita rate limiting
- ⚠️ I titoli si aggiornano ogni 30 minuti

### Modificare il Tempo di Cache

Modifica `netlify/functions/fetch-rss.ts`:

```typescript
// 15 minuti
'Cache-Control': 'public, max-age=900, s-maxage=900'

// 1 ora
'Cache-Control': 'public, max-age=3600, s-maxage=3600'

// Nessun cache
'Cache-Control': 'no-cache, no-store, must-revalidate'
```

---

## 🐛 Troubleshooting

### Problema: "Function not found"

**Soluzione**: Verifica che:

1. La cartella sia `netlify/functions/` (non `functions/`)
2. Il file si chiami `fetch-rss.ts`
3. Il `netlify.toml` specifichi `functions = "netlify/functions"`

### Problema: CORS errors

**Soluzione**: La function include già gli headers CORS. Se persiste:

1. Verifica che stai chiamando `/.netlify/functions/fetch-rss`
2. Controlla la console del browser per errori specifici

### Problema: Timeout errors

**Soluzione**: Alcuni feed RSS sono lenti. Aumenta il timeout in `fetch-rss.ts`:

```typescript
const parser = new Parser({
  timeout: 20000, // 20 secondi invece di 10
  // ...
});
```

### Problema: "No headlines available"

**Soluzione**:

1. Verifica che l'URL RSS sia corretto in `newspapers.ts`
2. Testa l'URL RSS direttamente nel browser
3. Controlla i logs della function su Netlify

---

## 📊 Monitoraggio

### Netlify Dashboard

Dopo il deploy, puoi monitorare:

1. **Functions** → Vedi quante volte è stata chiamata `fetch-rss`
2. **Logs** → Controlla errori e performance
3. **Analytics** → Traffico e utilizzo

### Logs della Function

Per vedere i logs in tempo reale:

```bash
netlify functions:log fetch-rss
```

---

## 🎯 Prossimi Passi (Opzionali)

### 1. Aggiungere Rate Limiting

Limita le richieste per IP per evitare abusi:

```typescript
// In fetch-rss.ts
const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'];
// Implementa logica di rate limiting
```

### 2. Aggiungere Analytics

Traccia quali giornali sono più popolari:

```typescript
// Invia eventi a Google Analytics o Plausible
```

### 3. Migliorare il Parsing

Alcuni feed RSS hanno formati diversi. Puoi:

- Aggiungere fallback per feed malformati
- Estrarre immagini e descrizioni
- Gestire feed Atom oltre a RSS

### 4. Aggiungere Preferiti

Permetti agli utenti di salvare i giornali preferiti in localStorage

---

## ✨ Feature Implementate

✅ **Fetching RSS Reale** - Usa `rss-parser` per parsare feed RSS  
✅ **Netlify Function** - Evita problemi CORS  
✅ **Caching 30 minuti** - Ottimizza performance e riduce carico  
✅ **Error Handling** - Gestione errori con retry button  
✅ **18 Giornali** - Italia, Germania, USA, Europa  
✅ **50 Titoli** - Limitati a 50 per performance  
✅ **Google Search** - Link cliccabili per ogni titolo  
✅ **Loading States** - Spinner durante il caricamento  
✅ **Dark Mode** - Supporto completo tema scuro

---

## 📝 Comandi Utili

```bash
# Test locale con functions
netlify dev

# Deploy preview (test prima di produzione)
netlify deploy

# Deploy produzione
netlify deploy --prod

# Vedere logs functions
netlify functions:log fetch-rss

# Aprire dashboard Netlify
netlify open

# Vedere status del sito
netlify status
```

---

## 🎉 Conclusione

L'implementazione RSS è completa e pronta per il deploy!

**Per deployare ora:**

1. Pusha su GitHub
2. Connetti a Netlify
3. Deploy automatico! 🚀

**Per testare in locale:**

```bash
netlify dev
```

Buon deploy! 🎊
