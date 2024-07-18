import { model, Schema } from 'mongoose';

const eventGroupSchema = Schema(
  {
    name: { type: String, index: true },
    slug: { type: String, index: true },
    description: { type: String },
    image: { type: Schema.ObjectId, index: true, ref: 'file', default: null },
    group: { type: [{ type: Schema.ObjectId, ref: 'category' }], default: [] },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

const EventGroup = model('eventGroup', eventGroupSchema);

export default EventGroup;
