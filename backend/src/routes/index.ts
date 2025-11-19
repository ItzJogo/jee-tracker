import { Router } from 'express';
import authRouter from './auth';
import trackerRouter from './tracker';

const router = Router();

// Mount routers
router.use('/auth', authRouter);
router.use('/tracker', trackerRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
