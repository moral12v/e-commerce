import { model, Schema } from 'mongoose';

const calendarSchema = Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    image: { type: Schema.ObjectId, index: true, ref: 'file' },
    // items: { type: [{ type: Schema.ObjectId, index: true, ref: 'product' }], default: [] },
    package: { type: Schema.ObjectId, index: true, ref: 'pooja_package', default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

const Calendar = model('calendar', calendarSchema);

export default Calendar;
