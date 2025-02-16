import { Delete, Logout } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GetCurrentUserApi from "../api/auth/GetCurrentUserApi"
import RefreshTokenApi from "../api/auth/RefreshTokenApi"
import { useAlert } from "./AlertContext";

const userContext = createContext(null);

export const UserProvider = (props) => {

    const { children } = props;
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [idTokoen, setIdToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const navigate = useNavigate();
    const { showAlert } = useAlert();

    useEffect(() => {
        const accessTokenCheck = localStorage.getItem('accessToken');
        const idTokenCheck = localStorage.getItem('idToken');
        const refreshTokenCheck = localStorage.getItem('refreshToken');
        const userStorage = localStorage.getItem('user');

        // set the use state variables
        if (userStorage && accessTokenCheck && idTokenCheck && refreshTokenCheck) {
            setAccessToken(accessTokenCheck);
            setIdToken(idTokenCheck);
            setRefreshToken(refreshTokenCheck);
            setUser(JSON.parse(userStorage)); // Correctly parse the stored user object
        }
        setIsReady(true);
    }, []);

    // Method to populate the context use state vairables
    const UserLogIn = (userObject, accessTokenInput, idTokenInput, refreshTokenInput) => {
        // Store tokens in localStorage or secure storage
        localStorage.setItem('accessToken', accessTokenInput);
        localStorage.setItem('idToken', idTokenInput);
        localStorage.setItem('refreshToken', refreshTokenInput);
        // Set tokens in state for easy access
        setAccessToken(accessTokenInput);
        setIdToken(idTokenInput);
        setRefreshToken(refreshTokenInput);

        let formattedUserObject = userObject;
        let formatedUserAttributes = formatUserObject(userObject);
        formattedUserObject.UserAttributes = formatedUserAttributes;

        localStorage.setItem('user', JSON.stringify(formattedUserObject));
        setUser(formattedUserObject)
    }

    const formatUserObject = (userObject) => {
        if (userObject == null) {
            return null;
        }
        let formatedUserAttributes = {};
        userObject.UserAttributes.forEach(attribute => {
            formatedUserAttributes[attribute.Name] = attribute.Value;
        });
        return formatedUserAttributes;
    }

    const DeleteUser = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        setAccessToken(null);
        setIdToken(null);
        setRefreshToken(null);
        setUser(null);
        showAlert('info', 'Your account has been deleted')
        navigate('/')
    }

    const UserLogOut = () => {
        navigate('/')
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        setAccessToken(null);
        setIdToken(null);
        setRefreshToken(null);
        setUser(null);

        showAlert('success', 'Log out successful')
    }

    const SessionRefreshError = async () => {
        await navigate('/login')
        UserLogOut();
        showAlert('warning', 'Your session has expired. Please log in again.')
    }

    const SetNewTokens = (inputAccessToken, inputIdToken) => {
        localStorage.setItem('accessToken', inputAccessToken);
        localStorage.setItem('idToken', inputIdToken);
        setAccessToken(inputAccessToken);
        setIdToken(inputIdToken);
        console.log('new tokens set')
    }

    const RefreshUser = async (retryCount = 0) => {
        const MAX_RETRIES = 2;

        // Fetch user data and store it in context 
        GetCurrentUserApi(localStorage.getItem('accessToken'))
            .then((res) => {
                let formattedUserObject = res;
                let formatedUserAttributes = formatUserObject(res);
                formattedUserObject.UserAttributes = formatedUserAttributes;

                localStorage.setItem('user', JSON.stringify(formattedUserObject));
                setUser(formattedUserObject)
                console.log('fetched new user data')
            })
            .catch((error) => {
                console.error('Error when fetching data:', error);
                if (error.name === 'NotAuthorizedException') {
                    console.warn('Access token is invalid or expired, attempting to refresh token...', error.message);
                    // refresh token is reused
                    // Get new access and ID tokens
                    if (retryCount < MAX_RETRIES) {
                        RefreshTokenApi(refreshToken)
                            .then((res) => {
                                console.log('resdata', res)
                                localStorage.setItem('accessToken', res.accessToken);
                                localStorage.setItem('idToken', res.idToken);
                                setAccessToken(res.accessToken);
                                setIdToken(res.idToken);
                                RefreshUser(retryCount = retryCount + 1);
                            })
                            .catch((error) => {
                                if (error.name === 'NotAuthorizedException') {
                                    if (error.message === 'Refresh Token has expired') {
                                        console.error('Refresh token is invalid or expired. Please log in again.');
                                        SessionRefreshError();
                                    }

                                } else {
                                    console.error('Error refreshing tokens:', error);
                                }
                            })
                    }
                } else if (error.name === 'InvalidParameterException') {
                    console.error('Access token is missing or malformed:', error.message);
                } else {
                    console.error('Error fetching user data:', error.message);
                    enqueueSnackbar('Failed to fetch user data. Plesae log in again.', { variant: "error" })
                }
            })

    }

    const IsLoggedIn = () => {
        if (user)
            return true
        return false
    }


    return (
        <userContext.Provider
            value={{
                accessToken,
                idTokoen,
                refreshToken,
                user,
                setUser,
                UserLogIn,
                UserLogOut,
                IsLoggedIn,
                RefreshUser,
                SessionRefreshError,
                SetNewTokens,
                DeleteUser
            }}
        >
            {isReady ? children : null}
        </userContext.Provider>
    )
}

// Custom hook to handle errors
export const useUserContext = () => {
    if (!userContext) {
        enqueueSnackbar('User context is null, please add your component within the scope of your provider')
    }
    return useContext(userContext);
}