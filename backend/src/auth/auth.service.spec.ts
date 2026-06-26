import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'findByEmail' | 'create'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  const fakeUser = {
    _id: { toString: () => 'user-id-1' },
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    passwordHash: '',
  };

  beforeEach(async () => {
    fakeUser.passwordHash = await bcrypt.hash('StrongPassw0rd!', 10);

    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed.jwt.token'),
    };

    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  describe('signup', () => {
    it('throws a ConflictException when the email is already taken', async () => {
      usersService.findByEmail.mockResolvedValue(fakeUser as any);

      await expect(
        authService.signup({ name: 'Ada', email: 'ada@example.com', password: 'StrongPassw0rd!' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('hashes the password and returns an access token for a new user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(fakeUser as any);

      const result = await authService.signup({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'StrongPassw0rd!',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Ada Lovelace', email: 'ada@example.com' }),
      );
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).toEqual({
        id: 'user-id-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      });
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'whatever1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(fakeUser as any);

      await expect(
        authService.login({ email: 'ada@example.com', password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns an access token when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(fakeUser as any);

      const result = await authService.login({
        email: 'ada@example.com',
        password: 'StrongPassw0rd!',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe('ada@example.com');
    });
  });
});
