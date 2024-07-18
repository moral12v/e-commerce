import bcrypt from 'bcrypt';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  hashPassword,
  matchPassword,
} from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import Segment from '../../models/Segment.js';

export const assistantProfile = async (req, res) => {
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

    user.role = await Role.findOne({_id:user.role,isDeleted:false}).select("_id name");
    user.segment = await Segment.findOne({_id:user.segment,isDeleted:false}).select("_id name");

    return sendResponseWithData(res, 200, true, 'Vendor profile fetched successfully!', user);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const assistantPasswordChange = async (req, res) => {
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
