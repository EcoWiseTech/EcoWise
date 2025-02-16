import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Alert,
} from '@mui/material';
import PasswordIcon from '@mui/icons-material/Password';
import CardTitle from '../common/CardTitle';

function SSORootPasswordCard(props) {

    return (
        <Card>
            <CardContent>
                <CardTitle icon={<PasswordIcon />} title="Password settings" />
                <Box marginTop="0.5rem">
                    <Typography variant="body">
                        Want to change your password? Change your password settings here.
                    </Typography>
                </Box>
                <Alert sx={{ marginTop: "1rem" }} severity='info'>This account cannot change password as it was created with your {props.provider} account, meaning that the login method is associated with the account. For a account that can change password, you need to create it via email/password. Learn more <a href="#">here</a> </Alert>
            </CardContent>
        </Card>
    );
}

export default SSORootPasswordCard;
