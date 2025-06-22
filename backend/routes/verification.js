const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const { model } = require('../services/geminiClient');
const supabase = require('../services/supabaseClient');

// Configure multer to handle file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// @route   POST /api/disasters/:disaster_id/reports/:report_id/verify
// @desc    Upload an image for a report and have Gemini analyze it
// @access  Public
router.post('/', upload.single('reportImage'), async (req, res) => {
    const { report_id } = req.params;

    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
        // 1. Send the image to Gemini for analysis
        const prompt = `
      Analyze this image. Is it a real photo of a disaster (fire, flood, etc.)?
      Respond in JSON with "is_disaster" (boolean) and "analysis" (string).
    `;
        const imagePart = {
            inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype },
        };
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Use a regex to extract the JSON content from the markdown block
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch || !jsonMatch[1]) {
            throw new Error("Could not find a valid JSON block in the Gemini response.");
        }

        const jsonString = jsonMatch[1];
        const verificationResult = JSON.parse(jsonString);

        // 2. Update the report with the verification status
        const newStatus = verificationResult.is_disaster ? 'verified' : 'rejected';
        const { data, error } = await supabase
            .from('reports')
            .update({
                verification_status: newStatus,
                // In a real app, you would upload the image to Supabase Storage and save the URL here.
                // For now, we'll just acknowledge it was processed.
                image_url: `processed://${req.file.originalname}`,
            })
            .eq('id', report_id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            report: data,
            verification_analysis: verificationResult.analysis,
        });
    } catch (error) {
        console.error(`Error verifying image for report ${report_id}:`, error);
        res.status(500).json({ error: 'Failed to verify image.' });
    }
});

module.exports = router;
