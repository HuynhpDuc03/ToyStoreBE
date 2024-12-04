const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { createCanvas, loadImage } = require('canvas');
const crypto = require("crypto");
dotenv.config();

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_ACCOUNT,
    pass: process.env.MAIL_PASSWORD,
  },
});

// 1. Gửi email xác nhận đơn hàng
const sendEmailCreateOrder = async (email, fullName, orderItems, orderDetails) => {
  let listItem = '';
  const attachImage = [];

  for (const item of orderItems) {
      try {
        const image = await loadImage(item.image);
        const canvas = createCanvas(80, 80);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, 80, 80);

        const resizedImageBuffer = canvas.toBuffer();

        attachImage.push({
          filename: `${item.name}.png`,
          content: resizedImageBuffer,
          cid: item.name,
        });

        listItem += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <img src="cid:${item.name}" alt="${item.name}" style="width: 80px; height: 80px;"/>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            ${item.name}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            ${item.amount} x ${item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            ${(item.amount * item.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </td>
        </tr>`;
      } catch (error) {
        console.error('Error processing image:', error);
      }
  }

  await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "Xác nhận đơn hàng từ AntBaby - Mua Hàng Trực Tuyến",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="text-align: center;">Xác nhận đơn hàng</h2>
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Cảm ơn bạn đã đặt hàng tại cửa hàng AntBaby. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
        <hr style="border: 1px solid #eee;"/>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td><strong>Thông tin mua hàng</strong></td>
            <td><strong>Địa chỉ nhận hàng</strong></td>
          </tr>
          <tr>
            <td>
              <p>${orderDetails.fullName}</p>
              <p>${orderDetails.email}</p>
              <p>${orderDetails.phone}</p>
            </td>
            <td>
              <p>${orderDetails.address}, ${orderDetails.city}, ${orderDetails.district}, ${orderDetails.ward}</p>
              <p>${orderDetails.phone}</p>
            </td>
          </tr>
        </table>
        <h3>Thông tin đơn hàng</h3>
        <p><strong>Mã đơn hàng:</strong> #${orderDetails.orderNumber}</p>
        <p><strong>Ngày đặt hàng:</strong> ${formatDate(orderDetails.orderDate)}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Sản phẩm</th>
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Tên</th>
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Số lượng</th>
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${listItem}
          </tbody>
        </table>
        <h4 style="text-align: right;">Tổng thanh toán: ${orderDetails.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</h4>
        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại bên dưới.</p>
        <p>Trân trọng,<br/>Đội ngũ AntBaby</p>
      </div>`,
    attachments: attachImage,
  });
};

// 2. Gửi email OTP khi quên mật khẩu
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // Tạo mã OTP gồm 6 số
};

const sendEmailForgotPassword = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "Reset mật khẩu - AntBaby",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Đây là mã OTP để đặt lại mật khẩu:</p>
        <h3 style="text-align: center;">${otp}</h3>
        <p>Mã này có hiệu lực trong vòng 5 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br/>Đội ngũ AntBaby</p>
      </div>`,
  });

  console.log("OTP email sent successfully");
};


const sendEmailRegisterOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "Xác thực tài khoản - AntBaby",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="text-align: center;">Xác thực tài khoản</h2>
        <p>Chúng tôi nhận được yêu cầu xác thực tài khoản của bạn. Đây là mã OTP để xác thực:</p>
        <h3 style="text-align: center;">${otp}</h3>
        <p>Mã này có hiệu lực trong vòng 5 phút. Nếu bạn không yêu cầu xác thực tài khoản, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br/>Đội ngũ AntBaby</p>
      </div>`,
  });

  console.log("OTP email sent successfully");
};

module.exports = {
  sendEmailCreateOrder,
  sendEmailForgotPassword,
  generateOTP,
  sendEmailRegisterOTP
};
