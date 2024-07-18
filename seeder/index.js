import readline from 'readline';
import mongoose from 'mongoose';
import { SEEDER_PASSWORD } from '../config/config.js';
import { DB_HOST, DB_PORT, DB_NAME } from '../config/config.js';
import { createAdmin } from './admin.js';
import { createRoles } from './role.js';
import { readFile } from 'fs/promises';
import { createSegment } from './segment.js';
import { createCategory } from './category.js';
import { createState } from './state.js';
import { createCity } from './city.js';
import { createFilterCategory, createFilterCategoryValue, createFilterSorting } from './filter.js';
import { createPincode } from './pincode.js';
import { createSettings } from './setting.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const connectToDatabase = async () => {
  try {
    await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database Connected Successfully!');
    performSeeding();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

const performSeeding = () => {
  rl.question('Enter the seeding key : ', async (key) => {
    rl.close();
    if (key === SEEDER_PASSWORD) {
      // if (true) {
      try {
        if (mongoose.connection.readyState !== 1) {
          console.error('MongoDB connection not ready. Seeding aborted.');
          process.exit(1);
        }

        let jsonData = await readFile(`seeder/data/data.json`, 'utf-8');

        if (jsonData) {
          jsonData = JSON.parse(jsonData);

          const categoryAvailable = await createSegment(jsonData.segment);

          if (categoryAvailable) {
            await createCategory(jsonData.category);
          }

          const rolesAvailable = await createRoles(jsonData.role);
          if (rolesAvailable) {
            await createAdmin(jsonData.admin);
          }

          const statesAvailable = await createState();
          if (statesAvailable) {
            await createCity();
          }

          const filterCategoryAvailable = await createFilterCategory(jsonData.filterCategory);
          if (filterCategoryAvailable) {
            await createFilterCategoryValue(jsonData.filterValue);
          }

          const filterSorting = await createFilterSorting(jsonData.filterSorting);
        } else {
          throw new Error('Date not available...!');
        }

        let pincodeData = await readFile('seeder/data/lucknow_pincode.json', 'utf-8');

        if (pincodeData) {
          pincodeData = JSON.parse(pincodeData);
          await createPincode(pincodeData);
        } else {
          throw new Error('Date not available for pincode...!');
        }

        let settingsData = await readFile('seeder/data/general_settings.json', 'utf-8');

        if (settingsData) {
          settingsData = JSON.parse(settingsData);
          await createSettings(settingsData);
        } else {
          throw new Error('Date not available for settings...!');
        }

        mongoose.connection.close();
        console.log('Database Disconnected.');
      } catch (error) {
        console.error('Error during seeding operations:', error);
        process.exit(1);
      }
    } else {
      console.error('Invalid key. Seeding aborted.');
      process.exit(1);
    }
  });
};

connectToDatabase();
