import { model, Schema } from 'mongoose';

const transactionSchema = Schema(
  {
    orderId: { type: String, index: true, require: true },
    transactionId: { type: String, index: true, require: true },
    amount: { type: Number, index: true, require: true },
    currency: { type: String, index: true, require: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    payment_gateway: { type: String, default: 'Razorpay' },
    invoice_number: { type: String, index: true, require: true },
  },
  {
    timestamps: true,
  },
);

const Transaction = model('transaction', transactionSchema);

export default Transaction;
