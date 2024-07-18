import bcrypt from 'bcrypt';
import {
  getJwtToken,
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  matchPassword,
  hashPassword,
} from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';

export const adminLogin = async (req, res) => {
  try {
    let admin = await User.findOne({ email: req.body.email, type: 'admin', isDeleted: false, isActive: true }).select(
      '-isDeleted -isActive -otp -otpExpiryTime -__v',
    );

    if (admin && (await bcrypt.compare(req.body.password, admin.password))) {
      delete admin._doc.password;
      return sendResponseWithData(res, 200, true, 'Admin logged in successfully!', {
        ...admin._doc,
        token: getJwtToken({ id: admin.id }),
      });
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid credentials!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const adminProfile = async (req, res) => {
  try {
    let user = req.apiUser;

    delete user.password;
    delete user.isDeleted;
    delete user.__v;
    delete user.otp;
    delete user.otpExpiryTime;

    user.role = await Role.findOne({ _id: user.role, isDeleted: false }).select('_id name').lean();

    return sendResponseWithData(res, 200, true, 'Admin profile fetched successfully!', user);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const adminChangePassword = async (req, res) => {
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
