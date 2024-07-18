import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendErrorResponse } from '../../helpers/helper.js';
import Category from '../../models/Category.js';
import Segment from '../../models/Segment.js';
import SubCategory from '../../models/SubCategory.js';

export const listSegment = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let data = await Segment.find({ isDeleted: false })
      .populate({ path: 'image', select: '_id url' })
      .select('_id name slug image')
      .lean();



    for (let segment of data) {
      if (segment.image && 'url' in segment.image && segment.image.url.length > 0) {
        let segmentUrl = segment.image.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
        segment.image = segmentUrl;
      } else {
        segment.image = null;
      }
    }

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Segment list get Successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No segment found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const listSegmentWithCategory = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let data = await Segment.find({ isDeleted: false })
      .populate({ path: 'image', select: '_id url' })
      .select('_id name image slug')
      .lean();

    for (let segment of data) {
      if (segment.image && 'url' in segment.image && segment.image.url.length > 0) {
        let segmentUrl = segment.image.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
        segment.image = segmentUrl;
      } else {
        segment.image = null;
      }

      let segmentCategories = await Category.find({ segment: segment._id, isDeleted: false, isActive: true })
        .populate({ path: 'image', select: '_id url' })
        .select('_id name image slug')
        .lean();

      for (let category of segmentCategories) {
        if (category && category.image && 'url' in category.image && category.image.url.length > 0) {
          let categoryUrl = category.image.url.map((item) => {
            return `${protocol}://${hostname}/${item}`;
          });
          category.image = categoryUrl;
        } else {
          category.image = null;
        }
      }

      for (let cats of segmentCategories) {
        let segmentSubCategories = await SubCategory.find({ category: cats._id, isDeleted: false, isActive: true })
          .populate({ path: 'image', select: '-_id url' })
          .select('_id name image')
          .lean();

        for (let category of segmentSubCategories) {
          if (category && category.image && 'url' in category.image && category.image.url.length > 0) {
            let subCategoryUrl = category.image.url.map((item) => {
              return `${protocol}://${hostname}/${item}`;
            });
            category.image = subCategoryUrl;
          } else {
            category.image = null;
          }
        }

        cats.subCategory = segmentSubCategories;
      }

      segment.category = segmentCategories;
    }

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Segment list with categories fetched successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No segment found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
