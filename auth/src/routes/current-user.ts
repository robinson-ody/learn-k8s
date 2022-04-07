import express from 'express';
import { current_user } from '@robin-learn-k8s/common';

const router = express.Router();

router.get('/api/user/current-user', current_user, (req, res) => {
  res.send({ current_user: req.current_user || null });
});

export { router as current_user_router };
