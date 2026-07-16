import { Router } from 'express';
import { SdkController } from '../controllers/sdk.controller';

const router = Router();

router.get('/flags', SdkController.getFlags);
router.post('/flags/:flagKey/evaluate', SdkController.evaluateFlag);

export default router;
