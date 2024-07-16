import React, { useState, useContext } from "react";
import {
  Grid,
  TextField,
  Button,
  Typography,
  Container,
  IconButton,
  Paper,
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { UserContext } from "../App";
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(3, 0),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

const UserProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const [editMode, setEditMode] = useState(false);
  const [userDetails, setUserDetails] = useState({ ...user });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...userDetails,
      [name]: value,
    });
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3000/users/${userDetails.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userDetails),
          credentials: "include",
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "עדכון פרטי המשתמש נכשל");
      }
      setUser(userDetails);
      setEditMode(false);
    } catch (error) {
      console.error(error);
      // כאן תוכלי להוסיף הודעת שגיאה למשתמש
    }
  };

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            פרופיל משתמש
          </Typography>
          <IconButton onClick={editMode ? handleSubmit : toggleEditMode} color="primary">
            {editMode ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </Box>
        <Divider style={{ margin: '16px 0' }} />
        {editMode ? (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField label="שם פרטי" name="firstName" value={userDetails.firstName} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="שם משפחה" name="lastName" value={userDetails.lastName} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="דוא״ל" name="email" value={userDetails.email} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="טלפון" name="phone" value={userDetails.phone} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="עיר" name="city" value={userDetails.city} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="שכונה" name="neighborhood" value={userDetails.neighborhood} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="רחוב" name="street" value={userDetails.street} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="מספר בית" name="houseNumber" value={userDetails.houseNumber} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="מיקוד" name="zipCode" value={userDetails.zipCode} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset">
                  <Typography>אמצעי תקשורת מועדף</Typography>
                  <RadioGroup
                    row
                    name="communicationMethod"
                    value={userDetails.communicationMethod}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="WhatsApp" control={<Radio />} label="ווטסאפ" />
                    <FormControlLabel value="Email" control={<Radio />} label="מייל" />
                    <FormControlLabel value="Phone" control={<Radio />} label="טלפון" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {userDetails.role === "Volunteer" && (
                <Grid item xs={12} sm={6}>
                  <TextField label="מיקום" name="location" value={userDetails.location || ""} onChange={handleChange} fullWidth />
                </Grid>
              )}
            </Grid>
          </form>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTypography variant="subtitle1">שם פרטי</StyledTypography>
              <Typography>{userDetails.firstName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTypography variant="subtitle1">שם משפחה</StyledTypography>
              <Typography>{userDetails.lastName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTypography variant="subtitle1">דוא״ל</StyledTypography>
              <Typography>{userDetails.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTypography variant="subtitle1">טלפון</StyledTypography>
              <Typography>{userDetails.phone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTypography variant="subtitle1">עיר</StyledTypography>
              <Typography>{userDetails.city}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTypography variant="subtitle1">שכונה</StyledTypography>
              <Typography>{userDetails.neighborhood}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTypography variant="subtitle1">רחוב</StyledTypography>
              <Typography>{userDetails.street}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTypography variant="subtitle1">מספר בית</StyledTypography>
              <Typography>{userDetails.houseNumber}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTypography variant="subtitle1">מיקוד</StyledTypography>
              <Typography>{userDetails.zipCode}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTypography variant="subtitle1">אמצעי תקשורת מועדף</StyledTypography>
              <Typography>{userDetails.communicationMethod}</Typography>
            </Grid>
            {userDetails.role === "Volunteer" && (
              <Grid item xs={12} sm={6}>
                <StyledTypography variant="subtitle1">מיקום</StyledTypography>
                <Typography>{userDetails.location}</Typography>
              </Grid>
            )}
          </Grid>
        )}
      </StyledPaper>
    </Container>
  );
};

export default UserProfile;
