import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Container, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { GetHomeApi } from '../../api/home/GetHomeApi';
import { enqueueSnackbar } from 'notistack';
import { useUserContext } from '../../contexts/UserContext';
import ViewHomeTopCard from '../../components/home/ViewHomeTopCard';
import ViewHomeRoomCard from '../../components/home/ViewHomeRoomCard';
import { StoreDeviceConsumptionApi } from '../../api/home/StoreDeviceConsumptionApi';
import { UpdateHomeApi } from '../../api/home/UpdateHomeApi';
import { UpdateDeviceConsumptionApi } from '../../api/home/UpdateDeviceConsumptionApi';
import { GetDeviceConsumptionApi } from '../../api/home/GetDeviceConsumptionApi';
import DeviceConsumptionChart from '../../components/home/DeviceConsumptionChart';

function ViewHomePage() {
    const { user } = useUserContext();
    const [home, setHome] = useState(null);
    const { uuid } = useParams();
    const [startLoading, setStartLoading] = useState({})
    const [stopLoading, setStopLoading] = useState({})
    const [toggledDevices, setToggledDevices] = useState([]);

    const toggleDevice = (deviceId) => {
        if (toggledDevices.some(device => device.deviceId === deviceId)) {
            // If the device is already toggled, remove it from the state
            setToggledDevices(prev =>
                prev.filter(device => device.deviceId !== deviceId)
            );
        } else {
            // If the device is not toggled, fetch its consumption data and add it to the state
            GetDeviceConsumptionApi(deviceId)
                .then((res) => {
                    console.log(res);
                    if (res.data && Array.isArray(res.data)) {
                        // Add the device and its consumption data to the state
                        setToggledDevices(prev => [
                            ...prev,
                            {
                                deviceId,
                                consumptionData: res.data,
                            }
                        ]);
                    }
                })
                .catch((err) => {
                    console.error(`Failed to fetch consumption data for device ${deviceId}:`, err);
                });
        }
    };


    const startDevice = (requestBody) => {
        let formattedBody = {...requestBody};
        formattedBody.userId = home.userId
        formattedBody.uuid = home.uuid;
        formattedBody.status = 'running'
        setStartLoading((prev) => ({ ...prev, [requestBody.deviceId]: true }));

        StoreDeviceConsumptionApi(formattedBody)
            .then((res) => {
                const updatedHome = { ...home };
                updatedHome.rooms = updatedHome.rooms.map((room) => ({
                    ...room,
                    devices: room.devices.map((device) =>
                        device.deviceId === requestBody.deviceId
                            ? {
                                ...device,
                                status: "running",
                                sessionId: res.consumptionData.sessionId,
                                startTime: res.consumptionData.startTime,
                            }
                            : device
                    ),
                }));

                UpdateHomeApi(updatedHome)
                    .then(() => {
                        setHome(updatedHome);
                        setStartLoading((prev) => ({ ...prev, [requestBody.deviceId]: false }));
                        enqueueSnackbar("Device started successfully.", { variant: "success" });
                    })
                    .catch(() => {
                        setStartLoading((prev) => ({ ...prev, [requestBody.deviceId]: false }));
                        enqueueSnackbar("Unexpected error occurred. Please try again.", { variant: "error" });
                    });
            })
            .catch(() => {
                setStartLoading((prev) => ({ ...prev, [requestBody.deviceId]: false }));
                enqueueSnackbar("Failed to start device", { variant: "error" });
            });
    };


    const calculateTotalConsumption = (startTime, endTime, consumption) => {
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        console.log('test end time', endTime)
        console.log("test",startDate, endDate)

        // Calculate the difference in milliseconds
        const timeDifferenceInMilliseconds = endDate - startDate;

        // Convert milliseconds to hours
        const timeDifferenceInHours = timeDifferenceInMilliseconds / 3600000;

        // Calculate the total consumption
        const totalConsumption = timeDifferenceInHours * parseFloat(consumption);
        console.log(timeDifferenceInMilliseconds, timeDifferenceInHours, totalConsumption)

        // Set the total consumption and status
        return totalConsumption.toFixed(2); // Limiting to 2 decimal places

    }

    const stopDevice = (requestBody) => {
        setStopLoading((prev) => ({ ...prev, [requestBody.deviceId]: true }));
        let newBody = { ...requestBody }
        newBody.endTime = new Date().toISOString();
        newBody.totalConsumption = calculateTotalConsumption(requestBody.startTime, newBody.endTime, requestBody.consumption);
        newBody.status = "stopped";

        UpdateDeviceConsumptionApi(newBody)
            .then((res) => {
                const updatedHome = { ...home };
                updatedHome.rooms = updatedHome.rooms.map((room) => ({
                    ...room,
                    devices: room.devices.map((device) =>
                        device.deviceId === requestBody.deviceId
                            ? { ...device, status: "stopped" }
                            : device
                    ),
                }));

                UpdateHomeApi(updatedHome)
                    .then(() => {
                        setHome(updatedHome);
                        setStopLoading((prev) => ({ ...prev, [requestBody.deviceId]: false }));
                        enqueueSnackbar("Device stopped successfully.", { variant: "success" });
                    })
                    .catch(() => {
                        setStopLoading((prev) => ({ ...prev, [requestBody.deviceId]: false }));
                        enqueueSnackbar("Unexpected error occurred. Please try again.", { variant: "error" });
                    });
            })
            .catch(() => {
                setStopLoading((prev) => ({ ...prev, [requestBody.deviceId]: false }));
                enqueueSnackbar("Failed to stop device", { variant: "error" });
            });
    };



    useEffect(() => {
        if (uuid) {
            GetHomeApi(user.Username, uuid)
                .then((res) => {
                    setHome(res.data[0]);
                    console.log(res.data[0]);
                })
                .catch((err) => {
                    enqueueSnackbar('Failed to fetch home data', { variant: 'error' });
                });
        }
    }, [user.Username, uuid]);

    return (
        <>
            {home === null ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Container maxWidth="xl" sx={{ mt: '2rem', mb: "2rem" }}>
                    <ViewHomeTopCard
                        home={home}
                        uuid={uuid}
                        toggledDevices={toggledDevices}
                    />
                    <Grid container spacing={3}>
                        {home.rooms.map((room) => (
                            <ViewHomeRoomCard
                                room={room}
                                startDevice={startDevice}
                                stopDevice={stopDevice}
                                startLoading={startLoading}
                                stopLoading={stopLoading}
                                toggleDevice={toggleDevice}
                                toggledDevices={toggledDevices}
                            />
                        ))}
                    </Grid>
                </Container>
            )}
        </>
    );
}

export default ViewHomePage;
