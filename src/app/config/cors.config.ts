import { CorsOptions } from 'cors';

// CORS configuration (proper dynamic origin checking)
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Cors Allow Options
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server

    const isAllowed = allowedOrigins.some(
      (allowed) =>
        origin.startsWith(allowed.replace('www.', '')) || origin === allowed,
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

export default corsOptions;
