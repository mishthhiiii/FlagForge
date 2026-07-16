import { Router } from 'express';
import authRoutes from './auth.routes';
import flagRoutes from './flag.routes';
import environmentRoutes from './environment.routes';
import sdkRoutes from './sdk.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/flags', flagRoutes);
router.use('/projects', environmentRoutes);
router.use('/sdk', sdkRoutes);

export default router;
