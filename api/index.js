// Vercel Serverless Function - Main API Handler
// This file wraps the Express app for Vercel deployment

import app from '../apps/baliku-driver-server/src/index.js';

// Export as Vercel serverless function
// Vercel will automatically handle routing based on vercel.json
export default app;
