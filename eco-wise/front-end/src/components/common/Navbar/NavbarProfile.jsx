import { useState, useContext, useEffect } from "react";
import { Box, IconButton, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Popover, Divider, Typography } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import ProfilePicture from "./ProfilePicture";

import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import SupportIcon from '@mui/icons-material/Support';
import { enqueueSnackbar } from "notistack";
import { useUserContext } from "../../../contexts/UserContext";
import SignOutApi from "../../../api/auth/SignOutApi";
import { useAlert } from "../../../contexts/AlertContext";

export function NavbarProfile() {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const navigate = useNavigate()
    const { user, accessToken, refreshToken, UserLogOut, SessionRefreshError } = useUserContext();
    const { showAlert } = useAlert();

    function handlePopoverOpen(event) {
        setAnchorEl(event.currentTarget);
        setIsPopoverOpen(true);
    }

    function handleLogout() {
        navigate('/')
        SignOutApi(accessToken, refreshToken)
            .then((res) => {
                UserLogOut();
            })
            .catch((error) => {
                console.error('Error when signing out:', error);
                if (error.name === 'NotAuthorizedException') {
                    if (error.message == "Refresh Token has expired" || error.message.includes('Refresh')) {
                        UserLogOut();
                    }
                } else {
                    console.error('Error fetching user data:', error.message);
                    UserLogOut();
                }
            })
        setIsPopoverOpen(false)

    }

    return (
        <>
            <IconButton onClick={(e) => handlePopoverOpen(e)}>
                <ProfilePicture user={user} />
            </IconButton>
            <Popover
                disableScrollLock
                id={"userPopover"}
                open={isPopoverOpen}
                anchorEl={anchorEl}
                onClose={() => setIsPopoverOpen(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    horizontal: 'right',
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", margin: "1rem" }}>
                    <ProfilePicture user={user} />
                    <Box marginLeft={"1rem"}>
                        <Typography variant="subtitle1">{user.UserAttributes.given_name}</Typography>
                        <Typography variant="body2">{user.UserAttributes.email}</Typography>
                    </Box>
                </Box>
                <Divider sx={{ marginTop: "1rem" }} />
                <List>
                    <ListItem key={"My Profile"} disablePadding>
                        <ListItemButton component={Link} to="/profile" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><PersonIcon /></ListItemIcon>
                            <ListItemText primary={"My Profile"} />
                        </ListItemButton>
                    </ListItem>
                    {/* <ListItem key={"Wishlist"} disablePadding>
                        <ListItemButton component={Link} to="/wishlist" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><FavoriteBorderOutlinedIcon /></ListItemIcon>
                            <ListItemText primary={"Wishlist"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Cart"} disablePadding>
                        <ListItemButton component={Link} to="/cart" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                            <ListItemText primary={"Cart"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Support"} disablePadding>
                        <ListItemButton component={Link} to="/support" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><SupportIcon /></ListItemIcon>
                            <ListItemText primary={"Support"} />
                        </ListItemButton>
                    </ListItem> */}
                    <ListItem key={"Logout"} disablePadding>
                        <ListItemButton onClick={() => handleLogout()}>
                            <ListItemIcon><LogoutIcon /></ListItemIcon>
                            <ListItemText primary={"Logout"} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Popover>
        </>
    )
}