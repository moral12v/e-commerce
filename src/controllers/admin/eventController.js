import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse, removeSpace } from '../../helpers/helper.js';
import EventGroup from '../../models/EventsGroup.js';

export const createEvent = async (req, res) => {
  try {
    let user = req.apiUser;

    let { name, group } = req.body;

    let eventName = removeSpace(name.toLowerCase(), "-");
    let createSlug = `${eventName}-${Date.now()}`;
    let checkSlugExists = await EventGroup.findOne({ slug: createSlug, isDeleted: false });

    if (checkSlugExists) {
      return sendResponseWithoutData(res, 400, false, 'Event addition failed, try again in sometime!');
    }

    let newData = {
      name: name,
      slug: createSlug,
      group: group,
      createdBy: user._id,
      updatedBy: user._id,
    };

    if ('description' in req.body && req.body.description) {
      newData.description = req.body.description;
    }

    if ('file' in req.body && req.body.file) {
      newData.image = req.body.file;
    }

    const dataSave = await EventGroup.create(newData);

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Event group has been created successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Event group creation failed, try again in sometime!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listEvent = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let filter = { isDeleted: false };

    if ('isActive' in req.body) {
      filter.isActive = req.body.isActive;
    }

    let data = await EventGroup.find(filter)
      .populate([
        { path: 'image', select: '_id url' },
        {
          path: 'group',
          select: '-__v -isDeleted',
          populate: { path: 'image', select: '_id url' },
        },
      ])
      .select('-isDeleted -__v')
      .lean();

    if (data.length > 0) {
      for (let solo of data) {
        if ('image' in solo && solo.image && solo.image.url.length > 0) {
          let url = solo.image.url.map((item) => `${protocol}://${hostname}/${item}`);
          solo.image = url;
        }

        if ('group' in solo && solo.group) {
          for (let dataInSolo of solo.group) {
            if ('image' in dataInSolo && dataInSolo.image && dataInSolo.image.url.length > 0) {
              let url = dataInSolo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
              dataInSolo.image = url;
            }
          }
        }
      }

      return sendResponseWithData(res, 200, true, 'Event list fetched successfully!', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No event found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const eventDetails = async (req, res) => {
  try {
    let eventId = req?.params?.id;
    if (!eventId || !isValidObjectId(eventId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid event id!');
    }

    const hostname = req.headers.host;
    const protocol = req.protocol;

    let data = await EventGroup.findOne({ _id: eventId, isDeleted: false })
      .populate([
        { path: 'image', select: '_id url' },
        { path: 'group', select: '-__v -createdAt -updatedAt -isDeleted' },
      ])
      .select('-isDeleted -__v')
      .lean();

    if (data) {
      if ('image' in data && data.image && data.image.url.length > 0) {
        data.image.url = data.image.url.map((item) => `${protocol}://${hostname}/${item}`);
      }

      // let onlyGrpId = data.group.map((item)=>item._id);
      // data.groupId = onlyGrpId;

      return sendResponseWithData(res, 200, true, 'Event details fetched successfully!', data);
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid event id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateEvent = async (req, res) => {
  try {
    let user = req.apiUser;
    let { id, name, group } = req.body;

    let updatedData = {
      name: name,
      group: group,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('description' in req.body && req.body.description) {
      updatedData.description = req.body.description;
    }

    if ('file' in req.body && req.body.file) {
      updatedData.image = req.body.file;
    }

    let dataSave = await EventGroup.updateOne(
      { _id: id },
      {
        $set: updatedData,
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Event has been updated successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Event updation failed, try again in sometime!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteEvent = async (req, res) => {
  try {
    let eventId = req?.params?.id;
    if (!eventId || !isValidObjectId(eventId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid event id!');
    }

    const eventInfo = await EventGroup.findOne({ _id: eventId, isDeleted: false });

    if (!eventInfo) {
      return sendResponseWithoutData(res, 400, false, 'Invalid event Id!');
    }

    let dataSave = await EventGroup.updateOne(
      { _id: eventId },
      {
        $set: {
          isDeleted: true,
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Event has been deleted successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Event deletion failed, try again in sometime!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};


export const addSlugInEvent = async (req, res) => {
  try {
    let findAllEvent = await EventGroup.find();

    for (let data of findAllEvent) {

      let name = removeSpace(data.name.toLowerCase(), "-");
      let createSlug = `${name}-${Date.now()}`;

      await EventGroup.updateOne({ _id: data._id }, { $set: { slug: createSlug } });

    }

    return sendResponseWithoutData(res, 200, true, 'Slugs updated successfully in event!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};