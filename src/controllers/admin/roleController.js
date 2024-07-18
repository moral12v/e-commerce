import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendErrorResponse } from '../../helpers/helper.js';
import Role from '../../models/Role.js';

export const listRoles = async (req, res) => {
  try {
    let data = await Role.find({ isDeleted: false, name: { $nin: ['customer', 'admin'] } }).select('-isDeleted -__v');

    return sendResponseWithData(res, 200, true, 'Roles list fetched successfully', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
