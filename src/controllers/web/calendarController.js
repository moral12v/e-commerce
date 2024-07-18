import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import Calendar from '../../models/Calendar.js';
import PoojaPackage from '../../models/PoojaPackage.js';

export const listFest = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let filter = {
      isDeleted: false,
      isActive: true,
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
          select: '-isDeleted -__v -createdBy -updatedBy -createdAt -updatedAt -isActive',
          populate: { path: 'image', select: 'url' },
        },
      ])
      .select('-isDeleted -__v -createdBy -updatedBy -createdAt -updatedAt -isActive')
      .lean();

    for (let fest of fests) {
      if (fest.image && fest.image.url.length > 0) {
        let url = fest.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        fest.image = url;

        if (fest.package && fest.package.image && fest.package.image.url.length > 0) {
          let url = fest.package.image.url.map((item) => `${protocol}://${hostname}/${item}`);
          fest.package.image = url;
        }
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
      let filter = { _id: req.params.id, isActive: true, isDeleted: false };

      let data = await Calendar.findOne(filter)
        .populate([
          { path: 'image', select: '_id url' },
          {
            path: 'package',
            select: '-isDeleted -__v -createdBy -updatedBy -createdAt -updatedAt -isActive',
            populate: [
              { path: 'image', select: 'url' },
              {
                path: 'elements',
                select: '-isDeleted -__v -createdBy -updatedBy -createdAt -updatedAt -isActive',
                populate: { path: 'image', select: 'url' },
              },
            ],
          },
        ])
        .select('-isDeleted -__v -createdBy -updatedBy -createdAt -updatedAt -isActive')
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

        if (data.package && data.package.elements && data.package.elements.length > 0) {
          for (let pck of data.package.elements) {
            if (pck.image && pck.image.url.length > 0) {
              pck.image.url = pck.image.url.map((item) => `${protocol}://${hostname}/${item}`);
            }
          }
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

export const packageDetailById = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isActive: true, isDeleted: false };

      let data = await PoojaPackage.findOne(filter)
        .populate([
          { path: 'image', select: 'url' },
          {
            path: 'elements',
            select: '-isDeleted -__v -createdBy -updatedBy -createdAt -updatedAt -isActive',
            populate: { path: 'image', select: 'url' },
          },
        ])
        .select('-isDeleted -__v -createdBy -updatedBy -createdAt -updatedAt -isActive')
        .lean();

      if (data) {
        const hostname = req.headers.host;
        const protocol = req.protocol;

        if (data.image && data.image.url.length > 0) {
          data.image.url = data.image.url.map((item) => `${protocol}://${hostname}/${item}`);
        }

        if (data.elements && data.elements.length > 0) {
          for (let pck of data.elements) {
            if (pck.image && pck.image.url.length > 0) {
              pck.image.url = pck.image.url.map((item) => `${protocol}://${hostname}/${item}`);
            }
          }
        }

        return sendResponseWithData(res, 200, true, 'Calendar details fetched successfully', data);
      }

      return sendResponseWithoutData(res, 400, false, 'Invalid package id');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid package id');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};
