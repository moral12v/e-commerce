import mongoose from 'mongoose';
import { DB_HOST, DB_PORT, DB_NAME } from './config.js';

const databaseConnection = mongoose
  .connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)
  .then(() =>
    console.log(`📊 Database Connected Successfully! 🚀
******************************************`),
  )
  .catch((error) => console.error('❌ Error Connecting To The Database:', error));

export default databaseConnection;
