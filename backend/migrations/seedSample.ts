import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../src/utils/db';
import { Topic } from '../src/models/Topic';
import { User } from '../src/models/User';
import { Progress } from '../src/models/Progress';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jee-tracker';

/**
 * Sample JEE syllabus data
 * Note: This is a minimal sample. To use full PDF extraction, replace this
 * array with parsed data from the official JEE syllabus PDF.
 */
const SAMPLE_TOPICS = [
  // Mathematics
  {
    subject: 'Mathematics',
    chapter: 'Algebra',
    topics: [
      'Complex Numbers and Quadratic Equations',
      'Matrices and Determinants',
    ],
  },
  {
    subject: 'Mathematics',
    chapter: 'Calculus',
    topics: [
      'Limits and Continuity',
      'Differentiation',
    ],
  },
  // Physics
  {
    subject: 'Physics',
    chapter: 'Mechanics',
    topics: [
      'Laws of Motion',
      'Work, Energy and Power',
    ],
  },
  {
    subject: 'Physics',
    chapter: 'Electrodynamics',
    topics: [
      'Electric Charges and Fields',
      'Current Electricity',
    ],
  },
  // Chemistry
  {
    subject: 'Chemistry',
    chapter: 'Physical Chemistry',
    topics: [
      'Atomic Structure',
      'Chemical Bonding',
    ],
  },
  {
    subject: 'Chemistry',
    chapter: 'Organic Chemistry',
    topics: [
      'Hydrocarbons',
      'Haloalkanes and Haloarenes',
    ],
  },
];

/**
 * Seed the database with sample data
 */
const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB(MONGO_URI);

    // Clear existing data (optional - comment out to preserve existing data)
    console.log('🗑️  Clearing existing data...');
    await Topic.deleteMany({});
    await User.deleteMany({});
    await Progress.deleteMany({});

    // Create topics
    console.log('📚 Creating topics...');
    let order = 0;
    const createdTopics = [];

    for (const item of SAMPLE_TOPICS) {
      for (const topicTitle of item.topics) {
        const topic = await Topic.create({
          subject: item.subject,
          chapter: item.chapter,
          title: topicTitle,
          order: order++,
        });
        createdTopics.push(topic);
        console.log(`  ✓ Created: ${item.subject} > ${item.chapter} > ${topicTitle}`);
      }
    }

    console.log(`✓ Created ${createdTopics.length} topics`);

    // Create demo user
    console.log('👤 Creating demo user...');
    const passwordHash = await bcrypt.hash('demo123', 10);
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@local',
      passwordHash,
    });
    console.log(`  ✓ Email: demo@local`);
    console.log(`  ✓ Password: demo123`);

    // Create some sample progress for demo user
    console.log('📊 Creating sample progress...');
    const sampleProgress = [
      // Mark first topic as fully completed
      {
        userId: demoUser._id,
        topicId: createdTopics[0]._id,
        theory: true,
        practice: true,
        pyq: true,
      },
      // Mark second topic as partially completed
      {
        userId: demoUser._id,
        topicId: createdTopics[1]._id,
        theory: true,
        practice: false,
        pyq: false,
      },
      // Mark third topic as theory only
      {
        userId: demoUser._id,
        topicId: createdTopics[2]._id,
        theory: true,
        practice: false,
        pyq: false,
      },
    ];

    for (const progressData of sampleProgress) {
      await Progress.create(progressData);
    }
    console.log(`✓ Created ${sampleProgress.length} progress records`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   Topics: ${createdTopics.length}`);
    console.log(`   Users: 1 (demo@local)`);
    console.log(`   Progress records: ${sampleProgress.length}`);
    console.log('\n🚀 You can now start the server with: npm run dev');

    // Disconnect
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

// Run seed
seed();
