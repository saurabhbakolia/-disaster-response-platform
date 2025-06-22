const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams allows us to access params from the parent router (e.g., :disaster_id)
const supabase = require('../services/supabaseClient');
const { logEvent } = require('../utils/auditTrail');

// @route   POST /api/disasters/:disaster_id/reports
// @desc    Create a new report for a specific disaster
// @access  Public
router.post('/', async (req, res) => {
    const { disaster_id } = req.params;
    const { content, image_url } = req.body;

    // Mock user for now, as per requirements
    const user_id = 'netrunnerX';

    if (!content) {
        return res.status(400).json({ error: 'Report content is required.' });
    }

    try {
        const { data, error } = await supabase
            .from('reports')
            .insert([{
                disaster_id,
                user_id,
                content,
                image_url,
                verification_status: 'pending', // Default status
            }])
            .select()
            .single();

        if (error) throw error;

        // Log the event
        await logEvent('REPORT_CREATED', { disaster_id, report_id: data.id });

        res.status(201).json(data);
    } catch (error) {
        console.error(`Error creating report for disaster ${disaster_id}:`, error);
        res.status(500).json({ error: 'Failed to create report.' });
    }
});

// @route   GET /api/disasters/:disaster_id/reports
// @desc    Get all reports for a specific disaster
// @access  Public
router.get('/', async (req, res) => {
    const { disaster_id } = req.params;
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('disaster_id', disaster_id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(`Error fetching reports for disaster ${disaster_id}:`, error);
        res.status(500).json({ error: 'Failed to fetch reports.' });
    }
});

// Nested route for image verification for a specific report
const verificationRouter = require('./verification');
router.use('/:report_id/verify', verificationRouter);

module.exports = router; 