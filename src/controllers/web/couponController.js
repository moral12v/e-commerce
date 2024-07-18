import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendErrorResponse, sendResponseWithoutData } from '../../helpers/helper.js';
import Coupon from '../../models/Coupon.js';

export const checkCoupon = async (req, res) => {
  try {
    if (!('code' in req.params)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid coupon!');
    }

    const currentDate = new Date();
    let couponDetails = await Coupon.findOne({
      code: req.params.code,
      isExpired: false,
      isActive: true,
      isDeleted: false,
      expiredAt: { $gt: currentDate },
    })
      .select('-isDeleted -isActive -__v -createdBy -createdAt -updatedBy -updatedAt')
      .lean();

    if (!couponDetails) {
      return sendResponseWithoutData(res, 400, false, 'Invalid or expired coupon!');
    }

    return sendResponseWithData(res, 200, true, 'Coupon is valid!', couponDetails);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
