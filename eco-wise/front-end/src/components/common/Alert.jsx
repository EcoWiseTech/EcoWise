import React, { useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { Alert } from '@mui/material';
import Fade from '@mui/material/Fade';

function AlertComponent() {
    const { alert, hideAlert } = useAlert();

    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                hideAlert();
            }, 14000);

            return () => clearTimeout(timer);
        }
    }, [alert, hideAlert]);

    return (
        <>
            {alert.show && (
                <Fade in={alert.show} timeout={300}>
                    <Alert
                        variant="filled"
                        severity={alert.severity}
                        onClose={hideAlert}
                        sx={{
                            width: '60%',
                            margin: '0 auto',
                            marginTop: '10px',
                            ...(alert.severity === 'success' && {
                                bgcolor: '#4caf50',
                            }),
                        }}
                    >
                        {alert.message}
                    </Alert>
                </Fade>
            )}
        </>
    );
}

export default AlertComponent;
