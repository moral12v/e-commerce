import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import SubCategory from '../../models/SubCategory.js';

export const createSubCategory = async (req, res) => {
  try {
    let user = req.apiUser;

    const dataSave = await SubCategory.create({
      name: req.body.name,
      category: req.body.category,
      image: req.body.file || null,
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Sub Category has been added Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Sub Category failed to add!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listSubCatgory = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;
    let filter = { isDeleted: false };

    if (req.body.category) {
      filter.category = req.body.category;
    }

    let data = await SubCategory.find(filter)
      .populate([
        { path: 'category', select: '-isDeleted -createdAt -updatedAt -__v -isActive' },
        { path: 'image', select: '_id url' },
      ])
      .select('-isDeleted -__v')
      .lean();

    if (data.length > 0) {
      for (let cate of data) {
        if (cate.image && 'url' in cate.image && cate.image.url.length > 0) {
          let productUrl = cate.image.url.map((item) => {
            return `${protocol}://${hostname}/${item}`;
          });
          cate.image = productUrl;
        }
      }

      return sendResponseWithData(res, 200, true, 'Sub Category list fetched successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No sub category found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const subCategoryDetails = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;
    let subCategoryId = req?.params?.id;

    if (subCategoryId && isValidObjectId(subCategoryId)) {
      let subCategoryInfo = await SubCategory.findOne({ _id: subCategoryId, isDeleted: false })
        .select('-isDeleted -__v')
        .populate([
          {
            path: 'category',
            select: '-isDeleted -__v',
            populate: [
              { path: 'segment', select: '-isDeleted -__v -image' },
              { path: 'image', select: '-isDeleted -__v' },
            ],
          },
          { path: 'image', select: '_id url' },
        ])
        .lean();

      if (!subCategoryInfo) {
        return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
      }

      if (
        subCategoryInfo &&
        subCategoryInfo.image &&
        'url' in subCategoryInfo.image &&
        subCategoryInfo.image.url.length > 0
      ) {
        subCategoryInfo.image.url = subCategoryInfo.image.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
      }

      return sendResponseWithData(res, 200, true, 'Sub Category details fetched successfully!', subCategoryInfo);
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid sub category id!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    let user = req.apiUser;

    let dataSave = await SubCategory.updateOne(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          category: req.body.category,
          image: req.body.file || null,
          isActive: req.body.isActive,
          updatedBy: user._id,
          updatedAt: Date.now(),
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Sub Category has been updated successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Sub Category failed to update!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    let subCategoryId = req?.params?.id;

    if (!isValidObjectId(subCategoryId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid sub category Id!');
    }

    const subCategoryInfo = await SubCategory.findOne({ _id: subCategoryId, isDeleted: false });

    if (!subCategoryInfo) {
      return sendResponseWithoutData(res, 400, false, 'Invalid sub category Id!');
    }

    let dataSave = await SubCategory.updateOne(
      { _id: subCategoryId },
      {
        $set: {
          isDeleted: true,
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Sub Category has been deleted Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Sub Category failed to delete!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
