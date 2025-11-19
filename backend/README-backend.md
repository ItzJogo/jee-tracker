# JEE Tracker Backend API

A local-first, production-minded backend for JEE Tracker with authentication, syllabus tracking, and progress management.

## 🚀 Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Testing**: Jest + Supertest
- **Development**: ts-node-dev for hot reload

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── utils/
│   │   ├── db.ts                # MongoDB connection
│   │   └── jwt.ts               # JWT utilities and middleware
│   ├── models/
│   │   ├── Topic.ts             # Topic model (syllabus items)
│   │   ├── User.ts              # User model
│   │   └── Progress.ts          # Progress tracking model
│   ├── controllers/
│   │   ├── authController.ts    # Auth request handlers
│   │   └── trackerController.ts # Tracker request handlers
│   ├── services/
│   │   ├── authService.ts       # Auth business logic
│   │   └── trackerService.ts    # Tracker logic + progress computation
│   └── routes/
│       ├── auth.ts              # Auth routes
│       ├── tracker.ts           # Tracker routes
│       └── index.ts             # Route aggregation
├── migrations/
│   └── seedSample.ts            # Database seeding script
├── __tests__/
│   ├── auth.test.ts             # Auth API tests
│   └── tracker.test.ts          # Tracker API tests
├── Dockerfile                    # Production Docker image
├── docker-compose.yml            # Local dev stack (Mongo + Backend)
├── .env.example                 # Environment template
└── package.json                 # Dependencies and scripts
```

## 🔧 Installation

### Prerequisites

- Node.js 20 or higher
- MongoDB (local installation or Docker)

### Steps

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/jee-tracker
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   FRONTEND_URL=http://localhost:3000
   ```

   ⚠️ **Important**: Use a strong, random JWT_SECRET in production!

