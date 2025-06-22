const axios = require('axios');
const cheerio = require('cheerio');

const FEMA_NEWS_URL = 'https://www.fema.gov/news-releases';

/**
 * Scrapes the FEMA news release page for the latest updates.
 * @returns {Promise<Array<{title: string, link: string, date: string}>>} A list of recent news articles.
 */
async function scrapeFemaNews() {
    try {
        console.log(`Fetching updates from: ${FEMA_NEWS_URL}`);
        const { data } = await axios.get(FEMA_NEWS_URL);
        const $ = cheerio.load(data);

        const updates = [];
        // This selector targets the specific view and rows for news releases on the FEMA site.
        // NOTE: This is fragile and will break if FEMA redesigns their website.
        $('.view-content .views-row').each((i, element) => {
            const titleElement = $(element).find('h2.field-content a');
            const dateElement = $(element).find('.views-field-created span.field-content');

            const title = titleElement.text().trim();
            const link = `https://www.fema.gov${titleElement.attr('href')}`;
            const date = dateElement.text().trim();

            if (title && link) {
                updates.push({ title, link, date });
            }
        });

        console.log(`Scraped ${updates.length} updates from FEMA.`);
        return updates;
    } catch (error) {
        console.error('Error scraping FEMA news:', error);
        // In a real app, you might want to return an empty array or throw
        // a more specific error to be handled by the route.
        return [];
    }
}

module.exports = {
    scrapeFemaNews,
};
