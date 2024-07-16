const nodemailer = require("nodemailer");
require('dotenv').config(); 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_NAME_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  },
});

transporter.verify(function (error, success) {
    if (error) {
        console.log("Error verifying transporter: ", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});



const sendEmail = async (mailOption) => {
    console.log(mailOption)
    try {
        await transporter.sendMail(mailOption);

        console.log("Email sent successfully");
    } catch (error) {
        throw (error);
        
    }
};





module.exports = {
    sendEmail
};
