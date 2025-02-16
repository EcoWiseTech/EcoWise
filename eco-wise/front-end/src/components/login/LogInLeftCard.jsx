import { Box, Button, Container, Card, CardContent, CardActions, Stack, Typography, TextField, Divider, InputAdornment } from "@mui/material"
import LoadingButton from '@mui/lab/LoadingButton';
import LoginIcon from '@mui/icons-material/Login';
import AddIcon from '@mui/icons-material/Add';
import HelpIcon from '@mui/icons-material/Help';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from "react-router-dom";
import CardTitle from "../../components/common/CardTitle";
import SmallCardTitle from "../../components/common/SmallCardTitle";
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAlert } from "../../contexts/AlertContext";
import GoogleSSOButton from "./GoogleSSOButton";
import { useState } from "react";
import FacebookSSOButton from "./FacebookSSOButton";

function LogInLeftCard(props) {
    const {
        formik,
        togglePasswordVisibility,
        showPassword,
        mfaCode,
        setMfaCode,
        errorMessage,
        loading,
        handleResetPasswordDialog,
        isMfaRequired,
        open,
        setOpen
    } = props
    const { showAlert } = useAlert()

    const [googleLoading, setGoogleLoading] = useState(false)
    const [facebookLoading, setFacebookLoading] = useState(false);

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        // Construct the URL using environment variables
        const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
        const redirectUri = encodeURIComponent(process.env.REACT_APP_REDIRECT_URI);
        const cognitoDomain = process.env.REACT_APP_COGNITO_OAUTH_DOMAIN;
        const identityProvider = "Google";
        const responseType = "token";
        const prompt = "select_account";

        // Generate the URL
        const oauthUrl = `${cognitoDomain}/oauth2/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&identity_provider=${identityProvider}&prompt=${prompt}`;

        // Redirect to the constructed URL
        window.location.href = oauthUrl;
    };

    const handleFacebookLogin = () => {
        setFacebookLoading(true)
        // Construct the URL using environment variables
        const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
        const redirectUri = encodeURIComponent(process.env.REACT_APP_REDIRECT_URI);
        const cognitoDomain = process.env.REACT_APP_COGNITO_OAUTH_DOMAIN;
        const identityProvider = "Facebook";
        const responseType = "token";
        const prompt = "select_account";

        // Generate the URL
        const oauthUrl = `${cognitoDomain}/oauth2/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&identity_provider=${identityProvider}&prompt=${prompt}`;

        // Redirect to the constructed URL
        window.location.href = oauthUrl;
    };


    return (
        <Card sx={{ margin: "auto" }}>

            <Box component="form" onSubmit={formik.handleSubmit}>
                <CardContent>
                    <CardTitle title="Login to EcoWise" icon={<LoginIcon color="text.secondary" />} />
                    <Stack spacing={2} sx={{ marginTop: 2 }}>
                        <TextField
                            type="email"
                            fullWidth
                            label="E-mail Address"
                            variant="outlined"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                        }}>
                            <TextField
                                type={showPassword ? 'text' : 'password'}
                                fullWidth
                                label="Password"
                                variant="outlined"
                                name="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={togglePasswordVisibility}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                        {isMfaRequired && (
                            <Box mb={2}>
                                <TextField
                                    type="number"
                                    label="MFA Code"
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <VpnKeyIcon color="primary" sx={{ marginRight: 1 }} />
                                        ),
                                    }}
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                    required
                                />
                            </Box>
                        )}
                        <Collapse in={open}>
                            <Alert
                                severity="error"
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                            setOpen(false);
                                        }}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                }
                            >
                                {errorMessage}
                            </Alert>
                        </Collapse>
                    </Stack>
                </CardContent>
                <CardActions>
                    <LoadingButton type="submit" loadingPosition="start" loading={loading} size="small" variant="contained" color="primary" startIcon={<LoginIcon />}>Login</LoadingButton>
                    <Button size="small" variant="contained" color="primary" href="/" startIcon={<AddIcon />} LinkComponent={Link} to="/register">Register</Button>
                </CardActions>
            </Box>
            <Divider />
            <CardContent>
                <Stack spacing={1}>
                    <GoogleSSOButton
                        onClick={handleGoogleLogin}
                        loading={googleLoading}
                    />
                    <FacebookSSOButton
                        onClick={handleFacebookLogin}
                        loading={facebookLoading}
                    />
                </Stack>
            </CardContent>
            <Divider />
            <CardContent>
                <SmallCardTitle title="Trouble Logging In?" icon={<HelpIcon color="text.secondary" sx={{ fontSize: '1.3rem' }} />} />
                <Typography variant="body2" sx={{ marginTop: 1, fontSize: '0.8rem' }}>
                    If you have forgotten your password, you can reset it by clicking the button below.
                </Typography>
                <Button sx={{ marginTop: 1, fontSize: "0.8rem" }} variant="outlined" color="primary" onClick={handleResetPasswordDialog}>Reset Password</Button>
            </CardContent>
        </Card>
    )
}

export default LogInLeftCard