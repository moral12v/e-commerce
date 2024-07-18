import bcrypt from 'bcrypt';
import {
  getJwtToken,
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  matchPassword,
  hashPassword,
  generateRandomCouponCode,
  mailCustomerDetailsTemplate,
} from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import User from '../../models/User.js';
import UnVerifiedVendor from '../../models/UnVerifiedVendor.js';
import Vendor from '../../models/Vendor.js';
import { MAILER_EMAIL } from '../../../config/config.js';
import { sendMail } from '../../../config/mailer.js';
import { isValidObjectId } from 'mongoose';


export const becomePartnerLists = async (req, res) => {
  try {

    let filter = {
      isAdminApproved: false,
      isDeleted: false,
      isActive: true,
    }
    const page = req.body.page || 1;
    const count = req.body.count || 10;
    const totalCount = await UnVerifiedVendor.countDocuments(filter);
    let findVendors = await UnVerifiedVendor.find(filter).select('-isDeleted -createdAt -updatedAt -__v').skip((page - 1) * count)
      .limit(count).lean();

    if (findVendors && findVendors.length > 0) {
      return sendResponseWithData(res, 200, true, 'Become partner lists fetched successfully!', findVendors, { count: totalCount });
    }
    return sendResponseWithoutData(res, 400, false, 'Vendor not found!');

  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};


export const approvedVendorBecomePartner = async (req, res) => {
  try {
    let { id } = req.body
    if (!id || !isValidObjectId(id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid id!');
    }

    let findVendors = await UnVerifiedVendor.findOne({
      _id: id,
      isAdminApproved: false,
      isDeleted: false,
      isActive: true,
    }).select('-isDeleted -createdAt -updatedAt -__v');

    if (!findVendors) {
      return sendResponseWithoutData(res, 400, false, 'Vendor not found!');
    }

    let password = generateRandomCouponCode(10);
    findVendors.password = await hashPassword(password);

    let url = "https://gamlewala.in/vendor/sign-in"
    const mailOptions = {
      from: MAILER_EMAIL,
      to: findVendors.email,
      subject: 'Gamlewala vendor credentials for logIn',
      html: mailCustomerDetailsTemplate({ name: findVendors.name, email: findVendors.email, password: password, url: url }),
    };

    sendMail(mailOptions);

    await UnVerifiedVendor.updateOne({ _id: findVendors._id }, { $set: { isAdminApproved: true } });

    let dataSaved = await User.create({
      name: findVendors.name,
      email: findVendors.email,
      password: findVendors.password,
      mobile: findVendors.mobile,
      type: 'vendor',
      isVerified: true,
    });

    await Vendor.create({
      userId: dataSaved._id,
      name: findVendors.name,
      segment: findVendors.segment,
      pan: findVendors.pan,
      gst: findVendors.gst,
      aadhar: findVendors.aadhar,
    });

    return sendResponseWithoutData(res, 200, true, 'Vendor approved by admin!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
