import Category from '../src/models/Category.js';
import FilterCategory from '../src/models/FilterCategory.js';
import FilterValue from '../src/models/FilterValue.js';
import Segment from '../src/models/Segment.js';
import Sort from '../src/models/Sort.js';

export const createFilterCategory = async (data) => {
  const checkNullDb = await FilterCategory.find({});

  if (checkNullDb.length === 0) {
    for (const item of data) {
      let filterCategory = await FilterCategory.findOne({ name: item.name });

      if (!filterCategory) {
        await FilterCategory.create({
          name: item.name,
          field: item.field,
          type: item.type,
          multiSelect: item.multiSelect,
        });
      } else {
        console.log(`Filter Category with name '${item.name}' already exists in the database, skipped!`);
      }
    }

    console.log('Filter Category created...!');
  } else {
    console.log('Filter Category already in the database, skipped!');
  }

  return true;
};

export const createFilterCategoryValue = async (data) => {
  const checkNullDb = await FilterValue.find({});

  if (checkNullDb.length === 0) {
    for (const item of data) {
      let filterCategoryData = await FilterCategory.findOne({ name: item.filterCategory }).lean();

      if (filterCategoryData) {
        await FilterValue.create({
          filterCategoryId: filterCategoryData._id,
          title: item.title,
          min: item.min !== null && item.min >= 0 ? item.min : null,
          max: item.max !== null && item.max >= 0 ? item.max : null,
          match: item.match || null,
        });
      } else {
        console.log(`No category available with name '${item.filterCategory}'`);
      }
    }

    let segmentData = await Segment.find({ isDeleted: false }).lean();

    if (segmentData.length > 0) {
      for (const soloSegment of segmentData) {
        let filterCategoryData = await FilterCategory.findOne({ name: 'Segment' }).lean();

        if (filterCategoryData) {
          await FilterValue.create({
            filterCategoryId: filterCategoryData._id,
            title: soloSegment.name,
            min: null,
            max: null,
            match: soloSegment._id,
          });
        }
      }
    }

    let categoryData = await Category.find({ isDeleted: false }).lean();

    if (categoryData.length > 0) {
      for (const soloCategory of categoryData) {
        let filterCategoryData = await FilterCategory.findOne({ name: 'Category' }).lean();

        if (filterCategoryData) {
          await FilterValue.create({
            filterCategoryId: filterCategoryData._id,
            title: soloCategory.name,
            min: null,
            max: null,
            match: soloCategory._id,
          });
        }
      }
    }

    console.log('Filter Category values created...!');
  } else {
    console.log('Filter Category values already in the database, skipped!');
  }

  return true;
};

export const createFilterSorting = async (data) => {
  const checkNullDb = await Sort.find({});

  if (checkNullDb.length === 0) {
    for (const item of data) {
      let filterSortingData = await Sort.findOne({ name: item.name }).lean();

      if (!filterSortingData) {
        await Sort.create({
          name: item.name,
          field: item.field,
          type: item.type,
          value: item.type === 'ascending' ? 1 : -1,
        });
      } else {
        console.log(`Sorting filter with name '${item.name}' already exists in the database, skipped!`);
      }
    }

    console.log('Sorting filter created...!');
  } else {
    console.log('Sorting filter already in the database, skipped!');
  }

  return true;
};
