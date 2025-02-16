import { useState, useContext } from "react"
import { AppBar, Box, Container, Toolbar, IconButton, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, Divider, Drawer, Stack, Button } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import HomeIcon from "@mui/icons-material/Home"
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StoreIcon from '@mui/icons-material/Store';
import LoginIcon from '@mui/icons-material/Login';
import { Link } from "react-router-dom"
import { NavbarProfile } from "./NavbarProfile";
import { useUserContext } from "../../../contexts/UserContext";
import CloudIcon from '@mui/icons-material/Cloud';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import DashboardIcon from '@mui/icons-material/Dashboard';

export function Navbar() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false)
    const { IsLoggedIn } = useUserContext();


    return (
        <>
            {// !isAdminPage &&
                <AppBar position="sticky" sx={{ zIndex: 999, borderRadius: "0.5rem", maxWidth: "95%", margin: "0 auto", marginTop: ["1rem", "2rem"], top: ["1rem", "2rem"] }}>
                    <Toolbar>
                        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                            <IconButton color="inherit" sx={{ marginRight: "1rem", display: ["flex", "flex", "none"] }} onClick={() => setIsDrawerOpen(true)}><MenuIcon /></IconButton>
                            <Button color="inherit" variant="text" LinkComponent={Link} to="/" sx={{ marginRight: "1rem", fontFamily: "'caveat brush'", textTransform: "none", fontSize: "18px", padding: "0" }}>EcoWise</Button>
                            <Divider orientation="vertical" flexItem sx={{ marginRight: "1rem", display: ["none", "none", "flex"] }} />
                            <Stack spacing={2} direction="row" sx={{ display: ["none", "none", "flex"] }}>
                                <Button startIcon={<HomeIcon />} LinkComponent={Link} variant="text" color="inherit" to="/">Home</Button>
                                {IsLoggedIn() && <Button startIcon={<DashboardIcon />} LinkComponent={Link} variant="text" color="inherit" to="/dashboard">Dashboard</Button>}
                                {IsLoggedIn() && <Button startIcon={<PriceChangeIcon />} LinkComponent={Link} variant="text" color="inherit" to="/budget">Budget</Button>}
                                <Button startIcon={<CloudIcon />} LinkComponent={Link} variant="text" color="inherit" to="/weatherpage">weather</Button>
                            </Stack>
                        </Box>
                        {!IsLoggedIn() && <Button LinkComponent={Link} variant="text" color="inherit" to="/login" startIcon={<LoginIcon />}>Login</Button>}
                        {IsLoggedIn() && <NavbarProfile />}
                    </Toolbar>
                </AppBar>
            }
            {/* {isAdminPage &&
                <AppBar position="sticky" sx={{ zIndex:999, borderRadius: "0.5rem", maxWidth:"95%", margin: "0 auto", marginTop: ["1rem", "2rem"], top: ["1rem", "2rem"]}}>
                    <Toolbar>
                        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                            <IconButton color="inherit" sx={{ marginRight: "1rem", display: ["flex", "flex", "none"] }} onClick={() => setIsAdminDrawerOpen(true)}><MenuIcon /></IconButton>
                            <Button color="inherit" variant="text" LinkComponent={Link} to="/" sx={{ marginRight: "1rem", fontFamily: "'caveat brush'", textTransform: "none", fontSize: "18px", padding: "0" }}>EcoWise</Button>
                            <Divider orientation="vertical" flexItem sx={{ marginRight: "1rem" }} />
                            <Typography variant="h6" component="div" sx={{ marginRight: "1rem" }}>Admin Panel</Typography>
                        </Box>
                        {user && <NavbarProfile />}
                        {<NavbarProfile />}
                    </Toolbar>
                </AppBar>
            } */}

            <Drawer
                anchor={"left"}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            >
                <List sx={{ width: "250px" }}>
                    <ListItem key={"Home"}>
                        <Typography fontWeight={700}>Navigation Menu</Typography>
                    </ListItem>
                    <Divider sx={{ marginBottom: 1 }} />
                    <ListItem key={"Home"} disablePadding>
                        <ListItemButton component={Link} to="/" onClick={() => setIsDrawerOpen(false)}>
                            <ListItemIcon><HomeIcon /></ListItemIcon>
                            <ListItemText primary={"Home"} />
                        </ListItemButton>
                    </ListItem>
                    {IsLoggedIn() &&
                        <ListItem key={"Dashboard"} disablePadding>
                            <ListItemButton component={Link} to="/dashboard" onClick={() => setIsDrawerOpen(false)}>
                                <ListItemIcon><DashboardIcon /></ListItemIcon>
                                <ListItemText primary={"Dashbaord"} />
                            </ListItemButton>
                        </ListItem>
                    }
                    {IsLoggedIn() &&
                        <ListItem key={"Budget"} disablePadding>
                            <ListItemButton component={Link} to="/budget" onClick={() => setIsDrawerOpen(false)}>
                                <ListItemIcon><PriceChangeIcon /></ListItemIcon>
                                <ListItemText primary={"Budget"} />
                            </ListItemButton>
                        </ListItem>
                    }
                    <ListItem key={"weather"} disablePadding>
                        <ListItemButton component={Link} to="/weatherpage" onClick={() => setIsDrawerOpen(false)}>
                            <ListItemIcon><CloudIcon /></ListItemIcon>
                            <ListItemText primary={"weather"} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            {/* <Drawer anchor={"left"} open={isAdminDrawerOpen} onClose={() => setIsAdminDrawerOpen(false)} variant="temporary">
                <List sx={{ width: "250px" }}>
                    <ListItem key={"Home"}>
                        <Typography fontWeight={700}>Admin Navigation</Typography>
                    </ListItem>
                    <Divider sx={{marginBottom: 1}} />
                </List>
            </Drawer> */}
        </>


    )
}