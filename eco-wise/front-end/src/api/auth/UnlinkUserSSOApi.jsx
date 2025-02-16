import { AdminDisableProviderForUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import cognitoProviderClient from './AwsCognitoInit';

const UnlinkUserSSOApi = async (sub, providerName) => {
    const params = {
        UserPoolId: process.env.REACT_APP_USER_POOL_ID,
        User: {
            ProviderAttributeName: "Cognito_Subject", 
            ProviderAttributeValue: sub,
            ProviderName: providerName,
        }
    };

    try {
        const command = new AdminDisableProviderForUserCommand(params);
        const data = await cognitoProviderClient.send(command);
        return data;
    } catch (error) {
        console.error('Error disabling provider for user:', error);
        throw error;
    }
};

export default UnlinkUserSSOApi