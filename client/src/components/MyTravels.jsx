import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../App';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Paper, 
  Container, 
  Box,
  Divider,
  Card,
  CardContent,
  Grid,
  Icon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconText = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '& > *:first-child': {
    marginRight: theme.spacing(1),
  },
}));

const MyTravels = () => {
  const [travelRequests, setTravelRequests] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchTravelRequests = async () => {
      try {
        const response = await fetch(`http://localhost:3000/travelMatches/${user.id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        setTravelRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching travel requests:', error);
        setTravelRequests([]);
      }
    };

    if (user) {
      fetchTravelRequests();
    }
  }, [user]);

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center">
          הנסיעות שלי
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {travelRequests.length > 0 ? (
          <Grid container spacing={3}>
            {travelRequests.map((request) => (
              <Grid item xs={12} key={request.requestId}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      נסיעה מ{request.Origin} ל{request.Destination}
                    </Typography>
                    <IconText>
                      <DateRangeIcon color="primary" />
                      <Typography variant="body1">
                        תאריך: {request.TravelDate}
                      </Typography>
                    </IconText>
                    <IconText>
                      <AccessTimeIcon color="primary" />
                      <Typography variant="body1">
                        שעה: {request.TravelTime}
                      </Typography>
                    </IconText>
                    <IconText>
                      <PeopleIcon color="primary" />
                      <Typography variant="body1">
                        נוסעים: {request.NumberOfPassengers}
                      </Typography>
                    </IconText>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              אין בקשות נסיעה זמינות.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default MyTravels;