import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  fileUplaod,
  authValues,
} from '../../helpers/helper.js';

export const uploadImage = async (req, res) => {
  try {
    let token = '';
    if ('authorization' in req.headers) {
      let tokenArr = req.headers.authorization.split(' ');
      if (tokenArr.length === 2) {
        token = tokenArr[1];
      } else {
        return sendResponseWithoutData(res, 400, false, 'Invalid token provided!');
      }
    }

    let user = {};
    if (token !== '') {
      let tokenUserInfo = await authValues(token);
      if (tokenUserInfo) {
        user = tokenUserInfo;
      } else {
        user._id = '-';
      }
    } else {
      user._id = '-';
    }

    let files = req.files;

    let uploadedImageId = null;

    if (files) {
      let image = Array.isArray(files.image) ? files.image : [files.image];
      uploadedImageId = await fileUplaod(image, user._id);
    } else {
      return sendResponseWithoutData(res, 400, false, 'No files provided');
    }

    if (uploadedImageId.status) {
      return sendResponseWithData(res, 200, true, uploadedImageId.message, uploadedImageId.data.id);
    } else {
      return sendResponseWithoutData(res, 400, false, uploadedImageId.message);
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};


