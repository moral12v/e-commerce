import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendErrorResponse, sendResponseWithoutData } from '../../helpers/helper.js';
import { isValidObjectId } from 'mongoose';
import Reminder from '../../models/Reminder.js';

export const addReminder = async (req, res) => {
  try {
    let user = req.apiUser;

    let { event, date } = req.body;

    let newData = {
      userId: user._id,
      eventName: event,
      eventDate: date,
    };

    if ('description' in req.body && req.body.description) {
      newData.description = req.body.description;
    }

    let data = await Reminder.create(newData);

    if (data) {
      return sendResponseWithoutData(res, 200, true, 'Reminder added successfully');
    }

    return sendResponseWithoutData(res, 400, false, 'Reminder addition failed, try again in sometime.');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const listReminder = async (req, res) => {
  try {
    let user = req.apiUser;

    let data = await Reminder.find({ userId: user._id }).select('-__v -isDeleted -createdAt -updatedAt -userId').lean();


    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Reminder fetched successfully', data);
    }

    return sendResponseWithData(res, 200, true, 'No reminders found', data);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const detailReminder = async (req, res) => {
  try {
    let user = req.apiUser;

    const reminderId = req.params.id;
    if (!isValidObjectId(reminderId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid reminder id!');
    }

    let data = await Reminder.findOne({ _id: reminderId, userId: user._id })
      .select('-__v -isDeleted -createdAt -updatedAt -userId')
      .lean();

    if (data) {
      return sendResponseWithData(res, 200, true, 'Reminder detials fetched successfully', data);
    }

    return sendResponseWithData(res, 400, true, 'Invalid reminder id', data);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateReminder = async (req, res) => {
  try {
    let { id, event, date, isActive } = req.body;

    let updatedData = {
      eventName: event,
      eventDate: date,
      isActive,
      updatedAt: Date.now(),
    };

    if ('description' in req.body && req.body.description) {
      updatedData.description = req.body.description;
    }

    let data = await Reminder.updateOne(
      {
        _id: id,
      },
      {
        $set: updatedData,
      },
    );

    if (data.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Reminder updated successfully');
    }

    return sendResponseWithoutData(res, 400, false, 'Reminder updation failed, try again in sometime.');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteReminder = async (req, res) => {
  try {
    let user = req.apiUser;

    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid reminder id!');
    }

    let checkExist = await Reminder.findOne({ _id: id, userId: user._id });

    if (!checkExist) {
      return sendResponseWithoutData(res, 400, false, 'Invalid reminder id!');
    }

    let data = await Reminder.deleteOne({ _id: id });

    if (data.deletedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Reminder deleted successfully');
    }

    return sendResponseWithoutData(res, 400, true, 'Invalid reminder id');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
