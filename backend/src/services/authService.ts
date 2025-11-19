import bcrypt from 'bcrypt';
import { User, IUser } from '../models/User';
import { signToken, JWTPayload } from '../utils/jwt';

const SALT_ROUNDS = 10;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

/**
 * Register a new user
 * @param input - Registration data (name, email, password)
 * @returns User data and JWT token
 * @throws Error if email already exists or validation fails
 */
export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
  const { name, email, password } = input;

  // Validate input
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
  });

  // Generate token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  const payload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };

  const token = signToken(payload, jwtSecret);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    token,
  };
};

/**
 * Login an existing user
 * @param input - Login credentials (email, password)
 * @returns User data and JWT token
 * @throws Error if credentials are invalid
 */
export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const { email, password } = input;

  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  const payload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };

  const token = signToken(payload, jwtSecret);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    token,
  };
};

/**
 * Get user by ID
 * @param userId - User ID
 * @returns User data without password
 * @throws Error if user not found
 */
export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};
