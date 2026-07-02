import { Request } from 'express';

// Extends Express's Request type to include userId
// This is needed because our authMiddleware adds req.userId,
// but Express's default Request type doesn't know about it
export interface AuthRequest extends Request {
  userId?: string;
}

// Shape of a Task document (mirrors your Mongoose schema)
export interface ITask {
  _id: string;
  title: string;
  completed: boolean;
  user: string;
  createdAt: Date;
  updatedAt: Date;
}

// Shape of a User document
export interface IUser {
  _id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Shape of JWT payload (what gets encoded inside the token)
export interface JwtPayload {
  userId: string;
}

// Shape of paginated task response
export interface PaginatedTaskResponse {
  tasks: ITask[];
  currentPage: number;
  totalPages: number;
  totalTasks: number;
}