const model = require("../models/usersModels");

const handleLogout = async (req, res) => {
  console.log("handleLogout");
  const cookies = req.cookies;
  if (!cookies?.accessToken) return res.sendStatus(204); //No content
  const accessToken = cookies.accessToken;
  if (!cookies?.refreshToken) return res.sendStatus(204); //No content
  const refreshToken = cookies.refreshToken;

  const userId = req.params.id;

  await model.deleteRefreshToken(userId);

  //מחיקת העוגיות
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  //מסמל העוגיות נמחקו בהצלחה
  res.sendStatus(204);
};

module.exports = { handleLogout };
