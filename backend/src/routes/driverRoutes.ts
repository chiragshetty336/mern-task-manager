import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Driver from '../models/Driver';
import protect from '../middleware/authMiddleware';
import { AuthRequest } from '../types/index';

const router = express.Router();

// Helper: generate driver ID like DRV001, DRV002...
const generateDriverId = async (): Promise<string> => {
  const count = await Driver.countDocuments();
  return `DRV${String(count + 1).padStart(3, '0')}`;
};

// GET all drivers (with optional search + filter)
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status, factory } = req.query as {
      search?: string;
      status?: string;
      factory?: string;
    };

    const query: Record<string, unknown> = {};

    if (status && status !== 'All') query.status = status;
    if (factory && factory !== 'All') query.factory = factory;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { dlNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const drivers = await Driver.find(query).sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// GET single driver by ID
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      res.status(404).json({ message: 'Driver not found' });
      return;
    }
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

// POST create driver
router.post(
  '/',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('mobile').trim().notEmpty().withMessage('Mobile is required')
      .isLength({ min: 10, max: 10 }).withMessage('Mobile must be 10 digits'),
    body('aadhaar').trim().notEmpty().withMessage('Aadhaar is required'),
    body('dlNumber').trim().notEmpty().withMessage('DL Number is required'),
    body('dlExpiry').notEmpty().withMessage('DL Expiry is required'),
    body('factory').isIn(['DBP', 'MRS1', 'KOLAR']).withMessage('Invalid factory'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }

    try {
      const driverId = await generateDriverId();
      const driver = new Driver({ ...req.body, driverId });
      await driver.save();
      res.status(201).json(driver);
    } catch (err: unknown) {
      // Handle MongoDB duplicate key errors
      if ((err as { code?: number }).code === 11000) {
        const keyValue = (err as { keyValue?: Record<string, string> }).keyValue;
        const field = keyValue ? Object.keys(keyValue)[0] : 'field';
        res.status(400).json({ message: `${field} already exists` });
        return;
      }
      res.status(500).json({ message: 'Server error', error: (err as Error).message });
    }
  }
);

// PUT update driver
router.put(
  '/:id',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('mobile').optional().isLength({ min: 10, max: 10 }).withMessage('Mobile must be 10 digits'),
    body('factory').optional().isIn(['DBP', 'MRS1', 'KOLAR']).withMessage('Invalid factory'),
    body('status').optional().isIn(['Active', 'Inactive']).withMessage('Invalid status'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }

    try {
      const driver = await Driver.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
      );
      if (!driver) {
        res.status(404).json({ message: 'Driver not found' });
        return;
      }
      res.json(driver);
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) {
        const keyValue = (err as { keyValue?: Record<string, string> }).keyValue;
        const field = keyValue ? Object.keys(keyValue)[0] : 'field';
        res.status(400).json({ message: `${field} already exists` });
        return;
      }
      res.status(500).json({ message: 'Server error', error: (err as Error).message });
    }
  }
);

// DELETE driver
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      res.status(404).json({ message: 'Driver not found' });
      return;
    }
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});


// POST bulk import drivers
router.post('/bulk-import', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { drivers } = req.body as {
      drivers: Array<{
        name: string;
        mobile: string;
        altMobile?: string;
        address?: string;
        aadhaar: string;
        dlNumber: string;
        dlExpiry: string;
        factory: string;
        status: string;
      }>;
    };

    if (!drivers || !Array.isArray(drivers) || drivers.length === 0) {
      res.status(400).json({ message: 'No driver data provided' });
      return;
    }

    // Validate each row
    const errors: string[] = [];
    drivers.forEach((driver, index) => {
      const row = index + 2; // Excel row number (1 = header, data starts at 2)
      if (!driver.name) errors.push(`Row ${row}: name is required`);
      if (!driver.mobile || driver.mobile.toString().length !== 10)
        errors.push(`Row ${row}: mobile must be 10 digits`);
      if (!driver.aadhaar) errors.push(`Row ${row}: aadhaar is required`);
      if (!driver.dlNumber) errors.push(`Row ${row}: dlNumber is required`);
      if (!driver.dlExpiry) errors.push(`Row ${row}: dlExpiry is required`);
      if (!['DBP', 'MRS1', 'KOLAR'].includes(driver.factory))
        errors.push(`Row ${row}: factory must be DBP, MRS1, or KOLAR`);
      if (!['Active', 'Inactive'].includes(driver.status))
        errors.push(`Row ${row}: status must be Active or Inactive`);
    });

    if (errors.length > 0) {
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }

    // Generate driver IDs
    const existingCount = await Driver.countDocuments();
    const driversWithIds = drivers.map((driver, index) => ({
      ...driver,
      mobile: driver.mobile.toString(),
      aadhaar: driver.aadhaar.toString(),
      driverId: `DRV${String(existingCount + index + 1).padStart(3, '0')}`,
    }));

    // Insert all at once
    const inserted = await Driver.insertMany(driversWithIds, { ordered: false });

    res.status(201).json({
      message: `Successfully imported ${inserted.length} drivers`,
      count: inserted.length,
    });
  } catch (err: unknown) {
    // Handle partial success — some rows inserted, some failed due to duplicates
    if ((err as any).code === 11000 || (err as any).writeErrors) {
      const writeErrors = (err as any).writeErrors || [];
      const inserted = (err as any).insertedDocs?.length || 0;
      res.status(207).json({
        message: `Partial import: ${inserted} inserted, ${writeErrors.length} failed due to duplicates`,
        errors: writeErrors.map((e: any) => `Row ${e.index + 2}: duplicate value`),
      });
      return;
    }
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
});

export default router;