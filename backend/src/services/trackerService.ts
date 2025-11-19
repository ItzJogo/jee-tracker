import mongoose from 'mongoose';
import { Topic, ITopic } from '../models/Topic';
import { Progress, IProgress } from '../models/Progress';

export interface TopicWithProgress {
  _id: string;
  subject: string;
  chapter: string;
  title: string;
  order: number;
  progress?: {
    theory: boolean;
    practice: boolean;
    pyq: boolean;
  };
}

export interface ProgressUpdateInput {
  topicId: string;
  flags: {
    theory?: boolean;
    practice?: boolean;
    pyq?: boolean;
  };
}

export interface SubjectProgress {
  subject: string;
  total: number;
  theoryDone: number;
  practiceDone: number;
  pyqDone: number;
  percent: number;
}

export interface ProgressSummary {
  totalTopics: number;
  theoryDone: number;
  practiceDone: number;
  pyqDone: number;
  overallPercent: number;
  perSubject: SubjectProgress[];
}

/**
 * Get all topics grouped by subject
 * @returns Array of all topics
 */
export const getAllTopics = async (): Promise<ITopic[]> => {
  return await Topic.find().sort({ subject: 1, chapter: 1, order: 1 });
};

/**
 * Get user's progress merged with topics
 * @param userId - User ID
 * @returns Topics with user's progress attached
 */
export const getUserProgress = async (userId: string): Promise<TopicWithProgress[]> => {
  // Get all topics
  const topics = await Topic.find().sort({ subject: 1, chapter: 1, order: 1 });

  // Get user's progress
  const progressRecords = await Progress.find({ userId });

  // Create a map of topicId -> progress
  const progressMap = new Map<string, IProgress>();
  progressRecords.forEach((p) => {
    progressMap.set(p.topicId.toString(), p);
  });

  // Merge progress with topics
  return topics.map((topic) => {
    const progress = progressMap.get(topic._id.toString());
    return {
      _id: topic._id.toString(),
      subject: topic.subject,
      chapter: topic.chapter,
      title: topic.title,
      order: topic.order,
      progress: progress
        ? {
            theory: progress.theory,
            practice: progress.practice,
            pyq: progress.pyq,
          }
        : undefined,
    };
  });
};

/**
 * Update user's progress for a topic (upsert)
 * @param userId - User ID
 * @param input - Topic ID and flags to update
 * @returns Updated progress record
 * @throws Error if topic not found
 */
export const updateProgress = async (
  userId: string,
  input: ProgressUpdateInput
): Promise<IProgress> => {
  const { topicId, flags } = input;

  // Validate topic exists
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new Error('Topic not found');
  }

  // Prepare update data
  const updateData: any = {};
  if (flags.theory !== undefined) {
    updateData.theory = flags.theory;
  }
  if (flags.practice !== undefined) {
    updateData.practice = flags.practice;
  }
  if (flags.pyq !== undefined) {
    updateData.pyq = flags.pyq;
  }

  // Upsert progress
  const progress = await Progress.findOneAndUpdate(
    { userId, topicId },
    { $set: updateData },
    { new: true, upsert: true }
  );

  return progress;
};

/**
 * Compute progress summary with per-subject and overall statistics
 * @param userId - User ID
 * @returns Progress summary with percentages
 */
export const computeProgressSummary = async (
  userId: string
): Promise<ProgressSummary> => {
  // Get all topics
  const topics = await Topic.find();

  // Get user's progress
  const progressRecords = await Progress.find({ userId });

  // Create a map of topicId -> progress
  const progressMap = new Map<string, IProgress>();
  progressRecords.forEach((p) => {
    progressMap.set(p.topicId.toString(), p);
  });

  // Group topics by subject
  const subjectMap = new Map<string, ITopic[]>();
  topics.forEach((topic) => {
    const existing = subjectMap.get(topic.subject) || [];
    existing.push(topic);
    subjectMap.set(topic.subject, existing);
  });

  // Compute per-subject statistics
  const perSubject: SubjectProgress[] = [];
  let totalTheoryDone = 0;
  let totalPracticeDone = 0;
  let totalPyqDone = 0;

  subjectMap.forEach((subjectTopics, subject) => {
    let theoryDone = 0;
    let practiceDone = 0;
    let pyqDone = 0;

    subjectTopics.forEach((topic) => {
      const progress = progressMap.get(topic._id.toString());
      if (progress) {
        if (progress.theory) theoryDone++;
        if (progress.practice) practiceDone++;
        if (progress.pyq) pyqDone++;
      }
    });

    const total = subjectTopics.length;
    const totalCompleted = theoryDone + practiceDone + pyqDone;
    const maxPossible = total * 3; // 3 flags per topic
    const percent = maxPossible > 0 ? Math.round((totalCompleted / maxPossible) * 100) : 0;

    perSubject.push({
      subject,
      total,
      theoryDone,
      practiceDone,
      pyqDone,
      percent,
    });

    totalTheoryDone += theoryDone;
    totalPracticeDone += practiceDone;
    totalPyqDone += pyqDone;
  });

  // Compute overall statistics
  const totalTopics = topics.length;
  const totalCompleted = totalTheoryDone + totalPracticeDone + totalPyqDone;
  const maxPossible = totalTopics * 3;
  const overallPercent = maxPossible > 0 ? Math.round((totalCompleted / maxPossible) * 100) : 0;

  return {
    totalTopics,
    theoryDone: totalTheoryDone,
    practiceDone: totalPracticeDone,
    pyqDone: totalPyqDone,
    overallPercent,
    perSubject: perSubject.sort((a, b) => a.subject.localeCompare(b.subject)),
  };
};
