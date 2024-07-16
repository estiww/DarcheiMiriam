import React, { useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import CloseIcon from "@mui/icons-material/Close";
import HomePage from "./HomePage";
import TravelRequests from "./TravelRequests";
import TravelMatches from "./TravelMatches";
import TravelRequestForm from "./TravelRequestForm";
import UserProfile from "./UserProfile";
import MyTravels from "../components/MyTravels";
import Users from "./Users";
import AddUser from "./AddUser";
import NavigationMenu from "../components/NavigationMenu";
import { UserContext } from "../App";
import Reminders from "../components/Reminders";
import ProtectedRoute from "../components/ProtectedRoute";

const Home = () => {
  const { user } = useContext(UserContext);
  const [minimizedReminders, setMinimizedReminders] = useState(false);

  const toggleReminders = () => {
    setMinimizedReminders(!minimizedReminders);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavigationMenu />
      <Container
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "64px",
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="travelRequests"
            element={
              <ProtectedRoute
                element={<TravelRequests setMinimizedReminders={setMinimizedReminders} />}
                allowedRoles={["Admin", "Volunteer","Driver"]}
              />
            }
          />
          <Route
            path="travelMatches"
            element={
              <ProtectedRoute
                element={<TravelMatches />}
                allowedRoles={["Admin"]}
              />
            }
          />
          <Route
            path="travelRequestForm"
            element={
              <ProtectedRoute
                element={<TravelRequestForm />}
                allowedRoles={["Admin", "Patient"]}
              />
            }
          />
          <Route path="profile" element={<UserProfile />} />
          <Route
            path="myTravels"
            element={
              <ProtectedRoute
                element={<MyTravels />}
                allowedRoles={["Admin","Volunteer", "Patient","Driver"]}
              />
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute
                element={<Users />}
                allowedRoles={["Admin"]}
              />
            }
          />
          <Route
            path="addUser"
            element={
              <ProtectedRoute
                element={<AddUser />}
                allowedRoles={["Admin"]}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>

      {user && user.roleName === "Volunteer" && (
        <div
          style={{
            position: "fixed",
            bottom: "16px",
            left: "16px",
            zIndex: 1300,
          }}
        >
          {minimizedReminders ? (
            <IconButton
              onClick={toggleReminders}
              style={{
                backgroundColor: "white",
                boxShadow: "0 0 10px rgba(0,0,0,0.3)",
              }}
            >
              <DriveEtaIcon />
            </IconButton>
          ) : (
            <div
              style={{
                backgroundColor: "white",
                boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                padding: "16px",
                width: "250px",
              }}
            >
              <IconButton
                onClick={toggleReminders}
                style={{ position: "absolute", top: "8px", right: "8px" }}
              >
                <CloseIcon />
              </IconButton>
              <Reminders />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;

