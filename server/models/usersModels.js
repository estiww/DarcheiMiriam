const pool = require("../db.js");

async function getUsers() {
  try {
    const sql = `
          SELECT 
              UserTable.UserId,
              UserTable.FirstName,
              UserTable.LastName,
              UserTable.Phone,
              UserTable.Mail,
              UserTable.Gender,
              UserTable.BirthDate,
              UserTable.CommunicationMethod,
              UserTable.IsApproved,
              AddressTable.City,
              AddressTable.Neighborhood,
              AddressTable.Street,
              AddressTable.HouseNumber,
              AddressTable.ZipCode,
              RoleTable.RoleName
          FROM 
              UserTable
          LEFT JOIN 
              AddressTable ON UserTable.AddressId = AddressTable.AddressId
          LEFT JOIN 
              RoleTable ON UserTable.RoleId = RoleTable.RoleId
      `;
    const [result] = await pool.query(sql);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  }
}
async function updateIsApproved(id, isApproved) {
  try {
    console.log(`Update row(s)`);
    const sql = "UPDATE UserTable SET IsApproved = ? WHERE UserId = ?";
    const [result] = await pool.query(sql, [isApproved, id]);
    console.log(`result`, result);
    return result;
  } catch (err) {
    throw new Error(`Error updating IsApproved: ${err.message}`);
  }
}

//מחזיר ערך בוליאני
async function isUserExists(mail) {
  try {
    const sql =
      "SELECT EXISTS(SELECT 1 FROM UserTable WHERE Mail = ?) as userExists";
    const [rows] = await pool.query(sql, [mail]);
    const userExists = rows[0].userExists === 1; // Convert 1 or 0 to true or false
    console.log("User exists:", userExists);
    return userExists;
  } catch (err) {
    throw new Error("Error checking user existence:", err);
  }
}

