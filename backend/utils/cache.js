const supabase = require('../services/supabaseClient');

const CACHE_TABLE = 'cache';
const DEFAULT_TTL_SECONDS = 60 * 5; // 5 minutes

/**
 * Stores a value in the Supabase cache.
 * @param {string} key - The cache key.
 * @param {any} value - The JSON-serializable value to store.
 * @param {number} ttlSeconds - The time-to-live for the cache entry in seconds.
 */
async function set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    try {
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
        const { error } = await supabase
            .from(CACHE_TABLE)
            .upsert({ key, value: JSON.stringify(value), expires_at: expiresAt }, { onConflict: 'key' });

        if (error) throw error;
        console.log(`Cache set for key: ${key}`);
    } catch (error) {
        console.error(`Error setting cache for key "${key}":`, error);
    }
}

/**
 * Retrieves a value from the Supabase cache if it exists and has not expired.
 * @param {string} key - The cache key.
 * @returns {Promise<any|null>} The cached value or null if not found or expired.
 */
async function get(key) {
    try {
        const { data, error } = await supabase
            .from(CACHE_TABLE)
            .select('value, expires_at')
            .eq('key', key)
            .single();

        if (error || !data) {
            if (error && error.code !== 'PGRST116') { // PGRST116 = not found
                throw error;
            }
            return null;
        }

        // Check if the cache entry has expired
        if (new Date(data.expires_at) < new Date()) {
            console.log(`Cache expired for key: ${key}`);
            // Optional: Delete the expired key
            await supabase.from(CACHE_TABLE).delete().eq('key', key);
            return null;
        }

        console.log(`Cache hit for key: ${key}`);
        return JSON.parse(data.value);
    } catch (error) {
        console.error(`Error getting cache for key "${key}":`, error);
        return null; // On error, treat as a cache miss
    }
}

module.exports = {
    get,
    set,
};
