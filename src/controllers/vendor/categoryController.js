import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import Category from '../../models/Category.js';

export const listCategory = async (req, res) => {
  try {
    let user = req.apiUser;

    let data = await Category.find({ isDeleted: false, segment: user.segment })
      .populate({ path: 'segment', select: '-isDeleted -createdAt -updatedAt -__v -isActive' })
      .select('-isDeleted -__v');

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Category list get Successfully', data, true);
    }
    return sendResponseWithData(res, 200, true, 'No category found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const categoryDetails = async (req, res) => {
  try {
    let categoryId = req?.params?.id;

    if (categoryId && isValidObjectId(categoryId)) {
      let categoryInfo = await Category.findOne({ _id: categoryId, isDeleted: false })
        .select('-isDeleted -__v')
        .populate({ path: 'segment', select: '-isDeleted -__v' });

      if (!categoryInfo) {
        return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
      }

      return sendResponseWithData(res, 200, true, 'Category details fetched successfully!', categoryInfo._doc);
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
