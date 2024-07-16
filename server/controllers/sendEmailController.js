const {sendEmail}=require("../services/sendEmail")

const sendEmailController = async (req, res) => {
  const { name, email, message } = req.body;
  const mailOptions = {
    from: process.env.USER_NAME_EMAIL,
    to: process.env.USER_NAME_EMAIL,
    subject: "בקשת קשר מהאתר",
    text: `
            שם: ${name}
            אימייל: ${email}
            הודעה: ${message}
        `,
  };


  
  try {
    await sendEmail(mailOptions);
    res.status(200).json({ message: "המייל נשלח בהצלחה" });
  } catch (error) {
    console.error("שגיאה בשליחת המייל:", error);
    res.status(500).json({ message: "שגיאה בשליחת המייל" });
  }
};

module.exports = {

  sendEmailController,
};