import { model, Schema } from 'mongoose';

const CartSchema = Schema(
  {
    product: { type: Schema.ObjectId, index: true, ref: 'vendor_product' },
    user: { type: Schema.ObjectId, index: true, ref: 'user' },
    nameOnCake: { type: String, },
    weightOfCake: { type: Number, },
    messageForCelebration: { type: String, },
    imageOnCake: { type: [Schema.ObjectId], ref: 'file', },
    deliveryDate: { type: Date },
    deliveryTime: { type: String, default: '00:00' },
    quantity: { type: Number, default: 1 },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

const Cart = model('cart', CartSchema);

export default Cart;
