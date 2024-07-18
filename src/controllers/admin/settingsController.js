import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import Setting from '../../models/Setting.js';

export const addSetting = async (req, res) => {
  try {
    let generalSettingsData = await Setting.findOne({
      name: 'general settings',
    });

    if (!generalSettingsData) {
      return sendResponseWithoutData(res, 400, false, 'Settings data not available, run seeder!');
    }

    let newSettingsData = { ...generalSettingsData.data, ...req.body };

    let settingData = await Setting.updateOne(
      {
        name: 'general settings',
      },
      {
        $set: {
          data: newSettingsData,
        },
      },
    );

    if (settingData) {
      return sendResponseWithoutData(res, 200, true, 'Settings added!');
    }
    return sendResponseWithoutData(res, 400, false, 'Settings fail to add!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const getSettingDetails = async (req, res) => {
  try {
    let settingData = await Setting.findOne({
      name: 'general settings',
      isDeleted: false,
    }).select('-isDeleted -__v');

    if (settingData) {
      return sendResponseWithData(res, 200, true, 'Settings details fetched successfully!', settingData);
    }
    return sendResponseWithoutData(res, 400, false, 'Setting not available!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteSettings = async (req, res) => {
  try {
    let field = req.params.field;

    if (!field) {
      return sendResponseWithoutData(res, 400, false, 'Invalid field name!');
    }

    let settingData = await Setting.findOne({
      name: 'general settings',
      isDeleted: false,
    }).lean();

    if (settingData) {
      let data = { ...settingData.data };
      delete data[field];

      let deleteData = await Setting.updateOne({ name: 'general settings' }, { $set: { data } });
      if (deleteData.modifiedCount > 0) {
        return sendResponseWithoutData(res, 200, true, 'Settings deleted successfully!');
      }
      return sendResponseWithoutData(res, 400, false, 'Settings deletion failed!');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid settings id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
