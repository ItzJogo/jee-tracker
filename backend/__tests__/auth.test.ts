import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/utils/db';
import { User } from '../src/models/User';

const app = createApp();

/**
 * Authentication Tests
 * Note: These tests require a running MongoDB instance.
 * Set MONGO_URI environment variable or use the default localhost connection.
 */

describe('Authentication API', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123456',
  };

  let authToken: string;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/jee-tracker-test';
    await connectDB(mongoUri);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({ email: testUser.email });
    await disconnectDB();
  });

  describe('POST /api/auth/register', () => {
    beforeEach(async () => {
      // Clean up test user before each test
      await User.deleteMany({ email: testUser.email });
    });

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
    });

    it('should fail if email already exists', async () => {
      // Register once
      await request(app).post('/api/auth/register').send(testUser);

      // Try to register again
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already registered');
    });

    it('should fail if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail if password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, password: '123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('at least 6 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Ensure test user exists
      await User.deleteMany({ email: testUser.email });
      const response = await request(app).post('/api/auth/register').send(testUser);
      authToken = response.body.data.token;
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    beforeAll(async () => {
      // Ensure we have a valid token
      await User.deleteMany({ email: testUser.email });
      const response = await request(app).post('/api/auth/register').send(testUser);
      authToken = response.body.data.token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.name).toBe(testUser.name);
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No token');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