//לשנות שיתאים לרישום של כלל הפרטים
async function signup(
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
) {
  try {
    console.log('signup',roleName,
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
      communicationMethod)
    // מציאת RoleId על פי RoleName
    const findRoleIdSql = "SELECT RoleId FROM RoleTable WHERE RoleName = ?";
    const [roleResult] = await pool.query(findRoleIdSql, [roleName]);

    if (roleResult.length === 0) {
      throw new Error("Role not found");
    }

    const roleId = roleResult[0].RoleId;

    // Insert password into PasswordTable
    const insertPasswordSql =
      "INSERT INTO PasswordTable (PasswordValue) VALUES (?)";
    const [passwordResult] = await pool.query(insertPasswordSql, [
      hashedPassword,
    ]);
    const passwordId = passwordResult.insertId;

    // Insert address into AddressTable
    const insertAddressSql = `
          INSERT INTO AddressTable (City, Neighborhood, Street, HouseNumber, ZipCode)
          VALUES (?, ?, ?, ?, ?)
        `;
    const [addressResult] = await pool.query(insertAddressSql, [
      city,
      neighborhood,
      street,
      houseNumber,
      zipCode,
    ]);
    const addressId = addressResult.insertId;

    // Insert user into UserTable
    const insertUserSql = `
          INSERT INTO UserTable (
            PasswordId, 
            Mail, 
            FirstName, 
            LastName, 
            AddressId, 
            Phone, 
            Gender, 
            BirthDate, 
            RoleId, 
            IsApproved, 
            CommunicationMethod
          ) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const [userResult] = await pool.query(insertUserSql, [
      passwordId,
      email,
      firstName,
      lastName,
      addressId,
      phone,
      gender,
      birthDate,
      roleId,
      isApproved,
      communicationMethod,
    ]);

    return userResult;
  } catch (err) {
    throw err;
  }
}

// מחזיר את כל פרטי המשתמש לפי אימייל-מחזיר גם פרטים מטבלאות התפקיד
//אם אין מחזיר רזלט ריק
async function getUserByEmail(email) {
  try {
    const sql = `
      SELECT 
        UserTable.UserId,
        PasswordTable.PasswordValue,
        UserTable.FirstName,
        UserTable.LastName,
        AddressTable.City,
        AddressTable.Neighborhood,
        AddressTable.Street,
        AddressTable.HouseNumber,
        AddressTable.ZipCode,
        UserTable.Phone,
        UserTable.Mail,
        UserTable.CommunicationMethod,
        UserTable.IsApproved,
        RoleTable.RoleName,
        VolunteerTable.Location
      FROM UserTable
      INNER JOIN PasswordTable ON UserTable.PasswordId = PasswordTable.PasswordId
      INNER JOIN RoleTable ON UserTable.RoleId = RoleTable.RoleId
      LEFT JOIN AddressTable ON UserTable.AddressId = AddressTable.AddressId
      LEFT JOIN VolunteerTable ON UserTable.UserId = VolunteerTable.UserId
      WHERE UserTable.Mail = ?;
    `;
    const [result] = await pool.query(sql, [email]);
    console.log(result);
    return result[0]; // Assuming the email is unique, return the first (and only) user
  } catch (err) {
    throw err;
  }
}

async function updateUserByEmail(
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
  communicationMethod,
) {
  try {
    const getUserSql = `
      SELECT AddressId
      FROM UserTable
      WHERE Mail = ?
    `;
    let [addressResult] = await pool.query(getUserSql, [email]);
    
    if (addressResult.length === 0) {
      throw new Error("User not found");
    }

    let addressId = addressResult[0].AddressId;

    // עדכון פרטי הכתובת הקיימת
    const updateAddressSql = `
      UPDATE AddressTable
      SET City = ?, Neighborhood = ?, Street = ?, HouseNumber = ?, ZipCode = ?
      WHERE AddressId = ?
    `;
    await pool.query(updateAddressSql, [
      city,
      neighborhood,
      street,
      houseNumber,
      zipCode,
      addressId
    ]);

    // עדכון פרטי המשתמש
    const updateUserSql = `
      UPDATE UserTable
      SET FirstName = ?, LastName = ?, Phone = ?, CommunicationMethod = ?, AddressId = ?
      WHERE Mail = ?
    `;
    const [updateResult] = await pool.query(updateUserSql, [
      firstName,
      lastName,
      phone,
      communicationMethod,
      addressId,
      email
    ]);

    return updateResult.affectedRows > 0; // החזרת אמת אם העדכון הצליח
  } catch (error) {
    console.log(error);
    throw error;
  }
}


async function createPatient(id) {
  try {
    const sql = `
          INSERT INTO PatientTable (UserId)
          VALUES (?)
        `;
    const [result] = await pool.query(sql, [id]);
    return result;
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
}

async function createVolunteer(id, location) {
  try {
    console.log("Creating volunteer");

    const sql = `
    INSERT INTO VolunteerTable (UserId, Location)
    VALUES (?, ?)
  `;
    const [result] = await pool.query(sql, [id, location]);
    console.log("Result:", result);
    return result;
  } catch (error) {
    console.error("Error creating volunteer:", error);
    throw error;
  }
}
// async function updatePatient(id) {
 
// }

async function updateVolunteer(id, location) {
  try {
    const sql = `
      UPDATE VolunteerTable
      SET Location = ?
      WHERE UserId = ?
    `;
    const [result] = await pool.query(sql, [location, id]);
    console.log("Result:", result);
    return result;
  } catch (error) {
    console.error("Error updating volunteer:", error);
    throw error;
  }
}


async function updateUserToken(userId, token, expires) {
  try {
    const updateTokenSql =
      "UPDATE UserTable SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE UserId = ?";
    const [result] = await pool.query(updateTokenSql, [token, expires, userId]);
    return result;
  } catch (err) {
    throw err;
  }
}

async function getUserByToken(token) {
  try {
    const getUserSql =
      "SELECT * FROM UserTable WHERE resetPasswordToken = ? AND resetPasswordExpires > ?";
    const [rows] = await pool.query(getUserSql, [token, new Date()]);
    return rows;
  } catch (err) {
    throw err;
  }
}

async function updateUserPassword(userId, hashedPassword) {
  try {
    // קריאה למסד הנתונים כדי לקבל את ה־PasswordId של המשתמש
    const getPasswordIdSql =
      "SELECT PasswordId FROM UserTable WHERE UserId = ?";
    const [rows] = await pool.query(getPasswordIdSql, [userId]);

    if (rows.length === 0) {
      throw new Error(`User with UserId ${userId} not found.`);
    }

    const passwordId = rows[0].PasswordId;

    // עדכון הסיסמה בטבלת הסיסמאות
    const updatePasswordTableSql =
      "UPDATE PasswordTable SET PasswordValue = ? WHERE PasswordId = ?";
    await pool.query(updatePasswordTableSql, [hashedPassword, passwordId]);

    // עדכון השדות resetPasswordToken ו־resetPasswordExpires ל־NULL בטבלת המשתמשים
    const updateUserTableSql = `
          UPDATE UserTable 
          SET resetPasswordToken = NULL, resetPasswordExpires = NULL 
          WHERE UserId = ?
      `;
    const [result] = await pool.query(updateUserTableSql, [userId]);

    return result;
  } catch (err) {
    throw err;
  }
}
async function getUserResetTokenEmail(email) {
  try {
    console.log(333);
    const getUserEmailSql = "SELECT * FROM UserTable WHERE Mail = ?";
    const [rows] = await pool.query(getUserEmailSql, [email]);
    return rows;
  } catch (err) {
    throw err;
  }
}


async function getPatientIdByUserId(userId) {
  try {
    const patientSql = "SELECT PatientId FROM PatientTable WHERE UserId = ?";
    const [patientResult] = await pool.query(patientSql, [userId]);

    if (patientResult.length === 0) {
      throw new Error("No patient found for the given UserId");
    }

    return patientResult[0].PatientId;
  } catch (err) {
    throw err;
  }
}

async function getVolunteerIdByUserId(userId) {
  try {
    const sql = `
        SELECT VolunteerId
        FROM VolunteerTable
        WHERE UserId = ?;
    `;
    const [result] = await pool.query(sql, [userId]);
    console.log(result);
    return result[0] ? result[0].VolunteerId : null; // Return the VolunteerId if found, otherwise null
  } catch (err) {
    throw err;
  }
}

async function upsertRefreshToken(userId, refreshToken) {
  try {
    const updateSql =
      "UPDATE RefreshTokenTable SET RefreshToken = ? WHERE UserId = ?";
    const [result] = await pool.query(updateSql, [refreshToken, userId]);
    // אם אף שורה לא עודכנה, מכניסים רשומה חדשה
    if (result.affectedRows === 0) {
      const insertSql =
        "INSERT INTO RefreshTokenTable (UserId, RefreshToken) VALUES (?, ?)";
      const [insertResult] = await pool.query(insertSql, [
        userId,
        refreshToken,
      ]);
      console.log("Refresh token inserted:", insertResult);
    } else {
      console.log("Refresh token updated:", result);
    }
  } catch (err) {
    throw err;
  }
}
async function deleteRefreshToken(userId) {
  console.log(userId);
  try {
    const deleteSql = "DELETE FROM RefreshTokenTable WHERE UserId = ?";
    const [result] = await pool.query(deleteSql, [userId]);
    if (result.affectedRows === 0) {
      console.log("No refresh token found for userId:", userId);
    } else {
      console.log("Refresh token deleted for userId:", userId);
    }
  } catch (err) {
    throw err;
  }
}

async function getUserIdByRefreshToken(refreshToken) {
  try {
    const sql = `
      SELECT UserId 
      FROM RefreshTokenTable 
      WHERE RefreshToken = ?;
    `;
    const [rows] = await pool.query(sql, [refreshToken]);
    
    if (rows.length > 0) {
      return rows[0].UserId;
    } else {
      return null;
    }
  } catch (err) {
    throw err;
  }
}
module.exports = {
  updateUserByEmail,
  getUserByEmail,
  signup,
  createPatient,
  createVolunteer,
  updateVolunteer,
  isUserExists,
  upsertRefreshToken,
  deleteRefreshToken,
  getUserByToken,
  updateUserPassword,
  getUserResetTokenEmail,
  getUsers,
  updateIsApproved,
  updateUserToken,
  getVolunteerIdByUserId,
  getPatientIdByUserId,
  getUserIdByRefreshToken
};
