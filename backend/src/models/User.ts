import mongoose, { Schema, Document } from 'mongoose';

// Document extends our interface with Mongoose-specific fields
export interface IUserDocument extends Document {
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUserDocument>('User', userSchema);