const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const { logEvent } = require('../utils/auditTrail');

// @route   GET /api/disasters
// @desc    Get all disasters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('disasters').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching disasters:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/disasters
// @desc    Create a new disaster
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { title, description, location, tags, lat, lng } = req.body;

        if (!title || !description || !location || !lat || !lng) {
            return res.status(400).json({ error: 'Missing title, description, location name, lat, or lng.' });
        }

        const owner_id = 'mock_user_id';
        const audit_trail = [{ action: 'create', user_id: owner_id, timestamp: new Date().toISOString() }];
        const point = `SRID=4326;POINT(${lng} ${lat})`;

        const { data, error } = await supabase
            .from('disasters')
            .insert([{ title, description, location_name: location, location: point, tags, owner_id, audit_trail }])
            .select()
            .single();

        if (error) throw error;

        await logEvent('DISASTER_CREATED', { disaster_id: data.id, title: data.title });
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating disaster:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/disasters/:id
// @desc    Get a single disaster
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('disasters').select('*').eq('id', id).single();

        if (error) {
            // 'PGRST116' is the code for a resource not found in PostgREST
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Disaster not found' });
            }
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching single disaster:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   PUT /api/disasters/:id
// @desc    Update a disaster
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, tags } = req.body;

        const { data, error } = await supabase
            .from('disasters')
            .update({ title, description, location_name: location, tags })
            .eq('id', id)
            .select();

        if (error) throw error;
        if (data.length === 0) {
            return res.status(404).json({ error: 'Disaster not found' });
        }

        res.json(data[0]);
    } catch (error) {
        console.error('Error updating disaster:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   DELETE /api/disasters/:id
// @desc    Delete a disaster
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('disasters').delete().eq('id', id);

        if (error) throw error;

        res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        console.error('Error deleting disaster:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Nested Routes ---
// Mount the reports router for handling actions on specific disaster reports
const reportsRouter = require('./reports');
router.use('/:disaster_id/reports', reportsRouter);

module.exports = router;
