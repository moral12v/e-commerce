import bcrypt from 'bcrypt';
import {
  getJwtToken,
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  hashPassword,
  mailForgotPasswordTemplate,
  generateSixDigitOtp,
  getTimePlusXMinutes,
  getJwtValue,
} from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import { MAILER_EMAIL } from '../../../config/config.js';
import { sendMail } from '../../../config/mailer.js';

export const vendorSignUp = async (req, res) => {
  try {
    const role = await Role.findOne({ name: 'vendor', isDeleted: false });

    const dataSave = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: await hashPassword(req.body.password),
      mobile: req.body.mobile,
      segment: req.body.segment,
      role: role.id,
      type: role.name,
      isVerified: false,
    });

    if (dataSave) {
      await User.updateOne(
        { _id: dataSave.id },
        {
          $set: {
            createdBy: dataSave.id,
            updatedBy: dataSave.id,
          },
        },
      );
      return sendResponseWithoutData(res, 200, true, 'Account registered successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Account registered failed!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const vendorLogin = async (req, res) => {
  try {
    let vendor = await User.findOne({ email: req.body.email, type: 'vendor', isDeleted: false, isActive: true }).select(
      '-isDeleted -isActive -otp -otpExpiryTime -__v',
    );

    if (vendor && (await bcrypt.compare(req.body.password, vendor.password))) {
      return sendResponseWithData(res, 200, true, 'Vendor logged in successfully!', {
        token: getJwtToken({ id: vendor.id }),
      });
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid credentials!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const vendorForgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    const otp = generateSixDigitOtp();
    let extra5mins = getTimePlusXMinutes(5);

    // console.log(otp);

    let findEmail = await User.findOne({ email: email, type: 'vendor', isActive: true, isDeleted: false }).lean();

    if (!findEmail) {
      return sendResponseWithoutData(res, 400, false, "Couldn't find the email!");
    }

    let updateOtp = await User.updateOne({ _id: findEmail._id }, { $set: { otp: otp, otpExpiryTime: extra5mins } });

    if (updateOtp.modifiedCount === 0) {
      return sendResponseWithoutData(res, 400, false, 'Fail to processed!');
    }

    const tokenPayload = {
      email,
      otp,
    };

    const urlToken = getJwtToken(tokenPayload);

    const hostname = req.headers.host;
    const protocol = req.protocol;

    const magicUrl = `https://gamlewala.in/setnewpassword/${urlToken}`;
    const mailOptions = {
      from: MAILER_EMAIL,
      to: email,
      subject: 'Gamlewala vendor reset password',
      html: mailForgotPasswordTemplate({ url: magicUrl, name: findEmail.name }),
    };

    sendMail(mailOptions);

    return sendResponseWithoutData(res, 200, true, 'Reset password mail sent successfully!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const vendorResetPassword = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return sendResponseWithoutData(res, 401, false, 'Key not provided or invalid key!');
    }

    let tokenData = getJwtValue(token);

    if (!tokenData) {
      return sendResponseWithoutData(res, 401, false, 'Key not provided or invalid key!');
    }



    const userData = await User.findOne({ email: tokenData.email, otp: tokenData.otp, isDeleted: false }).lean();
    console.log("token============>", userData);
    if (!userData) {
      return sendResponseWithoutData(res, 401, false, 'Key not provided or invalid key!');
    }

    const currentTime = new Date();
    const newCurrentTime = new Date(currentTime.getTime() + 330 * 60000);

    if (userData.otpExpiryTime < newCurrentTime) {
      return sendResponseWithoutData(res, 401, false, 'Key expired, reset password failed!');
    }

    let updatePass = await User.updateOne(
      { _id: userData._id },
      { $set: { password: await hashPassword(req.body.password) } },
    );

    if (updatePass.modifiedCount > 0) {
      await User.updateOne({ _id: userData._id }, { $set: { otp: null, otpExpiryTime: null } });
      return sendResponseWithoutData(res, 200, true, 'Password changed!');
    }

    return sendResponseWithoutData(res, 400, false, 'Password not changed, try again in sometime!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
