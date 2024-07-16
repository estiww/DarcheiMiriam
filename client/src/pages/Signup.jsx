import React, { useState } from "react";
import {Button,Box,Container,Typography,Paper,Grid,Fade} from "@mui/material";
import { styled } from "@mui/material/styles";
import VolunteerForm from "../components/VolunteerForm";
import PatientForm from "../components/PatientForm";
import NavigationMenu from "../components/NavigationMenu";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  fontSize: "1rem",
  fontWeight: "bold",
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: "all 0.3s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: theme.shadows[2],
}));

const Signup = () => {
  const [selectedForm, setSelectedForm] = useState("volunteer");

  const renderForm = () => {
    switch (selectedForm) {
      case "volunteer":
        return <VolunteerForm />;
      case "patient":
        return <PatientForm />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <NavigationMenu />
      <Box sx={{ marginTop: 12, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          הרשמה
        </Typography>
        <Typography variant="body1" gutterBottom color="text.secondary">
          אנא בחר את סוג הבקשה המתאים לך
        </Typography>
        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{ marginTop: 3 }}
        >
          <Grid item xs={12} sm={5}>
            <StyledButton
              onClick={() => setSelectedForm("volunteer")}
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<VolunteerActivismIcon />}
            >
              בקשת התנדבות
            </StyledButton>
          </Grid>
          <Grid item xs={12} sm={5}>
            <StyledButton
              onClick={() => setSelectedForm("patient")}
              variant="contained"
              color="secondary"
              fullWidth
              startIcon={<AccessibilityNewIcon />}
            >
              בקשת סיוע
            </StyledButton>
          </Grid>
        </Grid>
      </Box>
      <Fade in={selectedForm !== null}>
        <StyledPaper elevation={2}>
          <Box>{renderForm()}</Box>
        </StyledPaper>
      </Fade>
    </Container>
  );
};

export default Signup;