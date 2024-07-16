const cron = require('node-cron');
const pool = require('../db'); // MySQL connection pool setup
const { sendEmail } = require("./sendEmail");
require('dotenv').config();

const createFutureRequests = async () => {
  try {
    console.log("Starting manual execution: createFutureRequests");

    const [recurringRequests] = await pool.query(
      "SELECT * FROM TravelRequestTable WHERE Recurring = TRUE AND RecurringEndDate >= CURDATE()"
    );
    console.log("Recurring requests:", recurringRequests);

    const daysOfWeek = {
      ראשון: 0,
      שני: 1,
      שלישי: 2,
      רביעי: 3,
      חמישי: 4,
      שישי: 5,
      שבת: 6,
    };

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    console.log("Tomorrow:", tomorrow.toISOString().split("T")[0]);

    for (const request of recurringRequests) {
      const recurringDays = request.RecurringDays
        ? request.RecurringDays.split(",")
        : []; // Assuming days are stored as a comma-separated string
      const currentDay = tomorrow.getDay();
      const currentDayName = Object.keys(daysOfWeek).find(
        (key) => daysOfWeek[key] === currentDay
      );

      console.log(
        `Checking request for PatientId: ${request.PatientId} on ${
          tomorrow.toISOString().split("T")[0]
        }`
      );
      console.log(
        "Current day:",
        currentDayName,
        "Recurring days:",
        recurringDays
      );

      if (recurringDays.includes(currentDayName)) {
        console.log(
          `Creating future request for PatientId: ${request.PatientId} on ${
            tomorrow.toISOString().split("T")[0]
          }`
        );

        const sql = `INSERT INTO TravelRequestTable 
            (PatientId, Origin, TravelTime, TravelDate, Destination, NumberOfPassengers, IsAlone, Status, Recurring, RecurringDays, RecurringEndDate) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await pool.query(sql, [
          request.PatientId,
          request.Origin,
          request.TravelTime,
          tomorrow.toISOString().split("T")[0], // Format date as 'YYYY-MM-DD'
          request.Destination,
          request.NumberOfPassengers,
          request.IsAlone,
          "התקבלה",
          !request.Recurring,
          null,
          null,
        ]);

        console.log(
          `Future request created successfully for PatientId: ${request.PatientId}`
        );
      } else {
        console.log(
          `No matching recurring day for PatientId: ${request.PatientId} on ${
            tomorrow.toISOString().split("T")[0]
          }`
        );
      }
    }
    console.log("Manual execution completed: createFutureRequests");
  } catch (error) {
    console.error("Error during manual execution: ", error.message);
  }
};

const sendEmailToDrivers = async () => {
  try {
    const sql = `SELECT *
    FROM TravelRequestTable
    WHERE CONCAT(TravelDate, ' ', TravelTime) > NOW()
      AND TIMEDIFF(CONCAT(TravelDate, ' ', TravelTime), NOW()) <= '01:00:00'
      AND Status = 'התקבלה';
    `;

    const [results] = await pool.query(sql);

    if (results.length > 0) {
      console.log("Travel requests within an hour:", results);

      const sqlDrivers = `SELECT Mail FROM UserTable WHERE RoleId = ?`;
      const [driverEmails] = await pool.query(sqlDrivers,[`4`]);

      console.log("driverEmails:", driverEmails[0]);

      const mailToDrivers = {
        to: driverEmails.map(driver => driver.Mail).join(','), 
        subject: "בקשות נסיעה פתוחות בשעה הקרובה",
        text: `
                  היי,
                  ישנן בקשות נסיעה פתוחות בשעה הקרובה. 
                  ניתן לראות אותן בקישור הבא:
                  http://localhost:5173/home/travelRequests
              `,
      };

      await sendEmail(mailToDrivers);
    } else {
      console.log("No travel requests within the next hour.");
    }
  } catch (error) {
    console.error("Error fetching or sending travel requests:", error.message);
  }
};

const sendEmailToAdmin = async () => {
  try {
    const sql = `SELECT * 
    FROM TravelRequestTable
    WHERE CONCAT(TravelDate, ' ', TravelTime) > NOW()
      AND TIMEDIFF(CONCAT(TravelDate, ' ', TravelTime), NOW()) <= '00:30:00'
      AND Status = 'התקבלה';
    `;

    const [results] = await pool.query(sql);

    if (results.length > 0) {
      console.log("Travel requests within the next half hour:", results);

      const sqlRole3 = `SELECT Mail FROM UserTable WHERE RoleId = ?`;
      const [role3Emails] = await pool.query(sqlRole3, [`3`]);

      console.log("role3Emails:", role3Emails);

      const mailToRole3 = {
        to: role3Emails.map(user => user.Mail).join(','), 
        subject: "בקשות נסיעה פתוחות בחצי השעה הקרובה",
        text: `
                  היי,
                  ישנן בקשות נסיעה פתוחות בחצי השעה הקרובה. 
                  ניתן לראות אותן בקישור הבא:
                  http://localhost:5173/home/travelRequests
              `,
      };

      await sendEmail(mailToRole3);
    } else {
      console.log("No travel requests within the next half hour.");
    }
  } catch (error) {
    console.error("Error fetching or sending travel requests:", error.message);
  }
};


cron.schedule("30 19 * * *", createFutureRequests);
// Schedule the cron job to run every 30 minutes
cron.schedule("*/30 * * * *", sendEmailToDrivers);
// Schedule the cron job to run every 15 minutes
cron.schedule("*/15 * * * *", sendEmailToAdmin);


