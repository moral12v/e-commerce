import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendErrorResponse,
  sendResponseWithoutData,
  matchPassword,
  hashPassword,
  authValues,
} from '../../helpers/helper.js';
// import Address from '../../models/Address.js';
import User from '../../models/User.js';

export const getProfile = async (req, res) => {
  try {
    let user = null;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return sendResponseWithoutData(res, 401, false, 'Unauthorized');
    }

    user = await authValues(token);
    if (!user) {
      return sendResponseWithoutData(res, 401, false, 'Invalid token');
    }

    let data = await User.findOne({ _id: user._id, isDeleted: false })
      .select(
        '-password -role -type -segment -isActive -isDeleted -otp -otpExpiryTime -updatedAt -createdAt -__v -createdBy -updatedBy',
      )
      .lean();

    if (data) {
      // let address = await Address.find({ userId: data._id, isDeleted: false })
      //   .populate([
      //     { path: 'city', select: '_id name' },
      //     { path: 'state', select: '_id name' },
      //   ])
      //   .select('-__v -isDeleted -createdAt -updatedAt -createdBy -updatedBy -userId')
      //   .lean();

      // data.address = address;

      return sendResponseWithData(res, 200, true, 'Profile fetched successfully', data);
    }

    return sendResponseWithData(res, 400, false, 'Profile not found', data);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const editProfile = async (req, res) => {
  try {
    let user = req.apiUser;
    let data = await User.findOne({ _id: user._id, isDeleted: false });

    if (!data) {
      return sendResponseWithoutData(res, 400, false, 'User not found');
    }

    let updationValue = {
      name: req.body.name,
      mobile: req.body.mobile,
    };

    if ('alternateMobile' in req.body && req.body.alternateMobile && req.body.alternateMobile.length > 0) {
      updationValue.alternateMobile = req.body.alternateMobile;
    }

    if ('title' in req.body && req.body.title) {
      updationValue.title = req.body.title;
    }

    let updateData = await User.updateOne({ _id: user._id, isDeleted: false }, { $set: updationValue });

    if (updateData.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Profile updated successfully');
    }

    return sendResponseWithoutData(res, 400, false, 'Profile updation failed!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const changePassword = async (req, res) => {
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

export const updateDeviceId = async (req, res) => {
  try {
    let user = req.apiUser;
    await User.findByIdAndUpdate(user?._id, { $set: { deviceId: req?.body?.deviceId } });
    return sendResponseWithoutData(res, 200, true, "Device Key has been Updated Successfully!!");
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
}