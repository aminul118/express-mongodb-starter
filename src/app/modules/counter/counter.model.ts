import { Schema, model } from 'mongoose';

interface ICounter {
  id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  },
);

const Counter = model<ICounter>('Counter', counterSchema);

export { Counter };
