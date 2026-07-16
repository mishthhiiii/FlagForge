import { Router } from 'express';
import { EnvironmentController } from '../controllers/environment.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { createProjectSchema, createEnvironmentSchema } from '../validators/environment.validator';

const router = Router();

router.use(requireAuth);

router.get('/projects', EnvironmentController.getProjects);
router.post('/projects', validate(createProjectSchema), EnvironmentController.createProject);
router.delete('/projects/:projectId', EnvironmentController.deleteProject);
router.post('/environments', validate(createEnvironmentSchema), EnvironmentController.createEnvironment);

export default router;
