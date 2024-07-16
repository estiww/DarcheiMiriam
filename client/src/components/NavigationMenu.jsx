import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Logo from "../imgs/Logo.png";
import { UserContext } from "../App";
import Box from "@mui/material/Box";

const NavigationMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      const response = await fetch(`http://localhost:3000/logout/${user.id}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        setUser(undefined);
        navigate("/home");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isLoginPage = location.pathname.includes("/login");

  const menuItems = [
    {
      text: "בקשות פתוחות",
      link: "/home/travelRequests",
      roles: ["Admin", "Volunteer"],
    },
    { text: "הוספת משתמש", link: "/home/addUser", roles: ["Admin"] },
    { text: "התאמות נסיעה", link: "/home/travelMatches", roles: ["Admin"] },
    {
      text: "טופס בקשת נסיעה",
      link: "/home/travelRequestForm",
      roles: ["Admin", "Patient"],
    },
    { text: "משתמשים", link: "/home/users", roles: ["Admin"] },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => user && user.isApproved && item.roles.includes(user.roleName)
  );

  const renderMenuItems = () => (
    <>
      {filteredMenuItems.map((item, index) => (
        <Button
          key={index}
          color="inherit"
          component={Link}
          to={item.link}
          style={{ color: "#000" }}
          onClick={isMobile ? toggleDrawer(false) : null}
        >
          {item.text}
        </Button>
      ))}
    </>
  );

  const renderMobileMenu = () => (
    <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
      <List>
        {filteredMenuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            component={Link}
            to={item.link}
            onClick={toggleDrawer(false)}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {user && user.isApproved && (
          <>
            <ListItem
              button
              component={Link}
              to="/home/profile"
              onClick={toggleDrawer(false)}
            >
              <ListItemText primary="פרופיל" />
            </ListItem>
            {user.roleName !== "Admin" && (
              <ListItem
                button
                component={Link}
                to="/home/myTravels"
                onClick={toggleDrawer(false)}
              >
                <ListItemText primary="הנסיעות שלי" />
              </ListItem>
            )}
            <ListItem
              button
              onClick={() => {
                toggleDrawer(false)(); // Close the drawer first
                handleLogout(); // Then handle the logout
              }}
            >
              <ListItemText primary="התנתקות" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <AppBar
      position="fixed"
      style={{
        backgroundColor: "white",
        boxShadow: "none",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Toolbar style={{ justifyContent: "space-between" }}>
        <Typography
          component={Link}
          to="/home"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <img
            src={Logo}
            alt="Darchei Miriam Logo"
            style={{ height: "80px", width: "auto" }}
          />
        </Typography>

        {isMobile ? (
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon style={{ color: "#000" }} />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            {user && user.isApproved && renderMenuItems()}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!user || (user && !user.isApproved) ? (
            <>
              {isLoginPage ? (
                <Button
                  color="inherit"
                  component={Link}
                  to="/signup"
                  style={{ color: "#000" }}
                >
                  הרשמה
                </Button>
              ) : (
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  style={{ color: "#000" }}
                >
                  התחברות
                </Button>
              )}
            </>
          ) : (
            <IconButton
              color="inherit"
              onClick={handleMenu}
              style={{ marginLeft: '16px' }}
            >
              <AccountCircle style={{ color: "#000", fontSize: '2.5rem' }} />
            </IconButton>
          )}
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={handleClose}
            component={Link}
            to="/home/profile"
          >
            פרופיל
          </MenuItem>
          {user && user.roleName !== "Admin" && (
            <MenuItem
              onClick={handleClose}
              component={Link}
              to="/home/myTravels"
            >
              הנסיעות שלי
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>התנתקות</MenuItem>
        </Menu>
        {isMobile && renderMobileMenu()}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationMenu;
