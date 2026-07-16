import { Router } from 'express';
import { FlagController } from '../controllers/flag.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { createFlagSchema, updateFlagStateSchema } from '../validators/flag.validator';

const router = Router();

router.use(requireAuth);

router.get('/project/:projectId', FlagController.getProjectFlags);
router.get('/:flagId', FlagController.getFlagDetails);
router.post('/', validate(createFlagSchema), FlagController.createFlag);
router.put('/:flagId/environment/:environmentId', validate(updateFlagStateSchema), FlagController.updateFlagState);
router.delete('/:flagId', FlagController.deleteFlag);
router.get('/project/:projectId/audit-logs', FlagController.getProjectAuditLogs);

export default router;
