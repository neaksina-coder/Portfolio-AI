const fs = require('fs');
const path = require('path');
const axios = require('axios');

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf8');
  envText.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) return;
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    if (key && !process.env[key]) process.env[key] = value;
  });
}

const DIFY_BASE = 'https://api.dify.ai/v1';
const API_KEY = process.env.DIFY_API_KEY;

if (!API_KEY) {
  console.error('Missing DIFY_API_KEY in environment. Copy .env.example to .env.local and set the key.');
  process.exit(1);
}

async function main() {
  const mdPath = path.resolve(__dirname, '../sina-neak-portfolio.md');
  if (!fs.existsSync(mdPath)) {
    console.error('Cannot find sina-neak-portfolio.md next to the project root.');
    process.exit(1);
  }

  const text = fs.readFileSync(mdPath, 'utf8');

  // 1) Create a knowledge base (dataset)
  console.log('Creating knowledge base...');
  const dsResp = await axios.post(`${DIFY_BASE}/datasets`, {
    name: 'Sina Neak Portfolio',
    description: 'Personal portfolio and AI knowledge base for Sina Neak',
    indexing_technique: 'high_quality'
  }, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });

  const dataset = dsResp.data;
  const datasetId = dataset.id || dataset.data?.id || dataset.dataset_id;
  if (!datasetId) {
    throw new Error(`Could not read dataset id from Dify response: ${JSON.stringify(dataset).slice(0, 300)}`);
  }
  console.log('Created dataset:', datasetId || JSON.stringify(dataset).slice(0,200));

  // 2) Upload the markdown as a document by text
  console.log('Uploading document...');
  const docResp = await axios.post(`${DIFY_BASE}/datasets/${datasetId}/document/create-by-text`, {
    name: 'sina-neak-portfolio.md',
    text: text,
    indexing_technique: 'high_quality',
    doc_form: 'text_model',
    doc_language: 'English'
  }, { headers: { Authorization: `Bearer ${API_KEY}` } });

  const batch = docResp.data.batch || docResp.data?.batch;
  console.log('Upload response, batch:', batch);

  // 3) Poll indexing status until completed or error
  console.log('Polling indexing status...');
  const statusUrl = `${DIFY_BASE}/datasets/${datasetId}/documents/${batch}/indexing-status`;
  while (true) {
    const s = await axios.get(statusUrl, { headers: { Authorization: `Bearer ${API_KEY}` } });
    const data = s.data;
    const entries = data.data || data;
    const allDone = entries.every(e => e.indexing_status === 'completed' || e.indexing_status === 'error');
    console.log('Status snapshot:', entries.map(e => ({ id: e.id, status: e.indexing_status }))); 
    if (allDone) break;
    await new Promise(r => setTimeout(r, 2500));
  }

  console.log('Ingestion finished. Dataset ID:', datasetId);
  console.log('Store this dataset id as DIFY_DATASET_ID in your .env.local for queries.');
}

main().catch(err => {
  console.error('Ingestion failed:', err.response?.data || err.message || err);
  process.exit(1);
});
