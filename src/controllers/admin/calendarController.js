import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  makeObjectId,
} from '../../helpers/helper.js';
import Calendar from '../../models/Calendar.js';
import PoojaElement from '../../models/PoojaElement.js';
import PoojaPackage from '../../models/PoojaPackage.js';

export const createFest = async (req, res) => {
  try {
    let user = req.apiUser;

    let { name, date } = req.body;

    let newData = {
      name,
      date,
      createdBy: user._id,
      updatedBy: user._id,
    };

    if ('description' in req.body && req.body.description) {
      newData.description = req.body.description;
    }

    if ('file' in req.body && req.body.file) {
      newData.image = req.body.file;
    }

    if ('packageId' in req.body && req.body.packageId) {
      newData.package = req.body.packageId;
    }

    const dataSave = await Calendar.create(newData);

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Fest has been added to calendar successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Fail to add fest in the calendar!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listFest = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let filter = {
      isDeleted: false,
      $expr: {
        $and: [],
      },
    };

    if ('day' in req.body && req.body.day) {
      filter.$expr.$and.push({ $eq: [{ $dayOfMonth: '$date' }, req.body.day] });
    }

    if ('month' in req.body && req.body.month) {
      filter.$expr.$and.push({ $eq: [{ $month: '$date' }, req.body.month] });
    }

    if ('year' in req.body && req.body.year) {
      filter.$expr.$and.push({ $eq: [{ $year: '$date' }, req.body.year] });
    }

    let fests = await Calendar.find(filter)
      .populate([
        { path: 'image', select: '_id url' },
        {
          path: 'package',
          select: '-isDeleted -__v',
        },
      ])
      .select('-isDeleted -__v')
      .lean();

    for (let fest of fests) {
      if (fest.image && fest.image.url.length > 0) {
        let url = fest.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        fest.image = url;
      }
    }

    sendResponseWithData(res, 200, true, 'Fests list fetched successfully!', fests, true);
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const festDetails = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await Calendar.findOne(filter)
        .populate([
          { path: 'image', select: '_id url' },
          {
            path: 'package',
            select: '-isDeleted -__v',
            populate: [
              { path: 'image', select: 'url' },
              { path: 'elements', select: '-isDeleted -__v' },
            ],
          },
        ])
        .select('-isDeleted -__v')
        .lean();

      if (data) {
        const hostname = req.headers.host;
        const protocol = req.protocol;

        if (data.image && data.image.url.length > 0) {
          data.image.url = data.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        }

        if (data.package && data.package.image && data.package.image.url.length > 0) {
          data.package.image.url = data.package.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        }

        return sendResponseWithData(res, 200, true, 'Calendar details fetched successfully', data);
      }

      return sendResponseWithoutData(res, 400, false, 'Invalid calendar id');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid calendar id');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const editFest = async (req, res) => {
  try {
    let user = req.apiUser;

    let { id, name, date, isActive } = req.body;

    let updatedData = {
      name,
      date,
      isActive,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('description' in req.body && req.body.description) {
      updatedData.description = req.body.description;
    }

    if ('file' in req.body && req.body.file) {
      updatedData.image = req.body.file;
    }

    if ('packageId' in req.body && req.body.packageId) {
      updatedData.package = req.body.packageId;
    }

    const dataSave = await Calendar.updateOne({ _id: id }, { $set: updatedData });

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Fest has been updated successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Fail to update fest in the calendar!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const deleteFest = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await Calendar.findOne(filter).lean();

      if (data) {
        let removeData = await Calendar.updateOne(
          { _id: req.params.id },
          {
            $set: { isDeleted: true },
          },
        );

        if (removeData.modifiedCount > 0) {
          return sendResponseWithoutData(res, 200, true, 'Calendar fest deleted successfully');
        }
        return sendResponseWithoutData(res, 400, false, 'Fail to delete calendar fest, try again in sometime');
      }

      return sendResponseWithoutData(res, 400, false, 'Invalid calendar id');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid calendar id');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

// ********************** Pooja Element **********************

export const createPoojaElement = async (req, res) => {
  try {
    let user = req.apiUser;

    let { name } = req.body;

    let newData = {
      name,
      createdBy: user._id,
      updatedBy: user._id,
    };

    if ('description' in req.body && req.body.description) {
      newData.description = req.body.description;
    }

    if ('file' in req.body && req.body.file) {
      newData.image = req.body.file;
    }

    const dataSave = await PoojaElement.create(newData);

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Pooja element has been added successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Fail to add pooja element!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listPoojaElement = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let poojaElems = await PoojaElement.find({ isDeleted: false })
      .populate([{ path: 'image', select: '_id url' }])
      .select('-isDeleted -__v')
      .lean();

    for (let fest of poojaElems) {
      if (fest.image && fest.image.url.length > 0) {
        let url = fest.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        fest.image = url;
      }
    }

    sendResponseWithData(res, 200, true, 'Pooja element list fetched successfully!', poojaElems, true);
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const PoojaElementDetails = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await PoojaElement.findOne(filter)
        .populate([{ path: 'image', select: '_id url' }])
        .select('-isDeleted -__v')
        .lean();

      if (data) {
        if (data.image && data.image.url.length > 0) {
          const hostname = req.headers.host;
          const protocol = req.protocol;
          data.image.url = data.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        }
        return sendResponseWithData(res, 200, true, 'Pooja element details fetched successfully', data);
      }

      return sendResponseWithoutData(res, 400, false, 'Invalid Pooja element id');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid Pooja element id');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const editPoojaElement = async (req, res) => {
  try {
    let user = req.apiUser;

    let { id, name, isActive } = req.body;

    let updatedData = {
      name,
      isActive,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('description' in req.body && req.body.description) {
      updatedData.description = req.body.description;
    }

    if ('file' in req.body && req.body.file) {
      updatedData.image = req.body.file;
    }

    const dataSave = await PoojaElement.updateOne({ _id: id }, { $set: updatedData });

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Pooja element has been updated successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Fail to update pooja element!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const deletePoojaElement = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await PoojaElement.findOne(filter).lean();

      if (data) {
        let removeData = await PoojaElement.updateOne(
          { _id: req.params.id },
          {
            $set: { isDeleted: true },
          },
        );

        if (removeData.modifiedCount > 0) {
          return sendResponseWithoutData(res, 200, true, 'Pooja element fest deleted successfully');
        }
        return sendResponseWithoutData(res, 400, false, 'Fail to delete pooja element, try again in sometime');
      }

      return sendResponseWithoutData(res, 400, false, 'Invalid pooja element id');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid pooja element id');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

// ********************** Pooja Package **********************

export const createPoojaPackage = async (req, res) => {
  try {
    let user = req.apiUser;

    let { name, price, segment, stock } = req.body;

    let newData = {
      name,
      price,
      segment,
      stock,
      mrp: req.body.mrp && req.body.mrp > price ? req.body.mrp : price,
      createdBy: user._id,
      updatedBy: user._id,
    };

    if ('description' in req.body && req.body.description) {
      newData.description = req.body.description;
    }

    if ('file' in req.body && req.body.file) {
      newData.image = req.body.file;
    }

    const dataSave = await PoojaPackage.create(newData);

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Pooja package has been added successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Fail to add pooja package!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listPoojaPackage = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let poojaElems = await PoojaPackage.find({ isDeleted: false })
      .populate([
        { path: 'image', select: '_id url' },
        { path: 'elements', select: 'name' },
        { path: 'segment', select: 'name' },
      ])
      .select('-isDeleted -__v')
      .lean();

    for (let fest of poojaElems) {
      if (fest.image && fest.image.url.length > 0) {
        let url = fest.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        fest.image = url;
      }
    }

    sendResponseWithData(res, 200, true, 'Pooja package list fetched successfully!', poojaElems, true);
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const poojaPackageDetails = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await PoojaPackage.findOne(filter)
        .populate([
          { path: 'image', select: '_id url' },
          { path: 'elements', select: '-isDeleted -__v', populate: [{ path: 'image', select: 'url' }] },
          {
            path: 'segment',
            select: '-isDeleted -__v -updatedBy -createdAt -updatedAt',
            populate: [{ path: 'image', select: 'url' }],
          },
        ])
        .select('-isDeleted -__v')
        .lean();

      if (data) {
        const hostname = req.headers.host;
        const protocol = req.protocol;
        if (data.image && data.image.url.length > 0) {
          data.image.url = data.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        }

        if (data.elements && data.elements.length > 0) {
          for (let elem of data.elements) {
            if (elem.image && elem.image.url.length > 0) {
              elem.image.url = elem.image.url.map((item) => `${protocol}://${hostname}/${item}`);
            }
          }
        }

        if (data.segment && data.segment.image && data.segment.image.url.length > 0) {
          data.segment.image.url = data.segment.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        }

        return sendResponseWithData(res, 200, true, 'Pooja package details fetched successfully', data);
      }

      return sendResponseWithoutData(res, 400, false, 'Invalid Pooja package id');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid Pooja package id');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const editPoojaPackage = async (req, res) => {
  try {
    let user = req.apiUser;

    let { id, name, stock, price, isActive, segment } = req.body;

    let updatedData = {
      name,
      price,
      segment,
      stock,
      mrp: req.body.mrp && req.body.mrp > price ? req.body.mrp : price,
      isActive,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('description' in req.body && req.body.description) {
      updatedData.description = req.body.description;
    }

    if ('file' in req.body && req.body.file) {
      updatedData.image = req.body.file;
    }

    const dataSave = await PoojaPackage.updateOne({ _id: id }, { $set: updatedData });

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Pooja package has been updated successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Fail to update pooja package!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const deletePoojaPackage = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await PoojaPackage.findOne(filter).lean();

      if (data) {
        let removeData = await PoojaPackage.updateOne(
          { _id: req.params.id },
          {
            $set: { isDeleted: true },
          },
        );

        if (removeData.modifiedCount > 0) {
          return sendResponseWithoutData(res, 200, true, 'Pooja package deleted successfully');
        }
        return sendResponseWithoutData(res, 400, false, 'Fail to delete pooja package, try again in sometime');
      }

      return sendResponseWithoutData(res, 400, false, 'Invalid pooja package id');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid pooja package id');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const addItemsToPackage = async (req, res) => {
  try {
    let { packageId, element } = req.body;

    let filteredIds = await Promise.all(
      element.map(async (item) => {
        if (await PoojaElement.findOne({ _id: item, isDeleted: false })) {
          return makeObjectId(item);
        }
      }),
    );

    for (const objId of filteredIds) {
      await PoojaPackage.updateOne({ _id: packageId }, { $push: { elements: objId } });
    }

    return sendResponseWithoutData(res, 200, true, 'Item added to pooja package successfully!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const removeItemsToPackage = async (req, res) => {
  try {
    let { packageId, element } = req.body;

    for (const objId of element) {
      await PoojaPackage.updateOne({ _id: packageId }, { $pull: { items: makeObjectId(objId) } });
    }

    return sendResponseWithoutData(res, 200, true, 'Item removed from pooja package successfully!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const replaceItemsToPackage = async (req, res) => {
  try {
    let { packageId, element } = req.body;
    let filteredIds = [];

    for (const ids of element) {
      if (isValidObjectId(ids)) {
        if (await PoojaElement.findOne({ _id: ids, isDeleted: false })) {
          filteredIds.push(makeObjectId(ids));
        }
      }
    }
    await PoojaPackage.updateOne({ _id: packageId }, { $set: { elements: filteredIds } });

    return sendResponseWithoutData(res, 200, true, 'Item updated to pooja package successfully!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};
