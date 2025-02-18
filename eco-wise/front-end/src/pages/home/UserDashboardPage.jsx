import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Container, CircularProgress } from '@mui/material';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import HomeIcon from '@mui/icons-material/Home';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { GetHomeApi } from '../../api/home/GetHomeApi';
import { enqueueSnackbar } from 'notistack';
import { useUserContext } from '../../contexts/UserContext';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import LargeCardTitle from '../../components/common/LargeCardTitle';

function UserDashboardPage() {
    const { user } = useUserContext()
    const [home, setHome] = useState(null); // Set initial value to null to indicate loading

    useEffect(() => {
        GetHomeApi(user.Username)
            .then((res) => {
                setHome(res.data)
                console.log(res.data)
            })
            .catch((err) => {
                enqueueSnackbar('Failed to fetch home data', { variant: "error" })
            })
    }, [user.Username]);

    return (
        <Container maxWidth="xl" sx={{ marginTop: "2rem", marginBottom: "1rem" }}>
            <Box >
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card>
                            <LargeCardTitle
                                title='Energy Dashboard'
                                icon={<ElectricBoltIcon sx={{ mr: 1, color: 'secondary.main' }} />}
                                button={<Button variant="contained" color="primary" href="/" startIcon={<AddIcon />} LinkComponent={Link} to="/addHome">Add Home</Button>}
                            />
                            <Typography variant="p3" sx={{ mb: 3, ml: 4 }}>
                                Track your homes and their device consumptions.
                            </Typography>
                        </Card>

                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: "300px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: 3, borderRadius: 3, bgcolor: 'background.paper', textAlign: 'center', p: 3 }}>
                            <Typography variant="h5" sx={{ mb: 3 }}>
                                Home Statistics
                            </Typography>
                            <Grid container spacing={2} justifyContent="center">
                                {/* Total Homes Card */}
                                <Grid item xs={12} sm={6}>
                                    <Card sx={{ p: 3, boxShadow: 2, borderRadius: 3, textAlign: 'center' }}>
                                        <HomeIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                                        <Typography variant="h6" fontWeight="bold">Total Homes</Typography>
                                        <Typography variant="h4" color="primary.main">{home ? home.length : 0}</Typography>
                                    </Card>
                                </Grid>

                                {/* Total Devices Card */}
                                <Grid item xs={12} sm={6}>
                                    <Card sx={{ p: 3, boxShadow: 2, borderRadius: 3, textAlign: 'center' }}>
                                        <ThermostatIcon sx={{ fontSize: 50, color: 'info.main', mb: 1 }} />
                                        <Typography variant="h6" fontWeight="bold">Total Devices</Typography>
                                        <Typography variant="h4" color="info.main">
                                            {home ? home.reduce((total, home) =>
                                                total + home.rooms.reduce((roomTotal, room) =>
                                                    roomTotal + (room.devices ? room.devices.length : 0), 0), 0) : 0}
                                        </Typography>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        {home === null ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {home?.map((home) => (
                                    <Grid item xs={12} sm={6} md={6} key={home.uuid}>
                                        <Card sx={{ boxShadow: 3 }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <HomeIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                                                    <Typography variant="h6">{home.homeName}</Typography>
                                                </Box>
                                                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <ElectricBoltIcon sx={{ mr: 1, color: 'secondary.main' }} />
                                                    Total Rooms: {home.rooms.length}
                                                </Typography>
                                                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <ThermostatIcon sx={{ mr: 1, color: 'info.main' }} />
                                                    Devices: {home.rooms.reduce((total, room) => total + (room.devices ? room.devices.length : 0), 0)}
                                                </Typography>
                                                <Button LinkComponent={Link} to={`/home/view/${home.uuid}`} variant='contained' sx={{ marginTop: "0.5rem" }}>
                                                    View
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>

                </Grid>
            </Box>
        </Container>
    );
}

export default UserDashboardPage;
