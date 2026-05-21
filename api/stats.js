/**
 * Vercel Serverless Function: Resume View Statistics
 * Direct connection to Upstash KV: carmine-yacht
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client - automatically uses:
// UPSTASH_KV_CARMINE_YACHT_REST_API_URL
// UPSTASH_KV_CARMINE_YACHT_REST_API_TOKEN
const redis = new Redis({
  url: process.env.UPSTASH_KV_CARMINE_YACHT_REST_API_URL,
  token: process.env.UPSTASH_KV_CARMINE_YACHT_REST_API_TOKEN,
});

const STATS_KEY = 'resume_stats';
const DAILY_KEY_PREFIX = 'resume_daily_';

function getTodayKey() {
  const today = new Date();
  return `${DAILY_KEY_PREFIX}${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Record a page view
      const todayKey = getTodayKey();

      // Increment daily and total counts
      await redis.incr(todayKey);
      await redis.incr(STATS_KEY);

      // Set expiration for today's key (30 days)
      await redis.expire(todayKey, 30 * 24 * 60 * 60);

      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      // Get current statistics
      const todayKey = getTodayKey();

      const [dailyViews, totalViews] = await Promise.all([
        redis.get(todayKey),
        redis.get(STATS_KEY),
      ]);

      return res.status(200).json({
        today: parseInt(dailyViews) || 0,
        total: parseInt(totalViews) || 0,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Stats API error:', error);
    return res.status(200).json({
      today: 0,
      total: 0,
      error: true,
      timestamp: new Date().toISOString(),
    });
  }
}
