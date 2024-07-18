import { model, Schema } from 'mongoose';

const vendorSchema = Schema(
  {
    userId: { type: Schema.ObjectId, index: true, ref: 'user' },
    name: { type: String, index: true },
    segment: { type: Schema.ObjectId, index: true, ref: 'segment', default: null },
    // products: { type: [Schema.ObjectId], index: true, ref: 'vendor_product', default: [] },
    pan: { type: String, default: null },
    gst: { type: String, default: null },
    aadhar: { type: String, default: null },
    totalOrdersReceived: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

const Vendor = model('vendor', vendorSchema);
export default Vendor;
