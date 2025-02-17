import React, { useState } from "react";
import { IconButton, Badge, Menu, MenuItem, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

const notifications = [
    { id: 1, message: "Your device has been running for over 5 minutes!" },
    { id: 2, message: "New update available for your app." },
    { id: 3, message: "Someone found your lost item!" },
];

function Notification() {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                disableScrollLock
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 300,
                        minWidth: 250,
                    },
                }}
            >
                {notifications.length === 0 ? (
                    <MenuItem onClick={handleClose}>No new notifications</MenuItem>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem key={notification.id} onClick={handleClose}>
                            <Typography variant="body2">{notification.message}</Typography>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}

export default Notification;
