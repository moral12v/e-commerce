import { model, Schema } from 'mongoose';

const userSchema = Schema(
  {

    deviceId: { type: String, default: null },
    title: { type: String, default: null },
    name: { type: String, index: true },
    email: { type: String, index: true },
    password: { type: String },
    mobile: { type: String, index: true },
    alternateMobile: { type: String, default: null },
    role: { type: Schema.ObjectId, index: true, ref: 'role' },
    type: { type: String },
    segment: { type: Schema.ObjectId, index: true, ref: 'segment', default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    loginType: { type: String, enum: ['normal', 'google'], default: 'normal' },
    otp: { type: Number, default: null },
    otpExpiryTime: { type: Date, default: null },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

const User = model('user', userSchema);
export default User;
