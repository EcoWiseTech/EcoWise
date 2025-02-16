import React, { useState } from 'react';
import {
    Container,
    Grid,
} from '@mui/material';
import * as Yup from 'yup';
import { useUserContext } from '../../contexts/UserContext';
import { useAlert } from '../../contexts/AlertContext';
import { useNavigate } from 'react-router-dom';
import { StoreHomeApi } from '../../api/home/StoreHomeApi';
import { LoadingButton } from '@mui/lab';
import AddHomeErrorAlert from '../../components/home/AddHomeErrorAlert';
import AddHomeTopCard from '../../components/home/AddHomeTopCard';
import AddHomeRoomCard from '../../components/home/AddHomeRoomCard';

const validationSchema = Yup.object({
    homeName: Yup.string().required('Home name is required'),
    rooms: Yup.array()
        .of(
            Yup.object({
                name: Yup.string().required('Room name is required'),
                devices: Yup.array()
                    .of(
                        Yup.object({
                            type: Yup.string().required('Device type is required'),
                            model: Yup.string().required('Device model is required'),
                            consumption: Yup.string().required('Device consumption is required'),
                        })
                    )
            })
        )
});

function AddHomePage() {
    const { user } = useUserContext();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [homeData, setHomeData] = useState({
        homeName: '',
        rooms: [
            {
                name: '',
                devices: [],
            },
        ],
    });

    const [errors, setErrors] = useState([]);
    const [openError, setOpenError] = useState(true);

    const deviceModels = {
        AirCon: ['Samsung AC 1', 'LG AC 2', 'Custom'],
        Fan: ['Dyson Fan 1', 'Philips Fan 2', 'Custom'],
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setHomeData((prev) => ({ ...prev, [name]: value }));
        setErrors([]); // Clear general error message when input is changed
    };

    const handleRoomChange = (index, field, value) => {
        const updatedRooms = [...homeData.rooms];
        updatedRooms[index][field] = value;
        setHomeData((prev) => ({ ...prev, rooms: updatedRooms }));
        setErrors([]); // Clear general error message when room data is changed
    };

    const handleDeviceChange = (roomIndex, deviceIndex, field, value) => {
        const updatedRooms = [...homeData.rooms];
        if (field === 'model' && value !== 'Custom') {
            updatedRooms[roomIndex].devices[deviceIndex].customModel = '';  // Clear custom model when not "Custom"
        }
        updatedRooms[roomIndex].devices[deviceIndex][field] = value;
        setHomeData((prev) => ({ ...prev, rooms: updatedRooms }));
        setErrors([]); // Clear general error message when device data is changed
    };


    const addRoom = () => {
        setHomeData((prev) => ({
            ...prev,
            rooms: [
                ...prev.rooms,
                { name: '', devices: [{ type: '', model: '', consumption: '' }] },
            ],
        }));
    };

    const removeRoom = (index) => {
        const updatedRooms = homeData.rooms.filter((_, i) => i !== index);
        setHomeData((prev) => ({ ...prev, rooms: updatedRooms }));
    };

    const addDevice = (roomIndex) => {
        const updatedRooms = [...homeData.rooms];
        updatedRooms[roomIndex].devices.push({ type: '', model: '', consumption: '' });
        setHomeData((prev) => ({ ...prev, rooms: updatedRooms }));
    };

    const removeDevice = (roomIndex, deviceIndex) => {
        const updatedRooms = [...homeData.rooms];
        updatedRooms[roomIndex].devices = updatedRooms[roomIndex].devices.filter(
            (_, i) => i !== deviceIndex
        );
        setHomeData((prev) => ({ ...prev, rooms: updatedRooms }));
    };

    const handleSubmit = async () => {
        try {
            await validationSchema.validate(homeData, { abortEarly: false });
            setLoading(true);

            const filteredData = {
                ...homeData,
                userId: user.Username,
                rooms: homeData.rooms.filter((room) => room.name.trim() !== ''),
            };

            await StoreHomeApi(filteredData);
            showAlert('success', 'New home has been added.');
            navigate('/dashboard');
        } catch (err) {
            if (err.inner) {
                // Collect all error messages into a single string
                const allErrors = err.inner.map((validationError) => validationError.message);
                setErrors(allErrors); // Store the error messages
                setOpenError(true); // Ensure the alert is open
            } else {
                showAlert('error', 'Unexpected error occurred, please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: '2rem', mb: '2rem' }}>
            {/* Display errors as collapsible alert */}
            {errors.length > 0 && (
                <AddHomeErrorAlert
                    openError={openError}
                    setOpenError={setOpenError}
                    errors={errors}
                />
            )}

            <AddHomeTopCard
                homeData={homeData}
                handleInputChange={handleInputChange}
                addRoom={addRoom}
            />

            <Grid container spacing={3}>
                {homeData.rooms.map((room, roomIndex) => (
                    <AddHomeRoomCard
                        handleRoomChange={handleRoomChange}
                        handleDeviceChange={handleDeviceChange}
                        room={room}
                        addDevice={addDevice}
                        removeDevice={removeDevice}
                        removeRoom={removeRoom}
                        deviceModels={deviceModels}
                        roomIndex={roomIndex}
                    />
                ))}
            </Grid>

            <LoadingButton
                sx={{ marginTop: '1rem' }}
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                loading={loading}
            >
                Add Home
            </LoadingButton>
        </Container>
    );
}

export default AddHomePage;
