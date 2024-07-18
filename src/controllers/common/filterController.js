import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendErrorResponse, sendResponseWithoutData } from '../../helpers/helper.js';
import FilterCategory from '../../models/FilterCategory.js';
import FilterValue from '../../models/FilterValue.js';
import Sort from '../../models/Sort.js';

export const filterCategoryList = async (req, res) => {
  try {
    let filterCategoryData = await FilterCategory.find({ isDeleted: false, isActive: true })
      .select('name type multiSelect')
      .lean();

    let sortingData = await Sort.find({ isDeleted: false, isActive: true }).select("_id name").lean();

    if (filterCategoryData) {
      let result = [];
      for (let cat of filterCategoryData) {
        cat.value = await FilterValue.find({ filterCategoryId: cat._id, isDeleted: false, isActive: true })
          .select('min max match title')
          .lean();
        if (cat.value.length > 0) {
          result.push(cat);
        }
      }

      return res.status(200).json({
        status: true,
        msg: 'Filter category fetched successfully!',
        data: result,
        count: result.length,
        sorting: sortingData,
        sortingCount: sortingData.length,
      });
    }

    return res.status(400).json({
      status: false,
      msg: 'No filter category found!',
      data: result || [],
      count: result?.length || 0,
      sorting: sortingData || [],
      sortingCount: sortingData?.length || 0,
    });
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

// export const filterCategoryValue = async (req, res) => {
//   try {
//     if (!('id' in req.params) || !isValidObjectId(req.params.id)) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid filter category id!');
//     }

//     let filterCategoryDataValue = await FilterValue.find({
//       filterCategoryId: req.params.id,
//       isDeleted: false,
//       isActive: true,
//     })
//       .select('title min max match')
//       .lean();

//     if (filterCategoryDataValue) {
//       return sendResponseWithData(
//         res,
//         200,
//         true,
//         'Filter category value fetched successfully!',
//         filterCategoryDataValue,
//         true,
//       );
//     }
//     return sendResponseWithoutData(res, 400, false, 'Invalid filter category name!');
//   } catch (error) {
//     errorLog(error);
//     return sendErrorResponse(res);
//   }
// };
