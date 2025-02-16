import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from "@mui/material"
import LoadingButton from '@mui/lab/LoadingButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

function ResendVerificationEmailDialog(props) {
    const {
        resendDialog,
        handleResendDialogClose,
        resendFormik,
        resendLoading
    } = props

    return (
        <Dialog open={resendDialog} onClose={handleResendDialogClose}>
            <DialogTitle>Resend Verification E-mail</DialogTitle>
            <Box component="form" onSubmit={resendFormik.handleSubmit}>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        To resend your verification e-mail, please enter your e-mail address below. We will send you a link to verify your account.
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
                        value={resendFormik.values.email}
                        onChange={resendFormik.handleChange}
                        error={resendFormik.touched.email && Boolean(resendFormik.errors.email)}
                        helperText={resendFormik.touched.email && resendFormik.errors.email}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleResendDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={resendLoading} variant="text" color="primary" startIcon={<RefreshIcon />}>Resend E-mail</LoadingButton>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

export default ResendVerificationEmailDialog