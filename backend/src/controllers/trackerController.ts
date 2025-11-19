import { Response } from 'express';
import { AuthRequest } from '../utils/jwt';
import {
  getAllTopics,
  getUserProgress,
  updateProgress,
  computeProgressSummary,
} from '../services/trackerService';

/**
 * Get all topics grouped by subject
 * GET /api/tracker/topics
 * Protected route
 */
export const getTopics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topics = await getAllTopics();

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch topics',
    });
  }
};

/**
 * Get user's progress merged with topics
 * GET /api/tracker/user-progress
 * Protected route
 */
export const getUserProgressData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const progress = await getUserProgress(req.user.id);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch user progress',
    });
  }
};

/**
 * Update user's progress for a topic
 * POST /api/tracker/update
 * Body: { topicId, flags: { theory?, practice?, pyq? } }
 * Protected route
 */
export const updateUserProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const { topicId, flags } = req.body;

    if (!topicId) {
      res.status(400).json({
        success: false,
        error: 'topicId is required',
      });
      return;
    }

    if (!flags || typeof flags !== 'object') {
      res.status(400).json({
        success: false,
        error: 'flags object is required',
      });
      return;
    }

    const progress = await updateProgress(req.user.id, { topicId, flags });

    // Get updated summary
    const summary = await computeProgressSummary(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        progress,
        summary,
      },
    });
  } catch (error: any) {
    if (error.message === 'Topic not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update progress',
    });
  }
};

/**
 * Get progress summary with statistics
 * GET /api/tracker/progress-summary
 * Protected route
 */
export const getProgressSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const summary = await computeProgressSummary(req.user.id);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to compute progress summary',
    });
  }
};
