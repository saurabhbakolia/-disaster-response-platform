const supabase = require('../services/supabaseClient');

const AUDIT_TABLE = 'audit_log';

/**
 * Logs an event to the audit trail.
 * @param {string} eventType - A string identifying the type of event (e.g., 'DISASTER_CREATED', 'USER_LOGIN_FAILED').
 * @param {object} details - A JSON object containing relevant details about the event.
 * @param {string|null} userId - The ID of the user who performed the action, if applicable.
 */
async function logEvent(eventType, details = {}, userId = null) {
    try {
        const { error } = await supabase.from(AUDIT_TABLE).insert({
            event_type: eventType,
            details,
            user_id: userId,
        });

        if (error) throw error;
    } catch (error) {
        // Log to console but don't crash the application if auditing fails
        console.error('Failed to log audit event:', { eventType, details, error: error.message });
    }
}

module.exports = { logEvent };
