import express, { Request, Response } from 'express';
import cors from 'cors';
import notFound from './app/middlewares/notFound';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './app/config/passport';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import compression from 'compression';
import corsOptions from './app/config/cors.config';
import router from './app/routes';
import expressSession from './app/config/expressSession.config';

const app = express();

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressSession());
app.use(passport.initialize());
app.use(passport.session());

//  API routes
app.use('/api/v1', router.v1);

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
