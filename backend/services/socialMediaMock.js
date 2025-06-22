const { getIo } = require('../socket/setup');

const priorityKeywords = ['urgent', 'sos', 'help', 'trapped', 'emergency', 'immediate assistance'];

const mockTweets = [
    { user: '@EmergencyBOS', text: 'Reports of a 4-alarm fire on Summer St. All units responding.' },
    { user: '@CitizenAppBOS', text: 'SOS! Building partially collapsed at 123 Hanover St. People may be trapped inside. URGENT response needed.' },
    { user: '@RedCrossMA', text: 'We are setting up a temporary shelter at the Tynan Elementary for families displaced by the fire.' },
    { user: '@BostonFire', text: 'Update: The fire on Summer St is now under control. Crews will remain on scene.' },
    { user: '@JaneDoe', text: 'Help! My basement is flooding on Commonwealth Ave, and the water is rising fast. We are trapped!' },
    { user: '@MBTA', text: 'Shuttle buses are replacing Red Line service between JFK and Broadway.' },
    { user: '@MassDOT', text: 'Heads up: The I-93 ramp to Summer Street is closed.' },
    { user: '@BOS_311', text: 'Heavy smoke reported in the Seaport district. Residents advised to keep windows closed.' },
];

let tweetInterval;

function startMockStream() {
    console.log('Starting mock social media stream...');
    const io = getIo();
    if (!io) {
        console.error("Socket.IO has not been initialized. Can't start mock stream.");
        return;
    }

    tweetInterval = setInterval(() => {
        const tweet = mockTweets[Math.floor(Math.random() * mockTweets.length)];

        // Check for priority keywords
        const isPriority = priorityKeywords.some(keyword => tweet.text.toLowerCase().includes(keyword));

        const newAlert = {
            id: `tweet_${Date.now()}`,
            source: 'twitter_mock',
            content: tweet,
            timestamp: new Date().toISOString(),
            priority: isPriority, // Add the priority flag
        };

        // Emit the new alert on the 'social-media-alert' channel
        io.emit('social-media-alert', newAlert);
        console.log('Emitted mock tweet:', newAlert.content.text);
    }, 8000); // Emit a new tweet every 8 seconds
}

function stopMockStream() {
    console.log('Stopping mock social media stream.');
    clearInterval(tweetInterval);
}

module.exports = {
    startMockStream,
    stopMockStream,
};
