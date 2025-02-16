import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import FacebookIcon from '@mui/icons-material/Facebook';
import { Box } from "@mui/material";

const FacebookSSOButton = ({ onClick, loading }) => {
    return (
        <LoadingButton
            loading={loading}
            variant="outlined"
            onClick={onClick}
            sx={{
                textTransform: "none",
                fontSize: "1rem",
                padding: "0.6rem 1rem",
                borderColor: "#ddd",
                color: "#000",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                "&:hover": {
                    backgroundColor: "#f9f9f9",
                    borderColor: "#ccc",
                },
                "&:disabled": {
                    backgroundColor: "#f5f5f5",
                    color: "#aaa",
                },
            }}
        >
            <FacebookIcon sx={{ fontSize: "1.7rem", marginRight: "1rem", color: "#1877F2" }} />
            <Box sx={{ marginRight: "-0.9rem" }}>

                Sign in with Facebook
            </Box>
        </LoadingButton>
    );
};

export default FacebookSSOButton;
