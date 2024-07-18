import Segment from '../src/models/Segment.js';

export const createSegment = async (data) => {
  const checkNullDb = await Segment.find({});

  if (checkNullDb.length === 0) {
    let categoryCheck = await Segment.insertMany(data);

    if (categoryCheck) {
      console.log('Segment created...!');
    }
  }else{
    console.log("Segment already in the database, skipped!");
  }

  return true;
};
