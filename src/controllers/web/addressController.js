import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendErrorResponse, sendResponseWithoutData } from '../../helpers/helper.js';
import State from '../../models/State.js';
import City from '../../models/City.js';
import Pincode from '../../models/Pincode.js';
import Address from '../../models/Address.js';
import { isValidObjectId } from 'mongoose';

export const searchPinCode = async (req, res) => {
  try {
    const pin = req.params.pin || null;
    if (!pin) {
      return sendResponseWithoutData(res, 400, false, 'No pin provided!');
    }

    let data = await Pincode.find({ pincode: { $regex: pin, $options: 'i' }, isActive: true })
      .populate({ path: 'state', select: 'name' })
      .select('-createdAt -updatedAt -__v -isActive');

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Pincode list fetched successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No pincodes found', [], true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const listState = async (req, res) => {
  try {

    const page = Number(req.body.page) || 1;
    const count = Number(req.body.count) || 10;

    let paginationStatus =
      "all" in req.body && req.body.all === true ? true : false;

    let newData = State.find({ isActive: true }).select('-createdAt -updatedAt -__v -isActive');

    if (paginationStatus) {

      newData = newData.skip((page - 1) * count).limit(count);
    }

    let data = await newData;

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'State list fetched successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No states found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const listCity = async (req, res) => {
  try {
    let filter = { isActive: true };
    if (req.body.state && req.body.state !== '') {
      filter.stateId = req.body.state;
    }

    const page = Number(req.body.page) || 1;
    const count = Number(req.body.count) || 10;

    let paginationStatus =
      "all" in req.body && req.body.all === true ? true : false;

    let newData = City.find(filter).select('-createdAt -updatedAt -__v -isActive');

    if (paginationStatus) {

      newData = newData.skip((page - 1) * count).limit(count);
    }

    let data = await newData;

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'City list fetched successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No city found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const addAddress = async (req, res) => {
  try {
    let user = req.apiUser;

    let { name, type, mobile, street, city, state, country, postalCode } = req.body;

    if ('isDefault' in req.body && req.body.isDefault) {
      await Address.updateMany({ userId: user._id, isDeleted: false }, { $set: { isDefault: false } });
    }

    let data = await Address.create({
      userId: user._id,
      name,
      type,
      mobile,
      alternateMobile: req.body.alternateMobile || null,
      street,
      city,
      state,
      country,
      postalCode,
      landmark: req.body?.landmark || '',
      isDefault: req.body?.isDefault || false,
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (data) {
      return sendResponseWithoutData(res, 200, true, 'Address inserted successfully');
    }

    return sendResponseWithoutData(res, 400, false, 'Address insertion failed, try again in sometime.');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const listAddress = async (req, res) => {
  try {
    let user = req.apiUser;

    let data = await Address.find({ userId: user._id, isDeleted: false })
      .populate([
        { path: 'city', select: '_id name' },
        { path: 'state', select: '_id name' },
      ])
      .select('-__v -isDeleted -createdAt -updatedAt -userId')
      .lean();



    if (data.length > 0) {
      // data = data.map((item) => {
      //   item['cityId'] = item?.city?._id || null;
      //   item['stateId'] = item?.state?._id || null;
      //   return item;
      // });
      return sendResponseWithData(res, 200, true, 'Address fetched successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No address found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const detailAddress = async (req, res) => {
  try {
    let user = req.apiUser;

    const addressId = req.params.id;
    if (!isValidObjectId(addressId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid address id!');
    }

    let data = await Address.findOne({ _id: addressId, userId: user._id, isDeleted: false })
      .populate([
        { path: 'city', select: '_id name' },
        { path: 'state', select: '_id name' },
      ])
      .select('-__v -isDeleted -createdAt -updatedAt -userId')
      .lean();

    if (data) {
      let tempCityData = data.city;
      data.city = tempCityData._id;
      data.cityName = tempCityData.name;

      let tempStateData = data.state;
      data.state = tempStateData._id;
      data.stateName = tempStateData.name;
      return sendResponseWithData(res, 200, true, 'Address detials fetched successfully', data);
    }

    return sendResponseWithData(res, 400, true, 'Invalid address id', data);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteAddress = async (req, res) => {
  try {
    let user = req.apiUser;

    const addressId = req.params.id;
    if (!isValidObjectId(addressId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid address id!');
    }

    let data = await Address.updateOne(
      { _id: addressId, userId: user._id, isDeleted: false },
      { $set: { isDeleted: true } },
    );

    if (data.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Address removed successfully');
    }

    return sendResponseWithoutData(res, 400, true, 'Invalid address id');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateAddress = async (req, res) => {
  try {
    let user = req.apiUser;

    let { addressId, name, type, mobile, street, city, state, country, postalCode } = req.body;

    if ('isDefault' in req.body && req.body.isDefault) {
      await Address.updateMany({ userId: user._id, isDeleted: false }, { $set: { isDefault: false } });
    }

    let updatedData = {
      name,
      type,
      mobile,
      street,
      city,
      state,
      country,
      postalCode,
      landmark: req.body?.landmark || '',
      isDefault: req.body?.isDefault || false,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('alternateMobile' in req.body && req.body.alternateMobile && req.body.alternateMobile.length > 0) {
      updatedData.alternateMobile = req.body.alternateMobile;
    }

    let data = await Address.updateOne(
      {
        _id: addressId,
      },
      {
        $set: updatedData,
      },
    );

    if (data.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Address updated successfully');
    }

    return sendResponseWithoutData(res, 400, false, 'Address updation failed, try again in sometime.');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    let user = req.apiUser;

    if (!('id' in req.params) || !req.params.id || !isValidObjectId(req.params.id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid address id!');
    }

    let checkExists = await Address.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!checkExists) {
      return sendResponseWithoutData(res, 400, false, 'Invalid address id!');
    }

    let updatedData = {
      isDefault: true,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    let data = await Address.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: updatedData,
      },
    );

    if (data.modifiedCount > 0) {
      await Address.updateMany(
        {
          _id: { $ne: req.params.id },
          userId: user._id,
          isDeleted: false,
        },
        {
          $set: { isDefault: false },
        },
      );

      return sendResponseWithoutData(res, 200, true, 'Address updated successfully');
    }

    return sendResponseWithoutData(res, 400, false, 'Address updation failed, try again in sometime.');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
