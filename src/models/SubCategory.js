import { model, Schema } from 'mongoose';

const subCategorySchema = Schema(
  {
    name: { type: String, index: true },
    category: { type: Schema.ObjectId, index: true, ref:'category' },
    image: { type: Schema.ObjectId, index: true, ref: 'file', default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String}
  },
  { timestamps: true },
);

const SubCategory = model('sub_category', subCategorySchema);

export default SubCategory;