import bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import {
  getJwtToken,
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  hashPassword,
  mailVerificationTemplate,
  generateSixDigitOtp,
  getTimePlusXMinutes,
  authValues,
  mailForgotPasswordTemplate,
  getJwtValue,
} from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import { sendMail } from '../../../config/mailer.js';
import { MAILER_EMAIL } from '../../../config/config.js';

export const customerSignUp = async (req, res) => {
  try {
    const otp = generateSixDigitOtp();
    const role = await Role.findOne({ name: 'customer', isDeleted: false }).lean();

    let extra30mins = getTimePlusXMinutes(30);

    const dataSave = await User.create({
      title: req.body.title || null,
      name: req.body.name,
      email: req.body.email,
      password: await hashPassword(req.body.password),
      mobile: req.body.mobile,
      alternateMobile: req.body.alternateMobile || null,
      role: role._id,
      type: role.name,
      isVerified: false,
      loginType: 'normal',
      otp: otp,
      otpExpiryTime: extra30mins,
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

      const tokenPayload = {
        email: req.body.email,
        otp,
      };

      const urlToken = getJwtToken(tokenPayload);

      const hostname = req.headers.host;
      const protocol = req.protocol;

      const magicUrl = `https://www.gamlewala.in/verify-email/${urlToken}`;
      const mailOptions = {
        from: MAILER_EMAIL,
        to: req.body.email,
        subject: 'Gamlewala customer verification',
        html: mailVerificationTemplate({ url: magicUrl, name: req.body.name }),
      };

      sendMail(mailOptions);

      return sendResponseWithoutData(res, 200, true, 'Verification mail sent successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Account registration failed!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const customerSignIn = async (req, res) => {
  try {
    let customer = await User.findOne({
      email: req.body.email,
      loginType: 'normal',
      type: 'customer',
      isDeleted: false,
      isActive: true,
    })
      .select('-isDeleted -isActive -otp -otpExpiryTime -__v')
      .lean();

    if (customer && (await bcrypt.compare(req.body.password, customer.password))) {
      // Update the device token
      await User.updateOne({ email: req.body.email }, { $set: { deviceId: req.body.deviceId } })

      return sendResponseWithData(res, 200, true, 'User logged in successfully!', {
        verified: customer.isVerified,
        token: getJwtToken({ id: customer._id }),
      });
    } else {
      return sendResponseWithoutData(res, 400, false, "Invalid credentials or user doesn't exists");
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const customerGoogleSignUp = async (req, res) => {
  try {
    let { token } = req.body;

    let rawData = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    let parsedData = await rawData.json();
    let userData = null;

    if (rawData.status === 200) {
      let checkUser = await User.findOne({ email: parsedData.email, isDeleted: false });
      if (checkUser) {
        return sendResponseWithoutData(res, 400, false, 'User already exists!');
      }
      let rawUserData = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      let parsedUserData = await rawUserData.json();

      if (rawUserData.status === 200) {
        userData = parsedUserData;
      }
    }

    if (!userData) {
      return sendResponseWithoutData(res, 400, false, 'Invalid token!');
    }

    const role = await Role.findOne({ name: 'customer', isDeleted: false }).lean();

    const dataSave = await User.create({
      name: userData.name,
      email: parsedData.email,
      role: role._id,
      type: role.name,
      isVerified: true,
      loginType: 'google',
    });

    if (dataSave) {
      return sendResponseWithData(res, 200, true, 'User signed up successfully!', {
        verified: true,
        token: getJwtToken({ id: dataSave._id }),
      });
    }

    return sendResponseWithoutData(res, 400, false, 'Account registration failed!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const customerGoogleSignIn = async (req, res) => {
  try {
    let { token } = req.body;

    let rawData = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    let parsedData = await rawData.json();
    if (rawData.status === 200) {
      let checkUser = await User.findOne({ email: parsedData.email, isDeleted: false });
      if (checkUser) {
        return sendResponseWithData(res, 200, true, 'User logged in successfully!', {
          verified: checkUser.isVerified,
          token: getJwtToken({ id: checkUser._id }),
        });
      }
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid login!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const customerEmailVerify = async (req, res) => {
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

    if (user.isVerified) {
      return sendResponseWithoutData(res, 200, true, 'Your account is already verified!');
    }

    const otp = generateSixDigitOtp();
    let extra30mins = getTimePlusXMinutes(30);

    let updateOtp = await User.updateOne({ _id: user._id }, { $set: { otp: otp, otpExpiryTime: extra30mins } });

    if (updateOtp.modifiedCount === 0) {
      return sendResponseWithoutData(res, 400, false, 'Fail to processed!');
    }

    const tokenPayload = {
      email: user.email,
      otp,
    };

    const urlToken = getJwtToken(tokenPayload);

    const magicUrl = `https://www.gamlewala.in/verify-email/${urlToken}`;
    const mailOptions = {
      from: MAILER_EMAIL,
      to: user.email,
      subject: 'Gamlewala customer verification',
      html: mailVerificationTemplate({ url: magicUrl, name: user.name }),
    };

    sendMail(mailOptions);

    return sendResponseWithoutData(res, 200, true, 'Verification mail sent successfully!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const customerForgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    const otp = generateSixDigitOtp();
    let extra5mins = getTimePlusXMinutes(5);

    console.log(otp);

    let findEmail = await User.findOne({ email: email, type: 'customer', isActive: true, isDeleted: false }).lean();

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

    // const hostname = req.headers.host;
    // const protocol = req.protocol;

    // const magicUrl = `${protocol}://${hostname}/setnewpassword/${urlToken}`;
    const magicUrl = `https://gamlewala.in/setnewpassword/${urlToken}`;
    const mailOptions = {
      from: MAILER_EMAIL,
      to: email,
      subject: 'Gamlewala customer reset password',
      html: mailForgotPasswordTemplate({ url: magicUrl, name: findEmail.name }),
    };

    sendMail(mailOptions);

    return sendResponseWithoutData(res, 200, true, 'Reset password mail sent successfully!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const customerResetPassword = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return sendResponseWithoutData(res, 401, false, 'Key not provided or invalid key1!');
    }

    let tokenData = getJwtValue(token);

    if (!tokenData) {
      return sendResponseWithoutData(res, 401, false, 'Key not provided or invalid key2!');
    }

    const userData = await User.findOne({ email: tokenData.email, otp: tokenData.otp, isDeleted: false }).lean();

    if (!userData) {
      return sendResponseWithoutData(res, 401, false, 'Key not provided or invalid key3!');
    }

    const currentTime = new Date();
    const newCurrentTime = new Date(currentTime.getTime() + 330 * 60000);

    if (userData.otpExpiryTime < newCurrentTime) {
      return sendResponseWithoutData(res, 401, false, 'Key expired, reset password failed!');
    }

    let updatePass = await User.updateOne(
      { _id: userData._id },
      { $set: { password: await hashPassword(req.body.password), loginType: 'normal' } },
    );

    if (updatePass.modifiedCount > 0) {
      await User.updateOne({ _id: userData._id }, { $set: { otp: null, otpExpiryTime: null } });
      return sendResponseWithoutData(res, 200, true, 'Password changed!');
    }

    return sendResponseWithoutData(res, 400, false, 'Password not changed, try again in sometime!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};
