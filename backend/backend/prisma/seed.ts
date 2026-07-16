import { PrismaClient, FlagType } from '@prisma/client';
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

  // 1. Create a default user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@flagforge.com',
      name: 'FlagForge Admin',
      passwordHash,
    },
  });
  console.log(`Created user: ${user.email}`);

  // 2. Create a default project
  const project = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform',
      key: 'ecommerce',
      description: 'Main flagship e-commerce application platform.',
      userId: user.id,
    },
  });
  console.log(`Created project: ${project.name} (${project.key})`);

  // 3. Create default environments
  const devEnv = await prisma.environment.create({
    data: {
      name: 'Development',
      key: 'dev',
      sdkKey: 'ff_sdk_dev_7a42b9c1d8',
      projectId: project.id,
    },
  });

  const stagingEnv = await prisma.environment.create({
    data: {
      name: 'Staging',
      key: 'staging',
      sdkKey: 'ff_sdk_staging_9c31e2f4a5',
      projectId: project.id,
    },
  });

  const prodEnv = await prisma.environment.create({
    data: {
      name: 'Production',
      key: 'prod',
      sdkKey: 'ff_sdk_prod_2e84d5c9f0',
      projectId: project.id,
    },
  });
  console.log('Created environments: Development, Staging, Production');

  // 4. Create some default feature flags
  const newBillingFlag = await prisma.featureFlag.create({
    data: {
      name: 'New Stripe Billing Flow',
      key: 'new-stripe-billing',
      description: 'Enables the brand-new, multi-tier subscription Stripe billing flow.',
      type: FlagType.BOOLEAN,
      projectId: project.id,
    },
  });

  const bannerColorFlag = await prisma.featureFlag.create({
    data: {
      name: 'Campaign Hero Banner Color',
      key: 'campaign-hero-color',
      description: 'Multivariate flag returning a hex color code for the campaign banner.',
      type: FlagType.MULTIVARIATE,
      projectId: project.id,
    },
  });

  const searchConfigFlag = await prisma.featureFlag.create({
    data: {
      name: 'Algolia Search Config',
      key: 'search-config',
      description: 'Advanced Algolia query configurations returned as JSON.',
      type: FlagType.JSON,
      projectId: project.id,
    },
  });
  console.log('Created feature flags: new-stripe-billing, campaign-hero-color, search-config');

  // 5. Connect flags to environments and specify states
  // Flag 1: New billing flow
  // - Dev: Enabled, true
  // - Staging: Enabled, targeting beta users
  // - Prod: Disabled, false
  await prisma.environmentFlagState.createMany({
    data: [
      {
        flagId: newBillingFlag.id,
        environmentId: devEnv.id,
        enabled: true,
        defaultValue: 'true',
        rules: JSON.stringify([]),
      },
      {
        flagId: newBillingFlag.id,
        environmentId: stagingEnv.id,
        enabled: true,
        defaultValue: 'false',
        rules: JSON.stringify([
          {
            id: 'rule_1',
            name: 'Beta Team Targeting',
            conditions: [
              {
                attribute: 'email',
                operator: 'ENDS_WITH',
                value: '@company.com',
              },
            ],
            serveValue: 'true',
          },
        ]),
      },
      {
        flagId: newBillingFlag.id,
        environmentId: prodEnv.id,
        enabled: false,
        defaultValue: 'false',
        rules: JSON.stringify([]),
      },
    ],
  });

  // Flag 2: Campaign Banner Color (Multivariate)
  // - Dev: Enabled, default '#3B82F6' (Blue)
  // - Staging: Enabled, targeting premium users with Gold color '#F59E0B'
  // - Prod: Enabled, default '#10B981' (Green)
  await prisma.environmentFlagState.createMany({
    data: [
      {
        flagId: bannerColorFlag.id,
        environmentId: devEnv.id,
        enabled: true,
        defaultValue: '#3B82F6',
        rules: JSON.stringify([]),
      },
      {
        flagId: bannerColorFlag.id,
        environmentId: stagingEnv.id,
        enabled: true,
        defaultValue: '#3B82F6',
        rules: JSON.stringify([
          {
            id: 'rule_1',
            name: 'Premium Account Tier',
            conditions: [
              {
                attribute: 'tier',
                operator: 'EQUALS',
                value: 'premium',
              },
            ],
            serveValue: '#F59E0B',
          },
        ]),
      },
      {
        flagId: bannerColorFlag.id,
        environmentId: prodEnv.id,
        enabled: true,
        defaultValue: '#10B981',
        rules: JSON.stringify([]),
      },
    ],
  });

  // Flag 3: Algolia Search Configuration (JSON)
  // - Enabled everywhere, default configs
  const defaultSearchConfig = JSON.stringify({
    hitsPerPage: 10,
    analytics: true,
    enablePersonalization: false,
  });

  const prodSearchConfig = JSON.stringify({
    hitsPerPage: 20,
    analytics: true,
    enablePersonalization: true,
  });

  await prisma.environmentFlagState.createMany({
    data: [
      {
        flagId: searchConfigFlag.id,
        environmentId: devEnv.id,
        enabled: true,
        defaultValue: defaultSearchConfig,
        rules: JSON.stringify([]),
      },
      {
        flagId: searchConfigFlag.id,
        environmentId: stagingEnv.id,
        enabled: true,
        defaultValue: defaultSearchConfig,
        rules: JSON.stringify([]),
      },
      {
        flagId: searchConfigFlag.id,
        environmentId: prodEnv.id,
        enabled: true,
        defaultValue: prodSearchConfig,
        rules: JSON.stringify([
          {
            id: 'rule_1',
            name: 'QA Internal Users',
            conditions: [
              {
                attribute: 'isStaff',
                operator: 'EQUALS',
                value: 'true',
              },
            ],
            serveValue: JSON.stringify({
              hitsPerPage: 50,
              analytics: false,
              enablePersonalization: false,
              debug: true,
            }),
          },
        ]),
      },
    ],
  });

  // 6. Create default Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: user.id,
        projectId: project.id,
        action: 'PROJECT_CREATE',
        details: JSON.stringify({ name: project.name, key: project.key }),
      },
      {
        userId: user.id,
        projectId: project.id,
        action: 'FLAG_CREATE',
        details: JSON.stringify({ name: newBillingFlag.name, key: newBillingFlag.key }),
      },
      {
        userId: user.id,
        projectId: project.id,
        action: 'FLAG_STATE_UPDATE',
        details: JSON.stringify({
          flagKey: newBillingFlag.key,
          environment: 'dev',
          enabled: true,
          defaultValue: 'true',
        }),
      },
    ],
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
