import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';
import { TextField, Box } from '@mui/material';
import PinIcon from '@mui/icons-material/Pin';
import PhoneIcon from '@mui/icons-material/Phone';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function VerifyPhoneNumberDialogModal(props) {
    const {
        open,
        setOpen,
        phoneNumber,
        onSendCode,
        onVerify,
        loadingSendCode,
        loadingVerify,
        verificationCode,
        setVerificationCode
    } = props;



    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ marginRight: 1 }} /> Verify Phone Number
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={(theme) => ({
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500],
                        })}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom>
                        We will send a verification code to your number: {phoneNumber}
                    </Typography>
                    <Typography marginTop={"1rem"} marginBottom={"1rem"} variant='body2' gutterBottom>
                        Enter your code below.
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <TextField
                            sx={{ width: "60%" }}
                            id="verification-code"
                            label="Code"
                            variant="standard"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <LoadingButton
                            sx={{ marginTop: "0.7rem", marginLeft: "1rem" }}
                            loading={loadingSendCode}
                            variant="outlined"
                            onClick={onSendCode}
                        >
                            Send Code
                        </LoadingButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        variant='contained'
                        onClick={() => onVerify(verificationCode)}
                        startIcon={<PinIcon />}
                        loading={loadingVerify}
                    >
                        Verify
                    </LoadingButton>
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}

export default VerifyPhoneNumberDialogModal;
