import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import Setting from '../../models/Setting.js';

export const getSettingDetails = async (req, res) => {
  try {
    let settingData = await Setting.findOne({
      name: 'general settings',
      isDeleted: false,
    }).select('-isDeleted -isActive -createdAt  -updatedAt -__v').lean();

    if (settingData) {
      return sendResponseWithData(res, 200, true, 'Settings details fetched successfully!', settingData.data||{});
    }
    return sendResponseWithoutData(res, 400, false, 'Setting not available!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
}