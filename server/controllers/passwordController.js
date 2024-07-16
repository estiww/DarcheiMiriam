const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/usersModels");
const {sendEmail}=require("../services/sendEmail")
// פונקציה לשכחת סיסמה - שולחת מייל עם קישור לאיפוס סיסמה
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(20).toString("hex");

  try {
    // בדיקה אם קיים משתמש עם האימייל הנתון
    const users = await User.getUserResetTokenEmail(email);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: "Email not found" });
    }

    const user = users[0];
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 שעה

    // עדכון שדות איפוס הסיסמה במסד הנתונים
    await User.updateUserToken(user.UserId, token, resetPasswordExpires);

    // הגדרות למייל שיישלח למשתמש כולל קישור לאיפוס סיסמה
    const resetPassword = {
      to: email,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://localhost:5173/resetPassword/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    sendEmail(resetPassword);
    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({ success: false, message: "Error sending email" });
  }
};

// פונקציה לאיפוס סיסמה - משנה את הסיסמה למשתמש על פי הטוקן המקושר לבקשה
const resetPassword = async (req, res) => {
  console.log(555)
  const { password, token } = req.body;
  console.log(token)
  console.log(password)

  try {
    // בדיקה אם הטוקן תקין ועדכון הסיסמה
    const users = await User.getUserByToken(token);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: "Password reset token is invalid or has expired." });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateUserPassword(user.UserId, hashedPassword);

    res.status(200).json({ success: true, message: "Password has been reset." });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  forgotPassword,
  resetPassword
};
