import { useContext, useEffect, createContext, useState } from 'react'
import { Route, Routes, useNavigate, Link, useLocation } from 'react-router-dom'
import { Container, Box, Card, Typography, Grid, List, ListItem, ListItemText, ListItemButton, ListItemIcon, Tooltip, IconButton, Dialog, DialogTitle, DialogActions, DialogContentText, Stack, DialogContent, Button } from '@mui/material'
import { LoadingButton } from '@mui/lab';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import KeyIcon from '@mui/icons-material/Key';
import HistoryIcon from '@mui/icons-material/History';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PublicIcon from '@mui/icons-material/Public';
import { useSnackbar } from 'notistack'
import { useUserContext } from '../../contexts/UserContext';
import ViewProfilePage from './ViewProfilePage';
import UserMFAPage from './UserMFAPage';
import PhoneLockedIcon from '@mui/icons-material/PhoneLocked';
import UserPasswordLoginPage from './UserPasswordLoginPage';
import NotFoundPage from '../NotFoundPage'
import NotificationSettingsPage from './NotificationSettingsPage'

export const ProfileContext = createContext(null)
function UserProfileRoutesPage() {
    const { user } = useUserContext();
    const location = useLocation()
    const [profile, setProfile] = useState({
        id: 1,
        name: "",
        email: "",
        phone_number: "",
        profile_picture: "",
        profile_picture_type: "",
        is_active: false,
        is_email_verified: false,
        is_phone_verified: false,
        is_2fa_enabled: false,
        cash: 0,
        points: 0,
    },)
    const [changePictureDialog, setChangePictureDialog] = useState(false);
    const [loadingPicture, setLoadingPicture] = useState(false);
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()


    return (
        <>
            <Container maxWidth="xl" sx={{ marginTop: "2rem", marginBottom: "1rem" }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <List>
                                <ListItem key={"Account Overview"} disablePadding>
                                    <ListItemButton component={Link} to="/profile" selected={(location.pathname == "/profile" || location.pathname.includes("/profile/edit"))}>
                                        <ListItemIcon><PersonIcon /></ListItemIcon>
                                        <ListItemText primary={"Account Overview"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem key={"Notification Settings"} disablePadding>
                                    <ListItemButton component={Link} to="/profile/notification" selected={(location.pathname == "/profile/notification" )}>
                                        <ListItemIcon><NotificationsIcon /></ListItemIcon>
                                        <ListItemText primary={"Notification Settings"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem key={"Phone & 2FA"} disablePadding>
                                    <ListItemButton component={Link} to="/profile/mfa" selected={(location.pathname == "/profile/mfa")}>
                                        <ListItemIcon><PhoneLockedIcon /></ListItemIcon>
                                        <ListItemText primary={"Phone & 2FA"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem key={"Password & login"} disablePadding>
                                    <ListItemButton component={Link} to="/profile/passwordlogin" selected={(location.pathname == "/profile/passswordlogin")}>
                                        <ListItemIcon><KeyIcon /></ListItemIcon>
                                        <ListItemText primary={"Password & login"} />
                                    </ListItemButton>
                                </ListItem>
                                {/* <ListItem key={"Driver Information"} disablePadding>
                                    <ListItemButton component={Link} to="/profile/driverInformation" selected={(location.pathname == "/profile/driverInformation")}>
                                        <ListItemIcon><DriveEtaIcon /></ListItemIcon>
                                        <ListItemText primary={"Driver Information"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem key={"Wallet"} disablePadding>
                                    <ListItemButton component={Link} to="/profile/wallet" selected={(location.pathname == "/profile/wallet")}>
                                        <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
                                        <ListItemText primary={"Wallet"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem key={"Transaction History"} disablePadding>
                                    <ListItemButton component={Link} to="/profile/history" selected={(location.pathname.includes("/profile/history"))}>
                                        <ListItemIcon><HistoryIcon /></ListItemIcon>
                                        <ListItemText primary={"Transaction History"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem key={"Orders History"} disablePadding>
                                    <ListItemButton component={Link} to="/profile/orders" selected={(location.pathname.includes("/profile/orders"))}>
                                        <ListItemIcon><ReceiptLongIcon /></ListItemIcon>
                                        <ListItemText primary={"Orders History"} />
                                    </ListItemButton>
                                </ListItem> */}
                            </List>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={9}>
                        <Routes>
                            <Route path="/" element={<ViewProfilePage />} />
                        </Routes>
                        <Routes>
                            <Route path="/notification" element={<NotificationSettingsPage />} />
                        </Routes>
                        <Routes>
                            <Route path="/mfa" element={<UserMFAPage />} />
                        </Routes>
                        <Routes>
                            <Route path="/passwordlogin" element={<UserPasswordLoginPage />} />
                        </Routes>
                    </Grid>
                </Grid>
            </Container>

        </>
    )
}

export default UserProfileRoutesPage