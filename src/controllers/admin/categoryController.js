import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  updateFilter,
  removeFilter,
  addFilter,
  removeSpace,
} from '../../helpers/helper.js';
import Category from '../../models/Category.js';
import Segment from '../../models/Segment.js';

export const createCategory = async (req, res) => {
  try {
    let user = req.apiUser;

    let checkSegment = await Segment.findOne({ _id: req.body.segment, isDeleted: false });

    let categoryName = removeSpace(req.body.name.toLowerCase(), "-");
    let segmentName = removeSpace(checkSegment.name.toLowerCase(), "-");

    let createSlug = `${categoryName}-${segmentName}-${Date.now()}`;
    let checkSlugExists = await Category.findOne({ slug: createSlug });

    if (checkSlugExists) {
      return sendResponseWithoutData(res, 400, false, 'Category addition failed, try again in sometime!');
    }

    const dataSave = await Category.create({
      name: req.body.name,
      slug: createSlug,
      segment: req.body.segment,
      image: req.body.file,
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (dataSave) {
      await addFilter('Category', req.body.name, dataSave.id);
      return sendResponseWithoutData(res, 200, true, 'Category has been added Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listCatgory = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;
    let filter = { isDeleted: false };

    if (req.body.segment) {
      filter.segment = req.body.segment;
    }

    let data = await Category.find(filter)
      .populate([
        { path: 'segment', select: '-isDeleted -createdAt -updatedAt -__v -isActive' },
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
    const hostname = req.headers.host;
    const protocol = req.protocol;
    let categoryId = req?.params?.id;

    if (categoryId && isValidObjectId(categoryId)) {
      let categoryInfo = await Category.findOne({ _id: categoryId, isDeleted: false })
        .select('-isDeleted -__v')
        .populate([
          { path: 'segment', select: '-isDeleted -__v' },
          { path: 'image', select: '_id url' },
        ])
        .lean();

      if (!categoryInfo) {
        return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
      }

      if (categoryInfo && categoryInfo.image && 'url' in categoryInfo.image && categoryInfo.image.url.length > 0) {
        categoryInfo.image.url = categoryInfo.image.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
      }

      return sendResponseWithData(res, 200, true, 'Category details fetched successfully!', categoryInfo);
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateCategory = async (req, res) => {
  try {
    let user = req.apiUser;

    let updatedData = {
      name: req.body.name,
      segment: req.body.segment,
      isActive: req.body.isActive,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('file' in req.body && req.body.file) {
      updatedData.image = req.body.file;
    }

    if ('slug' in req.body && req.body.slug) {

      let categoryName = removeSpace(req.body.slug.toLowerCase(), "-")
      updatedData.slug = categoryName;
    }

    let dataSave = await Category.updateOne(
      { _id: req.body.id },
      {
        $set: updatedData,
      },
    );

    if (dataSave.modifiedCount > 0) {
      updateFilter('Category', req.body.id, req.body.name);
      return sendResponseWithoutData(res, 200, true, 'Category has been updated successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    let categoryId = req?.params?.id;

    if (!isValidObjectId(categoryId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid category Id!');
    }

    const categoryInfo = await Category.findOne({ _id: categoryId, isDeleted: false });

    if (!categoryInfo) {
      return sendResponseWithoutData(res, 400, false, 'Invalid category Id!');
    }

    let dataSave = await Category.updateOne(
      { _id: categoryId },
      {
        $set: {
          isDeleted: true,
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      await removeFilter('Category', categoryId);
      return sendResponseWithoutData(res, 200, true, 'Category has been deleted Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const addSlugInCategory = async (req, res) => {
  try {
    let findAllCategory = await Category.find();

    for (let data of findAllCategory) {

      let findSegment = await Segment.findOne({ _id: data.segment, isDeleted: false }).lean();
      if (findSegment) {

        let name = removeSpace(data.name.toLowerCase(), "-");
        let categoryName = removeSpace(findSegment.name.toLowerCase(), "-");
        let createSlug = `${name}-${categoryName}-${Date.now()}`;

        await Category.updateOne({ _id: data._id }, { $set: { slug: createSlug } });
      }
    }

    return sendResponseWithoutData(res, 200, true, 'Slugs updated successfully in category!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};