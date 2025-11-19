import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/utils/db';
import { Topic } from '../src/models/Topic';
import { User } from '../src/models/User';
import { Progress } from '../src/models/Progress';

const app = createApp();

/**
 * Tracker API Tests
 * Note: These tests require a running MongoDB instance.
 */

describe('Tracker API', () => {
  let authToken: string;
  let userId: string;
  let sampleTopics: any[] = [];

  const testUser = {
    name: 'Tracker Test User',
    email: 'tracker@example.com',
    password: 'test123456',
  };

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/jee-tracker-test';
    await connectDB(mongoUri);

    // Clean up
    await User.deleteMany({ email: testUser.email });
    await Topic.deleteMany({});
    await Progress.deleteMany({});

    // Register test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;

    // Create sample topics
    const topicsData = [
      {
        subject: 'Mathematics',
        chapter: 'Algebra',
        title: 'Complex Numbers',
        order: 1,
      },
      {
        subject: 'Mathematics',
        chapter: 'Algebra',
        title: 'Matrices',
        order: 2,
      },
      {
        subject: 'Physics',
        chapter: 'Mechanics',
        title: 'Laws of Motion',
        order: 3,
      },
      {
        subject: 'Physics',
        chapter: 'Mechanics',
        title: 'Work and Energy',
        order: 4,
      },
    ];

    for (const topicData of topicsData) {
      const topic = await Topic.create(topicData);
      sampleTopics.push(topic);
    }
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({ email: testUser.email });
    await Topic.deleteMany({});
    await Progress.deleteMany({});
    await disconnectDB();
  });

  describe('GET /api/tracker/topics', () => {
    it('should return all topics', async () => {
      const response = await request(app)
        .get('/api/tracker/topics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(sampleTopics.length);
      expect(response.body.data[0]).toHaveProperty('subject');
      expect(response.body.data[0]).toHaveProperty('chapter');
      expect(response.body.data[0]).toHaveProperty('title');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/tracker/topics').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tracker/user-progress', () => {
    it('should return user progress with topics', async () => {
      const response = await request(app)
        .get('/api/tracker/user-progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(sampleTopics.length);
    });
  });

  describe('POST /api/tracker/update', () => {
    it('should update progress for a topic', async () => {
      const topicId = sampleTopics[0]._id.toString();

      const response = await request(app)
        .post('/api/tracker/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topicId,
          flags: {
            theory: true,
            practice: false,
            pyq: false,
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('progress');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data.progress.theory).toBe(true);
      expect(response.body.data.progress.practice).toBe(false);
    });

    it('should update existing progress (upsert)', async () => {
      const topicId = sampleTopics[0]._id.toString();

      // Update again with different flags
      const response = await request(app)
        .post('/api/tracker/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topicId,
          flags: {
            practice: true,
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.progress.theory).toBe(true); // Should remain true
      expect(response.body.data.progress.practice).toBe(true); // Should be updated
    });

    it('should fail with invalid topicId', async () => {
      const response = await request(app)
        .post('/api/tracker/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topicId: '507f1f77bcf86cd799439011', // Valid ObjectId format but doesn't exist
          flags: {
            theory: true,
          },
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should fail without topicId', async () => {
      const response = await request(app)
        .post('/api/tracker/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          flags: {
            theory: true,
          },
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tracker/progress-summary', () => {
    beforeAll(async () => {
      // Create some progress for testing
      await Progress.deleteMany({ userId });

      await Progress.create({
        userId,
        topicId: sampleTopics[0]._id,
        theory: true,
        practice: true,
        pyq: true,
      });

      await Progress.create({
        userId,
        topicId: sampleTopics[1]._id,
        theory: true,
        practice: false,
        pyq: false,
      });
    });

    it('should return progress summary with statistics', async () => {
      const response = await request(app)
        .get('/api/tracker/progress-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalTopics');
      expect(response.body.data).toHaveProperty('theoryDone');
      expect(response.body.data).toHaveProperty('practiceDone');
      expect(response.body.data).toHaveProperty('pyqDone');
      expect(response.body.data).toHaveProperty('overallPercent');
      expect(response.body.data).toHaveProperty('perSubject');

      expect(response.body.data.totalTopics).toBe(4);
      expect(response.body.data.theoryDone).toBe(2);
      expect(response.body.data.practiceDone).toBe(1);
      expect(response.body.data.pyqDone).toBe(1);

      expect(Array.isArray(response.body.data.perSubject)).toBe(true);
      expect(response.body.data.perSubject.length).toBeGreaterThan(0);
      expect(response.body.data.perSubject[0]).toHaveProperty('subject');
      expect(response.body.data.perSubject[0]).toHaveProperty('total');
      expect(response.body.data.perSubject[0]).toHaveProperty('percent');
    });

    it('should calculate correct percentages', async () => {
      const response = await request(app)
        .get('/api/tracker/progress-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // With 4 topics, max possible = 4 * 3 = 12
      // Current: theory=2, practice=1, pyq=1 = 4 total
      // Percentage = (4 / 12) * 100 = 33%
      expect(response.body.data.overallPercent).toBe(33);
    });
  });
});
