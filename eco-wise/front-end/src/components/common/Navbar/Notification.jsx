import React, { useEffect, useState } from "react";
import { IconButton, Badge, Menu, MenuItem, Typography, Button, Divider, Box } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { GetNotificationApi } from "../../../api/notification/GetNotificationApi";
import { useUserContext } from "../../../contexts/UserContext";

function Notification() {
    const { user } = useUserContext();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]); // State to hold notifications
    const [visibleNotifications, setVisibleNotifications] = useState(4); // Initially show 4 notifications
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const loadMoreNotifications = () => {
        setVisibleNotifications((prev) => prev + 4); // Show 4 more notifications
    };

    useEffect(() => {
        // Fetch notifications and update the state
        GetNotificationApi(user.Username)
            .then((res) => {
                const messages = res.messages.map((message, index) => ({
                    id: index + 1, // or you can use a unique ID if available
                    message: message,
                }));
                setNotifications(messages);
            })
            .catch((error) => {
                console.error("Error fetching notifications:", error);
            });
    }, [user.Username]);

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
                        maxHeight: 500,
                        minWidth: 500, // Wider menu
                        marginLeft: -20, // Adjust position to the left
                    },
                }}
            >
                {notifications.slice(0, visibleNotifications).map((notification, index) => (
                    <Box key={notification.id}>
                        <MenuItem onClick={handleClose} sx={{ display: "flex", justifyContent: "space-between", flexDirection: "row" }}>
                            <Typography variant="body2">{notification.message}</Typography>
                        </MenuItem>
                        {index < visibleNotifications - 1 && <Divider />}
                    </Box>
                ))}

                {visibleNotifications < notifications.length && (
                    <MenuItem onClick={loadMoreNotifications}>
                        <Button fullWidth>Load more</Button>
                    </MenuItem>
                )}

                {notifications.length === 0 && (
                    <MenuItem onClick={handleClose}>No new notifications</MenuItem>
                )}
            </Menu>
        </>
    );
}

export default Notification;
