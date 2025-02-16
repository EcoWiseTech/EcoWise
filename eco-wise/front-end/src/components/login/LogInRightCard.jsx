import { Box, Button, Card, CardContent, Typography, Divider } from "@mui/material"
import HelpIcon from '@mui/icons-material/Help';
import { Link } from "react-router-dom";
import SmallCardTitle from "../common/SmallCardTitle";


function LogInRightCard(props) {
    const {
        handleResendDialog
    } = props
    return (
        <Card sx={{ margin: "auto" }}>
            <Box
                component="img"
                src="/images/loginPage.webp"
                alt="EcoWise Register image"
                sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }}
            />
            <CardContent>
                <SmallCardTitle title="Need Help?" icon={<HelpIcon color="text.secondary" sx={{ fontSize: '1.3rem' }} />} />
                <Typography variant="body2" sx={{ marginTop: 1, fontSize: '0.8rem' }}>
                    If you have not received your verification e-mail, you can resend it by clicking the button below.
                </Typography>
                <Button sx={{ marginTop: 1, fontSize: '0.8rem' }} variant="outlined" color="primary" onClick={handleResendDialog}>Resend Verification E-mail</Button>
                <Divider sx={{ marginTop: 2 }} />
                <Typography variant="body2" sx={{ marginTop: 1, fontSize: '0.8rem' }}>
                    For other issues such as 2FA, please contact us via the support page.
                </Typography>
                <Button sx={{ marginTop: 1, fontSize: '0.8rem' }} variant="outlined" color="primary" LinkComponent={Link} to="/support">Go to support</Button>
            </CardContent>

        </Card>
    )
}

export default LogInRightCard