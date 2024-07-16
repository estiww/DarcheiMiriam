import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import sendRefreshToken from "./SendRefreshToken";

import {
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Box,
  Container,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const AdminForm = ({ isApproved = false }) => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  console.log("isApproved");
  console.log(isApproved);
  const [formData, setFormData] = useState({
    roleName: "Admin",
    firstName: "",
    lastName: "",
    birthDate: "",
    phone: "",
    email: "",
    password: "",
    gender: "",
    city: "",
    neighborhood: "",
    street: "",
    houseNumber: "",
    zipCode: "",
    isApproved: isApproved,
    communicationMethod: "",
  });

  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(formData.email)) {
      setError("You have entered an invalid email address!");
      return;
    }
    if (!validateBirthDate(formData.birthDate)) {
      setError("You have entered an invalid birthdate!");
      return;
    }
  
    let url;
    if (user.roleName !== "Admin") {
      url = `http://localhost:3000/signup`;
    } else {
      url = `http://localhost:3000/addUser`;
    }
  
    const fetchData = async () => {
      try {
        let response = await fetch(url, requestOptions);
  
        if (!response.ok) {
          if (user.roleName === "Admin" && response.status === 401) {
            console.log('user.roleName === "Admin" && response.status === 401');
            const tokenResponse = await sendRefreshToken();
            if (tokenResponse.status === 440) {
              console.log(440);
              throw new Error("440");
            }
            return fetchData(); // Retry the request after refreshing the token
          }
  
          const data = await response.json();
          throw new Error(data.message);
        }
  
        const data = await response.json();
        if (user.roleName !== "Admin") {
          setUser(data);
        }
        setOpen(true); // Open the dialog upon successful request
      } catch (error) {
        setError(error.message);
        if (error.message === "440") {
          navigate("/login");
        }
      }
    };
  
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: "include",
    };
  
    // try {
    //   await fetchData(); // Call fetchData to initiate the request
    // } catch (error) {
    //   setError(error.message);
    // }
    await fetchData()
   
  };
  
  
  const validateEmail = (mailAddress) => {
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return mailAddress.match(mailformat);
  };

  const validateBirthDate = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    return birthDateObj.setFullYear(birthDateObj.getFullYear() + 18) < today;
  };

  const handleClose = () => {
    setOpen(false);
    navigate("/home");
  };

  return (
    <Container>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Typography variant="h6">הוספת מנהל</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="שם פרטי"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            InputLabelProps={{ style: { textAlign: 'right', right: 0, left: 'auto' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="שם משפחה"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            InputLabelProps={{ style: { textAlign: 'right', right: 0, left: 'auto' } }}
          />
        </Box>
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">מגדר</FormLabel>
          <RadioGroup
            row
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <FormControlLabel value="Male" control={<Radio />} label="זכר" />
            <FormControlLabel value="Female" control={<Radio />} label="נקבה" />
          </RadioGroup>
        </FormControl>
  
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="תאריך לידה"
            name="birthDate"
            type="date"
            InputLabelProps={{
              shrink: true,
              style: { textAlign: 'right', right: 0, left: 'auto' }
            }}
            value={formData.birthDate}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="טלפון"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            InputLabelProps={{ style: { textAlign: 'right', right: 0, left: 'auto' } }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="דואר אלקטרוני"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            InputLabelProps={{ style: { textAlign: 'right', right: 0, left: 'auto' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="סיסמה"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            InputLabelProps={{ style: { textAlign: 'right', right: 0, left: 'auto' } }}
          />
        </Box>
  
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">אמצעי תקשורת מועדף</FormLabel>
          <RadioGroup
            row
            name="communicationMethod"
            value={formData.communicationMethod}
            onChange={handleChange}
          >
            <FormControlLabel
              value="WhatsApp"
              control={<Radio />}
              label="וואטסאפ"
            />
            <FormControlLabel value="Email" control={<Radio />} label="דואר אלקטרוני" />
            <FormControlLabel value="Phone" control={<Radio />} label="טלפון" />
          </RadioGroup>
        </FormControl>
  
        <Typography variant="h6" sx={{ mt: 2 }}>
          כתובת
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="עיר"
            name="city"
            value={formData.city}
            onChange={handleChange}
            InputLabelProps={{ style: { textAlign: 'right', right: 0, left: 'auto' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="שכונה"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            InputLabelProps={{ style: { textAlign: 'right', right: 0, left: 'auto' } }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="רחוב"
            name="street"
            value={formData.street}
            onChange={handleChange}
            InputLabelProps={{ style: { textAlign: 'right', right: 0, left: 'auto' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="מספר בית"
            name="houseNumber"
            value={formData.houseNumber}
            onChange={handleChange}
            InputLabelProps={{ style: { textAlign: 'right', right: 0, left: 'auto' } }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="מיקוד"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            InputLabelProps={{ style: { textAlign: 'right', right: 0, left: 'auto' } }}
          />
        </Box>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
         אישור
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleOutlineIcon color="success" />
            הבקשה נשלחה בהצלחה
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            הבקשה שלך התקבלה והיא ממתינה לאישור.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            אישור
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminForm;
