const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const otpStore = new Map(); // Bộ nhớ tạm thời lưu OTP

const { genneralAccessToken, genneralRefreshToken } = require("./JwtService");
const {
  sendEmailForgotPassword,
  generateOTP,
  sendEmailRegisterOTP
} = require("../services/EmailService");
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, email, password, confirmPassword, phone } = newUser;
    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser !== null) {
        resolve({
          status: "ERR",
          message: "Email này đã bị trùng",
        });
      }
      const hash = bcrypt.hashSync(password, 10);
      const createdUser = await User.create({
        name,
        email,
        password: hash,
        phone,
      });
      if (createdUser) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdUser,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "Tài khoản không tồn tại",
        });
      }
      if (checkUser.isBlock) {
        resolve({
          status: "ERR",
          message: "Tài khoản này đã bị khóa !",
        });
        return;
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);

      if (!comparePassword) {
        resolve({
          status: "ERR",
          message: "Email hoặc Mật khẩu không đúng, Vui lòng thử lại!",
        });
      }
      const access_token = await genneralAccessToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      const refresh_token = await genneralRefreshToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      resolve({
        status: "OK",
        message: "SUCCESS",
        access_token,
        refresh_token,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        _id: id,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedUser,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: "An error occurred while updating the user",
        error: e.message,
      });
    }
  });
};

const updateIsBlockStatus = (id, isBlock) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(id);

      if (!user) {
        resolve({
          status: "ERR",
          message: "User not found",
        });
      }

      user.isBlock = isBlock; // Cập nhật trạng thái isBlock
      await user.save(); // Lưu lại thay đổi

      resolve({
        status: "OK",
        message: "User block status updated successfully",
        data: user,
      });
    } catch (error) {
      reject({
        status: "ERR",
        message: "An error occurred while updating isBlock",
        error: error.message,
      });
    }
  });
};

const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        _id: id,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }

      await User.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "Delete user success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteManyUser = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await User.deleteMany({ _id: ids });
      resolve({
        status: "OK",
        message: "Delete user success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find().sort({ createdAt: -1, updatedAt: -1 });
      resolve({
        status: "OK",
        message: "Success",
        data: allUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        _id: id,
      });
      if (user === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }
      resolve({
        status: "OK",
        message: "SUCESS",
        data: user,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { status: "ERR", message: "Email does not exist" };
    }

    const otp = generateOTP();
    await sendEmailForgotPassword(email, otp);

    user.resetPasswordOTP = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    return { status: "OK", message: "OTP has been sent to your email" };
  } catch (error) {
    throw error;
  }
};

const verifyOtp = async (email, otp, otpType = 'register') => {
  try {
    const user = await User.findOne({ email });
    const otpData = otpStore.get(email);

    // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
    if (!user) {
      return { status: "ERR", message: "Email does not exist" };
    }

    // Kiểm tra OTP trong bộ nhớ tạm thời
    if (!otpData) {
      return { status: "ERR", message: "OTP not found" };
    }

    // Kiểm tra loại OTP (register hoặc resetPassword)
    if (otpData.type !== otpType) {
      return { status: "ERR", message: `Invalid OTP for ${otpType}` };
    }

    // Kiểm tra OTP có hợp lệ không
    if (otpData.otp !== otp) {
      return { status: "ERR", message: "Invalid OTP" };
    }

    // Kiểm tra thời gian hết hạn OTP
    if (otpData.expiry < Date.now()) {
      otpStore.delete(email); // Xóa OTP hết hạn
      return { status: "ERR", message: "OTP has expired" };
    }

    // Nếu là OTP đăng ký, kiểm tra otpExpiry trong User
    if (otpType === 'register' && user.otpExpiry < Date.now()) {
      return { status: "ERR", message: "OTP for registration has expired" };
    }

    // Nếu là OTP quên mật khẩu, kiểm tra resetPasswordOTP trong User
    if (otpType === 'resetPassword' && user.resetPasswordOTP !== otp) {
      return { status: "ERR", message: "Invalid OTP for password reset" };
    }

    return { status: "OK", message: "OTP is valid" };
  } catch (error) {
    throw error;
  }
};


const resetPassword = async (email, newPassword) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { status: "ERR", message: "Email does not exist" };
    }

    const hash = bcrypt.hashSync(newPassword, 10);

    user.password = hash;
    user.resetPasswordOTP = null;
    user.otpExpiry = null;
    await user.save();

    return { status: "OK", message: "Password has been successfully reset" };
  } catch (error) {
    throw error;
  }
};

const RegisterSendOTP = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (user) {
      return { status: "ERR", message: "Email already exists" };
    }

    // Tạo OTP
    const otp = generateOTP();

    // Lưu OTP vào bộ nhớ tạm thời (5 phút)
    otpStore.set(email, { otp, expiry: Date.now() + 5 * 60 * 1000 });

    // Gửi OTP qua email
    await sendEmailRegisterOTP(email, otp);

    return { status: "OK", message: "OTP has been sent to your email" };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  deleteManyUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateIsBlockStatus,
  RegisterSendOTP
};
