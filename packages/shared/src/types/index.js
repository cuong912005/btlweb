// Shared TypeScript-like type definitions for JavaScript

// User type structure
export const UserSchema = {
  id: 'string',
  email: 'string',
  password: 'string', // hashed
  role: 'VOLUNTEER | ORGANIZER | ADMIN',
  firstName: 'string',
  lastName: 'string',
  phone: 'string?', // optional
  avatar: 'string?', // optional
  bio: 'string?', // optional
  location: 'string?', // optional
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Event type structure
export const EventSchema = {
  id: 'string',
  title: 'string',
  description: 'string',
  location: 'string',
  startDate: 'Date',
  endDate: 'Date',
  capacity: 'number?', // optional
  category: 'string',
  status: 'PENDING | APPROVED | REJECTED | COMPLETED',
  organizerId: 'string',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Event Participant type structure
export const EventParticipantSchema = {
  id: 'string',
  eventId: 'string',
  volunteerId: 'string',
  status: 'PENDING | APPROVED | REJECTED | COMPLETED',
  registeredAt: 'Date',
  completedAt: 'Date?', // optional
};

// Communication Channel type structure
export const CommunicationChannelSchema = {
  id: 'string',
  eventId: 'string',
  createdAt: 'Date'
};

// Channel Post type structure
export const ChannelPostSchema = {
  id: 'string',
  channelId: 'string',
  authorId: 'string',
  content: 'string',
  imageUrl: 'string?', // optional
  createdAt: 'Date',
  updatedAt: 'Date'
};