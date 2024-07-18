import crypto from 'crypto';
import { errorLog } from '../../../config/logger.js';
import { createInvoice, sendErrorResponse, sendResponseWithoutData } from '../../helpers/helper.js';
import Order from '../../models/Order.js';
import Transaction from '../../models/Transaction.js';
import { MAILER_EMAIL, RAZORPAY_KEY_SECRET } from '../../../config/config.js';
import Cart from '../../models/Cart.js';
import { sendMail } from '../../../config/mailer.js';
import Address from '../../models/Address.js';


export const paymentVerification = async (req, res) => {
  try {
    const { order_id, payment_id } = req.body;
    const razorpay_signature = req.headers['x-razorpay-signature'];
    let user = req.apiUser;
    if (!razorpay_signature) {
      return sendResponseWithoutData(res, 400, false, 'Invalid or no signature!');
    }

    let hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);

    const generated_signature = hmac.update(order_id + '|' + payment_id).digest('hex');

    if (generated_signature === razorpay_signature) { 

      await Transaction.updateOne({ transactionId: order_id }, { $set: { status: 'confirmed' } });

      let transactionDetails = await Transaction.findOne({ transactionId: order_id }).lean();

      if (!transactionDetails) {
        return sendResponseWithoutData(res, 400, false, 'Signature matched but invalid transaction details!');
      }
 
      await Order.updateOne(
        { transactionDbId: transactionDetails._id },
        { $set: { "productDetails.$[].paymentStatus": 'paid' ,paymentStatus:'paid'} } 
      );

      let orderDetails = await Order.findOne({ transactionDbId: transactionDetails._id }).lean();

      let findAddress = await Address.findOne({_id:orderDetails?.shippingAddressId, isDeleted: false }).populate([{path:'city',select:"name"},{path:'state',select :'name'}])

      let invoicePath =await createInvoice({ name: user?.name, email :user?.email, mobile:user?.mobile, orderId: orderDetails?.orderId ,invoiceNo:orderDetails?.invoiceNo,createdAt: orderDetails?.createdAt,paymentMethod: orderDetails?.paymentMethod, addressName: findAddress?.name, street : findAddress?.street, city: findAddress?.city.name, state: findAddress?.state.name, products:orderDetails?.productDetails,totalAmountToPay:orderDetails?.totalAmountToPay });
    
      const mailOptions = {
        from: MAILER_EMAIL,
        to: user.email,
        subject: 'Invoice',
         
        attachments: [
          {
            filename: 'invoice.pdf',
           path: invoicePath,
          },
        ],
      };

      sendMail(mailOptions);

      if ('orderFrom' in orderDetails && orderDetails.orderFrom === 'cart') {
        let user = req.apiUser;
        await Cart.deleteMany({ user: user._id });
      }

      return sendResponseWithoutData(res, 200, true, 'Payment verified successfully');
    }

    await Transaction.updateOne({ transactionId: order_id }, { $set: { status: 'cancelled' } });
    let transactionDetails = await Transaction.findOne({ transactionId: order_id }).lean();

    if (!transactionDetails) {
      return sendResponseWithoutData(res, 400, false, 'Invalid transaction details!');
    }

    await Order.updateOne(
      { transactionDbId: transactionDetails._id },
      { $set: { "productDetails.$[].paymentStatus": 'unpaid' ,"productDetails.$[].status": 'cancelled',paymentStatus:'unpaid'} },
      
    );
    return sendResponseWithoutData(res, 400, false, 'Payment verification failed!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};



// export const paymentVerification = async (req, res) => {
//   try {
//     const { order_id, payment_id } = req.body;
//     const razorpay_signature = req.headers['x-razorpay-signature'];

//     if (!razorpay_signature) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid or no signature!');
//     }

//     let hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);

//     const generated_signature = hmac.update(order_id + '|' + payment_id).digest('hex');

    
//       if (generated_signature === razorpay_signature) {
//       await Transaction.updateOne({ transactionId: order_id }, { $set: { status: 'confirmed' } });

//       let transactionDetails = await Transaction.findOne({ transactionId: order_id }).lean();

//       if (!transactionDetails) {
//         return sendResponseWithoutData(res, 400, false, 'Signature matched but invalid transaction details!');
//       }

//       await Order.updateOne(
//         { transactionDbId: transactionDetails._id },
//         { $set: { paymentStatus: 'paid', status: 'confirmed' } },
//       );

//       let orderDetails = await Order.findOne({ transactionDbId: transactionDetails._id }).lean();

//       if ('orderFrom' in orderDetails && orderDetails.orderFrom === 'cart') {
//         let user = req.apiUser;
//         await Cart.deleteMany({ user: user._id });
//       }

//       return sendResponseWithoutData(res, 200, true, 'Payment verified successfully');
//     }

//     await Transaction.updateOne({ transactionId: order_id }, { $set: { status: 'cancelled' } });
//     let transactionDetails = await Transaction.findOne({ transactionId: order_id }).lean();

//     if (!transactionDetails) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid transaction details!');
//     }

//     await Order.updateOne(
//       { transactionDbId: transactionDetails._id },
//       { $set: { paymentStatus: 'unpaid', status: 'cancelled' } },
//     );
//     return sendResponseWithoutData(res, 400, false, 'Payment verification failed!');
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };







