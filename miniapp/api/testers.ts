import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * API endpoint to get tester IDs for QA testing.
 * Testers can see test events and have unlimited swipes.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Parse TESTER_IDS from environment variable
  const testerIdsRaw = process.env.TESTER_IDS || ''
  const testerIds = testerIdsRaw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id && /^\d+$/.test(id))
    .map(Number)

  return res.status(200).json({ testerIds })
}
