import session from 'express-session';
import envVars from './env';

const expressSession = () => {
  return session({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: envVars.NODE_ENV === 'production',
      sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  });
};

export default expressSession;
