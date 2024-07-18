import { model, Schema } from 'mongoose';

const pageSchema = Schema(
  {
    category: { type: Schema.ObjectId, index: true, ref: 'pageCategory', default: null },
    title: { type: String, index: true },
    slug: { type: String, index: true },
    description: { type: String, default: '' },
    content: { type: String, default: '' },
    icon: { type: Schema.ObjectId, index: true, ref: 'file', default: null },
    darkModeIcon: { type: Schema.ObjectId, index: true, ref: 'file', default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

const Page = model('page', pageSchema);

export default Page;
