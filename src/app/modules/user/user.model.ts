import { model, Schema } from 'mongoose';
import { IAuthProvider, IsActive, IUser, Role } from './user.interface';
import { Counter } from '../counter/counter.model';

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: {
      type: String,
      enum: ['google', 'credentials'],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
    },
    picture: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.INVESTOR,
    },
    userId: {
      type: Number,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    auths: [authProviderSchema],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Auto-increment userId before saving
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.userId = counter.seq;
  }
  next();
});

const User = model<IUser>('User', userSchema);

export { User };
