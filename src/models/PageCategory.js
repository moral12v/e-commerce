import { model, Schema } from 'mongoose';

const pageCategorySchema = Schema(
  {
    name: { type: String, index: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

const PageCategory = model('pageCategory', pageCategorySchema);

export default PageCategory;
