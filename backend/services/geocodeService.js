const { model } = require('./geminiClient');

/**
 * Extracts a structured address from a freeform text description using the Gemini API.
 * @param {string} description - The text to analyze (e.g., "There's a fire near the old water tower on Main St").
 * @returns {Promise<string|null>} A structured address string or null if not found.
 */
async function extractLocationFromText(description) {
    try {
        const prompt = `
      From the following text, extract the most specific physical location or address mentioned.
      The location could be a street address, a landmark, a neighborhood, or cross-streets.
      Only return the location text itself, with no extra explanation or labels.
      If no specific location is mentioned, return "null".

      Text: "${description}"
      Location:
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        if (text.toLowerCase() === 'null') {
            return null;
        }
        return text;
    } catch (error) {
        console.error('Error extracting location with Gemini:', error);
        throw new Error('Failed to analyze location description.');
    }
}

/**
 * Geocodes a location string into latitude and longitude.
 *
 * @param {string} locationString - The location to geocode (e.g., "1600 Amphitheatre Parkway, Mountain View, CA").
 * @returns {Promise<object>} An object with { lat, lng } or throws an error.
 */
async function geocodeLocation(locationString) {
    // For now, this is a mock. In a real app, you would integrate
    // with an API like Google Maps, Mapbox, or Nominatim.
    console.log(`Geocoding (mock): "${locationString}"`);

    if (!locationString) {
        throw new Error('Location string is required for geocoding.');
    }

    // Simulate an API call with a delay
    return new Promise((resolve) => {
        setTimeout(() => {
            // Return a fixed coordinate for demonstration purposes.
            // A real implementation would return dynamic coordinates.
            resolve({ lat: 37.422, lng: -122.084 });
        }, 500);
    });
}

module.exports = {
    extractLocationFromText,
    geocodeLocation,
};
