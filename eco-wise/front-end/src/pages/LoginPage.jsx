import { Container, Grid } from "@mui/material"
import { useEffect, useState, useContext } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import SignInApi from "../api/auth/SignInApi";
import ResendAuthCodeApi from "../api/auth/ResendAuthCodeApi";
import GetCurrentUserApi from "../api/auth/GetCurrentUserApi";
import SendPasswordResetApi from "../api/auth/SendPasswordResetApi";
import { useUserContext } from "../contexts/UserContext";
import { useAlert } from "../contexts/AlertContext";
import ResendVerificationEmailDialog from "../components/login/ResendVerificationEmailDialog";
import ResetPasswordDialog from "../components/login/ResetPasswordDialog";
import LogInRightCard from "../components/login/LogInRightCard";
import LogInLeftCard from "../components/login/LogInLeftCard";
import { useLocation } from "react-router-dom"; // Import useLocation

function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
    const [resendDialog, setResendDialog] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [session, setSession] = useState(null);
    const [isMfaRequired, setIsMfaRequired] = useState(false);

    const { UserLogIn } = useUserContext();
    const { showAlert } = useAlert();
    const location = useLocation(); // Access the current URL location
    
    useEffect(() => {
        const hash = window.location.hash.substring(1); // Remove the #
        const params = new URLSearchParams(hash);
        const idToken = params.get("id_token");
        const accessToken = params.get("access_token");

        // Store tokens securely
        if (idToken && accessToken) {
            localStorage.setItem("id_token", idToken);
            localStorage.setItem("access_token", accessToken);
            GetCurrentUserApi(accessToken)
                .then((user) => {
                    console.log('User data fetched:', user);
                    UserLogIn(user, accessToken, idToken, null); // Handle successful login
                    showAlert('success', 'Log in successful');
                    navigate('/'); // Redirect to home page
                })
                .catch((error) => {
                    console.error('Error when fetching user data:', error);
                    enqueueSnackbar('Failed to fetch user data. Please log in again.', { variant: 'error' });
                });
        }

        // Clear hash to prevent duplicate parsing
        window.history.replaceState(null, null, " ");
    }, []);
    const togglePasswordVisibility = () => {
        console.log('test')
        setShowPassword(!showPassword);
    };

    const handleResetPasswordDialog = () => {
        setResetPasswordDialog(true);
    }

    const handleResetPasswordDialogClose = () => {
        setResetPasswordDialog(false);
    }

    const handleResendDialog = () => {
        setResendDialog(true);
    }

    const handleResendDialogClose = () => {
        setResendDialog(false);
    }

    const googleAuth = null;

    const handleSignIn = (email, password) => {
        setLoading(true);
        console.log("email", email)
        SignInApi(email, password, isMfaRequired ? mfaCode : null, session)
            .then((response) => {
                if (response.challengeName === 'SMS_MFA') {
                    // MFA challenge triggered
                    setSession(response.session);
                    setIsMfaRequired(true);
                    showAlert('info', 'MFA required. Please enter the code sent to your phone.');
                } else {
                    // Successfully signed in
                    const { accessToken, idToken, refreshToken } = response;

                    // Fetch user details
                    GetCurrentUserApi(accessToken)
                        .then((user) => {
                            console.log('User data fetched:', user);
                            UserLogIn(user, accessToken, idToken, refreshToken); // Handle successful login
                            showAlert('success', 'Log in successful');
                            navigate('/'); // Redirect to home page
                        })
                        .catch((error) => {
                            console.error('Error when fetching user data:', error);
                            enqueueSnackbar('Failed to fetch user data. Please log in again.', { variant: 'error' });
                        });
                }
            })
            .catch((error) => {
                console.error('Error during sign-in:', error);
                if (error.name === 'NotAuthorizedException') {
                    if (error.message == "Invalid session for the user, session is expired.") {
                        showAlert('error', 'MFA code has expired, please try again.')
                        setIsMfaRequired(false);
                        setMfaCode("");
                        setSession("");
                    }
                    setErrorMessage('Incorrect username, password.');
                } else if (error.name === 'UserNotFoundException') {
                    setErrorMessage('User does not exist.');
                } else if (error.name === 'UserNotConfirmedException') {
                    setErrorMessage('User account has not been confirmed. Please check your email.');
                } else if (error.name === 'CodeMismatchException') {
                    setErrorMessage('Invalid MFA code. Please try again.');
                } else {
                    setErrorMessage('An error occurred during sign-in. Please try again later.');
                }
                setOpen(true);
            })
            .finally(() => setLoading(false));
    };

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Required"),
            password: Yup.string().required("Password is required"),
        }),
        onSubmit: (data) => {
            setLoading(true);
            data.email = data.email.trim();
            data.password = data.password.trim();

            handleSignIn(data.email, data.password);
        }

    })

    const resetFormik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Required"),
        }),
        onSubmit: (data) => {
            setResetLoading(true);
            SendPasswordResetApi(data.email)
                .then((res) => {
                    console.log('success', res)
                    showAlert('success', 'Reset password e-mail sent!')
                    setResetPasswordDialog(false);
                    setResetLoading(false)
                })
                .catch((error) => {
                    console.error('Error during password reset:', error);
                    enqueueSnackbar("Reset password e-mail failed! ", { variant: "error" });
                    setResetLoading(false)
                });
        }
    })

    const resendFormik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Required"),
        }),
        onSubmit: (data) => {
            setResendLoading(true);
            data.email = data.email.trim();
            data.email = data.email.trim();
            ResendAuthCodeApi(data.email)
                .then((res) => {
                    console.log('success', res)
                    showAlert('success', 'Verification e-mail sent!')
                    setResendDialog(false);
                    setResendLoading(false)
                })
                .catch((error) => {
                    console.error('Error during resend email:', error);
                    enqueueSnackbar("Verification e-mail failed! ", { variant: "error" });
                    setResendLoading(false)
                });
        }
    })

    return (
        <>
            <Container maxWidth="xl" sx={{ marginY: "1rem", marginTop: '2rem', }}>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} sm={6} md={5} lg={4}>
                        <LogInLeftCard
                            formik={formik}
                            togglePasswordVisibility={togglePasswordVisibility}
                            showPassword={showPassword}
                            mfaCode={mfaCode}
                            setMfaCode={setMfaCode}
                            errorMessage={errorMessage}
                            loading={loading}
                            handleResetPasswordDialog={handleResetPasswordDialog}
                            isMfaRequired={isMfaRequired}
                            open={open}
                            setOpen={setOpen}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={5} lg={4}>
                        <LogInRightCard
                            handleResendDialog={handleResendDialog}
                        />
                    </Grid>
                </Grid>
            </Container>
            <ResetPasswordDialog
                resetPasswordDialog={resetPasswordDialog}
                handleResetPasswordDialogClose={handleResetPasswordDialogClose}
                resetFormik={resetFormik}
                resetLoading={resetLoading}
            />
            <ResendVerificationEmailDialog
                resendDialog={resendDialog}
                handleResendDialogClose={handleResendDialogClose}
                resendFormik={resendFormik}
                resendLoading={resendLoading}
            />
        </>
    )
}

export default LoginPage