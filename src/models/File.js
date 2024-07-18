import { model, Schema } from 'mongoose';

const fileSchema = Schema(
  {
    url: { type: [String] },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

const File = model('file', fileSchema);

export default File;
