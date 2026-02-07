import cors from 'cors';

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
});

// Ensure global state exists
global.todos = global.todos || [];

// Promisify CORS
function runCors(req, res, fn) {
  return new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(fn());
    });
  });
}

export default async function handler(req, res) {
  await runCors(req, res, () => {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: global.todos,
        count: global.todos.length,
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  });
}
