import { Response, NextFunction } from 'express';
import { EnvironmentService } from '../services/environment.service';
import { AuthenticatedRequest } from '../types/index';

export class EnvironmentController {
  static async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const projects = await EnvironmentService.getUserProjects(userId);
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const project = await EnvironmentService.createProject(userId, req.body);
      res.status(211).json({
        message: 'Project created successfully with default environments',
        project,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { projectId } = req.params;
      const result = await EnvironmentService.deleteProject(userId, projectId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createEnvironment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const env = await EnvironmentService.createEnvironment(userId, req.body);
      res.status(211).json({
        message: 'Environment created successfully',
        environment: env,
      });
    } catch (error) {
      next(error);
    }
  }
}
