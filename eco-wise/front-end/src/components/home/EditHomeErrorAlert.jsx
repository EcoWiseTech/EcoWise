import { Alert, Box, Collapse, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import React from 'react'

function EditHomeErrorAlert(props) {

    const {
        setOpenError,
        openError,
        errors
    } = props

    return (
        <Collapse in={openError}>
            <Alert
                sx={{ mb: 1 }}
                severity="error"
                action={
                    <IconButton
                        color="inherit"
                        size="small"
                        onClick={() => setOpenError(!openError)}
                    >
                        <CloseIcon />
                    </IconButton>
                }
            >
                <Box sx={{ whiteSpace: 'pre-line' }}>{errors.join(', ')}</Box>
            </Alert>
        </Collapse>
    )
}

export default EditHomeErrorAlert