import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Grid, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Select, MenuItem, InputLabel } from '@mui/material';

const DonationPage = () => {
    const [donationInfo, setDonationInfo] = useState({
        amount: '',
        frequency: 'oneTime',
        paymentMethod: 'creditCard',
        numPayments: 1,
        cardNumber: '',
        cardExpiry: '',
        cardCVC: '',
        recurringDuration: 12, // ברירת מחדל: שנה
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setDonationInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Donation submitted:', donationInfo);
    };

    const handlePayPalSuccess = (details, data) => {
        console.log('PayPal Transaction completed by ' + details.payer.name.given_name);
    };

    return (
        <Container maxWidth="md" style={{ marginTop: '80px', direction: 'rtl' }}>
            <Typography variant="h4" align="center" gutterBottom>
                תרום לארגון דרכי מרים
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="סכום התרומה (בש״ח)"
                            name="amount"
                            type="number"
                            value={donationInfo.amount}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel component="legend">תדירות התרומה</FormLabel>
                            <RadioGroup
                                name="frequency"
                                value={donationInfo.frequency}
                                onChange={handleChange}
                            >
                                <FormControlLabel value="oneTime" control={<Radio />} label="חד פעמי" />
                                <FormControlLabel value="monthly" control={<Radio />} label="הוראת קבע חודשית" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    {donationInfo.frequency === 'oneTime' ? (
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>מספר תשלומים</InputLabel>
                                <Select
                                    name="numPayments"
                                    value={donationInfo.numPayments}
                                    onChange={handleChange}
                                >
                                    {[1,2,3,4,5,6,12].map(num => (
                                        <MenuItem key={num} value={num}>{num} תשלומים</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>משך הוראת הקבע</InputLabel>
                                <Select
                                    name="recurringDuration"
                                    value={donationInfo.recurringDuration}
                                    onChange={handleChange}
                                >
                                    <MenuItem value={3}>3 חודשים</MenuItem>
                                    <MenuItem value={6}>6 חודשים</MenuItem>
                                    <MenuItem value={12}>שנה</MenuItem>
                                    <MenuItem value={24}>שנתיים</MenuItem>
                                    <MenuItem value={0}>ללא הגבלת זמן</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel component="legend">אמצעי תשלום</FormLabel>
                            <RadioGroup
                                name="paymentMethod"
                                value={donationInfo.paymentMethod}
                                onChange={handleChange}
                            >
                                <FormControlLabel value="creditCard" control={<Radio />} label="כרטיס אשראי" />
                                <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    {donationInfo.paymentMethod === 'creditCard' && (
                        <>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="מספר כרטיס אשראי"
                                    name="cardNumber"
                                    value={donationInfo.cardNumber}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="תוקף (MM/YY)"
                                    name="cardExpiry"
                                    placeholder="MM/YY"
                                    value={donationInfo.cardExpiry}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="CVC"
                                    name="cardCVC"
                                    value={donationInfo.cardCVC}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </>
                    )}
                    <Grid item xs={12}>
                        {donationInfo.paymentMethod === 'creditCard' ? (
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                style={{ backgroundColor: '#B300B3', color: 'white' }}
                            >
                                תרום עכשיו
                            </Button>
                        ) : (
                            <Button
                                amount={donationInfo.amount}
                                onSuccess={handlePayPalSuccess}
                               
                            />
                        )}
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
};

export default DonationPage;
