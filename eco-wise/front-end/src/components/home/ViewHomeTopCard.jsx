import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Divider, Typography } from '@mui/material';
import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp';
import DeviceConsumptionChart from './DeviceConsumptionChart';

function ViewHomeTopCard(props) {

    const { home, uuid, toggledDevices } = props
    const navigate = useNavigate()

    return (
        <Card sx={{ mb: '2rem', p: '1rem' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent:"space-between", alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button onClick={() => navigate(-1)} >
                                <ArrowBackSharpIcon />
                            </Button>
                            <HomeIcon sx={{ fontSize: '2rem', marginRight: '0.5rem' }} />
                            {home.homeName}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'gray', mt: '0.5rem' }}>
                            Created at: {new Date(home.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                    <Box>
                        <Button variant="contained" startIcon={<EditIcon />} color="primary" href='/' to={`/home/edit/${uuid}`} LinkComponent={Link}>
                            Edit
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ mt: "1rem", mb: "1rem" }} />
                <DeviceConsumptionChart toggledDevices={toggledDevices} />
            </CardContent>
        </Card>
    )
}

export default ViewHomeTopCard