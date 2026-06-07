import { z } from 'zod';
import { randomUUID } from 'crypto';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface UserProps {
  id?: string;
  email: string;
  name?: string | null;
  role?: UserRole;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

const emailSchema = z.string().email('Invalid email');

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string | null;
  public readonly role: UserRole;
  public readonly passwordHash: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  private constructor(props: UserProps) {
    this.id = props.id || randomUUID();
    this.email = props.email;
    this.name = props.name || null;
    this.role = props.role || UserRole.USER;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.deletedAt = props.deletedAt || null;
  }

  public static create(props: UserProps): User {
    emailSchema.parse(props.email);
    return new User(props);
  }
}
