import { hashPassword } from '../src/helpers/helper.js';
import Role from '../src/models/Role.js';
import User from '../src/models/User.js';

export const createAdmin = async (data) => {
  const checkNullDb = await User.find({});

  if (checkNullDb.length === 0) {
    let adminRoleId = await Role.findOne({ name: 'admin', isDeleted: false, isActive: true });

    let admin = await User.create({
      name: data.name,
      email: data.email,
      password: await hashPassword('1234'),
      mobile: data.mobile,
      role: adminRoleId.id,
      type: data.type,
      isEmailVerify: true,
      otp: 1000,
      otpExpiryTime: Date.now(),
    });

    if (admin) {
      console.log('Admin created...!');
    }
  }else{
    console.log("Users already in the database, skipped!");
  }
};
