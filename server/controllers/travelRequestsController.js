const model = require("../models/travelRequestsModel");
const usersModel=require("../models/usersModels");
const getOpentravelRequests = async (req, res) => {
  try {
    const status = req.query.status;
    const result = await model.getOpentravelRequests(status);
    if (result.length > 0) {
      return res.send(result);
    }
    return res.status(204).json();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// יצירת בקשת נסיעה חדשה
const createTravelRequest = async (req, res) => {
  try {
    const {
      origin,
      userId,
      travelTime,
      travelDate,
      destination,
      numberOfPassengers,
      isAlone,
      status,
      travelType,
      recurringDays,
      endDate,
    } = req.body;
    let patientId;
    if (userId == "") patientId = await usersModel.getPatientIdByUserId(req.userId);
    else patientId = await usersModel.getPatientIdByUserId(userId);
    const newTravelRequest = {
      patientId,
      origin,
      travelTime,
      travelDate,
      destination,
      numberOfPassengers,
      isAlone,
      status,
      recurring: travelType === "קבוע",
      recurringDays: travelType === "קבוע" ? recurringDays.join(",") : null,
      recurringEndDate: travelType === "קבוע" ? endDate : null,
    };
    const result = await model.createTravelRequest(newTravelRequest);

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const requestTaken = async (req, res) => {
  try {
    userId=req.body.userId;
    volunteerId = await usersModel.getVolunteerIdByUserId(userId);
    if(!volunteerId){
      throw new Error("No volunteer found for the given UserId"); 
    }

    const travelRequestId = req.params.id;
    const response = await model.updateTravelRequestStatus(travelRequestId);
    if (!response) {
      return res.status(404).json({ error: "Travel request not found" });
    }

    res.json({ message: "status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOpentravelRequests, createTravelRequest, requestTaken };

