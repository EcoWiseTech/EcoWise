import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    Button,
    Divider,
    Alert,
    useMediaQuery,
    IconButton,
    InputAdornment,
} from '@mui/material';
import PasswordIcon from '@mui/icons-material/Password';
import * as yup from 'yup';
import CardTitle from '../common/CardTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import { useTheme } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useUserContext } from '../../contexts/UserContext';

function UserPasswordCard(props) {
    const {
        changePassword,
        forgetPassword,
        loading
    } = props;
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [passwordVisiblity, setPasswordVisibility] = useState(false);
    const [confirmPasswordVisiblity, setConfirmPasswordVisibility] = useState(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // Check if the screen size is small
    const { user } = useUserContext()

    // Yup schema for validation
    const validationSchema = yup.object().shape({
        currentPassword: yup.string().required('Current password is required'),
        newPassword: yup
            .string()
            .required('New password is required')
            .min(8, 'Password must be at least 8 characters')
            .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
            .matches(/[0-9]/, 'Password must contain at least one number')
            .matches(/[!@#$%^&*]/, 'Password must contain at least one special character'),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
            .required('Confirm password is required'),
    });

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate the form data
            await validationSchema.validate(formData, { abortEarly: false });
            setErrors({});
            changePassword(formData.currentPassword, formData.newPassword)
        } catch (validationErrors) {
            const errorMessages = {};
            validationErrors.inner.forEach((error) => {
                errorMessages[error.path] = error.message;
            });
            setErrors(errorMessages);
        }
    };

    // Handle forgot password
    const handleForgotPassword = () => {
        console.log('Forgot Password button clicked');
    };

    return (
        <Card>
            <CardContent>
                <CardTitle icon={<PasswordIcon />} title="Password settings" />
                <Box marginTop="0.5rem">
                    <Typography variant="body">
                        Want to change your password? Change your password settings here.
                    </Typography>
                </Box>
                <Box component="form" onSubmit={handleSubmit} marginTop="1rem">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={10} md={7}>
                            <TextField
                                fullWidth
                                label="Current password"
                                name="currentPassword"
                                type="password"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                error={!!errors.currentPassword}
                                helperText={errors.currentPassword}
                            />
                            <TextField
                                sx={{ marginTop: '1rem' }}
                                key="password"
                                fullWidth
                                label="New password"
                                name="newPassword"
                                type={passwordVisiblity ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={handleChange}
                                error={!!errors.newPassword}
                                helperText={errors.newPassword}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setPasswordVisibility(!passwordVisiblity)}
                                                edge="end"
                                            >
                                                {!passwordVisiblity ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>

                                }}
                            />
                            <TextField
                                sx={{ marginTop: '1rem' }}
                                fullWidth
                                label="Confirm password"
                                name="confirmPassword"
                                type={confirmPasswordVisiblity ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setConfirmPasswordVisibility(!confirmPasswordVisiblity)}
                                                edge="end"
                                            >
                                                {!confirmPasswordVisiblity ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>

                                }}
                            />
                            <LoadingButton
                                loading={loading.changePasswordLoading}
                                sx={{ marginTop: '1rem' }}
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                Change Password
                            </LoadingButton>
                        </Grid>
                        {!isSmallScreen && (
                            <Divider orientation="vertical" sx={{ marginX: '1rem' }} flexItem />
                        )}
                        <Grid item xs={12} sm={10} md={4}>
                            <Alert severity="info">Forgot password?</Alert>
                            <Typography sx={{ marginTop: '1rem' }} variant="body2">
                                Click the button and we will send you an email with a password reset
                                link. Click the link to reset your password.
                            </Typography>
                            <LoadingButton loading={loading.forgotPasswordLoading} onClick={forgetPassword} variant="contained" sx={{ marginTop: '3rem' }}>
                                Reset Password
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
}

export default UserPasswordCard;
