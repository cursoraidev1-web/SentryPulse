import crypto from 'crypto';

export const uuid = (): string => {
  return crypto.randomUUID();
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
};

export const now = (): string => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
};

export const hashString = (str: string): string => {
  return crypto.createHash('sha256').update(str).digest('hex');
};
