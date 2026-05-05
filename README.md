# Sina Neak — Portfolio + Dify Knowledge Integration

This project scaffolds a minimal Next.js frontend and simple backend routes to integrate with Dify Knowledge API.

Quick setup

1. Install dependencies

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and set your `DIFY_API_KEY`.

3. Ingest the portfolio markdown into Dify (creates a knowledge base and uploads the file):

```bash
npm run ingest
```

4. After ingestion finishes, set `NEXT_PUBLIC_DIFY_DATASET_ID` in `.env.local` to the dataset id printed by the ingestion script, then run the dev server:

```bash
npm run dev
```

5. Open `http://localhost:3000` and use the chat box to query your knowledge base.

Notes

- The ingestion script uses the Dify Knowledge API to create a dataset and upload the `sina-neak-portfolio.md` file as text.
- API keys must never be committed. Use `.env.local` or your hosting platform secrets.
- The `/api/query` endpoint calls the Dify `/datasets/{dataset_id}/retrieve` endpoint and returns the retrieval records.
# Portfolio-AI
