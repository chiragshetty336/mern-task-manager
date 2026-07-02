import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task';
import protect from '../middleware/authMiddleware';
import { AuthRequest } from '../types/index';

const router = express.Router();

router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 5;
    const skip: number = (page - 1) * limit;

    const totalTasks = await Task.countDocuments({ user: req.userId });
    const tasks = await Task.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ tasks, currentPage: page, totalPages: Math.ceil(totalTasks / limit), totalTasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

router.post(
  '/',
  protect,
  [body('title').trim().notEmpty().withMessage('Task title cannot be empty')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }
    try {
      const { title } = req.body as { title: string };
      const task = new Task({ title, user: req.userId });
      await task.save();
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: (err as Error).message });
    }
  }
);

router.put('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const { title, completed } = req.body as { title?: string; completed?: boolean };
    if (title !== undefined) task.title = title;
    if (completed !== undefined) task.completed = completed;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;