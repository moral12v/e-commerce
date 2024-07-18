import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  generateRandomCouponCode,
} from '../../helpers/helper.js';
import Coupon from '../../models/Coupon.js';

export const createCoupon = async (req, res) => {
  try {
    let user = req.apiUser;

    let { type, discount, totalLimit, userLimit, expiredAt } = req.body;

    let discountUpTo = Number(req.body.discountUpTo) || null;

    if (type === 'percentage' && !discountUpTo) {
      return sendResponseWithoutData(
        res,
        400,
        false,
        'discountUpTo value should be an positive integer when used with type -> percentage!',
      );
    }

    let code = req.body.code || null;

    if (!code) {
      code = generateRandomCouponCode();
    }

    if (!code) {
      return sendResponseWithoutData(res, 400, false, 'Coupon generation failed, try again!');
    }

    let checkExist = await Coupon.findOne({ code, isDeleted: false });

    if (checkExist) {
      return sendResponseWithoutData(
        res,
        400,
        false,
        'Coupon with this code already exists, try with some different code!',
      );
    }

    const dataSave = await Coupon.create({
      code: code,
      type,
      discount,
      discountUpTo: type === 'flat' ? null : discountUpTo,
      totalLimit,
      userLimit,
      expiredAt,
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Coupon has been added successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Coupon fail to add, try again in sometime!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listCoupon = async (req, res) => {
  try {
    let filter = { isDeleted: false };

    if ('type' in req.body && (req.body.type === 'flat' || req.body.type === 'percentage')) {
      filter.type = req.body.type;
    }

    if ('expired' in req.body) {
      const currentDate = new Date();
      if (Number(req.body.expired) === 0) {
        filter.expiredAt = { $gt: currentDate };
      } else if (Number(req.body.expired) === 1) {
        filter.expiredAt = { $lt: currentDate };
      }
    }

    let data = await Coupon.find(filter).select('-isDeleted -__v').lean();

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Coupon list get Successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No Coupon   found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const couponDetails = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await Coupon.findOne(filter)
        .populate([
          { path: 'createdBy', select: 'name email mobile role type isActive createdAt updatedAt' },
          { path: 'updatedBy', select: 'name email mobile role type isActive createdAt updatedAt' },
        ])
        .select('-isDeleted -__v')
        .lean();

      if (data) {
        return sendResponseWithData(res, 200, true, 'Coupon details fetched successfully', data);
      }

      return sendResponseWithoutData(res, 400, false, 'Invalid coupon id', data);
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid coupon id');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateCoupon = async (req, res) => {
  try {
    let user = req.apiUser;

    let { code, type, discount, totalLimit, userLimit, expiredAt } = req.body;

    let discountUpTo = Number(req.body.discountUpTo) || null;

    if (type === 'percentage' && !discountUpTo) {
      return sendResponseWithoutData(
        res,
        400,
        false,
        'discountUpTo value should be an positive integer when used with type -> percentage!',
      );
    }

    let dataSave = await Coupon.updateOne(
      { _id: req.body.id },
      {
        $set: {
          code: code,
          type,
          discount,
          discountUpTo: type === 'flat' ? null : discountUpTo,
          totalLimit,
          userLimit,
          expiredAt,
          updatedBy: user._id,
          updatedAt: Date.now(),
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Coupon has been updated successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Coupon fail to update, try again in sometime!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await Coupon.findOne(filter).lean();

      if (!data) {
        return sendResponseWithoutData(res, 400, false, 'Invalid coupon id', data);
      }

      let deleteCoupon = await Coupon.updateOne(filter, { $set: { isDeleted: true } });

      if (deleteCoupon.modifiedCount > 0) {
        return sendResponseWithData(res, 200, true, 'Coupon deleted successfully!');
      }
      return sendResponseWithoutData(res, 400, false, 'Coupon fail to delete, try again in sometime!');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid coupon id');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
