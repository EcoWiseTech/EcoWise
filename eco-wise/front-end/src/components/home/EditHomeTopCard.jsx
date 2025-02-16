import React from 'react';
import {
    Box,
    TextField,
    Button,
    Card,
    InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';


function EditHomeTopCard(props) {

    const {
        addRoom,
        setDeleteModal,
        homeData,
        handleInputChange
    } = props;

    const navigate = useNavigate()

    return (
        <Card sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button onClick={() => navigate(-1)} >
                <ArrowBackSharpIcon />
            </Button>
            <TextField
                sx={{ width: '60%' }}
                label="Home Name"
                variant="outlined"
                name="homeName"
                value={homeData.homeName}
                onChange={handleInputChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <HomeIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={addRoom} sx={{ ml: 2 }}>
                    Add Room
                </Button>
                <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteModal(true)} sx={{ ml: 2 }}>
                    Delete Home
                </Button>
            </Box>
        </Card>
    )
}

export default EditHomeTopCard