5. **Start MongoDB** (if not using Docker):
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community

   # Linux with systemd
   sudo systemctl start mongod

   # Or use Docker
   docker run -d -p 27017:27017 --name mongo mongo:7
   ```

6. **Seed the database**:
   ```bash
   npm run seed
   ```

   This creates:
   - Sample topics (Mathematics, Physics, Chemistry)
   - Demo user: `demo@local` / `demo123`
   - Sample progress records

7. **Start development server**:
   ```bash
   npm run dev
   ```

   Server will start on http://localhost:5000

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

This starts both MongoDB and the backend in containers:

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Run seed script in container
docker-compose exec backend npm run seed

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Build Docker Image Only

```bash
docker build -t jee-tracker-backend .
docker run -p 5000:5000 --env-file .env jee-tracker-backend
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production build (requires npm run build first)
npm run seed         # Seed database with sample data
npm test             # Run Jest tests
```

## 🔑 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication

#### 1. Register New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65abc123...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@local",
    "password": "demo123"
  }'
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65abc123...",
      "name": "Demo User",
      "email": "demo@local"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get Current User Profile

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "name": "Demo User",
    "email": "demo@local",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Tracker (All Protected - Requires JWT)

#### 4. Get All Topics

```bash
curl -X GET http://localhost:5000/api/tracker/topics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc456...",
      "subject": "Mathematics",
      "chapter": "Algebra",
      "title": "Complex Numbers and Quadratic Equations",
      "order": 0,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    ...
  ]
}
```

#### 5. Get User Progress

Returns all topics with user's progress merged in:

```bash
curl -X GET http://localhost:5000/api/tracker/user-progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc456...",
      "subject": "Mathematics",
      "chapter": "Algebra",
      "title": "Complex Numbers",
      "order": 0,
      "progress": {
        "theory": true,
        "practice": false,
        "pyq": false
      }
    },
    {
      "_id": "65abc789...",
      "subject": "Physics",
      "chapter": "Mechanics",
      "title": "Laws of Motion",
      "order": 5
      // No progress field means no progress yet
    }
  ]
}
```

#### 6. Update Progress

Updates progress flags for a topic (upsert - creates if doesn't exist):

```bash
curl -X POST http://localhost:5000/api/tracker/update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": "65abc456...",
    "flags": {
      "theory": true,
      "practice": true,
      "pyq": false
    }
  }'
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "progress": {
      "_id": "65def123...",
      "userId": "65abc123...",
      "topicId": "65abc456...",
      "theory": true,
      "practice": true,
      "pyq": false,
      "updatedAt": "2024-01-15T11:00:00.000Z"
    },
    "summary": {
      "totalTopics": 12,
      "theoryDone": 5,
      "practiceDone": 3,
      "pyqDone": 2,
      "overallPercent": 28,
      "perSubject": [...]
    }
  }
}
```

#### 7. Get Progress Summary

Returns statistics about completion across all subjects:

```bash
curl -X GET http://localhost:5000/api/tracker/progress-summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalTopics": 12,
    "theoryDone": 5,
    "practiceDone": 3,
    "pyqDone": 2,
    "overallPercent": 28,
    "perSubject": [
      {
        "subject": "Mathematics",
        "total": 4,
        "theoryDone": 2,
        "practiceDone": 1,
        "pyqDone": 1,
        "percent": 33
      },
      {
        "subject": "Physics",
        "total": 4,
        "theoryDone": 2,
        "practiceDone": 1,
        "pyqDone": 1,
        "percent": 33
      },
      {
        "subject": "Chemistry",
        "total": 4,
        "theoryDone": 1,
        "practiceDone": 1,
        "pyqDone": 0,
        "percent": 17
      }
    ]
  }
}
```

#### 8. Health Check (Public)

```bash
curl -X GET http://localhost:5000/api/health
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T12:00:00.000Z"
  }
}
```

## 🔗 Connecting Frontend

To connect the existing frontend to this backend:

1. **Set the base API URL** in your frontend code:
   ```javascript
   const BASE_API_URL = 'http://localhost:5000/api';
   ```

2. **Store JWT token** after login/register:
   ```javascript
   const response = await fetch(`${BASE_API_URL}/auth/login`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   const data = await response.json();
   localStorage.setItem('authToken', data.data.token);
   ```

3. **Include token in protected requests**:
   ```javascript
   const token = localStorage.getItem('authToken');
   const response = await fetch(`${BASE_API_URL}/tracker/topics`, {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   ```

4. **Update CORS** if frontend runs on different port:
   - Edit `.env`: `FRONTEND_URL=http://localhost:3000` (or your frontend URL)
   - CORS is configured in `src/app.ts`

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Requirements

Tests require a running MongoDB instance. Configure via:
- Environment variable: `MONGO_URI=mongodb://localhost:27017/jee-tracker-test`
- Or use default localhost connection

### Test Structure

- `__tests__/auth.test.ts`: Registration, login, authentication
- `__tests__/tracker.test.ts`: Topics, progress tracking, summary computation

Tests automatically:
- Connect to test database
- Create test data
- Run test cases
- Clean up after completion

## 🔒 Security Notes

1. **JWT Secret**: Always use a strong, random secret in production
   ```bash
   # Generate a secure secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Password Hashing**: Uses bcrypt with 10 salt rounds

3. **CORS**: Configured to allow frontend origin. Update `FRONTEND_URL` in `.env`

4. **Environment Variables**: Never commit `.env` file. Use `.env.example` as template

5. **Token Expiration**: JWT tokens expire in 7 days (configurable in `src/utils/jwt.ts`)

6. **⚠️ Rate Limiting**: For production deployment, implement rate limiting using `express-rate-limit`:
   ```bash
   npm install express-rate-limit
   ```
   Example configuration in `src/app.ts`:
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // Limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP, please try again later.'
   });
   
   // Apply to all routes
   app.use('/api/', limiter);
   
   // Stricter limit for auth routes
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5, // 5 requests per 15 minutes
   });
   
   app.use('/api/auth/login', authLimiter);
   app.use('/api/auth/register', authLimiter);
   ```

## 🐛 Troubleshooting

### Cannot connect to MongoDB

```bash
# Check if MongoDB is running
docker ps  # If using Docker
brew services list  # If using Homebrew (macOS)
sudo systemctl status mongod  # If using systemd (Linux)

# Check connection string in .env
MONGO_URI=mongodb://localhost:27017/jee-tracker
```

### Port 5000 already in use

```bash
# Change port in .env
PORT=5001

# Or kill process using port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
```

### JWT token errors (401)

- Ensure token is included: `Authorization: Bearer YOUR_TOKEN`
- Check token hasn't expired (7 day default)
- Verify JWT_SECRET matches between requests

### Seed script fails

```bash
# Ensure MongoDB is running
# Check MONGO_URI in .env
# Clear existing data if needed
npm run seed
```

## 📊 Data Models

### Topic
```typescript
{
  _id: ObjectId,
  subject: string,      // e.g., "Mathematics"
  chapter: string,      // e.g., "Algebra"
  title: string,        // e.g., "Complex Numbers"
  order: number,        // For sorting
  createdAt: Date
}
```

### User
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,        // Unique, lowercase
  passwordHash: string,
  createdAt: Date
}
```

### Progress
```typescript
{
  _id: ObjectId,
  userId: ObjectId,     // Reference to User
  topicId: ObjectId,    // Reference to Topic
  theory: boolean,      // Theory completed
  practice: boolean,    // Practice completed
  pyq: boolean,         // Previous Year Questions completed
  updatedAt: Date
}
```

## 🎯 Next Steps

1. **Expand Syllabus**: Replace sample topics with full JEE syllabus from PDF
2. **Add Revision Tracking**: Track revision dates and spaced repetition
3. **Statistics**: Add charts for progress over time
4. **Export/Import**: Allow users to backup and restore their progress
5. **Social Features**: Add study groups, leaderboards
6. **Notifications**: Remind users about pending topics

## 📄 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feat/new-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to branch: `git push origin feat/new-feature`
5. Open Pull Request

---

**Questions?** Open an issue on GitHub or check the main project README.
