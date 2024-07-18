import { model, Schema } from 'mongoose';

const settingSchema = Schema(
  {
    name: { type: String, index: true, require: true },
    data: { type: Object, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Setting = model('setting', settingSchema);

export default Setting;