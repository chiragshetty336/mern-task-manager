import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicleDocument extends Document {
  vehicleId: string;
  registrationNumber: string;
  type: 'Truck' | 'Van' | 'Bike' | 'Tempo';
  factory: 'DBP' | 'MRS1' | 'KOLAR';
  status: 'ON ROAD' | 'MAINTENANCE' | 'STANDBY';
  assignedDriver?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicleDocument>(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Truck', 'Van', 'Bike', 'Tempo'],
      required: true,
    },
    factory: {
      type: String,
      enum: ['DBP', 'MRS1', 'KOLAR'],
      required: true,
    },
    status: {
      type: String,
      enum: ['ON ROAD', 'MAINTENANCE', 'STANDBY'],
      required: true,
      default: 'STANDBY',
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ status: 1 });
vehicleSchema.index({ factory: 1 });

export default mongoose.model<IVehicleDocument>('Vehicle', vehicleSchema);