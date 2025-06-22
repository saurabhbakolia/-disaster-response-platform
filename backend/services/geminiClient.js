const { GoogleGenerativeAI } = require('@google/generative-ai');

// The .env variables are loaded in the main index.js file
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not defined.');
    console.error('Please make sure you have a .env file in the /backend directory with your Gemini API key.');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

module.exports = { model };
