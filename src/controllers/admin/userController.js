import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  hashPassword,
} from '../../helpers/helper.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import { isValidObjectId } from 'mongoose';
import Vendor from '../../models/Vendor.js';
import Segment from '../../models/Segment.js';

export const createUser = async (req, res) => {
  try {
    let user = req.apiUser;

    const role = await Role.findOne({ _id: req.body.role, isDeleted: false });


    const dataSave = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: await hashPassword(req.body.password),
      mobile: req.body.mobile,
      type: role.name,
      role: req.body.role,
      segment: req.body.segment,
      isVerified: true,
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'User has been added Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const createCustomer = async (req, res) => {
  try {
    let user = req.apiUser;

    const role = await Role.findOne({ name: 'customer', isActive: true, isDeleted: false }).lean();

    const dataSave = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: await hashPassword(req.body.password),
      mobile: req.body.mobile,
      type: role.name,
      role: role._id,
      segment: null,
      isVerified: true,
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Customer has been added successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listUser = async (req, res) => {
  try {
    const url = req?.url.split('/');

    let filter = { isDeleted: false };

    if (url[url.length - 1] === 'assistant') {
      filter.type = 'assistant';
    } else if (url[url.length - 1] === 'vendor') {
      filter.type = 'vendor';
    } else if (url[url.length - 1] === 'customer') {
      filter.type = 'customer';
    } else {
      return sendResponseWithoutData(res, 400, false, 'Role not found!');
    }

    if (req.body.verifyCheck) {
      filter.isVerified = Number(req.body.verifyCheck) === 1 ? true : false;
    }

    let data = await User.find(filter)
      .populate({ path: 'segment', select: '_id name' })
      .select('-password -isDeleted -__v');

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'User List get Successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No user found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

// export const listAssistant = async (req, res) => {
//   try {
//     let user = req.apiUser;
// console.log(req.url);
//     let filter = { isDeleted: false };

//     if(req.body.verifyCheck){
//       filter.isVerified = req.body.verifyCheck;
//     }

//     let data = await User.find(filter)
//     .populate({ path: 'segment', select: '_id name' })
//     .select('-password -isDeleted -__v');

//     // if (req.body.verifyCheck) {
//     //   data = await User.find(filter)
//     //     .populate({ path: 'segment', select: '_id name' })
//     //     .select('-password -isDeleted -__v');
//     // } else {
//     //   data = await User.find({ role: { $ne: user.role }, isDeleted: false })
//     //     .populate({ path: 'segment', select: '_id name' })
//     //     .select('-password -isDeleted -__v');
//     // }

//     if (data.length > 0) {
//       return sendResponseWithData(res, 200, true, 'Assistant list fetched successfully', data, true);
//     }

//     return sendResponseWithData(res, 200, true, 'No assistant found', data, true);
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };

export const userDetails = async (req, res) => {
  try {
    let userId = req?.params?.id;

    if (userId && isValidObjectId(userId)) {
      let userInfo = await User.findOne({ _id: userId, isDeleted: false })
        .select('-password -isDeleted -__v')
        .populate([
          { path: 'role', select: '-isDeleted -__v -createdAt -updatedAt' },
          { path: 'segment', select: '-isDeleted -__v -createdAt -updatedAt' },
        ])
        .lean();

      if (!userInfo) {
        return sendResponseWithoutData(res, 400, false, 'Invalid user id!');
      }

      userInfo.createdBy = await User.findOne({ _id: userInfo.createdBy, isDeleted: false }).select(
        '-password -isDeleted -__v -isVerified -isEmailVerify -otp -otpExpiryTime -createdAt -updatedAt -segment',
      );

      userInfo.updatedBy = await User.findOne({ _id: userInfo.updatedBy, isDeleted: false }).select(
        '-password -isDeleted -__v -isVerified -isEmailVerify -otp -otpExpiryTime -createdAt -updatedAt -segment',
      );

      return sendResponseWithData(res, 200, true, 'Vendor details fetched successfully!', userInfo);
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid user id!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateUser = async (req, res) => {
  try {
    let user = req.apiUser;
    const role = await Role.findOne({ _id: req.body.role, isDeleted: false });

    if (role.name !== 'customer') {
      if ('segment' in req.body && req.body.segment) {
        if (!isValidObjectId(req.body.segment)) {
          return sendResponseWithoutData(res, 400, false, 'Invalid segment!');
        }
        const checkExists = await Segment.findOne({ _id: req.body.segment, isActive: true, isDeleted: false });

        if (!checkExists) {
          return sendResponseWithoutData(res, 400, false, 'Invalid segment!');
        }
      } else {
        return sendResponseWithoutData(res, 400, false, 'Segment value is required');
      }
    }

    let dataSave = await User.updateOne(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          role: req.body.role,
          mobile: req.body.mobile,
          role: req.body.role,
          type: role.name,
          segment: role.name !== 'customer' ? req.body.segment : null,
          isActive: req.body.isActive,
          isVerified: req.body.isVerified,
          updatedBy: user._id,
          updatedAt: Date.now(),
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'User has been updated Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateCustomer = async (req, res) => {
  try {
    let user = req.apiUser;

    let dataSave = await User.updateOne(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          isActive: req.body.isActive,
          isVerified: req.body.isVerified,
          updatedBy: user._id,
          updatedAt: Date.now(),
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Customer has been updated Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteUser = async (req, res) => {
  try {
    let userId = req?.params?.id;
    let user = req.apiUser;

    if (!isValidObjectId(userId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid user Id!');
    }

    const userInfo = await User.findOne({ _id: userId, isDeleted: false });

    if (!userInfo) {
      return sendResponseWithoutData(res, 400, false, 'Invalid user Id!');
    }

    let dataSave = await User.updateOne(
      { _id: userId },
      {
        $set: {
          isDeleted: true,
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Vendor has been deleted Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const verifyUser = async (req, res) => {
  try {
    let user = req.apiUser;

    let dataSave = await User.updateOne(
      { _id: req.body.id },
      {
        $set: {
          isVerified: req.body.verify,
          updatedBy: user._id,
          updatedAt: Date.now(),
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      let checkVendor = await Vendor.findOne({ userId: req.body.id, isDeleted: false });
      if (!checkVendor) {
        const userInfo = await User.findOne({ _id: req.body.id, isDeleted: false });
        if (userInfo) {
          await Vendor.create({
            userId: req.body.id,
            name: userInfo.name,
            segment: userInfo.segment,
            products: [],
            totalOrdersReceived: 0,
          });
        }
      }

      return sendResponseWithoutData(res, 200, true, 'Vendor verification updated successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
