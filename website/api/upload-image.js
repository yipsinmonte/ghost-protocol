// api/upload-image.js
// Vercel serverless function — receives image from frontend, uploads to Pinata IPFS
// Keeps PINATA_JWT secret server-side, never exposed to browser

export const config = {
  api: {
    bodyParser: false, // we handle raw multipart ourselves
  },
};

export default async function handler(req, res) {
  // CORS — allow your frontend origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const jwt = process.env.PINATA_JWT;
  if (!jwt) return res.status(500).json({ error: 'Pinata JWT not configured' });

  try {
    // Collect raw body chunks
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);

    // Extract content-type header (includes boundary for multipart)
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Expected multipart/form-data' });
    }

    // Forward directly to Pinata — they accept the same multipart body
    const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': contentType, // pass through boundary intact
      },
      body: rawBody,
    });

    if (!pinataRes.ok) {
      const err = await pinataRes.text();
      console.error('Pinata error:', err);
      return res.status(502).json({ error: 'Pinata upload failed', detail: err });
    }

    const result = await pinataRes.json();
    const url = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

    return res.status(200).json({ url, hash: result.IpfsHash });

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message });
  }
}
