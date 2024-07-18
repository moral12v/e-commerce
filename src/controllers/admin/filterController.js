import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import FilterCategory from '../../models/FilterCategory.js';
import { isValidObjectId } from 'mongoose';
import VendorProduct from '../../models/VendorProduct.js';
import FilterValue from '../../models/FilterValue.js';
import Sort from '../../models/Sort.js';

export const FilterFieldList = async (req, res) => {
  try {
    let sampleProductTemplate = await VendorProduct.find({})
      .select(
        '-__v -isDeleted -rejectReason -approvedBy -isActive -createdBy -updatedBy -createdAt -updatedAt -status -vendorPrice',
      )
      .limit(1)
      .lean();

    if (sampleProductTemplate.length === 0) {
      return sendResponseWithoutData(res, 400, false, 'No fields available!');
    }

    sampleProductTemplate = Object.keys(sampleProductTemplate[0]);

    return sendResponseWithData(res, 200, true, 'Filter field list!', sampleProductTemplate, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const addFilterCategory = async (req, res) => {
  try {
    let { name, field, type, multiSelect } = req.body;

    let sampleProductTemplate = await VendorProduct.find({}).limit(1).lean();
    if (sampleProductTemplate.length === 0) {
      return sendResponseWithoutData(
        res,
        400,
        false,
        'Product template not available, insert atleast one product from vendor side!',
      );
    }
    sampleProductTemplate = Object.keys(sampleProductTemplate[0]);

    if (!sampleProductTemplate.includes(field)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid field!');
    }

    let filterCategoryData = await FilterCategory.create({
      name,
      field,
      type,
      multiSelect,
    });

    if (filterCategoryData) {
      return sendResponseWithoutData(res, 200, true, 'Filter category added!');
    }
    return sendResponseWithoutData(res, 400, false, 'Filter category fail to add!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateFilterCategory = async (req, res) => {
  try {
    let { id, name, field, isActive, type, multiSelect } = req.body;

    let sampleProductTemplate = await VendorProduct.find({}).limit(1).lean();
    if (sampleProductTemplate.length === 0) {
      return sendResponseWithoutData(
        res,
        400,
        false,
        'Product template not available, insert atleast one product from vendor side!',
      );
    }
    sampleProductTemplate = Object.keys(sampleProductTemplate[0]);

    if (!sampleProductTemplate.includes(field)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid field!');
    }

    let checkExists = await FilterCategory.findOne({ _id: { $ne: id }, name: name, isDeleted: false });
    if (checkExists) {
      return sendResponseWithoutData(res, 400, false, 'Category name already exists!');
    }

    let filterCategoryData = await FilterCategory.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          name,
          field,
          isActive,
          type,
          multiSelect,
        },
      },
    );

    if (filterCategoryData.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Filter category updated!');
    }
    return sendResponseWithoutData(res, 400, false, 'Filter category fail to update!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const removeFilterCategory = async (req, res) => {
  try {
    if (!('id' in req.params) || !isValidObjectId(req.params.id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid filter category id!');
    }

    let checkfilterCategory = await FilterCategory.findOne({ _id: req.params.id, isDeleted: false }).lean();

    if (!checkfilterCategory) {
      return sendResponseWithoutData(res, 400, false, "Filter category doesn't exists!");
    }

    let filterCategoryData = await FilterCategory.updateOne(
      {
        _id: req.params.id,
      },
      { $set: { isDeleted: true } },
    );

    if (filterCategoryData.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Filter category removed!');
    }
    return sendResponseWithoutData(res, 400, false, 'Filter category fail to remove!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const getFilterCategory = async (req, res) => {
  try {
    let filterCategoryData = await FilterCategory.find({ isDeleted: false })
      .select('-isDeleted -__v -createdAt -updatedAt')
      .lean();

    if (filterCategoryData) {
      return sendResponseWithData(res, 200, true, 'Filter category fetched successfully!', filterCategoryData, true);
    }
    return sendResponseWithData(res, 400, false, 'No filter category found!', filterCategoryData, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const getFilterCategoryDetails = async (req, res) => {
  try {
    if (!('id' in req.params) || !isValidObjectId(req.params.id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid filter category id!');
    }

    let checkfilterCategory = await FilterCategory.findOne({ _id: req.params.id, isDeleted: false }).lean();

    if (!checkfilterCategory) {
      return sendResponseWithoutData(res, 400, false, "Filter category doesn't exists!");
    }

    let filterCategoryData = await FilterCategory.findOne({ _id: req.params.id, isDeleted: false })
      .select('-isDeleted -__v -createdAt -updatedAt')
      .lean();

    if (filterCategoryData) {
      return sendResponseWithData(res, 200, true, 'Filter category details fetched successfully!', filterCategoryData);
    }
    return sendResponseWithData(res, 400, false, 'Invalid filter category id!', filterCategoryData);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

// ********** category value start **********

export const addCategoryValue = async (req, res) => {
  try {
    let { category, title } = req.body;

    let checktype = (await FilterCategory.findOne({ _id: category, isDeleted: false })).type;

    let dataObj = {
      filterCategoryId: category,
      title,
    };

    if (checktype === 'range') {
      if (req.body.min && req.body.max && req.body.min > req.body.max) {
        return sendResponseWithoutData(res, 400, false, 'max value should be greater than min value!');
      }

      if (!(req.body.min || req.body.max)) {
        return sendResponseWithoutData(res, 400, false, 'provide atleast one of the range, min or max');
      }

      dataObj.min = req.body.min === 0 ? req.body.min : req.body.min || null;
      dataObj.max = req.body.max === 0 ? req.body.max : req.body.max || null;
    }

    if (checktype === 'match') {
      if (!req.body.match) {
        return sendResponseWithoutData(res, 400, false, "match value required while using category with type 'match'!");
      }
      dataObj.match = req.body.match;
    }

    let categoryValueData = await FilterValue.create(dataObj);

    if (categoryValueData) {
      return sendResponseWithoutData(res, 200, true, 'Filter category vaue added!');
    }
    return sendResponseWithoutData(res, 400, false, 'Filter category value fail to add!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const getFilterCategoryValue = async (req, res) => {
  try {
    if (!('id' in req.params) || !isValidObjectId(req.params.id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid filter category name!');
    }

    let filterCategoryDataValue = await FilterValue.find({
      filterCategoryId: req.params.id,
      isDeleted: false,
    })
      .select('-isDeleted -__v')
      .lean();

    if (filterCategoryDataValue) {
      const result = filterCategoryDataValue;
      return sendResponseWithData(res, 200, true, 'Filter category value fetched successfully!', result, true);
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid filter category name!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const getFilterCategoryValueDetails = async (req, res) => {
  try {
    if (!('categoryId' in req.params) || !isValidObjectId(req.params.categoryId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid filter category id!');
    }

    let checkFilterCategory = await FilterCategory.findOne({
      _id: req.params.categoryId,
      isDeleted: false,
    });

    if (!checkFilterCategory) {
      return sendResponseWithoutData(res, 400, false, 'Invalid filter category id!');
    }

    if (!('id' in req.params) || !isValidObjectId(req.params.id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid filter category value id!');
    }

    let filterCategoryDataValue = await FilterValue.findOne({
      _id: req.params.id,
      filterCategoryId: req.params.categoryId,
      isDeleted: false,
    })
      .select('-isDeleted -__v')
      .lean();

    if (filterCategoryDataValue) {
      return sendResponseWithData(
        res,
        200,
        true,
        'Filter category value details fetched successfully!',
        filterCategoryDataValue,
      );
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid filter category value of given provided category id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const removeFilterCategoryValue = async (req, res) => {
  try {
    let { id } = req.body;

    let filterCategoryData = await FilterValue.updateOne(
      {
        _id: id,
      },
      { $set: { isDeleted: true } },
    );

    if (filterCategoryData.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Filter category value removed!');
    }
    return sendResponseWithoutData(res, 400, false, 'Filter category value fail to remove!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateFilterCategoryValue = async (req, res) => {
  try {
    let { id, title, isActive } = req.body;

    let getValueInfo = await FilterValue.findOne({ _id: id, isDeleted: false }).lean();

    let checktype = (await FilterCategory.findOne({ _id: getValueInfo.filterCategoryId, isDeleted: false })).type;

    let dataObj = {
      title,
      isActive,
    };

    if (checktype === 'range') {
      if (req.body.min && req.body.max && req.body.min > req.body.max) {
        return sendResponseWithoutData(res, 400, false, 'max value should be greater than min value!');
      }

      if (!(req.body.min || req.body.max)) {
        return sendResponseWithoutData(res, 400, false, 'provide atleast one of the range, min or max');
      }

      dataObj.min = req.body.min === 0 ? req.body.min : req.body.min || null;
      dataObj.max = req.body.max === 0 ? req.body.max : req.body.max || null;
    }

    if (checktype === 'match') {
      if (!req.body.match) {
        return sendResponseWithoutData(res, 400, false, "match value required while using category with type 'match'!");
      }
      dataObj.match = req.body.match;
    }

    let filterCategoryData = await FilterValue.updateOne(
      {
        _id: id,
      },
      { $set: dataObj },
    );

    if (filterCategoryData.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Filter category value updated!');
    }
    return sendResponseWithoutData(res, 400, false, 'Filter category value fail to update!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

// ********** sorting value start **********

export const addSortingValue = async (req, res) => {
  try {
    let { name, type, field } = req.body;

    let sampleProductTemplate = await VendorProduct.find({}).limit(1).lean();
    if (sampleProductTemplate.length === 0) {
      return sendResponseWithoutData(
        res,
        400,
        false,
        'Product template not available, insert atleast one product from vendor side!',
      );
    }
    sampleProductTemplate = Object.keys(sampleProductTemplate[0]);

    if (!sampleProductTemplate.includes(field)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid field provided!');
    }

    let dataObj = {
      name,
      type,
      field,
    };

    if (type === 'ascending') {
      dataObj.value = '1';
    }

    if (type === 'descending') {
      dataObj.value = '-1';
    }

    let sortingValueData = await Sort.create(dataObj);

    if (sortingValueData) {
      return sendResponseWithoutData(res, 200, true, 'Filter sorting vaue added!');
    }
    return sendResponseWithoutData(res, 400, false, 'Filter sorting value fail to add!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const getFilterSortingList = async (req, res) => {
  try {
    let filterCategoryDataValue = await Sort.find({
      isDeleted: false,
    })
      .select('-isDeleted -__v')
      .lean();

    if (filterCategoryDataValue.length > 0) {
      return sendResponseWithData(res, 200, true, 'Sorting list fetched successfully!', filterCategoryDataValue, true);
    }
    return sendResponseWithData(res, 200, true, 'No sorting available!', [], true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const getFilterSortingValue = async (req, res) => {
  try {
    if (!('id' in req.params) || !isValidObjectId(req.params.id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid filter sorting id!');
    }

    let filterSortingDataValue = await Sort.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .select('-isDeleted -__v')
      .lean();

    if (filterSortingDataValue) {
      return sendResponseWithData(res, 200, true, 'Sorting list fetched successfully!', filterSortingDataValue);
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid sorting value!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const removeFilterSorting = async (req, res) => {
  try {
    if (!('id' in req.params) || !isValidObjectId(req.params.id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid filter sorting id!');
    }

    let checkExists = await Sort.findOne({ _id: req.params.id, isDeleted: false });
    if (!checkExists) {
      return sendResponseWithoutData(res, 400, false, 'Invalid filter sorting id!');
    }

    let filterSortingData = await Sort.updateOne(
      {
        _id: req.params.id,
      },
      { $set: { isDeleted: true } },
    );

    if (filterSortingData.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Filter sorting value deleted!');
    }
    return sendResponseWithoutData(res, 400, false, 'Filter sorting value fail to delete!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateFilterSortingValue = async (req, res) => {
  try {
    let { id, name, field, type, isActive } = req.body;

    let sampleProductTemplate = await VendorProduct.find({}).limit(1).lean();
    if (sampleProductTemplate.length === 0) {
      return sendResponseWithoutData(
        res,
        400,
        false,
        'Product template not available, insert atleast one product from vendor side!',
      );
    }
    sampleProductTemplate = Object.keys(sampleProductTemplate[0]);

    if (!sampleProductTemplate.includes(field)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid field provided!');
    }

    let updatedDataObj = {
      name,
      type,
      field,
      isActive,
    };

    if (type === 'ascending') {
      updatedDataObj.value = '1';
    }

    if (type === 'descending') {
      updatedDataObj.value = '-1';
    }

    let filterSortingData = await Sort.updateOne({ _id: id }, { $set: updatedDataObj });

    if (filterSortingData.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Filter sorting value updated!');
    }
    return sendResponseWithoutData(res, 400, false, 'Filter sorting value fail to update!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
