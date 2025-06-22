# Disaster Response Coordination Platform

A full-stack application designed to coordinate and manage responses to disaster events in real-time. This platform uses a Node.js/Express backend with a Supabase database and a React frontend. It leverages AI for data enrichment and WebSockets for live updates.

---

### Live Application Links

- **Live Frontend (Vercel):** https://disaster-response-platform-snowy.vercel.app/
- **Live Backend (Render):** https://disaster-response-platform-i1h2.onrender.com

---

## Key Features

### Backend

- **Disaster Management API**: Full CRUD functionality for creating, reading, updating, and deleting disaster events.
- **Geospatial Search**: An endpoint (`/api/resources/nearby`) that uses a PostGIS function to find critical resources within a specified radius of a disaster location.
- **AI-Powered Geocoding**: An endpoint (`/api/geocode`) that uses the Gemini API to extract precise latitude and longitude coordinates from unstructured text descriptions (e.g., "fire near 5th and Main").
- **User Reporting System**: Allows users to submit text-based reports and image updates for specific disasters.
- **AI-Powered Image Verification**: Uses the Gemini Vision API to analyze user-submitted images, verifying whether they depict a real disaster scene and updating the report's status accordingly.
- **Real-time Alerts & Priority System**: A WebSocket server broadcasts mock social media alerts to all clients in real-time. A keyword-based classifier identifies high-priority alerts (containing "SOS," "urgent," etc.) and flags them for immediate attention on the frontend.
- **Web Scraping for Official Updates**: An endpoint (`/api/updates`) that scrapes and caches official news from a FEMA news feed to provide vetted information.
- **Audit Trail**: A system that automatically logs key events (like DISASTER_CREATED) to an `audit_log` table for accountability.

### Frontend

- **Real-time Dashboard**: A multi-column layout displaying a list of all reported disasters, a live feed of social media alerts, and a form to report new disasters.
- **Disaster Detail View**: A dedicated page for each disaster, showing its description, location, tags, and a list of all user-submitted reports.
- **Interactive Forms**: Users can submit new disaster events, add new reports to existing disasters, and upload images for AI verification directly from the UI.
- **Visual Priority Alerts**: High-priority alerts received through the WebSocket connection are instantly highlighted with a distinct color and a "PRIORITY" badge.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React (Vite), `react-router-dom`
- **Database**: Supabase (PostgreSQL with PostGIS)
- **AI**: Google Gemini API (for geocoding and image analysis)
- **Real-time**: Socket.IO
- **Deployment**: Backend on Render, Frontend on Vercel

---

## Local Development Setup

### Prerequisites

- Node.js (v18 or later)
- npm
- A Supabase account and project
- A Google AI Studio API Key for Gemini

### Setup Instructions

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/saurabhbakolia/-disaster-response-platform.git
    cd -disaster-response-platform
    ```

2.  **Configure Backend:**

    - Navigate to the `backend` directory: `cd backend`
    - Create a `.env` file and copy the contents of `.env.example` (if provided), or add the following variables:
      ```
      SUPABASE_URL="your_supabase_project_api_url"
      SUPABASE_KEY="your_supabase_anon_public_key"
      GEMINI_API_KEY="your_google_gemini_api_key"
      PORT=5000
      ```
    - Install dependencies: `npm install`

3.  **Configure Frontend:**

    - Navigate to the `frontend` directory: `cd ../frontend`
    - Create a `.env` file with the following variable:
      ```
      VITE_API_URL="http://localhost:5000"
      ```
    - Install dependencies: `npm install`

4.  **Run the Application:**
    - **Start the backend server:** From the `backend` directory, run `npm start`. The server will run on `http://localhost:5000`.
    - **Start the frontend dev server:** In a separate terminal, from the `frontend` directory, run `npm run dev`. The application will be accessible at `http://localhost:5173` (or another port if 5173 is busy).

---

## Note on AI Assistant Usage

Throughout the development of this platform, the AI assistant played a central role in writing code, debugging issues, and guiding the overall architecture.

- **Backend Development**: The assistant generated the complete file structure, all CRUD APIs for disasters and reports, the Supabase client, and the implementations for the Gemini geocoding and image verification services. It also created the geospatial search logic, the Socket.IO setup for real-time alerts (including the priority keyword feature), the web scraper, and the audit trail system.

- **Frontend Development**: It scaffolded the React application, wrote the complete logic for the `App.jsx` and `DisasterDetailPage.jsx` components, managed API data fetching and state, set up `react-router-dom`, and wrote all the CSS for the application's dark theme and responsive layout.

- **Debugging & Deployment**: The assistant was critical in diagnosing a silent API error by guiding a process that led to the discovery of an incorrect `.env` variable. It also fixed a JSON parsing issue with the Gemini API response. Finally, it generated the `.gitignore` file and provided the step-by-step commands and configurations for deploying the backend to Render and the frontend to Vercel.

In summary, the AI assistant acted as a full-stack pair programmer, responsible for generating the vast majority of the application's code, architecture, and deployment strategy.
