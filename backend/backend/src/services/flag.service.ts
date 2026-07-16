import { prisma } from '../config/database';
import { CreateFlagInput, UpdateFlagStateInput } from '../validators/flag.validator';

export class FlagService {
  static async getProjectFlags(projectId: string) {
    return prisma.featureFlag.findMany({
      where: { projectId },
      include: {
        flagStates: {
          include: {
            environment: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getFlagDetails(flagId: string) {
    const flag = await prisma.featureFlag.findUnique({
      where: { id: flagId },
      include: {
        flagStates: {
          include: {
            environment: true,
          },
        },
      },
    });

    if (!flag) {
      throw { statusCode: 404, message: 'Feature flag not found' };
    }

    return flag;
  }

  static async createFlag(userId: string, input: CreateFlagInput) {
    // Check if project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
      include: { environments: true },
    });

    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    if (project.userId !== userId) {
      throw { statusCode: 403, message: 'Access denied to project' };
    }

    // Check for existing flag key in the project
    const existingFlag = await prisma.featureFlag.findFirst({
      where: {
        projectId: input.projectId,
        key: input.key,
      },
    });

    if (existingFlag) {
      throw { statusCode: 400, message: `Flag with key "${input.key}" already exists in this project` };
    }

    // Determine fallback default value based on flag type
    let defaultVal = 'false';
    if (input.type === 'MULTIVARIATE') {
      defaultVal = 'control';
    } else if (input.type === 'JSON') {
      defaultVal = '{}';
    }

    // Create the flag and flag states inside a database transaction
    const newFlag = await prisma.$transaction(async (tx) => {
      const flag = await tx.featureFlag.create({
        data: {
          name: input.name,
          key: input.key,
          description: input.description,
          type: input.type,
          projectId: input.projectId,
        },
      });

      // Create a default inactive state for each environment in the project
      for (const env of project.environments) {
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

      // Create an audit log
      await tx.auditLog.create({
        data: {
          userId,
          projectId: input.projectId,
          action: 'CREATE_FLAG',
          details: JSON.stringify({ key: flag.key, name: flag.name, type: flag.type }),
        },
      });

      return flag;
    });

    return this.getFlagDetails(newFlag.id);
  }

  static async updateFlagState(
    userId: string,
    flagId: string,
    environmentId: string,
    input: UpdateFlagStateInput
  ) {
    // Verify flag and environment exist
    const flag = await prisma.featureFlag.findUnique({
      where: { id: flagId },
      include: { project: true },
    });

    if (!flag) {
      throw { statusCode: 404, message: 'Feature flag not found' };
    }

    if (flag.project.userId !== userId) {
      throw { statusCode: 403, message: 'Access denied to this project' };
    }

    const envState = await prisma.environmentFlagState.findFirst({
      where: {
        flagId,
        environmentId,
      },
      include: {
        environment: true,
      },
    });

    if (!envState) {
      throw { statusCode: 404, message: 'Flag state configuration not found for this environment' };
    }

    // Update flag state inside a transaction
    const updatedState = await prisma.$transaction(async (tx) => {
      const state = await tx.environmentFlagState.update({
        where: { id: envState.id },
        data: {
          enabled: input.enabled,
          defaultValue: input.defaultValue,
          rules: JSON.stringify(input.rules),
        },
      });

      // Log the action
      await tx.auditLog.create({
        data: {
          userId,
          projectId: flag.projectId,
          action: 'UPDATE_FLAG_STATE',
          details: JSON.stringify({
            flagKey: flag.key,
            environment: envState.environment.key,
            enabled: input.enabled,
            defaultValue: input.defaultValue,
            rulesCount: input.rules.length,
          }),
        },
      });

      return state;
    });

    return updatedState;
  }

  static async deleteFlag(userId: string, flagId: string) {
    const flag = await prisma.featureFlag.findUnique({
      where: { id: flagId },
      include: { project: true },
    });

    if (!flag) {
      throw { statusCode: 404, message: 'Feature flag not found' };
    }

    if (flag.project.userId !== userId) {
      throw { statusCode: 403, message: 'Access denied' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.featureFlag.delete({
        where: { id: flagId },
      });

      await tx.auditLog.create({
        data: {
          userId,
          projectId: flag.projectId,
          action: 'DELETE_FLAG',
          details: JSON.stringify({ key: flag.key, name: flag.name }),
        },
      });
    });

    return { success: true, message: 'Feature flag deleted successfully' };
  }

  static async getProjectAuditLogs(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw { statusCode: 404, message: 'Project not found' };
    }

    if (project.userId !== userId) {
      throw { statusCode: 403, message: 'Access denied' };
    }

    return prisma.auditLog.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
