import { describe, it, expect } from 'vitest';
import { User, UserRole } from './User';

describe('User Entity', () => {
  it('should create a valid user with default role USER', () => {
    const user = User.create({
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password'
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe(UserRole.USER);
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('should not allow invalid email', () => {
    expect(() => {
      User.create({
        email: 'invalid-email',
        name: 'Test User',
        passwordHash: 'hashed_password'
      });
    }).toThrow('Invalid email');
  });
});
