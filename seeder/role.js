import Role from '../src/models/Role.js';

export const createRoles = async (data) => {
  const checkNullDb = await Role.find({});

  if (checkNullDb.length === 0) {
    let rolesCheck = await Role.insertMany(data);

    if (rolesCheck) {
      console.log('Roles created...!');
    }
  }else{
    console.log("Roles already in the database, skipped!");
  }

  return true;
};
