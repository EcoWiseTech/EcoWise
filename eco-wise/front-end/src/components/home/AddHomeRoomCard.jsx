import React from 'react';
import {
    Box,
    TextField,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Divider,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RoomIcon from '@mui/icons-material/MeetingRoom';
import DevicesIcon from '@mui/icons-material/Devices';
import CardTitle from '../../components/common/CardTitle';

function AddHomeRoomCard(props) {
    const {
        handleRoomChange,
        handleDeviceChange,
        room,
        addDevice,
        removeDevice,
        removeRoom,
        roomIndex,
        deviceModels
    } = props
    return (
        <Grid item xs={12} md={6} key={roomIndex}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TextField
                            label="Room Name"
                            variant="outlined"
                            fullWidth
                            value={room.name}
                            onChange={(e) =>
                                handleRoomChange(roomIndex, 'name', e.target.value)
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <RoomIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <IconButton color="error" onClick={() => removeRoom(roomIndex)} sx={{ ml: 2 }}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                    <Divider />
                    {room.devices.map((device, deviceIndex) => (
                        <>
                            <Card sx={{ mt: 2, padding: 1.5, boxShadow: 2, }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={11}>
                                        <CardTitle
                                            title='Device Settings'
                                            icon={<DevicesIcon sx={{ color: "gray" }} />}
                                        />
                                    </Grid>
                                    <Grid item xs={1} >
                                        <IconButton
                                            color="error"
                                            onClick={() => removeDevice(roomIndex, deviceIndex)}
                                            sx={{
                                                zIndex: 1, // Ensures delete icon is above other elements
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Device Type</InputLabel>
                                            <Select
                                                label='Device Type'
                                                value={device.type}
                                                onChange={(e) =>
                                                    handleDeviceChange(
                                                        roomIndex,
                                                        deviceIndex,
                                                        'type',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <MenuItem value="AirCon">Air Con</MenuItem>
                                                <MenuItem value="Fan">Fan</MenuItem>
                                            </Select>
                                        </FormControl>
                                        {device.type && (
                                            <FormControl fullWidth sx={{ mb: 2 }}>
                                                <InputLabel>Device Model</InputLabel>
                                                <Select
                                                    label="Device Model"
                                                    value={device.model}
                                                    onChange={(e) =>
                                                        handleDeviceChange(
                                                            roomIndex,
                                                            deviceIndex,
                                                            'model',
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    {deviceModels[device.type].map((model) => (
                                                        <MenuItem key={model} value={model}>
                                                            {model}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                        {device.model === 'Custom' && (
                                            <TextField
                                                label="Custom Model Name"
                                                variant="outlined"
                                                fullWidth
                                                value={device.customModel || ''}  // Use a different state variable to store the custom model
                                                onChange={(e) =>
                                                    handleDeviceChange(
                                                        roomIndex,
                                                        deviceIndex,
                                                        'customModel',  // Update customModel field
                                                        e.target.value
                                                    )
                                                }
                                                sx={{ mb: 2 }}
                                            />
                                        )}
                                        {device.type && device.model && (
                                            <TextField
                                                label="Device Consumption (e.g., 100kWh)"
                                                variant="outlined"
                                                fullWidth
                                                value={device.consumption}
                                                onChange={(e) =>
                                                    handleDeviceChange(
                                                        roomIndex,
                                                        deviceIndex,
                                                        'consumption',
                                                        e.target.value
                                                    )
                                                }
                                                sx={{ mb: 2 }}
                                            />
                                        )}
                                    </Grid>
                                </Grid>

                            </Card>
                        </>
                    ))}

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => addDevice(roomIndex)}
                        sx={{ mt: 2 }}
                    >
                        Add Device
                    </Button>
                </CardContent>
            </Card>
        </Grid>
    )
}

export default AddHomeRoomCard