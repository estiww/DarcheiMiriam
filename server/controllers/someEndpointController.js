const jwt = require("jsonwebtoken");
require("dotenv").config();
const model = require("../models/usersModels");

const someEndpoint = async (req, res) => {

  const cookies = req.cookies;
  //אם אין רפרש-בצד שרת תוציא ללוג אין
  if (!cookies?.refreshToken) return res.sendStatus(440);
  const refreshToken = cookies.refreshToken;
  

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    req.userId = decoded.userId;
    req.email = decoded.email;
    req.roleName = decoded.roleName;
    req.isApproved = decoded.isApproved;
    console.log("req.userId");
    console.log(req.userId);
    console.log("req.email");
    console.log(req.email);
    console.log("req.roleName");
    console.log(req.roleName);
    console.log("req.isApproved");
    console.log(req.isApproved);
  });
  const user = await model.getUserByEmail(req.email);

   return res.status(200).json({
    id: user.UserId,
    email: user.Mail,
    firstName: user.FirstName,
    lastName: user.LastName,
    city: user.City,
    neighborhood: user.Neighborhood,
    street: user.Street,
    houseNumber: user.HouseNumber,
    zipCode: user.ZipCode,
    communicationMethod: user.CommunicationMethod,
    phone: user.Phone,
    roleName: user.RoleName,
    isApproved: user.IsApproved,
  });
};
module.exports = {
  someEndpoint,
};
