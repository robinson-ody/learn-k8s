import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validate_request } from '@robin-learn-k8s/common';
import { User } from '../model/user';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/user/sign-up',
  [
    body('email').isEmail().withMessage('Email invalid.'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be between 4 - 20 characters.'),
  ],
  validate_request,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existing_user = await User.findOne({ email });
    if (existing_user) throw new BadRequestError('Email is already in use.');

    const user = User.build({ email, password });
    await user.save();

    const access_token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!, { expiresIn: '1h' });
    req.session = { access_token };
    res.status(201).send({ message: 'User created!', created_user: user });
  }
);

export { router as sign_up_router };
