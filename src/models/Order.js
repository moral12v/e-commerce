import { model, Schema } from 'mongoose';

const orderProductSchema = Schema({
  name: { type: String, index: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'delivered', 'processed', 'dispatched'],
    default: 'pending',
    require: true,
  },
  reason: { type: String, default: null },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid', index: true },
  nameOnCake: { type: String },
  weightOfCake: { type: Number },
  messageForCelebration: { type: String },
  imageOnCake: { type: [Schema.ObjectId], ref: 'file', },
  subCategory: { type: Schema.ObjectId, index: true, ref: 'sub_category', default: null },
  category: { type: Schema.ObjectId, index: true, ref: 'category' },
  extraDiscount: { type: Number, index: true, default: 0 },
  segment: { type: Schema.ObjectId, index: true, ref: 'segment' },
  image: { type: [Schema.Types.ObjectId], index: true, ref: 'file', default: null },
  price: { type: Number, index: true, default: 0 },
  vendorPrice: { type: Number, index: true, default: 0 },
  mrp: { type: Number, default: 0 },
  // totalMrp: { type: Number, index: true, default: 0 },
  shippingCost: { type: Number, index: true, default: 0 },
  discount: { type: Number, index: true, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  amountToPay: { type: Number, index: true, default: 0 },
  vendor: { type: Schema.ObjectId, index: true, ref: 'user' },
  quantity: { type: Number, default: 0 },
  totalMrp: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  deliveryDate: { type: Date, required: true },
  deliveryTime: { type: String, default: '00:00' },
  deliveryTypes: { type: String, enum: ['home', 'office', 'celebration'], index: true, },
});

const orderSchema = Schema(
  {
    orderId: { type: String, unique: true, require: true },
    userId: { type: Schema.Types.ObjectId, ref: 'user', index: true, require: true },
    couponId: { type: Schema.Types.ObjectId, ref: 'coupon', index: true, default: null },
    couponCode: { type: String, index: true, default: null },
    orderFrom: { type: String, enum: ['cart', 'product', 'package'], require: true, index: true, },
    paymentMethod: { type: String, enum: ['cod', 'online'], require: true, index: true },
    paymentStatus: { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid', index: true },
    shippingMethod: { type: String, enum: ['standard', 'free'], require: true },
    isOrderCancelAble: { type: Boolean, index: true, default: true },
    // deliveryType: { type: String, enum: ['local', 'partner', 'both '], index: true, require: true },
    totalMrp: { type: Number, index: true, default: 0 },
    totalPrice: { type: Number, default: 0 },
    // subTotal: { type: Number, index: true, default: 0 },
    shippingAddressId: { type: Schema.Types.ObjectId, ref: 'address', index: true },
    // discount: { type: Number, index: true, default: 0 },
    // couponDiscount: { type: Number, default: 0 },
    invoiceNo: { type: String, index: true, require: true },
    // tax: { type: String, index: true, default: null },
    shippingCost: { type: Number, index: true, default: 0 },
    totalAmountToPay: { type: Number, index: true, default: 0 },
    productDetails: { type: [orderProductSchema], index: true, default: [] },
    // shiprocketDetails: { type: Array, index: true, default: [] },
    transactionDbId: { type: Schema.Types.ObjectId, ref: 'transaction', index: true, default: null },
  },
  {
    timestamps: true,
  },
);

const Order = model('order', orderSchema);

export default Order;
