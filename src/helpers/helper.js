import fs from 'fs';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT } from 'google-auth-library';
import { dirname, join } from "path";
import { Types, isValidObjectId } from 'mongoose';
import User from '../models/User.js';
import File from '../models/File.js';
import axios from 'axios';
import puppeteer from 'puppeteer';
import {
  JWT_EXPIRES_IN,
  JWT_SECRET_TOKEN,
  CRYPTO_SECRET_KEY,
  FIRST_ORDER_ID_PREFIX,
  FIRST_ORDER_ID_POSTFIX,
  FIRST_INVOICE_ID_PREFIX,
  FIRST_INVOICE_ID_POSTFIX,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} from '../../config/config.js';
import { imageValiation } from '../validators/imageValidator.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import FilterValue from '../models/FilterValue.js';

import { writeFile } from 'fs/promises';
import FilterCategory from '../models/FilterCategory.js';
import Order from '../models/Order.js';
import Sort from '../models/Sort.js';
import Review from '../models/Review.js';
import ReviewLike from '../models/ReviewsLike.js';
import Notification from '../models/Notification.js';
import Segment from '../models/Segment.js';
import Category from '../models/Category.js';

// ******************* Variable Path Name Start *******************

const uploadPath = 'public';
// const bufferArray = CRYPTO_SECRET_KEY.split(' ').map((byte) => parseInt(byte, 16));
// const cryptoSecretKey = Buffer.from(bufferArray);

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// ******************* Variable Path Name End *********************

export const sendResponseWithData = (res, statusCode, status, msg, data, length = false) => {
  if (length) {
    return res.status(statusCode).json({
      status,
      msg,
      data,
      count: data.length,
    });
  }
  return res.status(statusCode).json({
    status,
    msg,
    data,
  });
};

export const sendResponseWithoutData = (res, statusCode, status, msg) => {
  return res.status(statusCode).json({
    status,
    msg,
    data: null,
  });
};

export const sendErrorResponse = (res) => {
  return res.status(500).send({ status: false, msg: 'Something Went Wrong' });
};

