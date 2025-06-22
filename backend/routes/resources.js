const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const cache = require('../utils/cache');

// @route   POST /api/resources
// @desc    Create a new resource
// @access  Public
router.post('/', async (req, res) => {
    const { name, type, location_name, lat, lng, disaster_id } = req.body;

    if (!name || !type || !location_name || !lat || !lng) {
        return res.status(400).json({ error: 'Name, type, location_name, lat, and lng are required.' });
    }

    try {
        const point = `SRID=4326;POINT(${lng} ${lat})`;

        const { data, error } = await supabase
            .from('resources')
            .insert([{
                name,
                type,
                location_name,
                location: point,
                disaster_id, // Can be null
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ error: 'Failed to create resource.' });
    }
});

// @route   GET /api/resources/nearby
// @desc    Find resources near a specific location
// @access  Public
router.get('/nearby', async (req, res) => {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    // Default radius to 10km if not provided
    const searchRadius = parseInt(radius, 10) || 10000;
    const cacheKey = `nearby:${lat}:${lng}:${searchRadius}`;

    try {
        // 1. Check the cache first
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        // 2. If not in cache, query the database
        console.log('Cache miss. Querying database for nearby resources.');
        const { data, error } = await supabase.rpc('find_nearby_resources', {
            lat,
            lng,
            radius: searchRadius,
        });

        if (error) throw error;

        // 3. Store the result in the cache for next time
        await cache.set(cacheKey, data);

        res.json(data);
    } catch (error) {
        console.error('Error finding nearby resources:', error);
        res.status(500).json({ error: 'Failed to find nearby resources.' });
    }
});

module.exports = router;
