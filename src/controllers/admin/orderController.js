import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendErrorResponse,
  sendResponseWithoutData,
  makeObjectId,
} from '../../helpers/helper.js';

import Order from '../../models/Order.js';

export const orderLists = async (req, res) => {
  try {
    let filterValues = {};

    if (req.body.filter) {
      filterValues.status = req.body.filter;
    }

    let data = await Order.find(filterValues)
      .populate({ path: 'userId', select: 'name email mobile alternateMobile' }).sort({ createdAt: -1 })
      .select('-__v')
      .lean();


    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Order list get Successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No Order found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const orderDetails = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id };

      const hostname = req.headers.host;
      const protocol = req.protocol;

      let data = await Order.findOne(filter)
        .populate([
          { path: 'userId', select: 'name email mobile alternateMobile' },
          {
            path: 'shippingAddressId',
            select: '-isDefault -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v',
            populate: [
              { path: 'city', select: 'name' },
              { path: 'state', select: 'name code' },
            ],
          },
          {
            path: 'productDetails',
            populate: [
              { path: 'image', select: 'name url' },
              { path: 'subCategory', select: 'name isActive' },
              { path: 'category', select: 'name isActive' },
              { path: 'segment', select: 'name isActive slug' },
              {
                path: 'vendor',
                select:
                  '-password -otpExpiryTime -otp -role -segment -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v',
              },
            ],
          },
        ])
        .select('-__v')
        .lean();

      if (data) {
        if (data.productDetails && data.productDetails.length > 0) {
          for (let product of data.productDetails) {
            if (product && product.image && product.image.url) {
              product.image.url = product.image.url.map((item) => `${protocol}://${hostname}/${item}`);
            }
          }
        }
        return sendResponseWithData(res, 200, true, 'Order details get Successfully', data, true);
      }
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid order id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
