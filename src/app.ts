import express, { Request, Response } from 'express';
import router from './app/routes';
import cors, { CorsOptions } from 'cors';
import notFound from './app/middlewares/notFound';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import expressSession from 'express-session';
import envVars from './app/config/env';
import './app/config/passport';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
// import OpenAI from 'openai';

const app = express();

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

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Secure and flexible session setup
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: envVars.NODE_ENV === 'production',
      sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

//  API routes
app.use('/api/v1', router);

//  Test route
app.get('/', (req: Request, res: Response) => {
  const siteMode =
    process.env.NODE_ENV === 'development' ? 'Development' : 'Production';
  if (siteMode) {
    res.status(200).json({
      status: 200,
      ENV: siteMode,
      message: 'Server running Successfully',
      time: new Date(),
    });
  }
});

//  Error handling
app.use(globalErrorHandler);
app.use(notFound);

export default app;
