import { LoadingButton } from '@mui/lab'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'
import KeyOffIcon from '@mui/icons-material/KeyOff';
import CloseIcon from '@mui/icons-material/Close';

function DisableMFAModal(props) {
    const {
        showModal,
        setShowModal,
        disable2FA,
        loading
    } = props;
    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
            <DialogTitle>Disable 2FA</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to disable 2FA? Your account will be less secure.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShowModal(false)} startIcon={<CloseIcon />}>Cancel</Button>
                <LoadingButton variant='contained' loading={loading} loadingPosition='start' onClick={disable2FA} color="error" startIcon={<KeyOffIcon />}>Disable</LoadingButton>
            </DialogActions>
        </Dialog>
    )
}

export default DisableMFAModal