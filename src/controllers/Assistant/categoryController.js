import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import Category from '../../models/Category.js';

// export const createCategory = async (req, res) => {
//   try {
//     let user = req.apiUser;

//     const dataSave = await Category.create({
//       name: req.body.name,
//       segment: user.segment,
//       createdBy: user._id,
//       updatedBy: user._id,
//     });

//     if (dataSave) {
//       return sendResponseWithoutData(res, 200, true, 'Category has been added successfully!');
//     } else {
//       return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
//     }
//   } catch (error) {
//     errorLog(error);
//     return sendErrorResponse(res);
//   }
// };

export const listCatgory = async (req, res) => {
  try {
    let user = req.apiUser;
    let data = await Category.find({ segment: user.segment, isDeleted: false })
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
    let user = req.apiUser;

    if (categoryId) {
      let categoryInfo = await Category.findOne({ _id: categoryId, segment: user.segment, isDeleted: false })
        .select('-isDeleted -__v')
        .populate({ path: 'segment', select: '_id name' })
        .lean();

      if (!categoryInfo) {
        return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
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

// export const updateCategory = async (req, res) => {
//   try {
//     let user = req.apiUser;
//     const category = await Category.findById(req.body.id);

//     if (category.segment.toHexString() !== user.segment.toHexString()) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid category segment!');
//     }

//     let dataSave = await Category.updateOne(
//       { _id: req.body.id },
//       {
//         $set: {
//           name: req.body.name,
//           isActive: req.body.isActive,
//           updatedBy: user._id,
//           updatedAt: Date.now(),
//         },
//       },
//     );

//     if (dataSave.modifiedCount > 0) {
//       return sendResponseWithoutData(res, 200, true, 'Category has been updated successfully!');
//     } else {
//       return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
//     }
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };

// export const deleteCategory = async (req, res) => {
//   try {
//     let categoryId = req?.params?.id;
//     let user = req.apiUser;

//     if (!isValidObjectId(categoryId)) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
//     }

//     const categoryInfo = await Category.findOne({ _id: categoryId, isDeleted: false });
    
//     if (!categoryInfo) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid category Id!');
//     }

//     if (categoryInfo.segment.toHexString() !== user.segment.toHexString()) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid category segment!');
//     }

//     let dataSave = await Category.updateOne(
//       { _id: categoryId },
//       {
//         $set: {
//           isDeleted: true,
//         },
//       },
//     );

//     if (dataSave.modifiedCount > 0) {
//       return sendResponseWithoutData(res, 200, true, 'Category has been deleted Successfully!');
//     } else {
//       return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
//     }
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };
