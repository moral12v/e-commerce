import Segment from '../src/models/Segment.js';
import Category from '../src/models/Category.js';

export const createCategory = async (data) => {
  const checkNullDb = await Category.find({});

  if (checkNullDb.length === 0) {
    for (const item of data) {
      let segment = await Segment.findOne({ name: item.segment });
      if (segment) {
        for(const subCat of item.data){
          await Category.create({
            name: subCat.name,
            segment: segment.id,
          });
        }
      }
    }

    console.log('Categories created...!');
  }else{
    console.log("Category already in the database, skipped!");
  }
};
