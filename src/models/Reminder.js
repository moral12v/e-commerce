import { model, Schema } from 'mongoose';

const reminderSchema = Schema(
  {
    userId: { type: Schema.ObjectId, ref: 'user', required: true, index: true },
    eventName: { type: String, required: true, index: true },
    eventDate: { type: Date, required: true, index: true },
    description: { type: String, default: null },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true },
);

const Reminder = model('reminder', reminderSchema);
export default Reminder;
