import React, { useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, Checkbox, FormControlLabel, Grid, Typography } from '@mui/material';
import RoomIcon from '@mui/icons-material/MeetingRoom';
import DeviceIcon from '@mui/icons-material/Devices';
import CardTitle from '../../components/common/CardTitle';
import { LoadingButton } from '@mui/lab';

// Helper function to calculate elapsed time
// Helper function to calculate elapsed time
const getElapsedTime = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = Math.max(now - start, 0); // Ensure non-negative
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) - 1;
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
};

const DeviceCard = ({ device, startDevice, stopDevice, startLoading, stopLoading, toggledDevices, toggleDevice }) => {
    const [elapsedTime, setElapsedTime] = useState({ hours: 0, minutes: 0, seconds: 0 }); // Initialize with zero

    useEffect(() => {
        if (device.status === 'running') {
            const timer = setInterval(() => {
                setElapsedTime(getElapsedTime(device.startTime));
            }, 1000);

            return () => clearInterval(timer); // Cleanup interval
        } else {
            // Reset timer when stopped
            setElapsedTime({ hours: 0, minutes: 0, seconds: 0 });
        }
    }, [device.status, device.startTime]);

    return (
        <Card sx={{ mt: 2, padding: 1.5, boxShadow: 2 }}>
            <Grid container spacing={1}>
                <Grid item xs={8}>
                    <CardTitle
                        title={device.model === 'Custom' ? device.customModel : device.model}
                        icon={<DeviceIcon sx={{ color: 'gray' }} />}
                    />
                </Grid>
                <Grid item xs={2}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={toggledDevices.some(d => d.deviceId === device.deviceId)}  // Check if the deviceId exists in toggledDevices
                                onChange={() => toggleDevice(device.deviceId)}  // Toggle device state
                            />
                        }
                        label=""
                    />
                </Grid>
                <Grid item xs={2}>
                    {device.status === 'stopped' ? (
                        <LoadingButton
                            loading={startLoading[device.deviceId] || false}
                            onClick={() => startDevice(device)}
                            variant="contained"
                            color="primary"
                        >
                            Start
                        </LoadingButton>
                    ) : (
                        <LoadingButton
                            loading={stopLoading[device.deviceId] || false}
                            onClick={() => stopDevice(device)}
                            variant="contained"
                            color="error"
                        >
                            Stop
                        </LoadingButton>
                    )}
                </Grid>
                <Grid item xs={12}>
                    <Typography
                        sx={{
                            color: device.status === 'running' ? 'green' : 'orange',
                            fontWeight: 'bold',
                        }}
                    >
                        Status: {device.status}
                    </Typography>
                </Grid>
                {device.status === 'running' && (
                    <Grid item xs={12}>
                        <Alert severity="info" sx={{ fontSize: '1rem', borderRadius: '10px' }}>
                            Time Elapsed: {elapsedTime.hours} hours, {elapsedTime.minutes} minutes,{' '}
                            {elapsedTime.seconds} seconds
                        </Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Typography>Type: {device.type}</Typography>
                </Grid>
                <Grid item xs={12}>
                    {device.model === 'Custom' ? (
                        <Typography>Model: Custom - {device.customModel}</Typography>
                    ) : (
                        <Typography>Model: {device.model}</Typography>
                    )}
                </Grid>
                <Grid item xs={12}>
                    <Typography>Device Consumption: {device.consumption}</Typography>
                </Grid>
            </Grid>
        </Card>
    );
};


const ViewHomeRoomCard = ({ room, startDevice, stopDevice, startLoading, stopLoading, toggledDevices, toggleDevice }) => {

    return (
        <Grid item xs={12} md={6} lg={6} key={room.roomId}>
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: '0.5rem' }}>
                        <RoomIcon color="primary" sx={{ fontSize: '1.5rem', marginRight: '0.5rem' }} />
                        {room.roomName}
                    </Typography>
                    {room.devices.map((device, index) => (
                        <DeviceCard
                            key={index}
                            device={device}
                            startDevice={startDevice}
                            stopDevice={stopDevice}
                            startLoading={startLoading}
                            stopLoading={stopLoading}
                            toggledDevices={toggledDevices}
                            toggleDevice={toggleDevice}
                        />
                    ))}
                </CardContent>
            </Card>
        </Grid>
    );
};

export default ViewHomeRoomCard;
