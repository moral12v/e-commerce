import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';

import PageCategory from '../../models/PageCategory.js';

export const createPageCategory = async (req, res) => {
  try {
    let user = req.apiUser;

    let { name } = req.body;

    let newData = {
      name,
      createdBy: user._id,
      updatedBy: user._id,
    };

    let dataSave = await PageCategory.create(newData);

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Category created successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Fail to create category, try again in sometime!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listPageCategory = async (req, res) => {
  try {
    let filter = { isDeleted: false };

    let data = await PageCategory.find(filter).select('-isDeleted -__v -updatedAt -createdAt').lean();

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Category list get fetched successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No categories found!', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const pageCategoryDetails = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await PageCategory.findOne(filter).select('-isDeleted -__v').lean();

      if (data) {
        return sendResponseWithData(res, 200, true, 'Category details fetched successfully', data);
      }
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateCategoryPage = async (req, res) => {
  try {
    let user = req.apiUser;

    let updatedData = {
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('name' in req.body) {
      updatedData.name = req.body.name;
    }

    let dataSave = await PageCategory.updateOne({ _id: req.params.id }, { $set: updatedData });

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Category has been updated successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Category fail to update, try again in sometime!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deletePageCategory = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await PageCategory.findOne(filter).select('-isDeleted -__v').lean();

      if (!data) {
        return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
      }

      let saveData = await PageCategory.updateOne({ _id: req.params.id }, { $set: { isDeleted: true } });
      if (saveData.modifiedCount > 0) {
        return sendResponseWithoutData(res, 200, true, 'Category deleted successfully');
      }
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
