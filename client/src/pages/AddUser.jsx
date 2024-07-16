import React, { useState } from "react";
import { Button, Box, Container, Typography, Grid, Paper } from "@mui/material";
import VolunteerForm from "../components/VolunteerForm";
import PatientForm from "../components/PatientForm";
import AdminForm from "../components/AdminForm";
import DriverForm from "../components/DriverForm";

const Signup = () => {
  const [selectedForm, setSelectedForm] = useState("volunteer");

  const renderForm = () => {
    switch (selectedForm) {
      case "volunteer":
        return <VolunteerForm isApproved={true} />;
      case "patient":
        return <PatientForm isApproved={true} />;
      case "admin":
        return <AdminForm isApproved={true} />;
      case "driver":
        return <DriverForm isApproved={true} />;
      default:
        return null;
    }
  };

  const userTypes = [
    { type: "volunteer", label: "מתנדב" },
    { type: "patient", label: "מטופל" },
    { type: "admin", label: "מנהל" },
    { type: "driver", label: "נהג" },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          הוספת משתמש חדש
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" align="center" gutterBottom>
            בחר סוג משתמש:
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {userTypes.map((user) => (
              <Grid item key={user.type}>
                <Button
                  onClick={() => setSelectedForm(user.type)}
                  variant={selectedForm === user.type ? "contained" : "outlined"}
                  color="primary"
                  fullWidth
                >
                  {user.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Box>
          <Typography variant="h6" align="center" gutterBottom>
            מלא את הפרטים:
          </Typography>
          {renderForm()}
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;