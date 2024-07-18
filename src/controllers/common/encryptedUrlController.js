import { errorLog } from '../../../config/logger.js';
import { sendErrorResponse, getJwtValue, sendResponseWithoutData } from '../../helpers/helper.js';
import User from '../../models/User.js';

export const encryptedUrl = async (req, res) => {
  try {
    let tokenValue = getJwtValue(req.params.token);

    if(!tokenValue){
      return sendResponseWithoutData(res, 400, false, 'Invalid Key, email verification failed!');
    }

    const currentTime = new Date();
    const newCurrentTime = new Date(currentTime.getTime() + 330 * 60000);

    let userData = await User.findOne({ email: tokenValue.email, isDeleted: false }).lean();

    if (!userData) {
      return sendResponseWithoutData(res, 400, false, 'Invalid Key, email verification failed!');
    }

    if (userData.otp !== tokenValue.otp) {
      return sendResponseWithoutData(res, 400, false, 'Invalid Key, email verification failed!');
    }

    if (userData.otpExpiryTime < newCurrentTime) {
      return sendResponseWithoutData(res, 400, false, 'Key expired, email verification failed!');
    }

    let updateVerification = await User.updateOne({ _id: userData._id }, { $set: { isVerified: true } });

    if (updateVerification.modifiedCount > 0) {
      await User.updateOne({ _id: userData._id }, { $set: { otp: null, otpExpiryTime: null } });
      return sendResponseWithoutData(res, 200, true, 'Email verified successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Email verification failed, try again in sometime!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};
