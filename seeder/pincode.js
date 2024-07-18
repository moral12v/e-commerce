import Pincode from '../src/models/Pincode.js';
import State from '../src/models/State.js';

export const createPincode = async (pinArr) => {
  try {
    for (const pin of pinArr) {
      const existingPincode = await Pincode.findOne({ office: pin.office });

      const state = await State.findOne({ code: 'UP' }).lean();

      const pincodeDataWithCityId = { ...pin, state: state?._id };

      if (existingPincode) {
        console.log(`Pincode ${pin.pincode} already exists. Skipping creation.`);
      } else {
        await Pincode.create(pincodeDataWithCityId);
      }
    }
    return true;
  } catch (error) {
    console.error('Pincode creating states:', error);
    return false;
  }
};
