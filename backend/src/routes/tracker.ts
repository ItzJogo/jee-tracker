import { Router } from 'express';
import {
  getTopics,
  getUserProgressData,
  updateUserProgress,
  getProgressSummary,
} from '../controllers/trackerController';
import { verifyToken } from '../utils/jwt';

const router = Router();

// All tracker routes are protected
router.use(verifyToken);

router.get('/topics', getTopics);
router.get('/user-progress', getUserProgressData);
router.post('/update', updateUserProgress);
router.get('/progress-summary', getProgressSummary);

export default router;
