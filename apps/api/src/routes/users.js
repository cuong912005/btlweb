import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// TODO: Implement user routes
// - GET /users - List users (admin only)
// - GET /users/:id - Get user details
// - PUT /users/:id - Update user profile
// - DELETE /users/:id - Delete user (admin only)

router.get('/', async (req, res) => {
  res.json({ message: 'Users API - Coming soon' });
});

export default router;