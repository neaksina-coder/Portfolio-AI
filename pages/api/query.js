import axios from 'axios';

const DIFY_BASE = 'https://api.dify.ai/v1';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { query, conversationId } = req.body;
  const API_KEY = process.env.DIFY_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'Server missing DIFY_API_KEY' });
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const payload = {
      inputs: { query },
      query,
      response_mode: 'blocking',
      user: 'portfolio-visitor',
      auto_generate_name: true
    };

    if (conversationId) payload.conversation_id = conversationId;

    const resp = await axios.post(`${DIFY_BASE}/chat-messages`, payload, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json(resp.data);
  } catch (err) {
    console.error('Dify chat error:', err.response?.data || err.message || err);
    if (err.response?.status === 401) {
      return res.status(401).json({
        error: 'Dify rejected DIFY_API_KEY. Open your Dify app, go to API Access, click API Key, and copy the app API key into .env.local.'
      });
    }
    return res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
}
