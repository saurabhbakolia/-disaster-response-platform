const express = require('express');
const router = express.Router();
const { extractLocationFromText, geocodeLocation } = require('../services/geocodeService');

// @route   POST /api/geocode/extract
// @desc    Extracts location from text and returns geocoded coordinates
// @access  Public
router.post('/extract', async (req, res) => {
    const { description } = req.body;

    if (!description) {
        return res.status(400).json({ error: 'Description is required.' });
    }

    try {
        // 1. Extract location string from the description
        const locationString = await extractLocationFromText(description);
        if (!locationString) {
            return res.status(404).json({ error: 'No specific location could be found in the text.' });
        }

        // 2. Geocode the extracted location string
        const coordinates = await geocodeLocation(locationString);

        res.json({
            original_description: description,
            extracted_location: locationString,
            coordinates: coordinates,
        });
    } catch (error) {
        console.error('Geocoding route error:', error);
        res.status(500).json({ error: 'An error occurred during the geocoding process.' });
    }
});

module.exports = router;
