import { sendErrorResponse, sendResponseWithData } from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import Segment from '../../models/Segment.js';
import Category from '../../models/Category.js';
import SubCategory from '../../models/SubCategory.js';
import VendorProduct from '../../models/VendorProduct.js';

export const globalSearch = async (req, res) => {
  try {
    let { search } = req.body;

    let data = [];

    const commonFilter = { isDeleted: false, isActive: true };

    // SEGMENT SECTION START
    let segmentFilter = { ...commonFilter, $or: [{ name: { $regex: search, $options: 'i' } }] };

    let segmentMatch = await Segment.aggregate([
      { $match: segmentFilter },
      { $limit: 20 },
      {
        $project: {
          type: { $literal: 'segment' },
          name: 1,
          image: 1,
        },
      },
    ]);

    data = data.concat(segmentMatch);

    // CATEGORY SECTION START
    let categoryFilter = { ...commonFilter, $or: [{ name: { $regex: search, $options: 'i' } }] };

    let categoryMatch = await Category.aggregate([
      { $match: categoryFilter },
      { $limit: 20 },
      {
        $project: {
          type: { $literal: 'category' },
          name: 1,
          image: 1,
        },
      },
    ]);

    data = data.concat(categoryMatch);

    // SUB-CATEGORY SECTION START
    // let subcategoryFilter = { ...commonFilter, $or: [{ name: { $regex: search, $options: 'i' } }] };

    // let subcategoryMatch = await SubCategory.aggregate([
    //   { $match: subcategoryFilter },
    //   { $limit: 20 },
    //   {
    //     $project: {
    //       type: { $literal: 'sub_category' },
    //       name: 1,
    //       image: 1,
    //     },
    //   },
    // ]);

    // data = data.concat(subcategoryMatch);

    // PRODUCT SECTION START
    let productFilter = {
      ...commonFilter,
      status: 'approved',
      $or: [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }],
    };

    const hostname = req.headers.host;
    const protocol = req.protocol;

    let productMatch = await VendorProduct.aggregate([
      { $match: productFilter },
      {
        $lookup: {
          from: 'files',
          localField: 'image',
          foreignField: '_id',
          as: 'image',
        },
      },
      { $limit: 20 },
      {
        $addFields: {
          imageUrl: {
            $cond: {
              if: { $eq: ['$image', null] },
              then: null,
              else: {
                $concat: [protocol, '://', hostname, '/', { $arrayElemAt: [{ $arrayElemAt: ['$image.url', 0] }, 0] }],
              },
            },
          },
        },
      },
      {
        $project: {
          type: { $literal: 'product' },
          image: '$imageUrl',
          slug: 1,
          name: 1,
          description: 1,
          subCategory: 1,
          category: 1,
          segment: 1,
        },
      },
    ]);

    data = data.concat(productMatch);

    if (data && data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Search keyword matched!', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No match found!', [], true);
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};
