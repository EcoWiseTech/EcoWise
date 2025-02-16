import { Box, Button, Card, Alert, CardContent, Divider, Grid, Typography, Grid2 } from '@mui/material'
import React, { useEffect } from 'react'
import CardTitle from '../../components/common/CardTitle'
import AddLinkIcon from '@mui/icons-material/AddLink';

function SSORootSocialLoginCard(props) {
    return (
        <Card>
            <CardContent>
                <CardTitle icon={<AddLinkIcon />} title="Link Social Logins" />
                <Box marginTop={"0.5rem"}>
                    <Typography variant="body">
                        Linking your social logins allows you to log in to your account using your Google or Facebook account.
                    </Typography>
                    <Alert
                        severity='info'
                        sx={{marginTop:"1rem"}}
                    >
                        This account is not available to link. Since it is created by a {props.provider} account. For a account that can link, you need to create it via email/password. Learn more <a href="#">here</a>
                    </Alert >
                </Box>


            </CardContent>
        </Card>
    )
}

export default SSORootSocialLoginCard