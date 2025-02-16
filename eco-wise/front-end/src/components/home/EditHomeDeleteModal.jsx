import React from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    DialogActions,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

function EditHomeDeleteModal(props) {

    const {
        homeData,
        deleteLoading,
        setDeleteModal,
        handleDeleteConfirm,
        deleteModal
    } = props;

    return (
        <Dialog open={deleteModal} onClose={() => setDeleteModal(false)}>
            <DialogTitle>Delete Home: {homeData.homeName}</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete {homeData.homeName}? All your rooms and devices will be deleted. This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setDeleteModal(false)} color="primary">
                    Cancel
                </Button>
                <LoadingButton loading={deleteLoading} onClick={handleDeleteConfirm} color="error" variant="contained">
                    Confirm
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}

export default EditHomeDeleteModal