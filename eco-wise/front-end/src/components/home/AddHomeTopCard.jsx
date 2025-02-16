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


function AddHomeTopCard(props) {

    const {
        addRoom,
        homeData,
        handleInputChange
    } = props;

    const navigate = useNavigate()

    return (
        <Card sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <Button variant="contained" startIcon={<AddIcon />} onClick={addRoom} sx={{ ml: 2 }}>
                Add Room
            </Button>
        </Card>
    )
}

export default AddHomeTopCard