import { LoadingButton } from '@mui/lab'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';

function EnableMFAModal(props) {
    const {
        showModal,
        setShowModal,
        enable2FA,
        loading
    } = props;
    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
            <DialogTitle>Enable 2FA</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to enable 2FA? You can disable this option later.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShowModal(false)} startIcon={<CloseIcon />}>Cancel</Button>
                <LoadingButton variant='contained' loading={loading} loadingPosition='start' onClick={enable2FA} color="success" startIcon={<LockIcon />}>Enable</LoadingButton>
            </DialogActions>
        </Dialog>
    )
}

export default EnableMFAModal