import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../../config/config.js';
import { errorLog } from '../../config/logger.js';

export const payment = async (data) => {
  let response = {
    status: false,
    reason: '',
  };

  try {
    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const amount = data.totalAmountToPay * 100;
    // const amount = 6;

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: data.invoiceNo,
      partial_payment: false,
      notes: {
        userId: data.userId,
        orderId: data.orderId,
      },
    };

    // calling function from razorpay sdk to create order
    let orderDetails = await instance.orders.create(options);

    if (orderDetails && 'error' in orderDetails) {
      response.reason = orderDetails.error?.description;
      return response;
    }

    response.status = true;
    response.data = orderDetails;
    return response;

  } catch (error) {
    errorLog(error);
    response.reason = error?.error?.description;
    return response;
  }
};
