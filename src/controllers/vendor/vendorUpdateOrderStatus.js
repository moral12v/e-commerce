import { MAILER_EMAIL } from "../../../config/config.js";
import { errorLog } from "../../../config/logger.js";
import { sendMail } from "../../../config/mailer.js";
import { createInvoice, mailOrderPlaceTemplate, sendErrorResponse, sendPushNotification, sendResponseWithoutData } from "../../helpers/helper.js";
import Address from "../../models/Address.js";
import Order from "../../models/Order.js";


// export const vendorUpateOrderStatus = async (req, res) => {
//     try {
//         let { id } = req.body;
//         let data = await Order.updateOne({ _id: id }, { $set: { status: req.body.status } });
//         if (data) {
//             return sendResponseWithoutData(res, 200, true, 'Update order status successfully!',);
//         } else {
//             return sendResponseWithoutData(res, 400, false, 'Fail to update status!');
//         }
//     } catch (error) {
//         errorLog(error);
//         return sendErrorResponse(res);
//     }
// };


export const vendorUpateOrderStatus = async (req, res) => {
    try {
        let { id, productId, status } = req.body;
        let user = req.apiUser;
        let updateFields = { "productDetails.$.status": status };
        if (status === 'delivered') {
            updateFields["productDetails.$.paymentStatus"] = 'paid';
        }

        let order = await Order.findOne({ _id: id, "productDetails.vendor": user._id }).populate({ path: 'userId', select: "name email mobile" });

        if (!order) {
            return sendResponseWithoutData(res, 400, false, 'Order not found!');
        }
        let link = `https://gamlewala.in/order/${order?.orderId}`
        const mailOptions = {
            from: MAILER_EMAIL,
            to: order?.userId?.email,
            subject: `Your order is ${status}`,
            html: mailOrderPlaceTemplate({ name: order?.userId?.name, orderId: order.orderId, status: status, link: link }),
        };

        sendMail(mailOptions);

        const productIndex = order.productDetails.findIndex(product => product._id.toString() === productId);

        if (productIndex === -1) {
            return sendResponseWithoutData(res, 400, false, 'Product not found in order!');
        }

        const data = await Order.updateOne(
            { _id: id, "productDetails._id": productId },
            { $set: updateFields }
        );

        order = await Order.findOne({ _id: id }).populate({ path: 'userId', select: "name email mobile" }).lean();
        let count = 0;

        for (let doc of order.productDetails) {
            if (doc?.paymentStatus === 'paid') {
                count++;
            }
        }

        if (count === 0) {
            await Order.updateOne({ _id: id }, { $set: { paymentStatus: 'unpaid' } });
        } else if (count === order.productDetails.length) {
            await Order.updateOne({ _id: id }, { $set: { paymentStatus: 'paid' } });
        } else {
            await Order.updateOne({ _id: id }, { $set: { paymentStatus: 'partial' } });
        }

        let findAddress = await Address.findOne({ _id: order?.shippingAddressId, isDeleted: false }).populate([{ path: 'city', select: "name" }, { path: 'state', select: 'name' }])
        let invoicePath = await createInvoice({ name: order?.userId?.name, email: order?.userId?.email, mobile: order?.userId?.mobile, orderId: order?.orderId, invoiceNo: order?.invoiceNo, createdAt: order?.createdAt, paymentMethod: order?.paymentMethod, addressName: findAddress?.name, street: findAddress?.street, city: findAddress?.city.name, state: findAddress?.state.name, products: order?.productDetails, totalAmountToPay: order?.totalAmountToPay });

        if (order?.paymentStatus === 'paid' && status === 'delivered') {
            const mailOptions = {
                from: MAILER_EMAIL,
                to: order?.userId?.email,
                subject: 'Invoice',
                attachments: [
                    {
                        filename: 'invoice.pdf',
                        path: invoicePath,
                    },
                ],
            };

            sendMail(mailOptions);
        }
        if (!data || data.modifiedCount === 0) {
            return sendResponseWithoutData(res, 400, false, 'Failed to update status for product!');
        }
        await sendPushNotification(order?.userId, `Your order is ${status}`, `Hello ${order?.userId?.name}, Thank you for shopping with Gamlewala! Your order ${order?.orderId} has been ${status}. You can track your order status in your account.`, "", "/order");

        return sendResponseWithoutData(res, 200, true, 'Update order status successfully!', data);
    } catch (error) {
        errorLog(error);
        return sendErrorResponse(res);
    }
};


