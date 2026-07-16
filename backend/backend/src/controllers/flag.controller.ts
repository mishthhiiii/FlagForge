import { Response, NextFunction } from 'express';
import { FlagService } from '../services/flag.service';
import { AuthenticatedRequest } from '../types/index';

export class FlagController {
  static async getProjectFlags(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const flags = await FlagService.getProjectFlags(projectId);
      res.status(200).json(flags);
    } catch (error) {
      next(error);
    }
  }

  static async getFlagDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { flagId } = req.params;
      const flag = await FlagService.getFlagDetails(flagId);
      res.status(200).json(flag);
    } catch (error) {
      next(error);
    }
  }

  static async createFlag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const flag = await FlagService.createFlag(userId, req.body);
      res.status(211).json({
        message: 'Feature flag created successfully',
        flag,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateFlagState(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { flagId, environmentId } = req.params;
      const updatedState = await FlagService.updateFlagState(
        userId,
        flagId,
        environmentId,
        req.body
      );
      res.status(200).json({
        message: 'Flag state updated successfully',
        state: updatedState,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFlag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { flagId } = req.params;
      const result = await FlagService.deleteFlag(userId, flagId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getProjectAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { projectId } = req.params;
      const logs = await FlagService.getProjectAuditLogs(userId, projectId);
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  }
}
