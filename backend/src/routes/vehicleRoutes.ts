import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Vehicle from '../models/Vehicle';
import Driver from '../models/Driver';
import protect from '../middleware/authMiddleware';
import { AuthRequest } from '../types/index';

const router = express.Router();

const generateVehicleId = async (): Promise<string> => {
  const count = await Vehicle.countDocuments();
  return `VEH${String(count + 1).padStart(3, '0')}`;
};

// GET all vehicles (with populate — fetches driver details)
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, factory, search } = req.query as {
      status?: string;
      factory?: string;
      search?: string;
    };

    const query: Record<string, unknown> = {};
    if (status && status !== 'All') query.status = status;
    if (factory && factory !== 'All') query.factory = factory;
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { vehicleId: { $regex: search, $options: 'i' } },
      ];
    }

    const vehicles = await Vehicle.find(query)
      .populate('assignedDriver', 'name mobile driverId')
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// GET single vehicle
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('assignedDriver', 'name mobile driverId');
    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// POST create vehicle
router.post(
  '/',
  protect,
  [
    body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
    body('type').isIn(['Truck', 'Van', 'Bike', 'Tempo']).withMessage('Invalid vehicle type'),
    body('factory').isIn(['DBP', 'MRS1', 'KOLAR']).withMessage('Invalid factory'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }
    try {
      const vehicleId = await generateVehicleId();
      const vehicle = new Vehicle({ ...req.body, vehicleId });
      await vehicle.save();
      const populated = await vehicle.populate('assignedDriver', 'name mobile driverId');
      res.status(201).json(populated);
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) {
        res.status(400).json({ message: 'Registration number already exists' });
        return;
      }
      res.status(500).json({ message: 'Server error', error: (err as Error).message });
    }
  }
);

// PUT update vehicle
router.put(
  '/:id',
  protect,
  [
    body('type').optional().isIn(['Truck', 'Van', 'Bike', 'Tempo']).withMessage('Invalid type'),
    body('factory').optional().isIn(['DBP', 'MRS1', 'KOLAR']).withMessage('Invalid factory'),
    body('status').optional().isIn(['ON ROAD', 'MAINTENANCE', 'STANDBY']).withMessage('Invalid status'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }
    try {
      const vehicle = await Vehicle.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
      ).populate('assignedDriver', 'name mobile driverId');

      if (!vehicle) {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      res.json(vehicle);
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) {
        res.status(400).json({ message: 'Registration number already exists' });
        return;
      }
      res.status(500).json({ message: 'Server error', error: (err as Error).message });
    }
  }
);

// PUT assign driver to vehicle
router.put('/:id/assign-driver', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { driverId } = req.body as { driverId: string | null };

    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        res.status(404).json({ message: 'Driver not found' });
        return;
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { assignedDriver: driverId || null },
      { new: true }
    ).populate('assignedDriver', 'name mobile driverId');

    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// DELETE vehicle
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;