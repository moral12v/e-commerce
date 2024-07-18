import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  hashPassword,
  matchPassword,
} from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import User from '../../models/User.js';
import Segment from '../../models/Segment.js';

export const vendorProfile = async (req, res) => {
  try {
    let user = req.apiUser;

    if (!user.isActive) {
      return sendResponseWithoutData(res, 400, true, 'Your profile has been disabled!');
    }

    if (!user.isVerified) {
      return sendResponseWithoutData(res, 200, true, 'Your profile is not verified yet!');
    }
    delete user.password;
    delete user.isDeleted;
    delete user.__v;
    delete user.isActive;
    delete user.createdBy;
    delete user.updatedBy;

    let segmentDetails = await Segment.findOne({ isDeleted: false, _id: user.segment })
      .populate({ path: 'image', select: 'url' })
      .select('name image')
      .lean();

    if (segmentDetails) {
      if ('image' in segmentDetails && segmentDetails.image && segmentDetails.image.url.length > 0) {
        const hostname = req.headers.host;
        const protocol = req.protocol;
        let url = segmentDetails.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        segmentDetails.image = url;
      }
      user.segment = segmentDetails;
    } else {
      return sendResponseWithoutData(res, 400, false, 'Vendor segment is disabled!');
    }

    return sendResponseWithData(res, 200, true, 'Vendor profile fetched successfully!', user);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const vendorPasswordChange = async (req, res) => {
  try {
    let user = req.apiUser;
    let checkOldPass = await matchPassword(req.body.old, user.password);

    if (checkOldPass) {
      let updatePassword = await User.updateOne(
        { _id: user._id },
        {
          $set: {
            password: await hashPassword(req.body.new),
            updatedBy: user.updatedBy,
            updatedAt: Date.now(),
          },
        },
      );

      if (updatePassword.modifiedCount > 0) {
        return sendResponseWithoutData(res, 200, true, 'Password updated successfully!');
      } else {
        return sendResponseWithoutData(res, 400, false, 'Password updation failed!');
      }
    } else {
      return sendResponseWithoutData(res, 400, false, 'Incorrect old password!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
