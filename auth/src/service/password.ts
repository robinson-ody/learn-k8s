import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  static async hash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buff = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buff.toString('hex')}.${salt}`;
  }

  static async compare(stored_password: string, supplied_password: string) {
    const [hashedPassword, salt] = stored_password.split('.');
    const buff = (await scryptAsync(supplied_password, salt, 64)) as Buffer;
    return buff.toString('hex') === hashedPassword;
  }
}
