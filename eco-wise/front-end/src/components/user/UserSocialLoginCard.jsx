import { Box, Button, Card, Alert, CardContent, Divider, Grid, Typography, Grid2 } from '@mui/material'
import React, { useEffect } from 'react'
import CardTitle from '../../components/common/CardTitle'
import AddLinkIcon from '@mui/icons-material/AddLink';
import { GoogleLogin } from '@react-oauth/google';
import { useUserContext } from '../../contexts/UserContext';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useAlert } from '../../contexts/AlertContext';
import LoadingButton from '@mui/lab/LoadingButton';
import FacebookLinkButton from '../login/FacebookLinkButton';

function UserSocialLoginCard(props) {
    const {
        unlinkGoogle,
        linkGoogle,
        unlinkFacebook,
        linkFacebook,
        facebookLoading,
        googleLoading,
    } = props;
    const { user } = useUserContext()
    const { showAlert } = useAlert()

    // Conditional render logic
    const shouldRender = (provider) => {
        const identities = user.UserAttributes.identities;

        if (!identities) {
            return false; // If identities attribute doesn't exist, return false
        }

        try {
            const parsedIdentities = JSON.parse(identities); // Parse the identities JSON string
            return parsedIdentities.some(identity => identity.providerType === provider);
        } catch (error) {
            console.error("Failed to parse identities:", error);
            return false; // Handle invalid JSON gracefully
        }
    };


    return (
        <Card>
            <CardContent>
                <CardTitle icon={<AddLinkIcon />} title="Link Social Logins" />
                <Box marginTop={"0.5rem"}>
                    <Typography variant="body">
                        Linking your social logins allows you to log in to your account using your Google or Facebook account.
                    </Typography>
                </Box>
                <Grid container marginTop={"1rem"} alignItems={"center"}>
                    <Grid item xs={12} sm marginBottom={["1rem", 0]}>

                        <Box
                            component="form"
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "8px",
                                margin: "0 auto",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {shouldRender("Google") ?
                                <Box sx={{ width: "100%" }}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid xs={2} md={2} lg={1} item>
                                            <Box display={"flex"}>
                                                <img src="/images/googleLogo.png" alt="G" style={{ width: "30px" }} />
                                            </Box>
                                        </Grid>
                                        <Grid xs={7} md={6} lg={6} item>
                                            <Alert severity="success" sx={{ width: '100%' }}>
                                                Linked!
                                            </Alert>
                                        </Grid>
                                        <Grid xs={3} md={4} lg={5} item>
                                            <Box display={"flex"} justifyContent="right">
                                                <LoadingButton loading={googleLoading} onClick={unlinkGoogle} variant='contained' color='info' >
                                                    Unlink
                                                </LoadingButton>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                                :
                                <Box sx={{ width: "100%" }}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid xs={2} md={2} lg={1} item>
                                            <Box display={"flex"}>
                                                <img src="/images/googleLogo.png" alt="G" style={{ width: "30px" }} />
                                            </Box>
                                        </Grid>
                                        <Grid xs={10} md={10} lg={5} item>
                                            <Alert severity="warning" sx={{ width: '100%' }}>
                                                Not Linked!
                                            </Alert>
                                        </Grid>
                                        <Grid xs={12} md={12} lg={6} item>
                                            <Box display={"flex"} justifyContent="right">
                                                <GoogleLogin
                                                    onSuccess={(response) => linkGoogle(response.credential)}
                                                    onFailure={(error) => showAlert('error', 'An unexpected error occured when getting your google account data. Please try again')}
                                                    theme='outline'
                                                    text='continue_with'
                                                    size='medium'
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            }
                        </Box>
                    </Grid>
                    <Divider orientation="vertical" sx={{ marginX: "1rem" }} flexItem />
                    <Grid item xs={12} sm marginBottom={["1rem", 0]}>
                        <Box
                            component="form"
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "8px",
                                margin: "0 auto",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {shouldRender("Facebook") ?
                                <Box sx={{ width: "100%" }}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid xs={2} md={2} lg={1} item>
                                            <Box display={"flex"}>
                                                <FacebookIcon sx={{ fontSize: '36px', color: '#4285F4' }} />
                                            </Box>
                                        </Grid>
                                        <Grid xs={7} md={6} lg={6} item>
                                            <Alert severity="success" sx={{ width: '100%' }}>
                                                Linked!
                                            </Alert>
                                        </Grid>
                                        <Grid xs={3} md={4} lg={5} item>
                                            <Box display={"flex"} justifyContent="right">

                                                <LoadingButton loading={facebookLoading} onClick={unlinkFacebook} variant='contained' color='info' >
                                                    Unlink
                                                </LoadingButton>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                                :
                                <Box sx={{ width: "100%" }}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid xs={2} md={2} lg={1} item>
                                            <Box display={"flex"}>
                                                <FacebookIcon sx={{ fontSize: '36px', color: '#4285F4' }} />
                                            </Box>
                                        </Grid>
                                        <Grid xs={10} md={10} lg={5} item>
                                            <Alert severity="warning" sx={{ width: '100%' }}>
                                                Not Linked!
                                            </Alert>
                                        </Grid>
                                        <Grid xs={12} md={12} lg={6} item>
                                            <Box display={"flex"} justifyContent="right">
                                                <FacebookLinkButton
                                                    onSuccess={(response) => linkFacebook(response)}
                                                />
                                            </Box>

                                        </Grid>
                                    </Grid>
                                </Box>

                            }
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default UserSocialLoginCard