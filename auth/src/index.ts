import mongoose from 'mongoose';
import { app } from './app';

const PORT = 3000;

(async () => {
  console.log(`Starting Up`)
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY must be defined.');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be defined.');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');
  } catch (error) {
    console.error(error);
  }

  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
})();
