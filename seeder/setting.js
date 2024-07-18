import Setting from '../src/models/Setting.js';

export const createSettings = async (data) => {
  const checkNullDb = await Setting.find({ name: 'general settings' });

  if (checkNullDb.length === 0) {
    let formattedData = {
      name: 'general settings',
      data,
    };
    let settings = await Setting.insertMany(formattedData);

    if (settings) {
      console.log('Setting created...!');
    }
  } else {
    console.log('Setting already exists in the database, skipped!');
  }

  const checkNullDbBanner = await Setting.find({ name: 'banner' });

  if (checkNullDbBanner.length === 0) {
    let formattedData = {
      name: 'banner',
      data: [],
    };
    let settings = await Setting.insertMany(formattedData);

    if (settings) {
      console.log('Setting created...!');
    }
  } else {
    console.log('Setting already exists in the database, skipped!');
  }

  return true;
};
