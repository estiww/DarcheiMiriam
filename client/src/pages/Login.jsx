import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { UserContext } from "../App";
import NavigationMenu from "../components/NavigationMenu";

function Login() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    if (!email || !password) {
      setError("אנא מלא את כל השדות.");
      return;
    }

    const url = "http://localhost:3000/login";
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    };

    fetch(url, requestOptions)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 409) {
            throw new Error("שם משתמש או סיסמה שגויים");
          }
          return response.json().then((data) => {
            throw new Error(data.message);
          });
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        setError("");
        navigate("/home");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleSignupNavigate = () => {
    navigate("/signup");
  };

  const forgotPassword = (event) => {
    event.preventDefault();
    const url = "http://localhost:3000/forgotPassword";
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    };

    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("נשלח אימייל עם הוראות לאיפוס הסיסמה.");
        } else {
          alert("שגיאה: " + data.message);
        }
      })
      .catch((error) => {
        alert("שגיאה: " + error.message);
      });
  };

  return (
    <>
      <NavigationMenu />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Paper elevation={3} sx={{ mt: 20, p: 4, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>{" "}
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              התחברות
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="כתובת אימייל"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  dir: "ltr",
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="סיסמה"
                type="password"
                id="password"
                autoComplete="current-password"
                InputProps={{
                  dir: "ltr",
                }}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mb: 3 }}
              >
                התחבר
              </Button>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Link
                    onClick={forgotPassword}
                    variant="body2"
                    sx={{
                      cursor: "pointer",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    שכחת סיסמה?
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Link
                    onClick={handleSignupNavigate}
                    variant="body2"
                    sx={{
                      cursor: "pointer",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    אין לך חשבון? הירשם
                  </Link>
                </Grid>
              </Grid>
              {error && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ mt: 2, textAlign: "center" }}
                >
                  {error}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default Login;