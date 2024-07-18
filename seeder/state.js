import State from '../src/models/State.js';
import { indianStates } from './data/state.js';
export const createState = async () => {
  try {
    for (const stateData of indianStates) {
      const existingState = await State.findOne({ code: stateData.code });

      if (existingState) {
        console.log(`State with code ${stateData.code} already exists. Skipping creation.`);
      } else {
        await State.create(stateData);
        // console.log(`State with code ${stateData.code} created successfully.`);
      }
    }
    return true;
  } catch (error) {
    console.error('Error creating states:', error);
    return false;
  }
}