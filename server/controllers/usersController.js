const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const model = require("../models/usersModels");

const generateTokens = (user) => {
  console.log("generateTokens");
  const accessToken = jwt.sign(
    {
      userId: user.UserId,
      email: user.Mail,
      roleName: user.RoleName,
      isApproved: user.IsApproved,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "5m" }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.UserId,
      email: user.Mail,
      roleName: user.RoleName,
      isApproved: user.IsApproved,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  return { accessToken, refreshToken };
};

const setTokensAsCookies = (res, tokens) => {
  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 5 * 60 * 1000,
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const user = await model.getUserByEmail(email);
    if (!user) {
      return res
        .status(409)
        .json({ message: "Incorrect password or username" });
    }

    const match = await bcrypt.compare(password, user.PasswordValue);
    if (match) {
      const tokens = generateTokens(user);
      await model.upsertRefreshToken(user.UserId, tokens.refreshToken);
      setTokensAsCookies(res, tokens);
      return res.json({
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
    } else {
      return res
        .status(401)
        .json({ message: "Incorrect password or username" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

async function signup(req, res) {
  try {
    const {
      roleName,
      firstName,
      lastName,
      isApproved,
      communicationMethod,
      gender,
      birthDate,
      phone,
      email,
      password,
      city,
      neighborhood,
      street,
      houseNumber,
      zipCode,
      location = null,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await model.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await model.signup(
      roleName,
      firstName,
      lastName,
      gender,
      birthDate,
      phone,
      email,
      hashedPassword,
      city,
      neighborhood,
      street,
      houseNumber,
      zipCode,
      isApproved,
      communicationMethod
    );

    if (result) {
      const user = {
        UserId: result.insertId,
        Mail: email,
        RoleName: roleName,
        IsApproved: isApproved,
      };

      if (roleName === "Patient") {
        await model.createPatient(result.insertId);
      }
      if (roleName === "Volunteer") {
        await model.createVolunteer(result.insertId, location);
      }

      const tokens = generateTokens(user);
      await model.upsertRefreshToken(user.UserId, tokens.refreshToken);
      setTokensAsCookies(res, tokens);
      return res.json({
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
    } else {
      return res.status(500).json({ error: "Failed to create user" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
async function createUser(req, res) {
  try {
    const {
      roleName,
      firstName,
      lastName,
      isApproved,
      communicationMethod,
      gender,
      birthDate,
      phone,
      email,
      password,
      city,
      neighborhood,
      street,
      houseNumber,
      zipCode,
      location = null,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await model.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await model.signup(
      roleName,
      firstName,
      lastName,
      gender,
      birthDate,
      phone,
      email,
      hashedPassword,
      city,
      neighborhood,
      street,
      houseNumber,
      zipCode,
      isApproved,
      communicationMethod
    );

    if (result) {
      const user = {
        UserId: result.insertId,
        Mail: email,
        RoleName: roleName,
        IsApproved: isApproved,
      };

      if (roleName === "Patient") {
        await model.createPatient(result.insertId);
      }
      if (roleName === "Volunteer") {
        await model.createVolunteer(result.insertId, location);
      }

      return res.json({
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
    } else {
      return res.status(500).json({ error: "Failed to create user" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
async function updateUserDetails(req, res) {
  try {
    const {
      roleName,
      firstName,
      lastName,
      email,
      phone,
      city,
      neighborhood,
      street,
      houseNumber,
      zipCode,
      communicationMethod,
      location = null,
    } = req.body;

    const id = req.params.id;

    await model.updateUserByEmail(
      id,
      firstName,
      lastName,
      phone,
      email,
      city,
      neighborhood,
      street,
      houseNumber,
      zipCode,
      communicationMethod
    );

    // if (roleName === "Patient") {
    //   await model.updatePatient(id);
    // }

    if (roleName === "Volunteer") {
      await model.updateVolunteer(id, location);
    }

    return res.json({ message: "User details updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const id = req.params.id;
    await model.deleteUser(id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getAll(req, res) {
  try {
    const users = await model.getUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateIsApproved(req, res) {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const result = await model.updateIsApproved(id, isApproved);
    await model.deleteRefreshToken(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const user = await model.getUser(id);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getByUsername(req, res) {
  try {
    const { username } = req.params;
    const user = await model.getByUsername(username);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAll,
  getById,
  deleteUser,
  getByUsername,
  login,
  signup,
  createUser,
  updateUserDetails,
  updateIsApproved,
  generateTokens,
  setTokensAsCookies,
};
