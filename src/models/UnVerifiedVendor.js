import { model, Schema } from 'mongoose';

const unVerifiedVendorSchema = Schema(
  {
    name: { type: String, index: true },
    email: { type: String, index: true },
    mobile: { type: String, index: true },
    pan: { type: String, default: null },
    gst: { type: String, default: null },
    aadhar: { type: String, default: null },
    segment: { type: Schema.ObjectId, index: true, ref: 'segment', default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isAdminApproved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const UnVerifiedVendor = model('un_verified_vendor', unVerifiedVendorSchema);
export default UnVerifiedVendor;
