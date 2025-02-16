import { Box, IconButton, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from 'react'
import { useNavigate } from 'react-router-dom';

function LargeCardTitle(props) {
    const navigate = useNavigate()
    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 2 }}>
                <Typography variant="h4">
                    {props.back && <>
                        <IconButton onClick={() => { navigate(props.back) }}><ArrowBackIcon color='primary' /></IconButton>
                    </>}
                    {props.icon}
                    {props.title}
                </Typography>
                {props.button}
            </Box>
        </>
    )
}

export default LargeCardTitle