export const getJwtToken = (data) => {
  try {
    return jwt.sign(data, JWT_SECRET_TOKEN, {
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getJwtValue = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_TOKEN);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const hashPassword = async (password) => bcrypt.hash(password, 10);

export const matchPassword = async (plainString, hashedString) => await bcrypt.compare(plainString, hashedString);

export const authValues = async (authToken) => {
  try {
    let result = jwt.verify(authToken, JWT_SECRET_TOKEN);
    let user = await User.findOne({ _id: result.id, isDeleted: false }).lean();
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const removeSpace = (str, joinElement = '_') => str.replaceAll(/\s+/g, joinElement);

export const fileUplaod = async (files, uploaderId = '') => {
  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    const currentTimeStamp = Date.now();
    let response = {
      status: false,
      data: {},
      message: 'Fail to upload!',
    };
    let fileArr = [];

    let index = 0;
    for (const file of files) {
      let filename = `${currentTimeStamp}${index}_${removeSpace(file.name)}`;
      let fullFileName = join(uploadPath, filename);
      let isImageValid = await imageValiation(file);

      if (isImageValid.status) {
        fileArr.push({ name: fullFileName, file: isImageValid.file });
      } else {
        response.message = isImageValid.message;
        return response;
      }
      index++;
    }

    for (const x of fileArr) {
      const imageDataBuffer = Buffer.from(x.file.data);
      await writeFile(x.name, imageDataBuffer);
      // await x.file.mv(x.name);
    }

    let urlArr = fileArr.map((item) => {
      return item.name;
    });

    let saveFile = await File.create({
      url: urlArr,
      createdBy: uploaderId,
      updatedBy: uploaderId,
    });

    if (saveFile) {
      response.status = true;
      response.data = saveFile;
      response.message = 'Image uploaded successfully';
    } else {
      response.message = 'Fail to upload image';
    }

    return response;
  } catch (err) {
    console.error(err);
    return {
      status: false,
      message: 'Fail to upload!',
    };
  }
};

export const makeObjectId = (id) => new Types.ObjectId(id);

export const mailVerificationTemplate = (data) => {
  const template = `
  <div style="margin: 0; padding: 20px 0 20px 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Email Verification</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear ${data.name},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Please click the button below to verify your email address:</p>
          <a href="${data.url}" target="_blank" style="display: inline-block; padding: 5px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 3px;"><p style="font-size: 16px;">Verify Email</p></a>
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you did not request this verification, please ignore this email.</p>
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you!</p>
      </div>
      <div style="text-align: center; color: #999; font-size: 12px;">This is an automated email. Please do not reply.</div>
  
      </div>
  `;
  return template;
};

export const mailForgotPasswordTemplate = (data) => {
  const template = `
<div style="margin: 0; padding: 20px 0 20px 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Forgot Password</h1>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear ${data.name},</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Please click the button below to reset your password:</p>
    <a href="${data.url}" target="_blank" style="display: inline-block; padding: 5px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 3px;"><p style="font-size: 16px;">Reset Password</p></a>
    
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you did not request this, please ignore this email.</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you!</p>
</div>
<div style="text-align: center; color: #999; font-size: 12px;">This is an automated email. Please do not reply.</div>
</div>`;
  return template;
};
export const mailCustomerDetailsTemplate = (data) => {
  const template = `
  <div style="margin: 0; padding: 20px 0 20px 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Vendor Details</h1>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear ${data?.name},</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><b>Email</b>: ${data?.email}</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><b>Password</b>: ${data?.password}</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Click the button below to log in.</p>
    <a href="${data?.url}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 3px; text-align: center;"><p style="font-size: 16px; margin: 0;">Click here</p></a>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you did not request this, please ignore this email.</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you!</p>
  </div>
  <div style="text-align: center; color: #999; font-size: 12px;">This is an automated email. Please do not reply.</div>
</div>`;
  return template;
};
export const mailOrderPlaceTemplate = (data) => {
  const template = `
  <div style="margin: 0; padding: 20px 0 20px 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear ${data?.name},</p>
    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Your order has been ${data?.status ? data.status : 'booked'} with order ID: ${data?.orderId}.</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><b>Click the button below to check the order status and track it</b>:</p>
    <a href="${data?.link}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 3px; text-align: center;"><p style="font-size: 16px; margin: 0;">Click Me</p></a>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><b>Support Contact</b>: 1800400252</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><b>Support Email</b>: gamleWala@gmail.com</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you did not request this, please ignore this email.</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you!</p>
  </div>
  <div style="text-align: center; color: #999; font-size: 12px;">This is an automated email. Please do not reply.</div>
</div>`;
  return template;
};

export const generateSixDigitOtp = () => Math.floor(100000 + Math.random() * 900000);

export const getTimePlusXMinutes = (timeToIncrese = 30) => {
  const currentTime = new Date();
  const ISTOffset = 330;
  const newTime = new Date(currentTime.getTime() + (timeToIncrese + ISTOffset) * 60000);
  return newTime;
};

export const removeProductsFromCart = async (productId = null) => {
  if (productId && isValidObjectId(productId)) {
    await Cart.deleteMany({ product: productId });
    return true;
  }
  return false;
};

export const removeProductsFromWishlist = async (productId = null) => {
  if (productId && isValidObjectId(productId)) {
    await Wishlist.deleteMany({ product: productId });
    return true;
  }
  return false;
};

export const removeReviewsFromProduct = async (productId = null) => {
  if (productId && isValidObjectId(productId)) {
    await Review.deleteMany({ productId: productId });
    await removeLikesFromReviews(productId);
    return true;
  }
  return false;
};

export const removeLikesFromReviews = async (productId = null) => {
  if (productId && isValidObjectId(productId)) {
    await ReviewLike.deleteMany({ productId: productId });
    return true;
  }
  return false;
};

// export const encryptData = (text) => {
//   try {
//     const cipher = crypto.createCipheriv('aes-256-cbc', cryptoSecretKey, Buffer.alloc(16, 0));
//     let encrypted = cipher.update(text, 'utf8', 'hex');
//     encrypted = encrypted + cipher.final('hex');
//     return encrypted;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

// export const decryptData = (encryptedText) => {
//   try {
//     const decipher = crypto.createDecipheriv('aes-256-cbc', cryptoSecretKey, Buffer.alloc(16, 0));
//     let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//     decrypted = decrypted + decipher.final('utf8');
//     return decrypted;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

export const getFilterValueById = async (id = null) => {
  if (!id) {
    return null;
  }
  id = String(id);

  let filterCategoryDataValue = await FilterValue.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate({ path: 'filterCategoryId', select: 'name field type' })
    .select('-isDeleted -__v')
    .lean();

  return filterCategoryDataValue;
};

export const getSortingFilter = (name = null) => {
  try {
    if (!name) {
      return null;
    }
    name = String(name);

    switch (name) {
      case 'ascending':
        return { price: 1 };
      case 'descending':
        return { price: -1 };
      case 'ascending_rating':
        return { rating: 1 };
      case 'descending_rating':
        return { price: -1 };
      case 'discount':
        return { offer: -1 };

      default:
        return null;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const addFilter = async (name = null, title = null, match = null, min = null, max = null) => {
  try {
    if (!name || !title) {
      return null;
    }

    name = String(name);
    title = String(title);

    let filterCategoryDetails = await FilterCategory.findOne({ name, isDeleted: false }).lean();

    if (!filterCategoryDetails) {
      return null;
    }

    let dataObj = {
      filterCategoryId: filterCategoryDetails._id,
      title: title,
    };

    if (filterCategoryDetails.type === 'match') {
      if (!match) {
        return null;
      }
      dataObj.match = match;
    } else if (filterCategoryDetails.type === 'range') {
      if (!min && !max) {
        return null;
      }
      dataObj.min = min || null;
      dataObj.max = max || null;
    }

    let createFilter = await FilterValue.create(dataObj);

    return createFilter;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updateFilter = async (name = null, id = null, title = null) => {
  try {
    if (!name || !id || !title) {
      return null;
    }
    name = String(name);
    title = String(title);

    let filterCategoryDetails = await FilterCategory.findOne({ name, isDeleted: false }).lean();

    if (!filterCategoryDetails) {
      return null;
    }
    let dataObj = {
      filterCategoryId: filterCategoryDetails._id,
      title,
    };

    if (filterCategoryDetails.type !== 'match') {
      return null;
    }

    let removeFilter = await FilterValue.updateOne(
      { filterCategoryId: filterCategoryDetails._id, match: id },
      { $set: dataObj },
    );

    if (removeFilter.modifiedCount > 0) {
      return true;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const removeFilter = async (name = null, id = null) => {
  try {
    if (!name || !id) {
      return null;
    }
    name = String(name);

    let filterCategoryDetails = await FilterCategory.findOne({ name, isDeleted: false }).lean();

    if (!filterCategoryDetails) {
      return null;
    }
    let dataObj = {
      filterCategoryId: filterCategoryDetails._id,
    };

    if (filterCategoryDetails.type === 'match') {
      dataObj.match = id;
    } else {
      return null;
    }

    let removeFilter = await FilterValue.deleteOne(dataObj);
    if (removeFilter.deletedCount > 0) {
      return true;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateRandomCouponCode = (length = 15) => {
  try {
    if (isNaN(length) || length > 50) {
      return null;
    }

    let result = '';
    const charLen = characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charLen);
      result += characters.charAt(randomIndex);
    }

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getPercentageToNumber = (number = null, percent = null) => {
  try {
    if (isNaN(number) || isNaN(percent)) {
      return null;
    }

    return (number * percent) / 100;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const useCoupon = async (id = null, discount = null, user = null) => {
  try {
    if (!id || !isValidObjectId(id) || !discount || !user || !isValidObjectId(user)) {
      return null;
    }

    return true;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateOrderId = async () => {
  try {
    const spliter = FIRST_ORDER_ID_PREFIX;
    let previousOrderId = null;

    let lastOrderId = await Order.find().sort({ createdAt: -1 }).limit(1);

    if (lastOrderId.length === 0) {
      previousOrderId = `${FIRST_ORDER_ID_PREFIX}${FIRST_ORDER_ID_POSTFIX}`;
      return previousOrderId;
    }

    if (lastOrderId.length > 0) {
      previousOrderId = lastOrderId[0].orderId;
    }

    if (previousOrderId && previousOrderId.split(spliter).length === 2) {
      let orderNumber = Number(previousOrderId.split(spliter)[1]);

      if (isNaN(orderNumber)) {
        return null;
      }
      orderNumber++;
      let arrangedNumber = String(orderNumber).padStart(5, '0');

      const newOrderId = previousOrderId.split(spliter)[0] + spliter + arrangedNumber;

      return newOrderId;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateInvoiceId = async () => {
  try {
    const spliter = 'GW';
    let previousInvoiceId = null;
    const currentYear = new Date().getFullYear();

    let lastOrderId = await Order.find().sort({ createdAt: -1 }).limit(1);

    if (lastOrderId.length === 0) {
      previousInvoiceId = `${FIRST_INVOICE_ID_PREFIX}${currentYear}GW${FIRST_INVOICE_ID_POSTFIX}`;
      return previousInvoiceId;
    }

    if (lastOrderId.length > 0) {
      previousInvoiceId = lastOrderId[0].invoiceNo;
    }

    if (previousInvoiceId && previousInvoiceId.split(spliter).length === 2) {
      let invoiceNumber = Number(previousInvoiceId.split(spliter)[1]);

      if (isNaN(invoiceNumber)) {
        return null;
      }
      invoiceNumber++;
      let arrangedNumber = String(invoiceNumber).padStart(5, '0');

      const newOrderId = previousInvoiceId.split(spliter)[0] + spliter + arrangedNumber;
      return newOrderId;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// export const makeValidImageUrl = async (id) => {
//   if (!id) {
//     return [];
//   }

//   let imageUrl = await File.findOne({ _id: id, isDeleted: false }).lean();
//   if (!imageUrl) {
//     return [];
//   }

//   let urls = imageUrl.url.map((item) => {
//     return `${protocol}://${hostname}/${item}`;
//   });

//   return urls;
// };

export const getSortingValueById = async (id) => {
  try {
    if (!id || !isValidObjectId(id)) {
      return null;
    }

    let getSortingMethod = await Sort.findOne({ _id: id, isDeleted: false, isActive: true }).lean();

    if (getSortingMethod) {
      return { [getSortingMethod.field]: getSortingMethod.value };
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};
export const getDiscount = async (productPrice, value) => {
  try {

    let totalPrice = (productPrice * value) / 100;
    return totalPrice;

  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getDayFromDate = async (dateString) => {
  const date = new Date(dateString);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = date.getDay();
  return daysOfWeek[day];
}
// let SERVICE_ACCOUNT_FILE = './gamlewale-4c551-firebase-adminsdk-62v9z-6362a7686b.json';
// let serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE));
const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

const client = new JWT({
  // key: serviceAccount.private_key,
  // email: serviceAccount.client_email,
  email: FIREBASE_CLIENT_EMAIL,
  key: FIREBASE_PRIVATE_KEY,
  scopes: SCOPES

})

async function getAccessToken() {
  const tokens = await client.authorize();
  return tokens.access_token;

}

export const sendPushNotification = async (userId, title, body, image, url) => {

  let notification = {
    userId: userId,
    title: title,
    body: body,
    image: (image) ? image : '',
    url: url
  }
  await Notification.create(notification);
  let deviceId = await getDeviceIdByCustomerId(userId);
  (deviceId) ? await sendFireBaseNotification(title, body, deviceId) : null;
}

export const sendFireBaseNotification = async (title, body, deviceId) => {
  // let data = JSON.stringify({
  //   "token": deviceId,
  //   "notification": {
  //     "title": title,
  //     "body": body,
  //     // "image": image
  //   },
  //   "priority": "high"
  // });

  let data = JSON.stringify({
    message: {
      token: deviceId,
      notification: {
        title: title,
        body: body,
      },
      android: {
        priority: "high",
      },
      // apns: {
      //   headers: {
      //     'apns-priority': '10',
      //   },
      //   payload: {
      //     aps: {
      //       alert: {
      //         title: title,
      //         body: body,
      //       },
      //       sound: 'default'
      //     },
      //   },
      // },
    },
  });

  let accessToken = await getAccessToken();
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://fcm.googleapis.com/v1/projects/gamlevala-customer/messages:send',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `key=${FIREBASE_SERVER_KEY}`
      'Authorization': `Bearer ${accessToken}`
    },
    data: data
  };

  axios.request(config)
    .then((response) => {

      // console.log( JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}

export const getDeviceIdByCustomerId = async (userId) => {
  let customer = await User.findById(userId);
  return customer?.deviceId;
}


export const getSegmentIdsBySlugs = async (slugs) => {
  try {
    const segments = await Segment.find({ slug: { $in: slugs }, isDeleted: false }).select('_id');
    return segments.map(segment => segment._id);
  } catch (error) {
    console.log(error);
    return null;
  }

}
export const getCategoryIdsBySlugs = async (slugs) => {
  try {
    const categories = await Category.find({ slug: { $in: slugs }, isDeleted: false }).select('_id');
    return categories.map(category => category._id);
  } catch (error) {
    console.log(error);
    return null;
  }

}
export const invoiceTemplate = (data, logoBase64) => {
  const formattedDate = new Date(data?.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const template = `  

  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin: 0; padding: 0">
    <div
      style="
        margin: 0 auto;
        width: 100%;

        min-width: fit-content;
        height: auto;
      "
    >
      <table style="width: 100%; margin: 1.5rem 0">
        <tr>
          <td style="vertical-align: top; text-align: left">
            <img
              src=${logoBase64}
              alt=""
              style="width: 30%; height: auto"
            />
          </td>
          <td style="width: 35%; padding-right: 15px">
            <p> <strong>Invoice:</strong> ${data?.invoiceNo}</p>
            <p><strong>Created:</strong> ${formattedDate}</p>
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top">
            <div style="width: auto; padding: 0 13px">
            ${data?.addressName}, ${data?.street}, ${data?.city}, ${data?.state}
            </div>
          </td>
          <td style="width: 30%; text-align: left">
            <p style="padding: 2px 0; margin: 2px 0">${data?.name}</p>
            <p style="padding: 2px 0; margin: 2px 0">${data?.email}</p>
            <p style="padding: 2px 0; margin: 2px 0">${data?.mobile}</p>
          </td>
        </tr>
      </table>
      <div style="margin: 15px">
        <table style="width: 100%; margin: 1.5rem 0; border-collapse: collapse;">
          <thead style="background-color: #f1f1f1">
            <tr>
              <th style="padding: 15px; font-weight: 500; text-align: left">
                Payment Mode
              </th>
              <th style="padding: 15px; font-weight: 500; text-align: right">
                ${data?.paymentMethod}
              </th>
            </tr>
          </thead>
        </table>
        <table style="width: 100%; padding: 5px; border-collapse: collapse">
          <thead style="background-color: #f1f1f1">
            <tr>
              <th style="padding: 15px; font-weight: 500">Products</th>
              <th style="padding: 15px; font-weight: 500">Qty</th>
              <th style="padding: 15px; font-weight: 500">MRP</th>
              <th style="padding: 15px; font-weight: 500">Price</th>
              <th style="padding: 15px; font-weight: 500">Discount</th>
              <th style="padding: 15px; font-weight: 500">Extra Discount</th>
              <th style="padding: 15px; font-weight: 500">Coupon Discount</th>
              <th style="padding: 15px; font-weight: 500">Delivery Charge</th>
            </tr>
          </thead>
          <tbody>
           ${data?.products?.map(item => `
            <tr>
              <td style="padding: 15px; text-align: center">${item?.name}</td>
              <td style="padding: 15px; text-align: center">${item?.quantity}</td>
              <td style="padding: 15px; text-align: center">${item?.totalMrp}</td>
              <td style="padding: 15px; text-align: center">${item?.totalPrice}</td>
              <td style="padding: 15px; text-align: center">${item?.discount}</td>
              <td style="padding: 15px; text-align: center">${item?.extraDiscount}</td>
              <td style="padding: 15px; text-align: center">${item?.couponDiscount}</td>
              <td style="padding: 15px; text-align: center">${item?.shippingCost}</td>
            </tr>
                `).join('')}
          
          </tbody>
        </table>
        <hr />
        <table style="float: right; margin-right: 4rem">
          <tr>
            <td style="font-weight: bold">Total:</td>
            <td>${data?.totalAmountToPay}</td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
  `;
  return template;
};

const encodeImageToBase64 = (filePath) => {
  const imageBuffer = fs.readFileSync(filePath);
  const base64Image = imageBuffer.toString('base64');
  return `data:image/png;base64,${base64Image}`;
};

// export const createInvoice = async (data,) => {
//   const __filename = import.meta.filename;
//   const __dirname = dirname(__filename);
//   const logoPath = join(__dirname, './../../static', 'logo.png');
//   let logoBase64 = encodeImageToBase64(logoPath);

//   const html = invoiceTemplate(data, logoBase64);
//   const directory = join(__dirname, './../../documents');
//   if (!fs.existsSync(directory)) {
//     fs.mkdirSync(directory, { recursive: true });
//   }

//   const filename = join(directory, `invoice-${Date.now()}.pdf`);

//   const options = {
//     format: 'A4',
//     orientation: 'portrait',
//   };

//   return new Promise((resolve, reject) => {
//     pdf.create(html, options).toFile(filename, (error, res) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(filename);
//       }
//     });
//   });

// };

export const createInvoice = async (data) => {
  const __filename = import.meta.filename;
  const __dirname = dirname(__filename);
  const logoPath = join(__dirname, './../../static', 'logo.png');
  try {

    let logoBase64 = encodeImageToBase64(logoPath);
    const html = invoiceTemplate(data, logoBase64); // Generate invoice HTML
    const directory = join(__dirname, './../../documents');

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const filename = join(directory, `invoice-${Date.now()}.pdf`);
    // const browser = await puppeteer.launch({ headless: false });
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], dumpio: true });

    const page = await browser.newPage();
    // await page.setContent(html, { waitUntil: 'networkidle2' }); // Set page content with invoice HTML
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({ path: filename, format: 'A4', orientation: 'portrait', });

    await browser.close();

    return filename;
  } catch (error) {
    console.log(error);
    return null;
  }
};