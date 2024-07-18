import { model, Schema } from 'mongoose';

const sortSchema = Schema(
  {
    name: { type: String, require: true },
    field: { type: String, require: true },
    type: { type: String, enum: ['ascending', 'descending'], default: 'ascending' },
    value: { type: Number, enum: [1, -1], default: 1 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Sort = model('sort', sortSchema);

export default Sort;
