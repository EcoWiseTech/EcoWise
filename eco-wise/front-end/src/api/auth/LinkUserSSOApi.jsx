import { AdminLinkProviderForUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import cognitoProviderClient from './AwsCognitoInit';

const LinkUserSSOApi = async (sub, providerName) => {
    const params = {
        UserPoolId: process.env.REACT_APP_USER_POOL_ID, 
        DestinationUser: {
            ProviderName: "Cognito", 
            ProviderAttributeValue: 'brianyuk@gmail.com', 
        },
        SourceUser: {
            ProviderName: providerName, 
            ProviderAttributeName: 'Cognito_Subject',
            ProviderAttributeValue: sub, 
        },
    };

    try {
        const command = new AdminLinkProviderForUserCommand(params);
        const data = await cognitoProviderClient.send(command);
        return data;
    } catch (error) {
        console.error('Error disabling provider for user:', error);
        throw error;
    }
};

export default LinkUserSSOApi