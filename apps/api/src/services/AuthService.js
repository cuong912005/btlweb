import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

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

    // Generate refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        location,
        role: 'VOLUNTEER', // Only volunteers can register publicly
        refreshToken
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

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generate new refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');
    
    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

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

    // Find user by refresh token
    const user = await prisma.user.findFirst({
      where: { refreshToken },
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
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Generate new tokens
    const { accessToken, newRefreshToken } = this.generateTokens(user);

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    return {
      user,
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  async logoutUser(userId) {
    // Clear refresh token
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });

    return { success: true };
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