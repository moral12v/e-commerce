import bcrypt from 'bcrypt';
import {
  getJwtToken,
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
} from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import User from '../../models/User.js';

export const assistantLogin = async (req, res) => {
  try {
    let assistant = await User.findOne({
      email: req.body.email,
      type: 'assistant',
      isDeleted: false,
      isActive: true,
    }).select('-isDeleted -isActive -otp -otpExpiryTime -__v');

    if (assistant && (await bcrypt.compare(req.body.password, assistant.password))) {
      if (!assistant.isVerified) {
        return sendResponseWithoutData(res, 400, false, 'Account is not verified!');
      }

      return sendResponseWithData(res, 200, true, 'Assistant logged in successfully!', {
        verified: true,
        token: getJwtToken({ id: assistant.id }),
      });
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid credentials!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
