import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  subject: string;
  chapter: string;
  title: string;
  order: number;
  createdAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    chapter: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
TopicSchema.index({ subject: 1, chapter: 1, order: 1 });

export const Topic = mongoose.model<ITopic>('Topic', TopicSchema);
