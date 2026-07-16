import { prisma } from '../config/database';
import { CreateProjectInput, CreateEnvironmentInput } from '../validators/environment.validator';

export class EnvironmentService {
  static async getUserProjects(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      include: {
        environments: true,
        _count: {
          select: { flags: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createProject(userId: string, input: CreateProjectInput) {
    const existingProject = await prisma.project.findUnique({
      where: { key: input.key },
    });

    if (existingProject) {
      throw { statusCode: 400, message: `Project key "${input.key}" is already taken` };
    }

    const project = await prisma.$transaction(async (tx) => {
      const proj = await tx.project.create({
        data: {
          name: input.name,
          key: input.key,
          description: input.description,
          userId,
        },
      });

      // Default environments: Development, Staging, Production
      const defaultEnvironments = [
        { name: 'Development', key: 'dev', sdkKey: `ff_sdk_dev_${Math.random().toString(36).substring(2, 10)}` },
        { name: 'Staging', key: 'staging', sdkKey: `ff_sdk_staging_${Math.random().toString(36).substring(2, 10)}` },
        { name: 'Production', key: 'prod', sdkKey: `ff_sdk_prod_${Math.random().toString(36).substring(2, 10)}` },
      ];

      for (const envData of defaultEnvironments) {
        await tx.environment.create({
          data: {
            name: envData.name,
            key: envData.key,
            sdkKey: envData.sdkKey,
            projectId: proj.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          projectId: proj.id,
          action: 'PROJECT_CREATE',
          details: JSON.stringify({ name: proj.name, key: proj.key }),
        },
      });

      return proj;
    });

    return prisma.project.findUnique({
      where: { id: project.id },
      include: { environments: true },
    });
  }

  static async deleteProject(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    if (project.userId !== userId) {
      throw { statusCode: 403, message: 'Access denied' };
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { success: true, message: 'Project deleted successfully along with environments and flags' };
  }

  static async createEnvironment(userId: string, input: CreateEnvironmentInput) {
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
    });

    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    if (project.userId !== userId) {
      throw { statusCode: 403, message: 'Access denied' };
    }

    // Check for existing key in the project
    const existingEnv = await prisma.environment.findFirst({
      where: {
        projectId: input.projectId,
        key: input.key,
      },
    });

    if (existingEnv) {
      throw { statusCode: 400, message: `Environment with key "${input.key}" already exists in this project` };
    }

    const sdkKey = `ff_sdk_${input.key}_${Math.random().toString(36).substring(2, 10)}`;

    const newEnv = await prisma.$transaction(async (tx) => {
      const env = await tx.environment.create({
        data: {
          name: input.name,
          key: input.key,
          sdkKey,
          projectId: input.projectId,
        },
      });

      // Find all existing flags in project
      const flags = await tx.featureFlag.findMany({
        where: { projectId: input.projectId },
      });

      // Create empty states for the new environment for all existing flags
      for (const flag of flags) {
        let defaultVal = 'false';
        if (flag.type === 'MULTIVARIATE') {
          defaultVal = 'control';
        } else if (flag.type === 'JSON') {
          defaultVal = '{}';
        }

        await tx.environmentFlagState.create({
          data: {
            flagId: flag.id,
            environmentId: env.id,
            enabled: false,
            defaultValue: defaultVal,
            rules: JSON.stringify([]),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          projectId: input.projectId,
          action: 'ENVIRONMENT_CREATE',
          details: JSON.stringify({ name: env.name, key: env.key }),
        },
      });

      return env;
    });

    return newEnv;
  }
}
