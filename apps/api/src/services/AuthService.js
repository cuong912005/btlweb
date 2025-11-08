import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import redisClient from '../config/redis.js';

const prisma = new PrismaClient();

class AuthService {
  constructor() {
    this.saltRounds = 12;
  }

  async registerUser(userData) {
    const { email, password, firstName, lastName, phone, location } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        location,
        role: 'VOLUNTEER' // Only volunteers can register publicly
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        location: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT tokens
    const { accessToken, newRefreshToken } = this.generateTokens(user);

    // Store refresh token in Redis with 7 days expiration
    const refreshTokenKey = `refresh_token:${user.id}:${newRefreshToken}`;
    await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, user.id);

    return {
      user,
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  async loginUser(email, password) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check if account is locked
    if (user.isActive === false) {
      throw new Error('ACCOUNT_LOCKED');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      location: user.location,
      role: user.role,
      createdAt: user.createdAt
    };

    // Generate JWT tokens
    const { accessToken, newRefreshToken } = this.generateTokens(userResponse);

    // Store refresh token in Redis with 7 days expiration
    const refreshTokenKey = `refresh_token:${user.id}:${newRefreshToken}`;
    await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, user.id);

    return {
      user: userResponse,
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('REFRESH_TOKEN_REQUIRED');
    }

    // Check if refresh token exists in Redis
    const keys = await redisClient.keys(`refresh_token:*:${refreshToken}`);
    
    if (!keys || keys.length === 0) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Extract userId from the key
    const userId = await redisClient.get(keys[0]);
    
    if (!userId) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        location: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Delete old refresh token from Redis
    await redisClient.del(keys[0]);

    // Generate new tokens
    const { accessToken, newRefreshToken } = this.generateTokens(user);

    // Store new refresh token in Redis with 7 days expiration
    const refreshTokenKey = `refresh_token:${user.id}:${newRefreshToken}`;
    await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, user.id);

    return {
      user,
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  async logoutUser(userId, refreshToken) {
    // Delete refresh token from Redis
    if (refreshToken) {
      const refreshTokenKey = `refresh_token:${userId}:${refreshToken}`;
      await redisClient.del(refreshTokenKey);
    } else {
      // If no specific token provided, delete all tokens for this user
      const keys = await redisClient.keys(`refresh_token:${userId}:*`);
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
      }
    }

    return { success: true };
  }

  async logoutAllDevices(userId) {
    // Delete all refresh tokens for this user
    const keys = await redisClient.keys(`refresh_token:${userId}:*`);
    if (keys && keys.length > 0) {
      await redisClient.del(keys);
    }

    return { success: true, message: 'Logged out from all devices' };
  }
  
  generateTokens(user) {
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = crypto.randomBytes(64).toString('hex');

    return { accessToken, newRefreshToken };
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('INVALID_ACCESS_TOKEN');
    }
  }
}

export default new AuthService();