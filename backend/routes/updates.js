const express = require('express');
const router = express.Router();
const { scrapeFemaNews } = require('../services/browseScraper');
const cache = require('../utils/cache');

const CACHE_KEY = 'fema_official_updates';
const CACHE_TTL_SECONDS = 3600; // 1 hour

// @route   GET /api/updates/official
// @desc    Get the latest official updates from FEMA
// @access  Public
router.get('/official', async (req, res) => {
    try {
        // 1. Check the cache first
        const cachedUpdates = await cache.get(CACHE_KEY);
        if (cachedUpdates) {
            console.log('Serving official updates from cache.');
            return res.json(cachedUpdates);
        }

        // 2. If not cached, scrape the website
        console.log('Cache miss. Scraping for official updates.');
        const updates = await scrapeFemaNews();

        // 3. Store the fresh results in the cache
        if (updates.length > 0) {
            await cache.set(CACHE_KEY, updates, CACHE_TTL_SECONDS);
        }

        res.json(updates);
    } catch (error) {
        // The scraper service already logs the error, so we can just send a generic response.
        res.status(500).json({ error: 'Failed to fetch official updates.' });
    }
});

module.exports = router;
