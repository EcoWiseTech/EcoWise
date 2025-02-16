import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from "@mui/material"
import LoadingButton from '@mui/lab/LoadingButton';
import LockResetIcon from '@mui/icons-material/LockReset';
import CloseIcon from '@mui/icons-material/Close';


function ResetPasswordDialog(props) {
    const {
        resetPasswordDialog,
        handleResetPasswordDialogClose,
        resetFormik,
        resetLoading
    } = props

    return (
        <Dialog open={resetPasswordDialog} onClose={handleResetPasswordDialogClose}>
            <DialogTitle>Forgot Password</DialogTitle>
            <Box component="form" onSubmit={resetFormik.handleSubmit}>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        To reset your password, please enter your e-mail address below. We will send you a link to reset your password.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="E-mail Address"
                        type="email"
                        name="email"
                        fullWidth
                        variant="standard"
                        value={resetFormik.values.email}
                        onChange={resetFormik.handleChange}
                        error={resetFormik.touched.email && Boolean(resetFormik.errors.email)}
                        helperText={resetFormik.touched.email && resetFormik.errors.email}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleResetPasswordDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={resetLoading} variant="text" color="primary" startIcon={<LockResetIcon />}>Reset</LoadingButton>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

export default ResetPasswordDialog