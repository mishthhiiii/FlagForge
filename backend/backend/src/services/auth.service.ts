import * as bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { generateToken } from '../utils/jwt.utils';
import { JWTPayload } from '../types/index';

export class AuthService {
  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw { statusCode: 400, message: 'A user with this email already exists' };
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
    });

    // Create a default project and environments for the new user automatically
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const project = await prisma.project.create({
      data: {
        name: 'Default Project',
        key: `default-project-${uniqueSuffix}`,
        description: 'Your default sandbox environment and feature flags workspace.',
        userId: user.id,
      },
    });

    // Create environments
    const environments = [
      { name: 'Development', key: 'dev', sdkKey: `ff_sdk_dev_${Math.random().toString(36).substring(2, 10)}` },
      { name: 'Staging', key: 'staging', sdkKey: `ff_sdk_staging_${Math.random().toString(36).substring(2, 10)}` },
      { name: 'Production', key: 'prod', sdkKey: `ff_sdk_prod_${Math.random().toString(36).substring(2, 10)}` },
    ];

    for (const envData of environments) {
      await prisma.environment.create({
        data: {
          name: envData.name,
          key: envData.key,
          sdkKey: envData.sdkKey,
          projectId: project.id,
        },
      });
    }

    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = generateToken(payload);

    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = generateToken(payload);

    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }
}
