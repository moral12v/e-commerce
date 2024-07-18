import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import Review from '../../models/Review.js';
import { isValidObjectId } from 'mongoose';
import VendorProduct from '../../models/VendorProduct.js';

export const getProductReviews = async (req, res) => {
  try {
    let getReviewsforProduct = await Review.find({
      productId: req.body.id,
    }).populate([{ path: "userId", select: "name" }, { path: "productId", select: "name" }]).select('-createdAt -updatedAt -__v');

    if (!getReviewsforProduct || getReviewsforProduct.length === 0) {
      return sendResponseWithoutData(res, 400, false, 'Product review not found!');
    }

    return sendResponseWithData(res, 200, true, 'Product review lists fetch successfully!', getReviewsforProduct);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    let { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid id!');
    }

    let review = await Review.findOneAndDelete({ _id: id });

    if (!review) {
      return sendResponseWithoutData(res, 404, false, 'Review not found!');
    }

    return sendResponseWithoutData(res, 200, true, 'Review deleted successfully!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateProductReview = async (req, res) => {
  try {
    let getReviewsforProduct = await Review.updateOne(
      {
        _id: req.body.id,
        // productId: req.body.id,
      },
      { $set: { rate: req.body.rate } },
    ).select('-createdAt -updatedAt -__v');

    if (!getReviewsforProduct) {
      return sendResponseWithoutData(res, 400, false, 'Product not found!');
    }

    return sendResponseWithoutData(res, 200, true, 'Product review update successfully!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
export const updateProductRating = async (req, res) => {
  try {
    let updateProductRating = await VendorProduct.updateOne(
      {
        _id: req.body.id,

      },
      { $set: { adminRating: req.body.rate } },
    ).select('-createdAt -updatedAt -__v');

    if (!updateProductRating) {
      return sendResponseWithoutData(res, 400, false, 'Product not found!');
    }

    return sendResponseWithoutData(res, 200, true, 'Product review update successfully!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
