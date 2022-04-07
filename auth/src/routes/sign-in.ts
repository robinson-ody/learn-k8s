import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validate_request } from '@robin-learn-k8s/common';
import { User } from '../model/user';
import { Password } from '../service/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/user/sign-in',
  [
    body('email').isEmail().withMessage('Email must be valid.'),
    body('password').trim().notEmpty().withMessage('You must supply a password.'),
  ],
  validate_request,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existing_user = await User.findOne({ email });
    if (!existing_user) throw new BadRequestError('Login failed.');

    const passwords_match = await Password.compare(existing_user.password, password);
    if (!passwords_match) throw new BadRequestError('Login failed.');

    const access_token = jwt.sign({ id: existing_user.id, email: existing_user.email }, process.env.JWT_KEY!);
    req.session = { access_token };

    res.status(200).send(existing_user);
  }
);

export { router as sign_in_router };
