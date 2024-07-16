import React, { useState, useContext, useEffect } from "react";
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  Container,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import FlagIcon from "@mui/icons-material/Flag";
import AlarmIcon from '@mui/icons-material/Alarm';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { UserContext } from "../App";


const TravelRequests = ({ setMinimizedReminders }) => {
  const { user } = useContext(UserContext); // שימוש ב-UserContext
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [requestToTake, setRequestToTake] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [filterType, setFilterType] = useState("origin");
  const [filterValue, setFilterValue] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDate, setSelectedDate] = useState(null);
  const [userId, setUserId] = useState(""); // מצב חדש עבור ה-User ID
  const navigate = useNavigate();
  const userIdToSend = user?.roleName === "Admin" ? userId : user?.id; 

  const hospitals = [
    "הדסה עין כרם",
    "הדסה הר הצופים",
    "איכילוב",
    "שיבא",
    "רמב\"ם",
    "סורוקה",
    "שערי צדק",
    "קפלן",
    "וולפסון",
    "לניאדו",
    "בילינסון",
    "אסף הרופא",
    "פוריה",
    "הלל יפה",
    "ברזילי",
    "זיו",
    "בית לוינשטיין",
    "משגב לדך",
    "אסותא",
  ];

  const fetchTravelRequests = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/travelRequests?status=התקבלה`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.log(response.status);
        if (response.status === 401) {
          const response = await sendRefreshToken();
          if (response.status === 440) {
            console.log(440);
            throw new Error("440");
          }
          return fetchTravelRequests();
        }

        const data = await response.json();
        throw new Error(data.message);
      }

      if (response.status === 204) {
        setRequests([]);
        throw new Error("No Open Travel Request");
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      setError(error.message);
      if (error.message === "440") {
        navigate("/login");
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return dayjs(dateStr).format("DD/MM");
  }};

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    return `${hours}:${minutes}`;
  };

  const handleTakeRequest = async (requestId) => {
    setLoading(true);
    setConfirmationMessage("");
    try {       
      console.log("User ID to send:", userIdToSend);
  
      const response = await fetch(
        `http://localhost:3000/travelRequests/${requestId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userIdToSend }),
        }
      );
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to take request");
      }
  
      await createTravelMatches(requestId, userIdToSend);
      setConfirmationMessage("הנסיעה נלקחה תודה רבה!");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      fetchTravelRequests();
      setMinimizedReminders(true);
    }
  };
  
  const createTravelMatches = async (requestId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/travelMatches/${requestId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userIdToSend }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create travel matches");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleOpenDialog = (id) => {
    setRequestToTake(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setRequestToTake(null);
    setOpenDialog(false);
    setConfirmationMessage("");
    fetchTravelRequests();
  };

  useEffect(() => {
    let timer;
    if (confirmationMessage) {
      timer = setTimeout(() => {
        handleCloseDialog();
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [confirmationMessage]);

  useEffect(() => {
    fetchTravelRequests();
    const interval = setInterval(fetchTravelRequests, 2000);
    return () => clearInterval(interval);
  }, []);

  const getRelevantPart = (address) => {
    for (const hospital of hospitals) {
      if (address.includes(hospital)) {
        return hospital;
      }
    }
    const parts = address.split(",");
    if (parts.length > 2) {
      return parts[1].trim();
    }
    return address;
  };

  const isRequestUrgent = (request) => {
    const dateParts = request.TravelDate.split('-');
    const timeParts = request.TravelTime.split(':');
    
    const requestDateTime = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
      parseInt(timeParts[0]),
      parseInt(timeParts[1]),
      parseInt(timeParts[2])
    );
    
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 60 * 60000);

    return requestDateTime <= thirtyMinutesLater;
  };

  const filteredRequests = requests
    .filter((request) => {
      if (filterType && filterValue) {
        if (filterType === "origin") {
          return getRelevantPart(request.Origin).includes(filterValue);
        } else if (filterType === "destination") {
          return getRelevantPart(request.Destination).includes(filterValue);
        } else if (filterType === "date") {
          const requestDate = dayjs(request.TravelDate).startOf("day");
          const selectedFilterDate = dayjs(filterValue).startOf("day");
          return requestDate.isSame(selectedFilterDate);
        }
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.TravelDate + " " + a.TravelTime);
      const dateB = new Date(b.TravelDate + " " + b.TravelTime);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    

    return (
      <Container maxWidth="md">
        <Box my={4}>
          <Typography variant="h4" gutterBottom color="primary" align="center" fontWeight="bold">
            בקשות נסיעה
          </Typography>
          <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: '#f5f5f5' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="filter-type-label">סוג סינון</InputLabel>
                  <Select
                    labelId="filter-type-label"
                    value={filterType}
                    label="סוג סינון"
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <MenuItem value="origin">מוצא</MenuItem>
                    <MenuItem value="destination">יעד</MenuItem>
                    <MenuItem value="date">תאריך</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                {filterType === "date" ? (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="בחר תאריך"
                      value={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        setFilterValue(date ? date.toISOString() : "");
                      }}
                      renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                    />
                  </LocalizationProvider>
                ) : (
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={filterType === "origin" ? "מוצא" : "יעד"}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  startIcon={<AlarmIcon />}
                >
                  {sortOrder === "asc" ? "מוקדם למאוחר" : "מאוחר למוקדם"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        
        {error && (
          <Box my={2}>
            <Typography variant="body1" color="error" align="center">
              שגיאה: {error}
            </Typography>
          </Box>
        )}
  
        <Grid container spacing={2}>
          {filteredRequests.map((request) => (
            <Grid item xs={12} key={request.TravelRequestId}>
              <Card 
                elevation={3}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  backgroundColor: isRequestUrgent(request) ? '#fff0f7' : 'white',
                  borderLeft: isRequestUrgent(request) ? '4px solid #b6247e' : 'none',
                }}
              >
                <CardContent sx={{ flex: '1 0 auto', py: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" component="div" sx={{ mr: 2, minWidth: '60px' }}>
                    #{request.TravelRequestId}
                  </Typography>
                  <Box display="flex" alignItems="center" flexWrap="wrap">
                    <Box display="flex" alignItems="center" mr={2}>
                      <EventIcon color="action" sx={{ mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2">{formatDate(request.TravelDate)}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mr={2}>
                      <AccessTimeIcon color="action" sx={{ mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2">{formatTime(request.TravelTime)}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mr={2}>
                      <PlaceIcon color="action" sx={{ mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" noWrap>{getRelevantPart(request.Origin)}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <FlagIcon color="action" sx={{ mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="body2" noWrap>{getRelevantPart(request.Destination)}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Box display="flex" alignItems="center">
                  {isRequestUrgent(request) && (
                    <Chip 
                      label="דחוף" 
                      color="primary" 
                      size="small"
                      sx={{ mr: 1, fontWeight: 'bold' }}
                    />
                  )}
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(request.TravelRequestId)}
                    disabled={loading}
                    size="small"
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

          <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>אישור לקיחת בקשה</DialogTitle>
          <DialogContent>
            <DialogContentText>
              האם אתה בטוח שברצונך לקחת את הבקשה?
            </DialogContentText>
            {user?.roleName === "Admin" && (
              <TextField
                fullWidth
                margin="normal"
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            )}
            {confirmationMessage && (
              <Typography variant="body1" color="primary">
                {confirmationMessage}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              ביטול
            </Button>
            <Button
              onClick={() => handleTakeRequest(requestToTake)}
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "אישור"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  };
  
  export default TravelRequests;
  