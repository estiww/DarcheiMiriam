const pool = require("../db.js");

async function createTravelMatch(volunteerId, requestId) {
  try {
    console.log(
      `Attempting to create a travel match with volunteerId: ${volunteerId} and requestId: ${requestId}`
    );
    const sql = `
          INSERT INTO TravelMatchTable (TravelRequestId, VolunteerId, MatchTime, MatchDate, NumberOfPassengers)
          VALUES (?, ?, CURRENT_TIME(), CURRENT_DATE(), 1);
        `;
    const [result] = await pool.query(sql, [requestId, volunteerId]);
    console.log("Insert operation result:", result);
    return result;
  } catch (err) {
    console.error("Error occurred while creating travel match:", err);
    throw err;
  }
}
async function getAll(limit = 1, offset = 0) {
  try {
    const sql = `
      SELECT tm.TravelMatchId, 
             tm.VolunteerId, 
             DATE_FORMAT(tm.MatchTime, '%H:%i') AS MatchTime, 
             DATE_FORMAT(tm.MatchDate, '%Y-%m-%d') AS MatchDate, 
             tm.NumberOfPassengers,
             tr.Origin AS TravelOrigin, 
             DATE_FORMAT(tr.TravelTime, '%H:%i') AS TravelTime,
             tr.Destination AS TravelDestination,
             u.FirstName AS VolunteerFirstName, 
             u.LastName AS VolunteerLastName,
             p.FirstName AS PatientFirstName, 
             p.LastName AS PatientLastName
      FROM TravelMatchTable tm
      INNER JOIN TravelRequestTable tr ON tm.TravelRequestId = tr.TravelRequestId
      INNER JOIN VolunteerTable v ON tm.VolunteerId = v.VolunteerId
      INNER JOIN UserTable u ON v.UserId = u.UserId
      INNER JOIN PatientTable pt ON tr.PatientId = pt.PatientId
      INNER JOIN UserTable p ON pt.UserId = p.UserId
      ORDER BY 
        CASE 
          WHEN tr.TravelDate >= CURDATE() THEN 0 
          ELSE 1 
        END, 
        ABS(DATEDIFF(tr.TravelDate, CURDATE())), 
        tr.TravelDate ASC
      LIMIT ? OFFSET ?;
    `;
    const [rows] = await pool.query(sql, [limit, offset]);
    return rows;
  } catch (err) {
    console.error("Error occurred while fetching travel matches:", err);
    throw err;
  }
}


async function getVolunteerTravels(userId) {
  try {
    sql = `
    SELECT 
      tm.TravelMatchId AS matchId,
      tr.Origin,
      tr.Destination,
      tr.TravelTime,
      tr.TravelDate,
      tr.NumberOfPassengers
    FROM 
      TravelMatchTable tm
    JOIN 
      TravelRequestTable tr ON tm.TravelRequestId = tr.TravelRequestId
    WHERE 
      tm.VolunteerId = (SELECT VolunteerId FROM VolunteerTable WHERE UserId = ?)
    ORDER BY 
      tr.TravelDate ASC
  `;

    const [rows] = await pool.query(sql, [userId]);
    return rows; // מחזיר את השורה הראשונה כתוצאה
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching data");
  }
}

async function getPatientTravels(userId) {
  try {
    sql = `
    SELECT 
      tr.TravelRequestId AS requestId,
      tr.Origin,
      tr.Destination,
      tr.TravelTime,
      tr.TravelDate,
      tr.NumberOfPassengers
    FROM 
      TravelRequestTable tr
    WHERE 
      tr.PatientId = (SELECT PatientId FROM PatientTable WHERE UserId = ?)
    ORDER BY 
      tr.TravelDate ASC
  `;
    const [rows] = await pool.query(sql, [userId]);
    console.log(rows);
    return rows; // מחזיר את השורה הראשונה כתוצאה
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching data");
  }
}

const getVolunteerDetailsByMatchId = async (matchId) => {
  const sql = `
      SELECT 
          UserTable.FirstName,
          UserTable.Mail,
          UserTable.Phone
      FROM 
          TravelMatchTable
      JOIN 
          VolunteerTable ON TravelMatchTable.VolunteerId = VolunteerTable.VolunteerId
      JOIN 
          UserTable ON VolunteerTable.UserId = UserTable.UserId
      WHERE 
          TravelMatchTable.TravelMatchId = ?;
  `;

  try {
    const [rows, fields] = await pool.query(sql, [matchId]);
    return rows[0]; // מחזיר את השורה הראשונה כתוצאה
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching volunteer details");
  }
};

const getPatientDetailsByMatchId = async (matchId) => {
  const sql = `
          SELECT 
              UserTable.FirstName,
              UserTable.Phone,
              UserTable.Mail
          FROM 
              TravelMatchTable
          JOIN 
              TravelRequestTable ON TravelMatchTable.TravelRequestId = TravelRequestTable.TravelRequestId
          JOIN 
              PatientTable ON TravelRequestTable.PatientId = PatientTable.PatientId
          JOIN 
              UserTable ON PatientTable.UserId = UserTable.UserId
          WHERE 
              TravelMatchTable.TravelMatchId = ?;
      `;
  try {
    const [rows] = await pool.query(sql, [matchId]);
    return rows[0]; // מחזיר את השורה הראשונה כתוצאה
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching data");
  }
};

const getRequestDetailsByMatchId = async (matchId) => {
  const sql = `
      SELECT 
          TravelRequestTable.TravelTime,
          TravelRequestTable.TravelDate,
          TravelRequestTable.NumberOfPassengers,              
          TravelRequestTable.Origin,
          TravelRequestTable.Destination

      FROM 
          TravelMatchTable
      JOIN 
          TravelRequestTable ON TravelMatchTable.TravelRequestId = TravelRequestTable.TravelRequestId
      WHERE 
          TravelMatchTable.TravelMatchId = ?;
  `;

  try {
    const [rows, fields] = await pool.query(sql, [matchId]);
    return rows[0]; // מחזיר את השורה הראשונה כתוצאה
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching request details");
  }
};

const getUpcomingTravelsByVolunteerId = async (volunteerId) => {
  const sql = `
    SELECT 
      tm.TravelMatchId AS id, 
      tm.TravelRequestId AS requestId, 
      tm.VolunteerId AS volunteerId, 
      tr.Origin, 
      tr.Destination, 
      tr.TravelTime, 
      DATE_FORMAT(tr.TravelDate, '%Y-%m-%d') AS TravelDate, 
      tr.NumberOfPassengers,
      tr.Status,
      u.FirstName AS PatientFirstName
    FROM 
      TravelMatchTable tm
    JOIN 
      TravelRequestTable tr ON tm.TravelRequestId = tr.TravelRequestId
    JOIN 
      PatientTable pt ON tr.PatientId = pt.PatientId
    JOIN 
      UserTable u ON pt.UserId = u.UserId
    WHERE 
      tm.VolunteerId = ? 
      AND tr.TravelDate >= CURDATE()
    ORDER BY 
      tr.TravelDate ASC;
  `;

  const [results] = await pool.query(sql, [volunteerId]);
  return results;
};

module.exports = {
  createTravelMatch,
  getAll,
  getPatientDetailsByMatchId,
  getVolunteerDetailsByMatchId,
  getRequestDetailsByMatchId,
  getUpcomingTravelsByVolunteerId,
  getPatientTravels,
  getVolunteerTravels,
};
