/* Serverless translation proxy for Vercel — hides API key from client */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const response = await fetch(process.env.TRANSLATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.TRANSLATION_API_KEY,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.ok ? 200 : 502).json(data);
  } catch {
    res.status(502).json({ error: 'Translation service unavailable' });
  }
}
