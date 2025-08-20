## Local AI Environment Setup

### 1) Install dotenv
Use your package manager to add `dotenv`.

### 2) App loads .env in development
`backend/app.js` loads `backend/.env` when `NODE_ENV !== 'production'`.

### 3) Create backend/.env (not committed)
Set your key and pricing caps:
```
ANTHROPIC_API_KEY=your_key_here
AI_PRICE_INPUT_PER_MTOK=0.15
AI_PRICE_OUTPUT_PER_MTOK=0.60
AI_SOFT_CAP_USD=2
AI_HARD_CAP_USD=4
```

Ensure `.env` is gitignored.

### 4) Production (Fly.io)
Set secrets instead of .env:
```
fly secrets set ANTHROPIC_API_KEY=your_key_here
```

