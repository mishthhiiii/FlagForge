import { BackendFile } from './types.ts';

export const backendFilesTree: BackendFile[] = [
  {
    name: 'backend',
    path: 'backend',
    type: 'directory',
    children: [
      {
        name: 'package.json',
        path: 'backend/package.json',
        type: 'file',
        content: `{
  "name": "flagforge-backend",
  "version": "1.0.0",
  "description": "Backend services for FlagForge Feature Flag Management Platform",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.10.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.11.24",
    "prisma": "^5.10.2",
    "tsx": "^4.7.1",
    "typescript": "^5.3.3"
  }
}`
      },
      {
        name: 'tsconfig.json',
        path: 'backend/tsconfig.json',
        type: 'file',
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}`
      },
      {
        name: '.env.example',
        path: 'backend/.env.example',
        type: 'file',
        content: `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/flagforge?schema=public"

# JWT Secrets
JWT_SECRET="your_jwt_secret_key_at_least_32_characters"
JWT_EXPIRES_IN="1d"

# SDK Settings
SDK_KEY_PREFIX="ff_sdk_"`
      },
      {
        name: 'prisma',
        path: 'backend/prisma',
        type: 'directory',
        children: [
          {
            name: 'schema.prisma',
            path: 'backend/prisma/schema.prisma',
            type: 'file',
            content: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  name         String
  projects     Project[]
  auditLogs    AuditLog[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model Project {
  id           String        @id @default(uuid())
  name         String
  key          String        @unique
  description  String?
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  environments Environment[]
  flags        FeatureFlag[]
  auditLogs    AuditLog[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Environment {
  id         String                 @id @default(uuid())
  name       String
  key        String
  sdkKey     String                 @unique
  projectId  String
  project    Project                @relation(fields: [projectId], references: [id], onDelete: Cascade)
  flagStates EnvironmentFlagState[]
  createdAt  DateTime               @default(now())
  updatedAt  DateTime               @updatedAt

  @@unique([projectId, key])
}

enum FlagType {
  BOOLEAN
  MULTIVARIATE
  JSON
}

model FeatureFlag {
  id           String                 @id @default(uuid())
  name         String
  key          String
  description  String?
  type         FlagType               @default(BOOLEAN)
  projectId    String
  project      Project                @relation(fields: [projectId], references: [id], onDelete: Cascade)
  flagStates   EnvironmentFlagState[]
  createdAt    DateTime               @default(now())
  updatedAt    DateTime               @updatedAt

  @@unique([projectId, key])
}

model EnvironmentFlagState {
  id            String      @id @default(uuid())
  flagId        String
  flag          FeatureFlag @relation(fields: [flagId], references: [id], onDelete: Cascade)
  environmentId String
  environment   Environment @relation(fields: [environmentId], references: [id], onDelete: Cascade)
  enabled       Boolean     @default(false)
  defaultValue  String
  rules         Json        @default("[]")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@unique([flagId, environmentId])
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  action    String
  details   String
  createdAt DateTime @default(now())
}`
          },
          {
            name: 'seed.ts',
            path: 'backend/prisma/seed.ts',
            type: 'file',
            content: `import { PrismaClient, FlagType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FlagForge database...');

  // Delete existing data to prevent duplications
  await prisma.auditLog.deleteMany({});
  await prisma.environmentFlagState.deleteMany({});
  await prisma.featureFlag.deleteMany({});
  await prisma.environment.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // Create default records...
  // Details omitted for code display simplicity, full version generated in file!
}`
          }
        ]
      },
      {
        name: 'src',
        path: 'backend/src',
        type: 'directory',
        children: [
          {
            name: 'server.ts',
            path: 'backend/src/server.ts',
            type: 'file',
            content: `import app from './app.ts';
import { env } from './config/env.ts';
import { connectDatabase } from './config/database.ts';

async function startServer() {
  await connectDatabase();

  const PORT = env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(\`🚀 FlagForge Backend running in \${env.NODE_ENV} mode on port \${PORT}\`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start the server:', error);
  process.exit(1);
});`
          },
          {
            name: 'app.ts',
            path: 'backend/src/app.ts',
            type: 'file',
            content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.ts';
import { errorHandler } from './middleware/error.middleware.ts';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1', routes);
app.use(errorHandler);

export default app;`
          },
          {
            name: 'config',
            path: 'backend/src/config',
            type: 'directory',
            children: [
              {
                name: 'env.ts',
                path: 'backend/src/config/env.ts',
                type: 'file',
                content: `import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('1d'),
  SDK_KEY_PREFIX: z.string().default('ff_sdk_'),
});

export const env = envSchema.parse(process.env);`
              },
              {
                name: 'database.ts',
                path: 'backend/src/config/database.ts',
                type: 'file',
                content: `import { PrismaClient } from '@prisma/client';
import { env } from './env.ts';

export const prisma = new PrismaClient();

export async function connectDatabase() {
  await prisma.$connect();
}`
              }
            ]
          },
          {
            name: 'services',
            path: 'backend/src/services',
            type: 'directory',
            children: [
              {
                name: 'sdk.service.ts',
                path: 'backend/src/services/sdk.service.ts',
                type: 'file',
                content: `import { prisma } from '../config/database.ts';
import { EvaluationContext, TargetingRule, TargetingCondition } from '../types/index.ts';

export class SdkService {
  static async evaluateFlag(sdkKey: string, flagKey: string, context: EvaluationContext) {
    const env = await prisma.environment.findUnique({
      where: { sdkKey },
      include: {
        flagStates: {
          where: { flag: { key: flagKey } },
          include: { flag: true }
        }
      }
    });

    if (!env) throw { statusCode: 401, message: 'Invalid SDK Key' };
    const state = env.flagStates[0];
    if (!state) throw { statusCode: 404, message: 'Flag not found' };

    if (!state.enabled) {
      return { key: flagKey, value: this.castValue(state.defaultValue, state.flag.type), reason: 'FLAG_DISABLED' };
    }

    // Sequentially evaluate rules...
    // Deterministic hash applied for rollout buckets.
  }
}`
              },
              {
                name: 'flag.service.ts',
                path: 'backend/src/services/flag.service.ts',
                type: 'file',
                content: `// Service to create and manage flags in DB... (Full file written to workspace!)`
              },
              {
                name: 'auth.service.ts',
                path: 'backend/src/services/auth.service.ts',
                type: 'file',
                content: `// Service handling bcrypt password hashing, project autoprovisioning, and JWT...`
              }
            ]
          }
        ]
      }
    ]
  }
];
