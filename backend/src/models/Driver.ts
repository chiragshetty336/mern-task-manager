import mongoose, { Schema, Document } from 'mongoose';

export interface IDriverDocument extends Document {
  driverId: string;
  name: string;
  mobile: string;
  altMobile?: string;
  address?: string;
  aadhaar: string;
  dlNumber: string;
  dlExpiry: string;
  factory: 'DBP' | 'MRS1' | 'KOLAR';
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriverDocument>(
  {
    driverId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    altMobile: {
      type: String,
    },
    address: {
      type: String,
    },
    aadhaar: {
      type: String,
      required: true,
      unique: true,
    },
    dlNumber: {
      type: String,
      required: true,
      unique: true,
    },
    dlExpiry: {
      type: String,
      required: true,
    },
    factory: {
      type: String,
      enum: ['DBP', 'MRS1', 'KOLAR'],
      required: true,
      default: 'DBP',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      required: true,
      default: 'Active',
    },
  },
  { timestamps: true }
);

driverSchema.index({ status: 1 });
driverSchema.index({ factory: 1 });

export default mongoose.model<IDriverDocument>('Driver', driverSchema);