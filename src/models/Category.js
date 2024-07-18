import { model, Schema } from 'mongoose';

const categorySchema = Schema(
  {
    name: { type: String, index: true },
    slug: { type: String, index: true },
    segment: { type: Schema.ObjectId, index: true, ref: 'segment' },
    image: { type: Schema.ObjectId, index: true, ref: 'file', default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String }
  },
  { timestamps: true },
);

const Category = model('category', categorySchema);

export default Category;