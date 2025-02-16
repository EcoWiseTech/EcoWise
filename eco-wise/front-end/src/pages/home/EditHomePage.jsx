import React, { useState } from 'react';
import {
    Box,
    Container,
    Grid,
    CircularProgress,
} from '@mui/material';
import * as Yup from 'yup';
import { useUserContext } from '../../contexts/UserContext';
import { useAlert } from '../../contexts/AlertContext';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { GetHomeApi } from '../../api/home/GetHomeApi';
import { useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import { UpdateHomeApi } from '../../api/home/UpdateHomeApi';
import { DeleteHomeApi } from '../../api/home/DeleteHomeApi';
import EditHomeTopCard from '../../components/home/EditHomeTopCard';
import EditHomeErrorAlert from '../../components/home/EditHomeErrorAlert';
import EditHomeRoomCard from '../../components/home/EditHomeRoomCard';
import EditHomeDeleteModal from '../../components/home/EditHomeDeleteModal';

const validationSchema = Yup.object({
    homeName: Yup.string().required('Home name is required'),
    rooms: Yup.array()
        .of(
            Yup.object({
                roomName: Yup.string().required('Room name is required'),
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

function EditHomePage() {
    const { user } = useUserContext();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [homeData, setHomeData] = useState(null);

    const [errors, setErrors] = useState([]);
    const [openError, setOpenError] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);

    const deviceModels = {
        AirCon: ['Samsung AC 1', 'LG AC 2', 'Custom'],
        Fan: ['Dyson Fan 1', 'Philips Fan 2', 'Custom'],
    };
    const { uuid } = useParams();

    useEffect(() => {
        if (uuid) {
            GetHomeApi(user.Username, uuid)
                .then((res) => {
                    setHomeData(res.data[0]);
                    console.log(res.data[0]);
                })
                .catch((err) => {
                    enqueueSnackbar('Failed to fetch home data', { variant: 'error' });
                });
        }
    }, [user.Username, uuid]);

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
                { roomName: '', devices: [{ type: '', model: '', consumption: '' }] },
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
                rooms: homeData.rooms.filter((room) => room.roomName.trim() !== ''),
            };

            await UpdateHomeApi(filteredData);
            showAlert('success', 'Home Has been Updated');
            navigate('/dashboard');
        } catch (err) {
            console.log('reached', err)
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

    const handleDeleteConfirm = () => {
        setDeleteLoading(true)
        const requestBody = {
            uuid: homeData.uuid,
            userId: homeData.userId
        }
        DeleteHomeApi(requestBody)
            .then((res) => {
                showAlert('success', 'Home has been successfully deleted')
                navigate('/dashboard')
            })
            .catch((err) => {
                showAlert('error', 'unexpected error occured, please try again')
                console.log(err)
            })
            .finally(() => {
                setDeleteLoading(false)
                setDeleteModal(false)
            })
    }

    return (
        <>
            {homeData === null ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Container maxWidth="xl" sx={{ mt: '2rem', mb: '2rem' }}>
                    {/* Display errors as collapsible alert */}
                    {errors.length > 0 && (
                        <EditHomeErrorAlert 
                        openError={openError}
                        setOpenError={setOpenError}
                        errors={errors}
                        />
                    )}

                    <EditHomeTopCard
                        homeData={homeData}
                        handleInputChange={handleInputChange}
                        setDeleteModal={setDeleteModal}
                        addRoom={addRoom}
                    />

                    <Grid container spacing={3}>
                        {homeData.rooms.map((room, roomIndex) => (
                            <EditHomeRoomCard 
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
                        Edit Home
                    </LoadingButton>
                    <EditHomeDeleteModal
                        deleteModal={deleteModal}
                        setDeleteModal={setDeleteModal}
                        deleteLoading={deleteLoading}
                        homeData={homeData}
                        handleDeleteConfirm={handleDeleteConfirm}
                    />
                </Container>
            )}
        </>

    );
}

export default EditHomePage;
