import { Box, Button, Card, CardContent, Divider, Grid, Typography } from '@mui/material'
import React, { useState } from 'react'
import CardTitle from '../../components/common/CardTitle'
import AddLinkIcon from '@mui/icons-material/AddLink';
import UserSocialLoginCard from '../../components/user/UserSocialLoginCard';
import UnlinkUserSSOApi from '../../api/auth/UnlinkUserSSOApi';
import { useUserContext } from '../../contexts/UserContext';
import { useAlert } from '../../contexts/AlertContext';
import { jwtDecode } from 'jwt-decode';
import LinkUserSSOApi from '../../api/auth/LinkUserSSOApi';
import UserPasswordCard from '../../components/user/UserPasswordCard';
import ChangePasswordApi from '../../api/auth/ChangePasswordApi';
import SendPasswordResetApi from '../../api/auth/SendPasswordResetApi';
import GetUserTypeFromUsername from '../../functions/GetUserTypeFromUsername';
import SSORootSocialLoginCard from '../../components/user/SSORootSocialLoginCard';
import SSORootPasswordCard from '../../components/user/SSORootPasswordCard';

function UserPasswordLoginPage() {

    const { user, RefreshUser, SessionRefreshError, refreshToken, accessToken } = useUserContext()
    const { showAlert } = useAlert()
    const [loading, setLoading] = useState({ googleLoading: false, facebookLoading: false, changePasswordLoading: false, forgetPasswordLoading: false })

    const getFederatedIdentitySub = (userAttributes, provider) => {
        if (!userAttributes || !userAttributes.identities) {
            return null;
        }
        // Parse the identities array
        const identities = JSON.parse(userAttributes.identities);

        const googleIdentity = identities.find(identity => identity.providerName === provider);

        if (googleIdentity) {
            return googleIdentity.userId;  // Return the Google 'sub' (user ID)
        }
        return null;
    };

    const unlinkGoogle = () => {
        setLoading((prev) => ({
            ...prev,
            googleLoading: true,
        }));

        const sub = getFederatedIdentitySub(user.UserAttributes, "Google")
        UnlinkUserSSOApi(sub, "Google")
            .then((res) => {
                RefreshUser();
                showAlert('success', 'Google Account has been unlinked')
                setLoading((prev) => ({
                    ...prev,
                    googleLoading: false,
                }));
            })
            .catch((error) => {
                showAlert('error', 'An unexpected error occured, please try again.')
                setLoading((prev) => ({
                    ...prev,
                    googleLoading: false,
                }));
            })
    }

    const linkGoogle = (credentials) => {
        const { sub } = jwtDecode(credentials)
        LinkUserSSOApi(sub, "Google")
            .then((res) => {
                RefreshUser();
                showAlert('success', 'Google Account has been linked')
            })
            .catch((error) => {
                if (error.name == "InvalidParameterException" && error.message.includes('SourceUser is already linked to DestinationUser')) {
                    return showAlert('warning', 'Google Account has already been linked to another account.')
                }
                if (error.name == "InvalidParameterException" && error.message.includes('Merging is not currently supported')) {
                    return showAlert('warning', 'Google Account already registered on EcoWise. Sign in with the google account and delete it first.')
                }
                showAlert('error', 'An unexpected error occured, please try again.')
            })
    }

    const linkFacebook = (credentials) => {
        LinkUserSSOApi(credentials.id, "Facebook")
            .then((res) => {
                RefreshUser();
                showAlert('success', 'Facebook Account has been linked')
                setLoading((prev) => ({
                    ...prev,
                    facebookLoading: false,
                }));
            })
            .catch((error) => {
                if (error.name == "InvalidParameterException" && error.message.includes('SourceUser is already linked to DestinationUser')) {
                    return showAlert('warning', 'Facebook Account has already been linked to another account.')
                }
                if (error.name == "InvalidParameterException" && error.message.includes('Merging is not currently supported')) {
                    return showAlert('warning', 'Facebook Account already registered on EcoWise. Sign in with the Facebook account and delete it first.')
                }
                showAlert('error', 'An unexpected error occured, please try again.')
            })
    }

    const unlinkFacebook = () => {
        setLoading((prev) => ({
            ...prev,
            facebookLoading: true,
        }));
        const sub = getFederatedIdentitySub(user.UserAttributes, "Facebook")
        UnlinkUserSSOApi(sub, "Facebook")
            .then((res) => {
                RefreshUser();
                showAlert('success', 'Facebook Account has been unlinked')
                setLoading((prev) => ({
                    ...prev,
                    facebookLoading: false,
                }));
            })
            .catch((error) => {
                showAlert('error', 'An unexpected error occured, please try again.')
                setLoading((prev) => ({
                    ...prev,
                    facebookLoading: false,
                }));
            })
    }

    const changePassword = (currentPassword, newPassword) => {
        setLoading((prev) => ({
            ...prev,
            changePasswordLoading: true,
        }));
        ChangePasswordApi(refreshToken, accessToken, currentPassword, newPassword)
            .then((res) => {
                RefreshUser();
                showAlert('success', "Password has been changed.")
                setLoading((prev) => ({
                    ...prev,
                    changePasswordLoading: false,
                }));
            })
            .catch((error) => {
                console.error("Error changing password:", error);
                if (error.name === 'NotAuthorizedException') {
                    if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
                        SessionRefreshError();
                    }
                } else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
                setLoading((prev) => ({
                    ...prev,
                    changePasswordLoading: false,
                }));
            })
    }

    const forgetPassword = () => {
        setLoading((prev) => ({
            ...prev,
            forgotPasswordLoading: true,
        }));
        SendPasswordResetApi(user.UserAttributes.email)
            .then((res) => {
                showAlert('success', 'Password Reset email has been sent. Check your email to reset your password.')
                setLoading((prev) => ({
                    ...prev,
                    forgotPasswordLoading: false,
                }));
            })
            .catch((error) => {
                console.error("error occured when sending password reset email:", error)
                showAlert('error', 'Password reset email not sent. Please try again.')
                setLoading((prev) => ({
                    ...prev,
                    forgotPasswordLoading: false,
                }));
            })
    }


    return (
        <>
            {
                GetUserTypeFromUsername(user.Username) === "Cognito" ? (
                    <UserSocialLoginCard
                        unlinkGoogle={unlinkGoogle}
                        linkGoogle={linkGoogle}
                        linkFacebook={linkFacebook}
                        unlinkFacebook={unlinkFacebook}
                        googleLoading={loading.googleLoading}
                        facebookLoading={loading.facebookLoading}
                    />
                ) : GetUserTypeFromUsername(user.Username) === "Google" ? (
                    <SSORootSocialLoginCard
                        provider="Google"
                    />
                ) : (
                    <SSORootSocialLoginCard
                        provider='Facebook'
                    />
                )
            }


            <Box sx={{ marginTop: "1.3rem" }} />
            {
                GetUserTypeFromUsername(user.Username) === "Cognito" ? (
                    <UserPasswordCard
                        changePassword={changePassword}
                        loading={loading}
                        forgetPassword={forgetPassword}
                    />
                ) : GetUserTypeFromUsername(user.Username) === "Google" ? (
                    <SSORootPasswordCard
                        provider="Google"
                    />
                ) : (
                    <SSORootPasswordCard
                        provider='Facebook'
                    />
                )
            }
        </>
    )
}

export default UserPasswordLoginPage