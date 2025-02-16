import React from 'react';
import { GoogleOAuthProvider } from "@react-oauth/google"


export const GoogleSSOProvider = ({ children }) => {

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_AUTH_PROVIDER_CLIENT_ID}>
            {children}
        </GoogleOAuthProvider>
    );
};
