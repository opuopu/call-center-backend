const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_HOST_EMAIL,
    pass: process.env.NODEMAILER_HOST_PASS,
  },
});
async function sendEmail(receiverGmail, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_HOST_EMAIL, // sender address
      to: receiverGmail, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = sendEmail;
