import { sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import UnVerifiedVendor from '../../models/UnVerifiedVendor.js';
import { isValidObjectId } from 'mongoose';
import Category from '../../models/Category.js';

export const addVendorBecomePartner = async (req, res) => {
  try {

    let { category } = req.body;

    if (!category || !isValidObjectId(category)) {
      return sendResponseWithoutData(res, 200, true, 'Invalid category id provided!');
    }
    let checkCategory = await Category.findOne({ _id: category, isDeleted: false });
    if (!checkCategory) {
      return sendResponseWithoutData(res, 200, true, 'Invalid category id provided!');
    }


    const dataSave = await UnVerifiedVendor.create({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      gst: req.body.gst || '',
      pan: req.body.pan || '',
      aadhar: req.body.aadhar || '',
      segment: checkCategory.segment,
    });

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Vendor add successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Vendor registration failed!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};
