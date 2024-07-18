import { errorLog } from '../../../config/logger.js';
import { sendErrorResponse, sendResponseWithoutData } from '../../helpers/helper.js';
import VendorProduct from '../../models/VendorProduct.js';
import Review from '../../models/Review.js';
import ReviewLike from '../../models/ReviewsLike.js';

export const reviewProduct = async (req, res) => {
  try {
    let user = req.apiUser;

    let { id, rate } = req.body;

    let checkExistingReview = await Review.findOne({ userId: user._id, productId: id }).lean();
    if (checkExistingReview) {
      return sendResponseWithoutData(res, 400, false, 'You aleady reviewed this product!');
    }

    rate = rate < 3 ? 3 : rate;
    let comment = 'comment' in req.body && req.body.comment ? req.body.comment : '';

    let newData = {
      userId: user._id,
      productId: id,
      rate,
      comment,
    };

    let newRateData = await Review.create(newData);

    if (newRateData) {
      let getAvgRate = await Review.find({ productId: id }).select('rate -_id').lean();

      let rateSum = 0;
      for (const rate of getAvgRate) {
        rateSum += rate.rate;
      }
      const avg = rateSum / getAvgRate.length;

      await VendorProduct.updateOne({ _id: id }, { $set: { rating: Number(avg.toFixed(1)) || avg } });

      return sendResponseWithoutData(res, 200, true, 'Rating updated successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Fail to update rating!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const editReviewProduct = async (req, res) => {
  try {
    let { reviewId } = req.body;

    let reviewDetails = await Review.findById(reviewId).lean();

    let updatedData = {
      updatedAt: Date.now(),
    };

    if ('rate' in req.body && req.body.rate) {
      updatedData.rate = req.body.rate < 3 ? 3 : req.body.rate;
    }

    if ('comment' in req.body && req.body.comment) {
      updatedData.comment = 'comment' in req.body && req.body.comment ? req.body.comment : '';
    }

    if (Object.keys(updatedData).length === 0) {
      return sendResponseWithoutData(res, 200, true, 'Provide something update!');
    }

    let updateReview = await Review.updateOne({ _id: reviewId }, { $set: updatedData });

    if (updateReview.modifiedCount > 0) {
      let getAvgRate = await Review.find({ productId: reviewDetails.productId }).select('rate -_id').lean();

      let rateSum = 0;
      for (const rate of getAvgRate) {
        rateSum += rate.rate;
      }
      const avg = rateSum / getAvgRate.length;

      await VendorProduct.updateOne({ _id: reviewDetails.productId }, { $set: { rating: avg } });

      return sendResponseWithoutData(res, 200, true, 'Rating updated successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Fail to update rating!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const listReviewByProductId = async (req, res) => {
  try {
    let user = req.apiUser;
    let { productId } = req.body;

    const page = req.body.page || 1;
    const count = req.body.count || 10;

    const totalCount = await Review.countDocuments({ productId });
    let reviews = await Review.find({ productId })
      .populate([{ path: 'userId', select: 'name email' }])
      .select('-__v -productId -updatedAt')
      .skip((page - 1) * count)
      .limit(count)
      .lean();

    if (reviews.length > 0) {
      for (let rev of reviews) {
        rev.likedByMe = false;
        let checkLiked = await ReviewLike.findOne({ reviewId: rev._id, likedBy: user._id });
        if (checkLiked) {
          rev.likedByMe = true;
        }
      }

      let getRating = await VendorProduct.findById(productId).select('rating').lean();
      return res.status(200).json({
        status: true,
        msg: 'Rating list fetched successfully!',
        avgRating: getRating.rating || null,
        data: reviews,
        totalCount,
      });
    }

    return sendResponseWithoutData(res, 200, true, "Product doesn't have any review!");
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const likeReview = async (req, res) => {
  try {
    const user = req.apiUser;

    let { reviewId } = req.body;

    let checkLike = await ReviewLike.findOne({ reviewId: reviewId });

    if (checkLike) {
      return sendResponseWithoutData(res, 200, true, 'You have already liked this review!');
    }

    let reviewDetails = await Review.findById(reviewId).lean();

    let createLikeData = await ReviewLike.create({
      reviewId,
      productId: reviewDetails.productId,
      likedBy: user._id,
    });

    if (createLikeData) {
      await Review.updateOne({ _id: reviewId }, { $set: { like: Number(reviewDetails.like) + 1 } });
      return sendResponseWithoutData(res, 200, true, 'Review liked successfully!');
    }

    return sendResponseWithoutData(res, 200, true, 'Failed to like the review!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const unlikeReview = async (req, res) => {
  try {
    const user = req.apiUser;

    let { reviewId } = req.body;

    let checkLike = await ReviewLike.findOne({ reviewId: reviewId });

    if (!checkLike) {
      return sendResponseWithoutData(res, 200, true, "You haven't liked this review yet!");
    }

    let reviewDetails = await Review.findById(reviewId).lean();

    let createLikeData = await ReviewLike.deleteOne({ reviewId, likedBy: user._id });

    console.log(createLikeData);

    if (createLikeData) {
      await Review.updateOne({ _id: reviewId }, { $set: { like: Number(reviewDetails.like) - 1 } });
      return sendResponseWithoutData(res, 200, true, 'Review unliked successfully!');
    }

    return sendResponseWithoutData(res, 200, true, 'Failed to unlike the review!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
