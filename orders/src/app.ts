import express from 'express';

// * so you won't need to wrap everything in trycatch block
// * this module catch all the exception automatically
import 'express-async-errors';

import { json } from 'body-parser';
import { error_handler, NotFoundError, current_user } from '@robin-learn-k8s/common';
import cookieSession from 'cookie-session';

const app = express();

app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }));
app.use(current_user);

// * import routes
import { deleteOrdersRouter } from './routes/delete';
import { newOrdersRouter } from './routes/new';
import { showOrdersRouter } from './routes/show';
import { indexOrdersRouter } from './routes/index';

// * use routes
app.use(deleteOrdersRouter);
app.use(newOrdersRouter);
app.use(showOrdersRouter);
app.use(indexOrdersRouter);

app.all('*', async () => {
  throw new NotFoundError('Route not found.');
});

app.use(error_handler);

export { app };
