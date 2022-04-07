import express from 'express';

// * so you won't need to wrap everything in trycatch block
// * this module catch all the exception automatically
import 'express-async-errors';

import { json } from 'body-parser';
import { error_handler, NotFoundError } from '@robin-learn-k8s/common';
import cookieSession from 'cookie-session';

const app = express();

app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }));

// * import routes
import { current_user_router } from './routes/current-user';
import { sign_in_router } from './routes/sign-in';
import { sign_out_router } from './routes/sign-out';
import { sign_up_router } from './routes/sign-up';

// * use routes
app.use(current_user_router);
app.use(sign_in_router);
app.use(sign_out_router);
app.use(sign_up_router);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(error_handler);

export { app };
