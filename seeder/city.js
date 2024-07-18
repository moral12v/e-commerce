import { indianCity } from './data/city.js';
import City from '../src/models/City.js';
import State from '../src/models/State.js';

export const createCity = async () => {
  try {
    for (const cityData of indianCity) {
      const existingCity = await City.findOne({ name: cityData.name }); 
      
      const state = await State.findOne({ code: cityData?.stateCode });

      const cityDataWithStateId = { ...cityData, stateId: state?._id };

      if (existingCity) {
        console.log(`City with name ${cityData.name} already exists. Skipping creation.`);
      } else {
        await City.create(cityDataWithStateId);
        // console.log(`City with name ${cityData.name} created successfully.`);
      }
    }
    return true;
  } catch (error) {
    console.error('City creating states:', error);
    return false;
  }
};
